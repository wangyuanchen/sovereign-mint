import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { generations, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateFormSchema } from "@/lib/validations";
import { buildWhitepaperPrompt, buildLandingPagePrompt } from "@/lib/prompts";
import {
  getModelById,
  canUserAccessModel,
  isModelFree,
  DEFAULT_FREE_MODEL,
  MONTHLY_QUOTA,
} from "@/lib/models";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Check and reset monthly quota if needed
async function checkAndResetQuota(walletAddress: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.walletAddress, walletAddress),
  });

  if (!user) return null;

  const today = new Date();
  const resetDate = user.quotaResetDate ? new Date(user.quotaResetDate) : null;

  // Reset quota on the 1st of each month or if never set
  if (!resetDate || today >= resetDate) {
    const nextReset = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const newQuota = user.hasPaidAccess
      ? MONTHLY_QUOTA.PAID_GENERATIONS
      : MONTHLY_QUOTA.FREE_GENERATIONS;

    await db
      .update(users)
      .set({
        usedThisMonth: 0,
        monthlyQuota: newQuota,
        quotaResetDate: nextReset,
      })
      .where(eq(users.walletAddress, walletAddress));

    return { ...user, usedThisMonth: 0, monthlyQuota: newQuota };
  }

  return user;
}

// Check if user can generate (has quota or boost credits)
function canUserGenerate(user: typeof users.$inferSelect): boolean {
  const hasMonthlyQuota = user.usedThisMonth < user.monthlyQuota;
  const hasBoostCredits = user.boostCredits > 0;
  return hasMonthlyQuota || hasBoostCredits;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = generateFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const formData = validationResult.data;
    const modelId = formData.model || DEFAULT_FREE_MODEL;

    // Check and reset quota if needed
    const user = await checkAndResetQuota(session.walletAddress);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user can access the selected model
    if (!canUserAccessModel(modelId, user.hasPaidAccess)) {
      return NextResponse.json(
        { error: "You need to unlock paid models to use this model" },
        { status: 403 }
      );
    }

    // Check quota
    if (!canUserGenerate(user)) {
      return NextResponse.json(
        { error: "No generations remaining. Purchase a boost pack to continue." },
        { status: 403 }
      );
    }

    const model = getModelById(modelId);
    if (!model) {
      return NextResponse.json({ error: "Invalid model" }, { status: 400 });
    }

    const generationId = nanoid(21);

    // Build prompt based on output type
    const prompt =
      formData.outputType === "whitepaper"
        ? buildWhitepaperPrompt(formData, formData.language)
        : buildLandingPagePrompt(formData, formData.language);

    // Create initial generation record
    await db.insert(generations).values({
      id: generationId,
      walletAddress: session.walletAddress,
      projectName: formData.projectName,
      inputData: formData,
      outputType: formData.outputType,
      modelUsed: modelId,
      isUnlocked: false,
    });

    // Call OpenRouter API with streaming
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Sovereign Mint",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 8192,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", error);
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500 }
      );
    }

    // Create a readable stream to handle SSE from OpenRouter
    const encoder = new TextEncoder();
    let fullContent = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("No response body");
          }

          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullContent += content;
                    controller.enqueue(encoder.encode(content));
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }

          // Save the complete output
          await db
            .update(generations)
            .set({ outputMarkdown: fullContent })
            .where(eq(generations.id, generationId));

          // Deduct from quota or boost credits
          const usedMonthly = user.usedThisMonth < user.monthlyQuota;
          if (usedMonthly) {
            await db
              .update(users)
              .set({ usedThisMonth: user.usedThisMonth + 1 })
              .where(eq(users.walletAddress, session.walletAddress));
          } else {
            await db
              .update(users)
              .set({ boostCredits: user.boostCredits - 1 })
              .where(eq(users.walletAddress, session.walletAddress));
          }

          // Auto-unlock for all generations
          await db
            .update(generations)
            .set({ isUnlocked: true })
            .where(eq(generations.id, generationId));

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Generation-Id": generationId,
      },
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

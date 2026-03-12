import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { WhitepaperPDF } from "@/lib/pdf-template";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const generation = await db.query.generations.findFirst({
      where: and(
        eq(generations.id, id),
        eq(generations.walletAddress, session.walletAddress)
      ),
    });

    if (!generation) {
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      );
    }

    if (!generation.isUnlocked) {
      return NextResponse.json(
        { error: "Generation is locked. Please purchase to unlock." },
        { status: 403 }
      );
    }

    if (!generation.outputMarkdown) {
      return NextResponse.json(
        { error: "No content available" },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      WhitepaperPDF({
        title: generation.projectName,
        content: generation.outputMarkdown,
      })
    );

    const pdfBytes = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${generation.projectName.replace(/\s+/g, "_")}_whitepaper.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

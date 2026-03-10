import { NextResponse } from "next/server";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userGenerations = await db.query.generations.findMany({
      where: eq(generations.walletAddress, session.walletAddress),
      orderBy: [desc(generations.createdAt)],
    });

    return NextResponse.json(userGenerations);
  } catch (error) {
    console.error("Error fetching generations:", error);
    return NextResponse.json(
      { error: "Failed to fetch generations" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

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

    return NextResponse.json(generation);
  } catch (error) {
    console.error("Error fetching generation:", error);
    return NextResponse.json(
      { error: "Failed to fetch generation" },
      { status: 500 }
    );
  }
}

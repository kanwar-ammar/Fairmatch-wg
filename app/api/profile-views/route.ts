import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      studentId?: string;
      viewerId?: string;
    };

    if (!body.studentId || !body.viewerId) {
      return NextResponse.json(
        { error: "studentId and viewerId are required" },
        { status: 400 },
      );
    }

    if (body.studentId === body.viewerId) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const now = new Date();

    await prisma.$executeRaw`
      INSERT INTO ProfileView (id, studentId, viewerId, viewedAt, updatedAt)
      VALUES (${randomUUID()}, ${body.studentId}, ${body.viewerId}, ${now}, ${now})
      ON CONFLICT(studentId, viewerId)
      DO UPDATE SET viewedAt = excluded.viewedAt, updatedAt = excluded.updatedAt
    `;

    const profileView = await prisma.$queryRaw<Array<{ id: string; studentId: string; viewerId: string; viewedAt: Date; updatedAt: Date }>>`
      SELECT id, studentId, viewerId, viewedAt, updatedAt
      FROM ProfileView
      WHERE studentId = ${body.studentId} AND viewerId = ${body.viewerId}
      LIMIT 1
    `;

    return NextResponse.json({ ok: true, profileView: profileView[0] ?? null });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to record profile view",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (role === "resident") {
      // Get unread messages for resident's applications
      const unreadCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM ApplicationMessage
        WHERE homeProfileId IN (
          SELECT id FROM HomeProfile
          WHERE id IN (
            SELECT homeProfileId FROM HomeMembership
            WHERE userId = ${userId} AND role IN ('OWNER', 'MANAGER')
          )
        )
        AND NOT JSON_EXTRACT(readByUserIds, '$[*]') LIKE CONCAT('%"', ${userId}, '"%')
      `;

      // For SQLite, use a simpler approach
      const messages = await prisma.applicationMessage.findMany({
        where: {
          homeProfile: {
            memberships: {
              some: {
                userId,
                role: { in: ["OWNER", "MANAGER"] },
              },
            },
          },
        },
        select: { readByUserIds: true },
      });

      const count = messages.filter(
        (msg) => !msg.readByUserIds.includes(userId)
      ).length;

      return NextResponse.json({ count });
    }

    // For students, get unread messages from their applications
    const messages = await prisma.applicationMessage.findMany({
      where: {
        application: {
          studentId: userId,
        },
      },
      select: { readByUserIds: true },
    });

    const count = messages.filter(
      (msg) => !msg.readByUserIds.includes(userId)
    ).length;

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get unread count",
      },
      { status: 500 }
    );
  }
}

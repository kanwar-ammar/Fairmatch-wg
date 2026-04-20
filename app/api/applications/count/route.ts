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
        { status: 400 },
      );
    }

    if (role === "resident") {
      // Get count of pending and interview applications for resident's listings
      const count = await prisma.application.count({
        where: {
          homeProfile: {
            OR: [
              { ownerId: userId },
              {
                memberships: {
                  some: {
                    userId,
                    role: "OWNER",
                  },
                },
              },
            ],
          },
          status: { in: ["PENDING", "INTERVIEW"] },
        },
      });

      return NextResponse.json({ count });
    }

    // For students, get their pending and interview applications
    const count = await prisma.application.count({
      where: {
        studentId: userId,
        status: { in: ["PENDING", "INTERVIEW"] },
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get application count",
      },
      { status: 500 },
    );
  }
}

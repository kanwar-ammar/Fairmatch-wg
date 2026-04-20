import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      homeProfileId?: string;
      favorite?: boolean;
    };

    if (!body.userId || !body.homeProfileId) {
      return NextResponse.json(
        { error: "userId and homeProfileId are required" },
        { status: 400 },
      );
    }

    const listing = await prisma.homeProfile.findUnique({
      where: { id: body.homeProfileId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (body.favorite) {
      await prisma.savedListing.upsert({
        where: {
          userId_homeProfileId: {
            userId: body.userId,
            homeProfileId: body.homeProfileId,
          },
        },
        create: {
          userId: body.userId,
          homeProfileId: body.homeProfileId,
        },
        update: {},
      });
    } else {
      await prisma.savedListing.deleteMany({
        where: {
          userId: body.userId,
          homeProfileId: body.homeProfileId,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update favorite",
      },
      { status: 500 },
    );
  }
}

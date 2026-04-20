import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type PreferencesPayload = {
  cleanliness: number;
  recycling: number;
  diy: number;
  cooking: number;
  quietness: number;
  music: number;
  fitness: number;
  studyHabits: number;
  socialActivity: number;
  parties: number;
  petFriendly: boolean;
  smokingAllowed: boolean;
};

function normalizeScore(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId query parameter." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        preference: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      preference: user.preference,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load preferences.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      preferences?: Partial<PreferencesPayload>;
    };

    if (!body.userId) {
      return NextResponse.json(
        { error: "Missing userId in request body." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: body.userId },
      select: {
        id: true,
        preference: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const incoming = body.preferences ?? {};
    const existing = user.preference;

    const normalized: PreferencesPayload = {
      cleanliness: normalizeScore(incoming.cleanliness, existing?.cleanliness ?? 50),
      recycling: normalizeScore(incoming.recycling, existing?.recycling ?? 50),
      diy: normalizeScore(incoming.diy, existing?.diy ?? 50),
      cooking: normalizeScore(incoming.cooking, existing?.cooking ?? 50),
      quietness: normalizeScore(incoming.quietness, existing?.quietness ?? 50),
      music: normalizeScore(incoming.music, existing?.music ?? 50),
      fitness: normalizeScore(incoming.fitness, existing?.fitness ?? 50),
      studyHabits: normalizeScore(incoming.studyHabits, existing?.studyHabits ?? 50),
      socialActivity: normalizeScore(incoming.socialActivity, existing?.socialActivity ?? 50),
      parties: normalizeScore(incoming.parties, existing?.parties ?? 50),
      petFriendly: normalizeBoolean(incoming.petFriendly, existing?.petFriendly ?? false),
      smokingAllowed: normalizeBoolean(incoming.smokingAllowed, existing?.smokingAllowed ?? false),
    };

    const preference = await prisma.studentPreference.upsert({
      where: { userId: body.userId },
      update: normalized,
      create: {
        userId: body.userId,
        ...normalized,
      },
    });

    return NextResponse.json({
      ok: true,
      preference,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save preferences.",
      },
      { status: 500 },
    );
  }
}

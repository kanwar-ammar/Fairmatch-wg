import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

async function buildCurrentUserPayload(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
      studentProfile: true,
      residentProfile: true,
      verificationDocs: {
        select: {
          type: true,
          label: true,
          status: true,
        },
      },
      memberships: {
        include: {
          homeProfile: {
            select: {
              title: true,
              district: true,
            },
          },
        },
      },
      ownedHomes: {
        select: {
          title: true,
          district: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const canUseResident = user.ownedHomes.length > 0 || user.memberships.length > 0;

  const activeRole =
    user.settings?.activeRole === "RESIDENT" && canUseResident
      ? "RESIDENT"
      : "STUDENT";

  const fullName =
    user.displayName ??
    user.studentProfile?.fullName ??
    user.residentProfile?.fullName ??
    user.email;

  const avatarUrl =
    user.studentProfile?.avatarUrl ?? user.residentProfile?.avatarUrl ?? null;

  const primaryHome = user.ownedHomes[0] ?? user.memberships[0]?.homeProfile;
  const primaryHomeLabel = primaryHome ? `${primaryHome.title}` : null;

  return {
    id: user.id,
    email: user.email,
    fullName,
    activeRole,
    avatarUrl,
    studentProfile: user.studentProfile,
    residentProfile: user.residentProfile,
    verificationDocs: user.verificationDocs,
    primaryHomeLabel,
    capabilities: {
      canUseStudent: true,
      canUseResident,
    },
  };
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

    const payload = await buildCurrentUserPayload(userId);

    if (!payload) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      user: payload,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load current user.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      bio?: string;
      budgetMin?: number | null;
      budgetMax?: number | null;
      moveInDate?: string | null;
      semester?: string | null;
      preferredDistricts?: string | null;
    };

    if (!body.userId) {
      return NextResponse.json(
        { error: "Missing userId in request body." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: body.userId },
      include: {
        studentProfile: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const fullNameForStudentProfile =
      existingUser.studentProfile?.fullName ??
      existingUser.displayName ??
      existingUser.email;

    await prisma.studentProfile.upsert({
      where: { userId: body.userId },
      update: {
        bio: body.bio ?? null,
        budgetMin: body.budgetMin ?? null,
        budgetMax: body.budgetMax ?? null,
        moveInDate: body.moveInDate ?? null,
        semester: body.semester ?? null,
        preferredDistricts: body.preferredDistricts ?? null,
      },
      create: {
        userId: body.userId,
        fullName: fullNameForStudentProfile,
        bio: body.bio ?? null,
        budgetMin: body.budgetMin ?? null,
        budgetMax: body.budgetMax ?? null,
        moveInDate: body.moveInDate ?? null,
        semester: body.semester ?? null,
        preferredDistricts: body.preferredDistricts ?? null,
      },
    });

    const payload = await buildCurrentUserPayload(body.userId);
    if (!payload) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      user: payload,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update current user profile.",
      },
      { status: 500 },
    );
  }
}

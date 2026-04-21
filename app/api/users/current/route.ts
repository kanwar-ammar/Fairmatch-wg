import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { normalizeGermanRegion } from "@/lib/german-regions";

function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
        select: {
          homeProfileId: true,
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
          id: true,
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
  const primaryHomeId = user.ownedHomes[0]?.id ?? user.memberships[0]?.homeProfileId ?? null;

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
    primaryHomeId,
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
      houseBio?: string;
      age?: number | null;
      gender?: string | null;
      nationality?: string | null;
      university?: string | null;
      location?: string | null;
      budgetMin?: number | null;
      budgetMax?: number | null;
      moveInDate?: string | null;
      semester?: string | null;
      contact?: string | null;
      hobbies?: string | null;
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

    const normalizedLocation = normalizeGermanRegion(
      String(body.location ?? ""),
    );

    if (!normalizedLocation) {
      return NextResponse.json(
        { error: "Location is required and must match the regional list." },
        { status: 400 },
      );
    }

    if (body.moveInDate && body.moveInDate < getTodayIsoDate()) {
      return NextResponse.json(
        { error: "Move-in date cannot be earlier than today." },
        { status: 400 },
      );
    }

    await prisma.studentProfile.upsert({
      where: { userId: body.userId },
      update: {
        bio: body.bio ?? null,
        houseBio: body.houseBio ?? null,
        age: body.age ?? null,
        gender: body.gender ?? null,
        nationality: body.nationality ?? null,
        university: body.university ?? null,
        location: normalizedLocation,
        budgetMin: body.budgetMin ?? null,
        budgetMax: body.budgetMax ?? null,
        moveInDate: body.moveInDate ?? null,
        semester: body.semester ?? null,
        contact: body.contact ?? null,
        hobbies: body.hobbies ?? null,
        preferredDistricts: body.preferredDistricts ?? null,
      },
      create: {
        userId: body.userId,
        fullName: fullNameForStudentProfile,
        bio: body.bio ?? null,
        houseBio: body.houseBio ?? null,
        age: body.age ?? null,
        gender: body.gender ?? null,
        nationality: body.nationality ?? null,
        university: body.university ?? null,
        location: normalizedLocation,
        budgetMin: body.budgetMin ?? null,
        budgetMax: body.budgetMax ?? null,
        moveInDate: body.moveInDate ?? null,
        semester: body.semester ?? null,
        contact: body.contact ?? null,
        hobbies: body.hobbies ?? null,
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

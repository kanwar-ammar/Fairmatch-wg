import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email")?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Missing email query parameter." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        residentProfile: true,
        settings: true,
        memberships: {
          include: {
            homeProfile: {
              select: {
                id: true,
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
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const primaryHome =
      user.ownedHomes[0] ?? user.memberships[0]?.homeProfile ?? null;
    const currentRole = user.settings?.activeRole ?? "STUDENT";

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        fullName:
          user.displayName ??
          user.studentProfile?.fullName ??
          user.residentProfile?.fullName ??
          user.email,
        avatarUrl:
          user.studentProfile?.avatarUrl ??
          user.residentProfile?.avatarUrl ??
          null,
        age: user.studentProfile?.age ?? null,
        university: user.studentProfile?.university ?? null,
        contact: user.studentProfile?.contact ?? null,
        hobbies: user.studentProfile?.hobbies ?? null,
        houseBio: user.studentProfile?.houseBio ?? null,
        currentRole,
        currentHomeId: primaryHome?.id ?? null,
        currentHomeLabel: primaryHome
          ? `${primaryHome.title} · ${primaryHome.district}`
          : null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to search for this user.",
      },
      { status: 500 },
    );
  }
}

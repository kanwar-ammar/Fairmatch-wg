import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

async function resolveCurrentHome(userId: string) {
  const ownedHome = await prisma.homeProfile.findFirst({
    where: {
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
  });

  if (ownedHome) {
    return ownedHome;
  }

  return prisma.homeMembership.findFirst({
    where: {
      userId,
      role: "OWNER",
    },
    include: {
      homeProfile: true,
    },
  });
}

async function isUserInAnotherHome(userId: string, homeProfileId: string) {
  const ownedHome = await prisma.homeProfile.findFirst({
    where: {
      ownerId: userId,
      id: { not: homeProfileId },
    },
    select: { id: true, title: true, district: true },
  });

  if (ownedHome) {
    return ownedHome;
  }

  return prisma.homeMembership.findFirst({
    where: {
      userId,
      homeProfileId: { not: homeProfileId },
    },
    include: {
      homeProfile: {
        select: { id: true, title: true, district: true },
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const actingUserId = url.searchParams.get("userId");

    if (!actingUserId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const home = await prisma.homeProfile.findFirst({
      where: {
        OR: [
          { ownerId: actingUserId },
          {
            memberships: {
              some: {
                userId: actingUserId,
                role: "OWNER",
              },
            },
          },
        ],
      },
      include: {
        memberships: true,
      },
    });

    if (!home) {
      return NextResponse.json(
        { error: "You are not authorized to manage this WG." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      targetUserId?: string;
      role?: "OWNER" | "MEMBER";
    };

    if (!body.targetUserId || !body.role) {
      return NextResponse.json(
        { error: "targetUserId and role are required." },
        { status: 400 },
      );
    }

    const existingTarget = await prisma.user.findUnique({
      where: { id: body.targetUserId },
      include: {
        studentProfile: true,
        residentProfile: true,
        memberships: true,
        ownedHomes: true,
      },
    });

    if (!existingTarget) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const alreadyMember = home.memberships.some(
      (membership) => membership.userId === body.targetUserId,
    );

    if (alreadyMember) {
      return NextResponse.json(
        { error: "This user is already part of your WG." },
        { status: 409 },
      );
    }

    const anotherHome = await isUserInAnotherHome(body.targetUserId, home.id);
    if (anotherHome) {
      const currentHomeLabel =
        "homeProfile" in anotherHome && anotherHome.homeProfile
          ? `${anotherHome.homeProfile.title} · ${anotherHome.homeProfile.district}`
          : anotherHome.title && anotherHome.district
            ? `${anotherHome.title} · ${anotherHome.district}`
            : "another WG";

      return NextResponse.json(
        {
          error: "This user is already a member of another WG.",
          existingHomeLabel: currentHomeLabel,
        },
        { status: 409 },
      );
    }

    const displayName =
      existingTarget.displayName ??
      existingTarget.studentProfile?.fullName ??
      existingTarget.residentProfile?.fullName ??
      existingTarget.email;

    const created = await prisma.homeMembership.create({
      data: {
        homeProfileId: home.id,
        userId: body.targetUserId,
        role: body.role,
        displayName,
        isPrimaryContact: body.role === "OWNER",
      },
      include: {
        user: {
          include: {
            studentProfile: true,
            residentProfile: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      member: created,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to add this housemate.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const actingUserId = url.searchParams.get("userId");

    if (!actingUserId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const home = await resolveCurrentHome(actingUserId);
    const homeProfile = "homeProfile" in home ? home.homeProfile : home;

    const canManage =
      homeProfile &&
      (homeProfile.ownerId === actingUserId ||
        (await prisma.homeMembership.findFirst({
          where: {
            homeProfileId: homeProfile.id,
            userId: actingUserId,
            role: "OWNER",
          },
        })));

    if (!homeProfile || !canManage) {
      return NextResponse.json(
        { error: "You are not authorized to manage this WG." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      targetUserId?: string;
    };

    if (!body.targetUserId) {
      return NextResponse.json(
        { error: "targetUserId is required." },
        { status: 400 },
      );
    }

    const targetMembership = await prisma.homeMembership.findUnique({
      where: {
        homeProfileId_userId: {
          homeProfileId: homeProfile.id,
          userId: body.targetUserId,
        },
      },
    });

    if (!targetMembership) {
      return NextResponse.json(
        { error: "This user is not part of your WG." },
        { status: 404 },
      );
    }

    const ownerCount = await prisma.homeMembership.count({
      where: {
        homeProfileId: homeProfile.id,
        role: "OWNER",
      },
    });

    if (targetMembership.role === "OWNER" && ownerCount <= 1) {
      return NextResponse.json(
        { error: "At least one owner must remain in the WG." },
        { status: 400 },
      );
    }

    await prisma.homeMembership.delete({
      where: {
        homeProfileId_userId: {
          homeProfileId: homeProfile.id,
          userId: body.targetUserId,
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to remove this housemate.",
      },
      { status: 500 },
    );
  }
}
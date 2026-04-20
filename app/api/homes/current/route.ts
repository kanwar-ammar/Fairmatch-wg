import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

const homeInclude = {
  owner: {
    include: {
      studentProfile: true,
      residentProfile: true,
    },
  },
  memberships: {
    include: {
      user: {
        include: {
          studentProfile: true,
          residentProfile: true,
        },
      },
    },
  },
  amenities: { orderBy: { sortOrder: "asc" as const } },
  photos: { orderBy: { sortOrder: "asc" as const } },
  rules: { orderBy: { sortOrder: "asc" as const } },
};

async function getAccessibleHomeById(userId: string, homeId: string) {
  return prisma.homeProfile.findFirst({
    where: {
      id: homeId,
      OR: [{ ownerId: userId }, { memberships: { some: { userId } } }],
    },
    include: homeInclude,
  });
}

function isListingOwner(
  homeProfile: {
    ownerId: string;
    memberships: Array<{ userId: string; role: string }>;
  },
  userId: string,
) {
  return (
    homeProfile.ownerId === userId ||
    homeProfile.memberships.some(
      (membership) =>
        membership.userId === userId && membership.role === "OWNER",
    )
  );
}

async function getEditableHome(userId: string, listingId?: string | null) {
  if (listingId) {
    return prisma.homeProfile.findFirst({
      where: {
        id: listingId,
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
  }

  return prisma.homeProfile.findFirst({
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
}

/**
 * GET /api/homes/current
 * Fetch the current user's home profile (if they are a RESIDENT/owner or member)
 * Query params: userId
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const listingId = request.nextUrl.searchParams.get("listingId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Fetch user to verify they're a resident
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let homeProfile = null;

    if (listingId) {
      homeProfile = await getAccessibleHomeById(userId, listingId);
      if (!homeProfile) {
        return NextResponse.json(
          { error: "Listing not found or inaccessible" },
          { status: 404 },
        );
      }
    } else {
      const ownedHome = await prisma.homeProfile.findFirst({
        where: { ownerId: userId },
        include: homeInclude,
      });

      homeProfile = ownedHome;

      if (!homeProfile) {
        const membership = await prisma.homeMembership.findFirst({
          where: { userId },
          include: {
            homeProfile: {
              include: homeInclude,
            },
          },
        });

        if (!membership) {
          return NextResponse.json(
            { error: "User is not a member of any home" },
            { status: 403 },
          );
        }

        homeProfile = membership.homeProfile;
      }
    }

    const isOwner = isListingOwner(homeProfile, userId);

    return NextResponse.json({
      homeProfile,
      isOwner,
    });
  } catch (error) {
    console.error("Failed to fetch home profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch home profile" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/homes/current
 * Update the current home profile (only owner can edit visibility, title, description, details)
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    const listingId = request.nextUrl.searchParams.get("listingId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const ownedHome = await getEditableHome(userId, listingId);

    if (!ownedHome) {
      return NextResponse.json(
        { error: "You are not the owner of any home" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      rentPrice,
      depositAmount,
      roomSizeM2,
      availableFrom,
      minStayMonths,
      isLive,
      vibeSummary,
      address,
      district,
      rules,
      preferences,
      amenities,
    } = body;

    // Build update payload with only provided fields
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = String(title).trim();
    if (description !== undefined)
      updateData.description = String(description).trim();
    if (rentPrice !== undefined)
      updateData.rentPrice = Math.max(0, parseInt(String(rentPrice), 10) || 0);
    if (depositAmount !== undefined)
      updateData.depositAmount = Math.max(
        0,
        parseInt(String(depositAmount), 10) || 0,
      );
    if (roomSizeM2 !== undefined)
      updateData.roomSizeM2 = Math.max(
        0,
        parseInt(String(roomSizeM2), 10) || 0,
      );
    if (availableFrom !== undefined)
      updateData.availableFrom = String(availableFrom).trim();
    if (minStayMonths !== undefined)
      updateData.minStayMonths = Math.max(
        0,
        parseInt(String(minStayMonths), 10) || 0,
      );
    if (isLive !== undefined) updateData.isLive = Boolean(isLive);
    if (vibeSummary !== undefined)
      updateData.vibeSummary = String(vibeSummary).trim();
    if (address !== undefined) updateData.address = String(address).trim();
    if (district !== undefined) updateData.district = String(district).trim();

    const clampPercent = (value: unknown) =>
      Math.min(100, Math.max(0, parseInt(String(value), 10) || 0));

    if (preferences && typeof preferences === "object") {
      const pref = preferences as Record<string, unknown>;
      if (pref.cleanliness !== undefined)
        updateData.prefCleanliness = clampPercent(pref.cleanliness);
      if (pref.recycling !== undefined)
        updateData.prefRecycling = clampPercent(pref.recycling);
      if (pref.diy !== undefined) updateData.prefDiy = clampPercent(pref.diy);
      if (pref.cooking !== undefined)
        updateData.prefCooking = clampPercent(pref.cooking);
      if (pref.quietness !== undefined)
        updateData.prefQuietness = clampPercent(pref.quietness);
      if (pref.music !== undefined)
        updateData.prefMusic = clampPercent(pref.music);
      if (pref.fitness !== undefined)
        updateData.prefFitness = clampPercent(pref.fitness);
      if (pref.studyHabits !== undefined)
        updateData.prefStudyHabits = clampPercent(pref.studyHabits);
      if (pref.social !== undefined)
        updateData.prefSocial = clampPercent(pref.social);
      if (pref.parties !== undefined)
        updateData.prefParties = clampPercent(pref.parties);
    }

    const normalizedRules = Array.isArray(rules)
      ? rules
          .map((rule) => {
            if (typeof rule === "string") {
              return { text: rule.trim() };
            }
            if (rule && typeof rule === "object") {
              const ruleText = (rule as { text?: unknown }).text;
              return { text: String(ruleText ?? "").trim() };
            }
            return { text: "" };
          })
          .filter((rule) => rule.text.length > 0)
      : null;

    const normalizedAmenities = Array.isArray(amenities)
      ? amenities
          .map((amenity, index) => {
            if (!amenity || typeof amenity !== "object") {
              return null;
            }

            const parsed = amenity as {
              key?: unknown;
              enabled?: unknown;
            };

            const key = String(parsed.key ?? "").trim();
            if (!key) return null;

            return {
              key,
              enabled: Boolean(parsed.enabled),
              sortOrder: index,
            };
          })
          .filter(
            (
              amenity,
            ): amenity is {
              key: string;
              enabled: boolean;
              sortOrder: number;
            } => Boolean(amenity),
          )
      : null;

    const updatedHome = await prisma.$transaction(async (tx) => {
      await tx.homeProfile.update({
        where: { id: ownedHome.id },
        data: updateData,
      });

      if (normalizedRules !== null) {
        await tx.homeRule.deleteMany({
          where: { homeProfileId: ownedHome.id },
        });

        if (normalizedRules.length > 0) {
          await tx.homeRule.createMany({
            data: normalizedRules.map((rule, index) => ({
              homeProfileId: ownedHome.id,
              text: rule.text,
              category: "general",
              sortOrder: index,
            })),
          });
        }
      }

      if (normalizedAmenities !== null) {
        await tx.homeAmenity.deleteMany({
          where: { homeProfileId: ownedHome.id },
        });

        if (normalizedAmenities.length > 0) {
          await tx.homeAmenity.createMany({
            data: normalizedAmenities.map((amenity) => ({
              homeProfileId: ownedHome.id,
              key: amenity.key,
              enabled: amenity.enabled,
              sortOrder: amenity.sortOrder,
            })),
          });
        }
      }

      return tx.homeProfile.findUniqueOrThrow({
        where: { id: ownedHome.id },
        include: {
          ...homeInclude,
        },
      });
    });

    return NextResponse.json({
      homeProfile: updatedHome,
      isOwner: true,
    });
  } catch (error) {
    console.error("Failed to update home profile:", error);
    return NextResponse.json(
      { error: "Failed to update home profile" },
      { status: 500 },
    );
  }
}

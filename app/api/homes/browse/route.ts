import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/match-score";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const search = (url.searchParams.get("search") || "").trim().toLowerCase();
    const favoritesOnly = url.searchParams.get("favoritesOnly") === "true";

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const [user, homeProfiles, favorites, applications] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          preference: {
            select: {
              cleanliness: true,
              recycling: true,
              diy: true,
              cooking: true,
              quietness: true,
              music: true,
              fitness: true,
              studyHabits: true,
              socialActivity: true,
              parties: true,
            },
          },
        },
      }),
      prisma.homeProfile.findMany({
        where: { isLive: true },
        include: {
          amenities: {
            where: { enabled: true },
            orderBy: { sortOrder: "asc" },
          },
          memberships: {
            select: {
              userId: true,
              displayName: true,
              user: {
                select: {
                  displayName: true,
                  studentProfile: { select: { fullName: true } },
                  residentProfile: { select: { fullName: true } },
                },
              },
            },
          },
          owner: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.savedListing.findMany({
        where: { userId },
        select: { homeProfileId: true },
      }),
      prisma.application.findMany({
        where: { studentId: userId },
        select: {
          homeProfileId: true,
          status: true,
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const favoriteIds = new Set(favorites.map((item) => item.homeProfileId));
    const appStatusByListing = new Map(
      applications.map((item) => [item.homeProfileId, item.status]),
    );

    const listings = homeProfiles
      .filter((home) => home.ownerId !== userId)
      .map((home) => {
        const matchScore = calculateMatchScore(user.preference, home);

        const residentNames = home.memberships
          .map((member) => {
            return (
              member.displayName ||
              member.user.displayName ||
              member.user.residentProfile?.fullName ||
              member.user.studentProfile?.fullName ||
              "Resident"
            );
          })
          .filter(Boolean);

        return {
          id: home.id,
          title: home.title,
          district: home.district,
          price: home.rentPrice,
          roomSize: home.roomSizeM2 ? `${home.roomSizeM2}m2` : "N/A",
          roomSizeM2: home.roomSizeM2,
          totalRooms: home.totalRooms,
          currentResidents: home.memberships.length,
          availableFrom: home.availableFrom,
          matchScore,
          verified: home.verified,
          tags: [
            home.vibeSummary,
            home.minStayMonths ? `Min ${home.minStayMonths} months` : null,
          ].filter(Boolean),
          description: home.description || "No description provided yet.",
          amenities: home.amenities.map((amenity) => amenity.key),
          address: home.address,
          isFavorite: favoriteIds.has(home.id),
          applicationStatus: appStatusByListing.get(home.id) || null,
          residentNames,
          ownerName: home.owner.displayName || "Resident",
          preferenceVector: {
            cleanliness: home.prefCleanliness,
            recycling: home.prefRecycling,
            diy: home.prefDiy,
            cooking: home.prefCooking,
            quietness: home.prefQuietness,
            music: home.prefMusic,
            fitness: home.prefFitness,
            studyHabits: home.prefStudyHabits,
            social: home.prefSocial,
            parties: home.prefParties,
          },
        };
      })
      .filter((listing) => {
        if (favoritesOnly && !listing.isFavorite) {
          return false;
        }

        if (!search) {
          return true;
        }

        const haystack = `${listing.title} ${listing.district} ${listing.address || ""}`.toLowerCase();
        return haystack.includes(search);
      });

    return NextResponse.json({ listings });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to browse WG listings",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/match-score";

function computeProfileCompleteness(
  studentProfile: {
    fullName: string;
    age: number | null;
    bio: string | null;
    houseBio: string | null;
    university: string | null;
    degreeProgram: string | null;
    semester: string | null;
    location: string | null;
    contact: string | null;
    hobbies: string | null;
    languages: string | null;
    budgetMin: number | null;
    budgetMax: number | null;
    preferredDistricts: string | null;
    moveInDate: string | null;
    avatarUrl: string | null;
  } | null,
  hasPreferences: boolean,
) {
  const checks = [
    { label: "Full name", complete: Boolean(studentProfile?.fullName?.trim()) },
    {
      label: "Age",
      complete:
        studentProfile?.age !== null && studentProfile?.age !== undefined,
    },
    { label: "About me", complete: Boolean(studentProfile?.bio?.trim()) },
    { label: "WG bio", complete: Boolean(studentProfile?.houseBio?.trim()) },
    {
      label: "University",
      complete: Boolean(studentProfile?.university?.trim()),
    },
    {
      label: "Degree program",
      complete: Boolean(studentProfile?.degreeProgram?.trim()),
    },
    { label: "Semester", complete: Boolean(studentProfile?.semester?.trim()) },
    { label: "Location", complete: Boolean(studentProfile?.location?.trim()) },
    { label: "Contact", complete: Boolean(studentProfile?.contact?.trim()) },
    { label: "Hobbies", complete: Boolean(studentProfile?.hobbies?.trim()) },
    {
      label: "Languages",
      complete: Boolean(studentProfile?.languages?.trim()),
    },
    {
      label: "Minimum budget",
      complete:
        studentProfile?.budgetMin !== null &&
        studentProfile?.budgetMin !== undefined,
    },
    {
      label: "Maximum budget",
      complete:
        studentProfile?.budgetMax !== null &&
        studentProfile?.budgetMax !== undefined,
    },
    {
      label: "Preferred districts",
      complete: Boolean(studentProfile?.preferredDistricts?.trim()),
    },
    {
      label: "Move-in date",
      complete: Boolean(studentProfile?.moveInDate?.trim()),
    },
    {
      label: "Profile photo",
      complete: Boolean(studentProfile?.avatarUrl?.trim()),
    },
    { label: "Lifestyle preferences", complete: hasPreferences },
  ];

  const completed = checks.filter((item) => item.complete).length;
  const percentage = Math.round((completed / checks.length) * 100);
  const missing = checks
    .filter((item) => !item.complete)
    .map((item) => item.label);

  return { percentage, missing };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const [user, homeProfiles, applications] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          preference: true,
          studentProfile: {
            select: {
              fullName: true,
              age: true,
              bio: true,
              houseBio: true,
              university: true,
              degreeProgram: true,
              semester: true,
              location: true,
              contact: true,
              hobbies: true,
              languages: true,
              budgetMin: true,
              budgetMax: true,
              preferredDistricts: true,
              moveInDate: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.homeProfile.findMany({
        where: { isLive: true, ownerId: { not: userId } },
        select: {
          id: true,
          title: true,
          district: true,
          rentPrice: true,
          roomSizeM2: true,
          availableFrom: true,
          prefCleanliness: true,
          prefRecycling: true,
          prefDiy: true,
          prefCooking: true,
          prefQuietness: true,
          prefMusic: true,
          prefFitness: true,
          prefStudyHabits: true,
          prefSocial: true,
          prefParties: true,
        },
      }),
      prisma.application.findMany({
        where: { studentId: userId },
        select: {
          id: true,
          status: true,
          homeProfile: {
            select: {
              id: true,
              ownerId: true,
              memberships: {
                where: { role: "OWNER" },
                select: { userId: true },
              },
            },
          },
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const listingsWithScores = homeProfiles.map((home) => ({
      id: home.id,
      title: home.title,
      district: home.district,
      price: home.rentPrice,
      roomSize: home.roomSizeM2 ? `${home.roomSizeM2}m2` : "N/A",
      availableFrom: home.availableFrom,
      matchScore: calculateMatchScore(user.preference, home),
    }));

    listingsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    const topMatches = listingsWithScores.slice(0, 3);
    const averageMatch = listingsWithScores.length
      ? Math.round(
          listingsWithScores.reduce(
            (sum, listing) => sum + listing.matchScore,
            0,
          ) / listingsWithScores.length,
        )
      : 0;

    const viewStatuses = new Set([
      "VIEWED",
      "INTERVIEW",
      "ACCEPTED",
      "REJECTED",
    ]);
    const uniqueViewers = new Set<string>();

    for (const application of applications) {
      if (!viewStatuses.has(application.status)) continue;
      if (
        application.homeProfile.ownerId &&
        application.homeProfile.ownerId !== userId
      ) {
        uniqueViewers.add(application.homeProfile.ownerId);
      }
      for (const ownerMember of application.homeProfile.memberships) {
        if (ownerMember.userId !== userId) {
          uniqueViewers.add(ownerMember.userId);
        }
      }
    }

    const completeness = computeProfileCompleteness(
      user.studentProfile,
      Boolean(user.preference),
    );

    const strongMatches = listingsWithScores.filter(
      (listing) => listing.matchScore >= 70,
    ).length;

    return NextResponse.json({
      uniqueProfileViews: uniqueViewers.size,
      wgMatchesCount: listingsWithScores.length,
      averageMatch,
      strongMatches,
      topMatches,
      profileCompleteness: completeness,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load student overview",
      },
      { status: 500 },
    );
  }
}

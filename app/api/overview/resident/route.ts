import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function computeListingCompleteness(listing: {
  title: string;
  district: string;
  description: string | null;
  address: string | null;
  rentPrice: number;
  roomSizeM2: number | null;
  availableFrom: string | null;
  vibeSummary: string | null;
  amenities: Array<{ id: string }>;
  photos: Array<{ id: string }>;
  rules: Array<{ id: string }>;
}) {
  const checks = [
    Boolean(listing.title.trim()),
    Boolean(listing.district.trim()),
    Boolean(listing.description?.trim()),
    Boolean(listing.address?.trim()),
    listing.rentPrice > 0,
    listing.roomSizeM2 !== null && listing.roomSizeM2 !== undefined,
    Boolean(listing.availableFrom?.trim()),
    Boolean(listing.vibeSummary?.trim()),
    listing.amenities.length > 0,
    listing.photos.length > 0,
    listing.rules.length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function toRelativeTime(iso: string) {
  const value = new Date(iso).getTime();
  const now = Date.now();
  const minutes = Math.max(1, Math.round((now - value) / 60000));

  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const manageableListings = await prisma.homeProfile.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { memberships: { some: { userId, role: "OWNER" } } },
        ],
      },
      select: {
        id: true,
        ownerId: true,
        title: true,
        district: true,
        description: true,
        address: true,
        rentPrice: true,
        roomSizeM2: true,
        availableFrom: true,
        vibeSummary: true,
        amenities: { select: { id: true } },
        photos: { select: { id: true } },
        rules: { select: { id: true } },
      },
    });

    const listingIds = manageableListings.map((listing) => listing.id);

    if (!listingIds.length) {
      return NextResponse.json({
        newApplications: 0,
        profileViews: 0,
        interviews: 0,
        matchesMade: 0,
        recentApplicants: [],
        activity: { pending: 0, viewed: 0, interview: 0 },
        listingCompleteness: 0,
      });
    }

    const [applications, interviewCount] = await Promise.all([
      prisma.application.findMany({
        where: { homeProfileId: { in: listingIds } },
        select: {
          id: true,
          status: true,
          matchScore: true,
          updatedAt: true,
          studentId: true,
          student: {
            select: {
              displayName: true,
              email: true,
              studentProfile: { select: { fullName: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.interview.count({
        where: {
          status: "UPCOMING",
          application: { homeProfileId: { in: listingIds } },
        },
      }),
    ]);

    const newApplications = applications.filter(
      (item) => item.status === "PENDING",
    ).length;
    const matchesMade = applications.filter(
      (item) => item.status === "ACCEPTED",
    ).length;
    const profileViews = new Set(applications.map((item) => item.studentId))
      .size;

    const recentApplicants = applications.slice(0, 5).map((item) => {
      const name =
        item.student.displayName ||
        item.student.studentProfile?.fullName ||
        item.student.email;
      const initials =
        name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join("") || "NA";

      const normalizedStatus =
        item.status === "PENDING"
          ? "new"
          : item.status === "VIEWED"
            ? "viewed"
            : item.status === "INTERVIEW"
              ? "interview"
              : "other";

      return {
        id: item.id,
        initials,
        score: item.matchScore,
        status: normalizedStatus,
        time: toRelativeTime(item.updatedAt.toISOString()),
      };
    });

    const listingCompleteness = Math.round(
      manageableListings.reduce(
        (sum, listing) => sum + computeListingCompleteness(listing),
        0,
      ) / manageableListings.length,
    );

    return NextResponse.json({
      newApplications,
      profileViews,
      interviews: interviewCount,
      matchesMade,
      recentApplicants,
      activity: {
        pending: applications.filter((item) => item.status === "PENDING")
          .length,
        viewed: applications.filter((item) => item.status === "VIEWED").length,
        interview: applications.filter((item) => item.status === "INTERVIEW")
          .length,
      },
      listingCompleteness,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load resident overview",
      },
      { status: 500 },
    );
  }
}

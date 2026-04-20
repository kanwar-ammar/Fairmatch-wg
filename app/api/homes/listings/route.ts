import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const listingPreviewSelect = {
  id: true,
  title: true,
  district: true,
  rentPrice: true,
  roomSizeM2: true,
  availableFrom: true,
  availableRooms: true,
  isLive: true,
  updatedAt: true,
} as const;

async function findAnchorListing(userId: string, listingId?: string | null) {
  if (listingId) {
    return prisma.homeProfile.findFirst({
      where: {
        id: listingId,
        OR: [{ ownerId: userId }, { memberships: { some: { userId } } }],
      },
      include: {
        memberships: true,
      },
    });
  }

  const ownerListing = await prisma.homeProfile.findFirst({
    where: { ownerId: userId },
    include: { memberships: true },
  });

  if (ownerListing) return ownerListing;

  const membership = await prisma.homeMembership.findFirst({
    where: { userId },
    include: {
      homeProfile: {
        include: { memberships: true },
      },
    },
  });

  return membership?.homeProfile ?? null;
}

function canManageListing(
  listing: {
    ownerId: string;
    memberships: Array<{ userId: string; role: string }>;
  },
  userId: string,
) {
  return (
    listing.ownerId === userId ||
    listing.memberships.some(
      (member) => member.userId === userId && member.role === "OWNER",
    )
  );
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const listingId = url.searchParams.get("listingId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const anchor = await findAnchorListing(userId, listingId);
    if (!anchor) {
      return NextResponse.json(
        { error: "No accessible listing found" },
        { status: 404 },
      );
    }

    const listings = await prisma.homeProfile.findMany({
      where: {
        ownerId: anchor.ownerId,
      },
      select: listingPreviewSelect,
      orderBy: [{ updatedAt: "desc" }],
    });

    const ownerForAnchor = canManageListing(anchor, userId);

    return NextResponse.json({
      listings,
      currentListingId: anchor.id,
      ownerForAnchor,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load listings",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const listingId = url.searchParams.get("listingId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const anchor = await findAnchorListing(userId, listingId);
    if (!anchor) {
      return NextResponse.json(
        { error: "No accessible listing found" },
        { status: 404 },
      );
    }

    if (!canManageListing(anchor, userId)) {
      return NextResponse.json(
        { error: "Only owners can create listings" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      district?: string;
      address?: string;
      rentPrice?: number;
      depositAmount?: number;
      roomSizeM2?: number;
      totalRooms?: number;
      availableRooms?: number;
      availableFrom?: string;
      minStayMonths?: number;
      isLive?: boolean;
      vibeSummary?: string;
    };

    const title = String(body.title ?? "").trim();
    const district = String(body.district ?? "").trim();
    if (!title || !district) {
      return NextResponse.json(
        { error: "Title and district are required" },
        { status: 400 },
      );
    }

    const membershipsToCopy = anchor.memberships.map((member) => ({
      userId: member.userId,
      role: member.role,
      displayName: member.displayName,
      isPrimaryContact: member.isPrimaryContact,
    }));

    const created = await prisma.$transaction(async (tx) => {
      const createdListing = await tx.homeProfile.create({
        data: {
          ownerId: anchor.ownerId,
          title,
          description: String(body.description ?? "").trim() || null,
          district,
          address: String(body.address ?? "").trim() || null,
          rentPrice: Math.max(0, Number(body.rentPrice ?? 0) || 0),
          depositAmount: Math.max(0, Number(body.depositAmount ?? 0) || 0),
          roomSizeM2: Math.max(0, Number(body.roomSizeM2 ?? 0) || 0),
          totalRooms: Math.max(1, Number(body.totalRooms ?? 1) || 1),
          availableRooms: Math.max(1, Number(body.availableRooms ?? 1) || 1),
          availableFrom: String(body.availableFrom ?? "").trim() || null,
          minStayMonths: Math.max(0, Number(body.minStayMonths ?? 0) || 0),
          isLive: body.isLive ?? false,
          vibeSummary: String(body.vibeSummary ?? "").trim() || null,
        },
        select: { id: true },
      });

      if (membershipsToCopy.length > 0) {
        await tx.homeMembership.createMany({
          data: membershipsToCopy.map((member) => ({
            homeProfileId: createdListing.id,
            userId: member.userId,
            role: member.role,
            displayName: member.displayName,
            isPrimaryContact: member.isPrimaryContact,
          })),
        });
      }

      return tx.homeProfile.findUniqueOrThrow({
        where: { id: createdListing.id },
        select: listingPreviewSelect,
      });
    });

    return NextResponse.json({ listing: created });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create listing",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const body = (await request.json()) as { listingId?: string };
    const listingId = body.listingId;

    if (!listingId) {
      return NextResponse.json(
        { error: "listingId required" },
        { status: 400 },
      );
    }

    const listing = await prisma.homeProfile.findFirst({
      where: {
        id: listingId,
        OR: [
          { ownerId: userId },
          { memberships: { some: { userId, role: "OWNER" } } },
        ],
      },
      include: {
        memberships: true,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found or inaccessible" },
        { status: 404 },
      );
    }

    if (!canManageListing(listing, userId)) {
      return NextResponse.json(
        { error: "Only owners can delete listings" },
        { status: 403 },
      );
    }

    const listingCountInGroup = await prisma.homeProfile.count({
      where: { ownerId: listing.ownerId },
    });

    if (listingCountInGroup <= 1) {
      return NextResponse.json(
        { error: "At least one listing must remain in this WG" },
        { status: 400 },
      );
    }

    await prisma.homeProfile.delete({
      where: { id: listing.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete listing",
      },
      { status: 500 },
    );
  }
}

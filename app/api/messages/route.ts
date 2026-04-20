import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function displayNameForUser(user: {
  displayName: string | null;
  studentProfile: { fullName: string | null } | null;
  residentProfile: { fullName: string | null } | null;
  email: string;
}) {
  return (
    user.displayName ||
    user.studentProfile?.fullName ||
    user.residentProfile?.fullName ||
    user.email
  );
}

async function getResidentListingIds(userId: string) {
  const listings = await prisma.homeProfile.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { memberships: { some: { userId } } },
      ],
    },
    select: { id: true },
  });

  return listings.map((listing) => listing.id);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const role = url.searchParams.get("role") || "student";

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const whereClause =
      role === "resident"
        ? {
            homeProfileId: {
              in: await getResidentListingIds(userId),
            },
          }
        : {
            application: {
              studentId: userId,
            },
          };

    const messages = await prisma.applicationMessage.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            displayName: true,
            studentProfile: { select: { fullName: true } },
            residentProfile: { select: { fullName: true } },
          },
        },
        application: {
          select: {
            id: true,
            status: true,
            student: {
              select: {
                id: true,
                email: true,
                displayName: true,
                studentProfile: { select: { fullName: true } },
                residentProfile: { select: { fullName: true } },
              },
            },
          },
        },
        homeProfile: {
          select: {
            id: true,
            title: true,
            district: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const threadsMap = new Map<string, {
      applicationId: string;
      homeProfileId: string;
      homeTitle: string;
      district: string;
      applicationStatus: string;
      studentName: string;
      messages: Array<{
        id: string;
        senderId: string;
        senderName: string;
        text: string;
        createdAt: string;
      }>;
    }>();

    for (const message of messages) {
      const key = message.applicationId;
      const existing = threadsMap.get(key);
      const senderName = displayNameForUser(message.sender);
      const studentName = displayNameForUser(message.application.student);

      if (!existing) {
        threadsMap.set(key, {
          applicationId: message.applicationId,
          homeProfileId: message.homeProfileId,
          homeTitle: message.homeProfile.title,
          district: message.homeProfile.district,
          applicationStatus: message.application.status,
          studentName,
          messages: [
            {
              id: message.id,
              senderId: message.senderId,
              senderName,
              text: message.text,
              createdAt: message.createdAt.toISOString(),
            },
          ],
        });
      } else {
        existing.messages.push({
          id: message.id,
          senderId: message.senderId,
          senderName,
          text: message.text,
          createdAt: message.createdAt.toISOString(),
        });
      }
    }

    return NextResponse.json({ threads: Array.from(threadsMap.values()) });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load messages",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      applicationId?: string;
      text?: string;
    };

    if (!body.userId || !body.applicationId) {
      return NextResponse.json(
        { error: "userId and applicationId are required" },
        { status: 400 },
      );
    }

    const text = String(body.text || "").trim();
    if (!text) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: body.applicationId },
      include: {
        homeProfile: {
          include: {
            memberships: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const isStudent = application.studentId === body.userId;
    const isResidentInListing =
      application.homeProfile.ownerId === body.userId ||
      application.homeProfile.memberships.some(
        (member) => member.userId === body.userId,
      );

    if (!isStudent && !isResidentInListing) {
      return NextResponse.json(
        { error: "Not authorized to send a message in this thread" },
        { status: 403 },
      );
    }

    const message = await prisma.applicationMessage.create({
      data: {
        applicationId: application.id,
        homeProfileId: application.homeProfileId,
        senderId: body.userId,
        text,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send message",
      },
      { status: 500 },
    );
  }
}

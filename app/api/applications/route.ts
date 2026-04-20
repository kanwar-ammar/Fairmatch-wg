import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/match-score";

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
    const role = url.searchParams.get("role") || "student";

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    if (role === "resident") {
      const manageableListings = await prisma.homeProfile.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { memberships: { some: { userId, role: "OWNER" } } },
          ],
        },
        select: { id: true },
      });

      const listingIds = manageableListings.map((listing) => listing.id);

      const applications = await prisma.application.findMany({
        where: {
          homeProfileId: { in: listingIds.length ? listingIds : ["__none__"] },
        },
        include: {
          student: {
            select: {
              id: true,
              email: true,
              displayName: true,
              studentProfile: {
                select: {
                  fullName: true,
                  university: true,
                  degreeProgram: true,
                  semester: true,
                  age: true,
                  bio: true,
                  houseBio: true,
                  contact: true,
                  hobbies: true,
                  languages: true,
                  location: true,
                },
              },
            },
          },
          homeProfile: {
            select: {
              id: true,
              title: true,
              district: true,
              rentPrice: true,
              roomSizeM2: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: {
                  displayName: true,
                  studentProfile: { select: { fullName: true } },
                  residentProfile: { select: { fullName: true } },
                },
              },
            },
          },
          interviews: {
            orderBy: { scheduledAt: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return NextResponse.json({ applications });
    }

    const applications = await prisma.application.findMany({
      where: { studentId: userId },
      include: {
        homeProfile: {
          include: {
            memberships: {
              include: {
                user: {
                  select: {
                    displayName: true,
                    studentProfile: { select: { fullName: true } },
                    residentProfile: { select: { fullName: true } },
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                displayName: true,
                studentProfile: { select: { fullName: true } },
                residentProfile: { select: { fullName: true } },
              },
            },
          },
        },
        interviews: {
          orderBy: { scheduledAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load applications",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      homeProfileId?: string;
      message?: string;
    };

    if (!body.userId || !body.homeProfileId) {
      return NextResponse.json(
        { error: "userId and homeProfileId are required" },
        { status: 400 },
      );
    }

    const message = String(body.message || "").trim();
    if (!message) {
      return NextResponse.json(
        { error: "Application message is required" },
        { status: 400 },
      );
    }

    const [user, home] = await Promise.all([
      prisma.user.findUnique({
        where: { id: body.userId },
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
      prisma.homeProfile.findUnique({
        where: { id: body.homeProfileId },
        select: {
          id: true,
          isLive: true,
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
    ]);

    if (!user || !home) {
      return NextResponse.json(
        { error: "User or listing not found" },
        { status: 404 },
      );
    }

    if (!home.isLive) {
      return NextResponse.json(
        { error: "This listing is currently hidden" },
        { status: 400 },
      );
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_homeProfileId: {
          studentId: body.userId,
          homeProfileId: body.homeProfileId,
        },
      },
      select: { id: true, status: true },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          error: `You already applied for this listing (${existingApplication.status}).`,
          status: existingApplication.status,
        },
        { status: 409 },
      );
    }

    const acceptedApplicationExists = await prisma.application.findFirst({
      where: {
        homeProfileId: body.homeProfileId,
        status: "ACCEPTED",
      },
      select: { id: true },
    });

    if (acceptedApplicationExists) {
      return NextResponse.json(
        { error: "This listing already has an accepted applicant." },
        { status: 400 },
      );
    }

    const matchScore = calculateMatchScore(user.preference, home);

    const application = await prisma.$transaction(async (tx) => {
      const created = await tx.application.create({
        data: {
          studentId: body.userId as string,
          homeProfileId: body.homeProfileId as string,
          status: "PENDING",
          matchScore,
          message,
        },
      });

      await tx.applicationMessage.create({
        data: {
          applicationId: created.id,
          homeProfileId: body.homeProfileId as string,
          senderId: body.userId as string,
          text: message,
        },
      });

      return created;
    });

    return NextResponse.json({ application });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit application",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      applicationId?: string;
      status?: "PENDING" | "INTERVIEW" | "ACCEPTED" | "REJECTED";
      scheduledAt?: string;
      notes?: string;
      location?: string;
      interviewType?: string;
    };

    if (!body.userId || !body.applicationId || !body.status) {
      return NextResponse.json(
        { error: "userId, applicationId and status are required" },
        { status: 400 },
      );
    }

    const application = await prisma.application.findUnique({
      where: { id: body.applicationId },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            displayName: true,
            studentProfile: {
              select: { fullName: true },
            },
          },
        },
        homeProfile: {
          include: {
            memberships: {
              select: {
                userId: true,
                role: true,
                displayName: true,
                isPrimaryContact: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    if (!canManageListing(application.homeProfile, body.userId)) {
      return NextResponse.json(
        { error: "Only WG owners can update application status" },
        { status: 403 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (body.status === "INTERVIEW") {
        const interviewDate = body.scheduledAt
          ? new Date(body.scheduledAt)
          : null;
        if (!interviewDate || Number.isNaN(interviewDate.getTime())) {
          throw new Error("scheduledAt is required for interview status");
        }

        const latestInterview = await tx.interview.findFirst({
          where: { applicationId: application.id },
          orderBy: { scheduledAt: "desc" },
        });

        if (latestInterview) {
          await tx.interview.update({
            where: { id: latestInterview.id },
            data: {
              scheduledAt: interviewDate,
              type: body.interviewType || latestInterview.type,
              location: body.location ?? latestInterview.location,
              notes: body.notes ?? latestInterview.notes,
              status: "UPCOMING",
            },
          });
        } else {
          await tx.interview.create({
            data: {
              applicationId: application.id,
              scheduledAt: interviewDate,
              type: body.interviewType || "video",
              location: body.location || null,
              notes: body.notes || null,
              status: "UPCOMING",
            },
          });
        }
      }

      if (body.status === "ACCEPTED") {
        // Add student as member to the WG
        await tx.homeMembership.upsert({
          where: {
            homeProfileId_userId: {
              homeProfileId: application.homeProfileId,
              userId: application.studentId,
            },
          },
          create: {
            homeProfileId: application.homeProfileId,
            userId: application.studentId,
            role: "MEMBER",
            displayName:
              application.student.displayName ||
              application.student.studentProfile?.fullName ||
              application.student.email,
          },
          update: {
            role: "MEMBER",
            displayName:
              application.student.displayName ||
              application.student.studentProfile?.fullName ||
              application.student.email,
          },
        });

        // Reject all other pending and interview applications for this listing
        await tx.application.updateMany({
          where: {
            homeProfileId: application.homeProfileId,
            id: { not: application.id },
            status: { in: ["PENDING", "INTERVIEW"] },
          },
          data: { status: "REJECTED" },
        });

        // Cancel all interviews for rejected applications
        const otherApplicationIds = await tx.application.findMany({
          where: {
            homeProfileId: application.homeProfileId,
            id: { not: application.id },
            status: "REJECTED",
          },
          select: { id: true },
        });

        for (const app of otherApplicationIds) {
          await tx.interview.updateMany({
            where: { applicationId: app.id },
            data: { status: "CANCELLED" },
          });
        }
      }

      if (body.status === "REJECTED") {
        await tx.interview.updateMany({
          where: { applicationId: application.id },
          data: { status: "CANCELLED" },
        });
      }

      return tx.application.update({
        where: { id: application.id },
        data: { status: body.status },
        include: {
          interviews: {
            orderBy: { scheduledAt: "desc" },
            take: 1,
          },
        },
      });
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update application status",
      },
      { status: 500 },
    );
  }
}

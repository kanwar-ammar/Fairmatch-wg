import {
  PrismaClient,
  UserRole,
  VerificationStatus,
  MembershipRole,
  DocumentType,
  ApplicationStatus,
  InterviewStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SEEDED_DEFAULT_PASSWORD = "password123";

async function main() {
  const seededPasswordHash = await bcrypt.hash(SEEDED_DEFAULT_PASSWORD, 10);

  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.verificationDocument.deleteMany();
  await prisma.studentPreference.deleteMany();
  await prisma.homeMembership.deleteMany();
  await prisma.homeRule.deleteMany();
  await prisma.homeAmenity.deleteMany();
  await prisma.homePhoto.deleteMany();
  await prisma.homeProfile.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.residentProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  const studentUser = await prisma.user.create({
    data: {
      email: "ammar@example.com",
      passwordHash: seededPasswordHash,
      displayName: "Ammar Ali",
      role: UserRole.STUDENT,
      settings: {
        create: {
          activeRole: "STUDENT",
        },
      },
      studentProfile: {
        create: {
          fullName: "Ammar Ali",
          age: 25,
          bio: "Hi! I'm Ammar, a Computer Science Master's student at University of Bremen. I'm tidy, enjoy cooking for the WG, and value a quiet environment for studying. On weekends, I love exploring the city, visiting flea markets, and cycling along the Spree. Looking for a welcoming WG where we share meals and respect each other's space.",
          university: "University of Bremen",
          degreeProgram: "M.Sc. Computer Science",
          semester: "3rd (Master's)",
          location: "Berlin, Germany",
          languages: "German, English, Turkish",
          budgetMin: 350,
          budgetMax: 550,
          preferredDistricts: "Kreuzberg, Neukölln, Mitte",
          moveInDate: "March 2026",
          avatarUrl: "/placeholder-avatar.jpg",
          verificationStatus: VerificationStatus.VERIFIED,
        },
      },
      preference: {
        create: {
          cleanliness: 85,
          recycling: 90,
          diy: 60,
          cooking: 75,
          quietness: 70,
          music: 45,
          fitness: 65,
          studyHabits: 80,
          socialActivity: 55,
          parties: 35,
          petFriendly: true,
          smokingAllowed: false,
        },
      },
      verificationDocs: {
        create: [
          {
            type: DocumentType.STUDENT_ID,
            label: "Student ID",
            fileName: "student-id.pdf",
            status: VerificationStatus.VERIFIED,
          },
          {
            type: DocumentType.UNIVERSITY_EMAIL,
            label: "University Email",
            fileName: "university-email.pdf",
            status: VerificationStatus.VERIFIED,
          },
          {
            type: DocumentType.ID_DOCUMENT,
            label: "ID Document",
            fileName: "id-document.pdf",
            status: VerificationStatus.VERIFIED,
          },
          {
            type: DocumentType.ENROLLMENT_PROOF,
            label: "Enrollment Proof",
            fileName: "enrollment-proof.pdf",
            status: VerificationStatus.PENDING,
          },
        ],
      },
    },
  });

  const mariaUser = await prisma.user.create({
    data: {
      email: "maria@example.com",
      passwordHash: seededPasswordHash,
      displayName: "Maria Kovacs",
      role: UserRole.RESIDENT,
      settings: {
        create: {
          activeRole: "RESIDENT",
        },
      },
      residentProfile: {
        create: {
          fullName: "Maria Kovacs",
          age: 24,
          bio: "I'm passionate about sustainable design and love creating cozy spaces. I enjoy cooking Mediterranean food and having coffee mornings with my flatmates. Early riser, usually in bed by 23:00.",
          city: "Berlin",
          avatarUrl: "/placeholder-avatar.jpg",
          verificationStatus: VerificationStatus.VERIFIED,
        },
      },
    },
  });

  const jonasUser = await prisma.user.create({
    data: {
      email: "jonas@example.com",
      passwordHash: seededPasswordHash,
      displayName: "Jonas Becker",
      role: UserRole.RESIDENT,
      settings: {
        create: {
          activeRole: "RESIDENT",
        },
      },
      residentProfile: {
        create: {
          fullName: "Jonas Becker",
          age: 26,
          bio: "Book nerd and amateur guitarist. I like a quiet atmosphere for reading but I am always up for a movie night or board game evening. I handle the recycling schedule for the WG.",
          city: "Berlin",
          avatarUrl: "/placeholder-avatar.jpg",
          verificationStatus: VerificationStatus.VERIFIED,
        },
      },
    },
  });

  const home = await prisma.homeProfile.create({
    data: {
      ownerId: mariaUser.id,
      title: "Sunny 3er-WG in Kreuzberg",
      description:
        "A bright, spacious room in a lively Kreuzberg WG. We love cooking together and keeping things tidy.",
      district: "Kreuzberg",
      address: "Kreuzberg, Berlin",
      rentPrice: 480,
      depositAmount: 960,
      roomSizeM2: 18,
      totalRooms: 3,
      availableRooms: 1,
      availableFrom: "Mar 1, 2026",
      minStayMonths: 12,
      verified: true,
      vibeSummary:
        "Shared meals, tidy routines, and a welcoming social atmosphere.",
      memberships: {
        create: [
          {
            userId: mariaUser.id,
            role: MembershipRole.OWNER,
            displayName: "Maria",
            isPrimaryContact: true,
          },
          {
            userId: jonasUser.id,
            role: MembershipRole.MEMBER,
            displayName: "Jonas",
          },
        ],
      },
      amenities: {
        create: [
          { key: "wifi", enabled: true, sortOrder: 1 },
          { key: "bike", enabled: true, sortOrder: 2 },
          { key: "green", enabled: true, sortOrder: 3 },
        ],
      },
      rules: {
        create: [
          {
            text: "Kitchen must be cleaned after cooking (same day)",
            category: "cleaning",
            sortOrder: 1,
          },
          {
            text: "Quiet hours: 22:00 - 08:00 on weekdays, 23:00 - 09:00 on weekends",
            category: "noise",
            sortOrder: 2,
          },
          {
            text: "Overnight guests need a heads-up in the WG group chat",
            category: "guests",
            sortOrder: 3,
          },
          {
            text: "Shared expenses split equally",
            category: "shared",
            sortOrder: 4,
          },
          {
            text: "No smoking inside the apartment",
            category: "general",
            sortOrder: 5,
          },
        ],
      },
    },
  });

  const application = await prisma.application.create({
    data: {
      studentId: studentUser.id,
      homeProfileId: home.id,
      status: ApplicationStatus.INTERVIEW,
      blindPhase: false,
      matchScore: 92,
      message:
        "Hi! I am a tidy, quiet student who loves cooking for flatmates. I work from home sometimes and value a calm environment. Looking forward to meeting you!",
    },
  });

  await prisma.interview.create({
    data: {
      applicationId: application.id,
      scheduledAt: new Date("2026-02-09T18:30:00.000Z"),
      type: "in-person",
      location: "Kreuzberg, Berlin",
      notes: "Coffee chat with the full WG",
      status: InterviewStatus.UPCOMING,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

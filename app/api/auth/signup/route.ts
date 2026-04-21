import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/auth-schemas";
import { normalizeGermanRegion } from "@/lib/german-regions";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid signup payload." },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const normalizedLocation = normalizeGermanRegion(data.location);

    if (!normalizedLocation) {
      return NextResponse.json(
        { error: "Please select a valid location from the regional list." },
        { status: 400 },
      );
    }

    const normalizedEmail = data.email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(data.password);

    const created = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        displayName: data.fullName,
        role: "STUDENT",
        settings: {
          create: {
            activeRole: "STUDENT",
          },
        },
        studentProfile: {
          create: {
            fullName: data.fullName,
            location: normalizedLocation,
          },
        },
      },
      include: {
        settings: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: created.id,
        email: created.email,
        activeRole: created.settings?.activeRole ?? "STUDENT",
        fullName: created.displayName ?? created.email,
        capabilities: {
          canUseStudent: true,
          canUseResident: false,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signup failed." },
      { status: 500 },
    );
  }
}

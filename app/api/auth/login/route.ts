import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/auth-schemas";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid login payload." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
      include: {
        settings: true,
        studentProfile: true,
        residentProfile: true,
        memberships: {
          select: { id: true },
        },
        ownedHomes: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const passwordOk = await verifyPassword(
      parsed.data.password,
      user.passwordHash,
    );
    if (!passwordOk) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const fullName =
      user.displayName ??
      user.studentProfile?.fullName ??
      user.residentProfile?.fullName ??
      user.email;

    const canUseResident =
      user.ownedHomes.length > 0 || user.memberships.length > 0;

    const activeRole =
      user.settings?.activeRole === "RESIDENT" && canUseResident
        ? "RESIDENT"
        : "STUDENT";

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        activeRole,
        fullName,
        capabilities: {
          canUseStudent: true,
          canUseResident,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

import { updateActiveRoleSchema } from "@/lib/auth-schemas";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = updateActiveRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ?? "Invalid active role payload.",
        },
        { status: 400 },
      );
    }

    const { userId, activeRole } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: { select: { id: true } },
        ownedHomes: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const canUseResident =
      user.ownedHomes.length > 0 || user.memberships.length > 0;

    if (activeRole === "RESIDENT" && !canUseResident) {
      return NextResponse.json(
        {
          error:
            "Resident mode requires being part of a WG. Join or create a house first.",
        },
        { status: 403 },
      );
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        activeRole,
      },
      update: {
        activeRole,
      },
    });

    return NextResponse.json({
      ok: true,
      activeRole: settings.activeRole,
      capabilities: {
        canUseStudent: true,
        canUseResident,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update active role.",
      },
      { status: 500 },
    );
  }
}

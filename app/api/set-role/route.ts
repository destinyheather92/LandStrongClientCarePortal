import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { assignRole, getCurrentActor } from "@/lib/auth-roles";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const actor = await getCurrentActor();
  if (actor?.role) {
    // Role already assigned — don't let it be reassigned via this endpoint.
    return NextResponse.json({ role: actor.role });
  }

  const body = await request.json().catch(() => ({}));
  const requestedRole = body.role === "therapist" ? "therapist" : "client";

  const role = await assignRole(userId, requestedRole);
  return NextResponse.json({ role });
}

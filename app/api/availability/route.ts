import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-roles";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(request: Request) {
  await requireRole("client");

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "A valid ?date=YYYY-MM-DD is required." }, { status: 400 });
  }

  const result = await getAvailableSlots(date);
  return NextResponse.json(result);
}

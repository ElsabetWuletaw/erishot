import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/backend/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAdminSessionCookie(response);

  return response;
}

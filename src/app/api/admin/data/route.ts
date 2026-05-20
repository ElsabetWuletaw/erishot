import { NextResponse } from "next/server";
import { getAdminSession } from "@/backend/admin-auth";
import { getAdminData } from "@/backend/admin-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  return NextResponse.json({
    data: await getAdminData()
  });
}

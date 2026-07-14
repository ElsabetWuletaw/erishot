import { NextResponse } from "next/server";
import { getAdminSession } from "@/backend/admin-auth";
import { updateSiteSettings } from "@/backend/admin-store";
import {
  getValidationError,
  siteSettingsSchema
} from "@/backend/admin-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = siteSettingsSchema.parse(await request.json());

    return NextResponse.json({
      data: await updateSiteSettings(body)
    });
  } catch (error) {
    return NextResponse.json(
      { error: getValidationError(error) },
      { status: 400 }
    );
  }
}

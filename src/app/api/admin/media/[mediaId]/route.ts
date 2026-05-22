import { NextResponse } from "next/server";
import { deleteAdminMedia, updateAdminMedia } from "@/backend/admin-store";
import { getAdminSession } from "@/backend/admin-auth";
import {
  adminMediaSchema,
  getValidationError
} from "@/backend/admin-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { mediaId: string } }
) {
  const session = getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = adminMediaSchema.parse(await request.json());

    return NextResponse.json({
      data: await updateAdminMedia(params.mediaId, body)
    });
  } catch (error) {
    return NextResponse.json(
      { error: getValidationError(error) },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { mediaId: string } }
) {
  const session = getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    return NextResponse.json({
      data: await deleteAdminMedia(params.mediaId)
    });
  } catch (error) {
    return NextResponse.json(
      { error: getValidationError(error) },
      { status: 400 }
    );
  }
}

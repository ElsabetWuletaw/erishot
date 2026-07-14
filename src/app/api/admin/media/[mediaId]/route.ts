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
  { params }: { params: Promise<{ mediaId: string }> }
) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = adminMediaSchema.parse(await request.json());

    const { mediaId } = await params;

    return NextResponse.json({
      data: await updateAdminMedia(mediaId, body)
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
  { params }: { params: Promise<{ mediaId: string }> }
) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { mediaId } = await params;

    return NextResponse.json({
      data: await deleteAdminMedia(mediaId)
    });
  } catch (error) {
    return NextResponse.json(
      { error: getValidationError(error) },
      { status: 400 }
    );
  }
}

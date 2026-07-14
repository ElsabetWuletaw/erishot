import { NextResponse } from "next/server";
import { getAdminSession } from "@/backend/admin-auth";
import { updateContactMessageStatus } from "@/backend/admin-store";
import {
  getValidationError,
  messageStatusUpdateSchema
} from "@/backend/admin-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = messageStatusUpdateSchema.parse(await request.json());

    const { messageId } = await params;

    return NextResponse.json({
      data: await updateContactMessageStatus(messageId, body.status)
    });
  } catch (error) {
    return NextResponse.json(
      { error: getValidationError(error) },
      { status: 400 }
    );
  }
}

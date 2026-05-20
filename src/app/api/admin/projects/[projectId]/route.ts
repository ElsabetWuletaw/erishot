import { NextResponse } from "next/server";
import { getAdminSession } from "@/backend/admin-auth";
import { updateAdminProjectStatus } from "@/backend/admin-store";
import {
  getValidationError,
  projectStatusUpdateSchema
} from "@/backend/admin-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = projectStatusUpdateSchema.parse(await request.json());

    return NextResponse.json({
      data: await updateAdminProjectStatus(params.projectId, body.status)
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? getValidationError(error)
            : "Could not update the project."
      },
      { status: 400 }
    );
  }
}

import { NextResponse } from "next/server";
import { getAdminSession } from "@/backend/admin-auth";
import { addAdminMedia } from "@/backend/admin-store";
import { adminMediaSchema, getValidationError } from "@/backend/admin-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readUploadedFile(formData: FormData) {
  const value = formData.get("file");

  if (value && typeof value === "object" && "arrayBuffer" in value) {
    return value as File;
  }

  return null;
}

export async function POST(request: Request) {
  const session = getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const mediaInput = adminMediaSchema.parse({
        title: readString(formData, "title"),
        category: readString(formData, "category"),
        mediaType: readString(formData, "mediaType"),
        description: readString(formData, "description")
      });
    const data = await addAdminMedia(mediaInput, readUploadedFile(formData));

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? getValidationError(error)
            : "Could not save the media record."
      },
      { status: 400 }
    );
  }
}

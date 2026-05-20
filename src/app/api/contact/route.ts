import { NextResponse } from "next/server";
import { addContactMessage } from "@/backend/admin-store";
import {
  contactMessageSchema,
  getValidationError
} from "@/backend/admin-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = contactMessageSchema.parse(await request.json());
    const message = await addContactMessage(body);

    return NextResponse.json({
      message: "Your message has been saved.",
      id: message.id
    });
  } catch (error) {
    return NextResponse.json(
      { error: getValidationError(error) },
      { status: 400 }
    );
  }
}

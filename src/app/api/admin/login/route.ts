import { NextResponse } from "next/server";
import {
  getConfiguredAdminEmail,
  isValidAdminLogin,
  setAdminSessionCookie
} from "@/backend/admin-auth";
import { getAdminData } from "@/backend/admin-store";
import { adminLoginSchema, getValidationError } from "@/backend/admin-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = adminLoginSchema.parse(await request.json());

    if (!(await isValidAdminLogin(body.email, body.password))) {
      return NextResponse.json(
        { error: "The email or password is incorrect." },
        { status: 401 }
      );
    }

    const email = getConfiguredAdminEmail();
    const response = NextResponse.json({
      email,
      data: await getAdminData()
    });

    setAdminSessionCookie(response, email);

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: getValidationError(error) },
      { status: 400 }
    );
  }
}

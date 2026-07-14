import { NextResponse } from "next/server";
import { getAdminSession } from "@/backend/admin-auth";
import { updatePortfolioReviewVisibility } from "@/backend/admin-store";
import {
  getValidationError,
  portfolioReviewVisibilitySchema
} from "@/backend/admin-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = portfolioReviewVisibilitySchema.parse(await request.json());

    const { reviewId } = await params;

    return NextResponse.json({
      data: await updatePortfolioReviewVisibility(reviewId, body.hidden)
    });
  } catch (error) {
    return NextResponse.json(
      { error: getValidationError(error) },
      { status: 400 }
    );
  }
}

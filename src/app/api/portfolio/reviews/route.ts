import { NextResponse } from "next/server";
import { addPortfolioReview } from "@/backend/portfolio-reviews";
import {
  getValidationError,
  portfolioReviewSchema
} from "@/backend/admin-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = portfolioReviewSchema.parse(await request.json());
    const data = await addPortfolioReview(body);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: getValidationError(error) },
      { status: 400 }
    );
  }
}

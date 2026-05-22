import { prisma } from "@/backend/prisma";
import { editorialNotes, ratingSummary } from "@/frontend/content/portfolio-content";
import type { PortfolioReview } from "@/shared/admin-types";

export type PortfolioReviewSummary = {
  averageRating: number;
  reviewCount: number;
  reviews: PortfolioReview[];
};

type AddPortfolioReviewInput = {
  name: string;
  rating: number;
  note: string;
};

function toPortfolioReview(review: {
  id: string;
  name: string;
  rating: number;
  note: string;
  createdAt: Date;
}): PortfolioReview {
  return {
    id: review.id,
    name: review.name,
    rating: review.rating,
    note: review.note,
    createdAt: review.createdAt.toISOString()
  };
}

function fallbackReviews(): PortfolioReview[] {
  return editorialNotes.map((note, index) => ({
    id: note.id,
    name: note.author,
    rating: ratingSummary.maxRating,
    note: note.text,
    createdAt: new Date(Date.UTC(2026, 4, 1 + index)).toISOString()
  }));
}

export async function getPortfolioReviewSummary(): Promise<PortfolioReviewSummary> {
  let reviews: Array<{
    id: string;
    name: string;
    rating: number;
    note: string;
    createdAt: Date;
  }> = [];
  let aggregate: {
    _avg: { rating: number | null };
    _count: { rating: number };
  } = {
    _avg: { rating: null },
    _count: { rating: 0 }
  };

  try {
    [reviews, aggregate] = await Promise.all([
      prisma.portfolioReview.findMany({
        orderBy: { createdAt: "desc" },
        take: 3
      }),
      prisma.portfolioReview.aggregate({
        _avg: { rating: true },
        _count: { rating: true }
      })
    ]);
  } catch (error) {
    console.error("Could not load portfolio reviews from the database.", error);
  }

  if (!reviews.length) {
    return {
      averageRating: Number(ratingSummary.score),
      reviewCount: 0,
      reviews: fallbackReviews().slice(0, 3)
    };
  }

  return {
    averageRating: aggregate._avg.rating ?? Number(ratingSummary.score),
    reviewCount: aggregate._count.rating,
    reviews: reviews.map(toPortfolioReview)
  };
}

export async function addPortfolioReview(input: AddPortfolioReviewInput) {
  const review = await prisma.portfolioReview.create({
    data: {
      name: input.name.trim() || "Guest",
      rating: input.rating,
      note: input.note.trim()
    }
  });

  return {
    review: toPortfolioReview(review),
    summary: await getPortfolioReviewSummary()
  };
}

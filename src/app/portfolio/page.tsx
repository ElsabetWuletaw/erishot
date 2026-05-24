import type { Metadata } from "next";
import { Footer } from "@/frontend/components/footer";
import { Navbar } from "@/frontend/components/navbar";
import { PortfolioGallery } from "@/frontend/components/portfolio-gallery";
import { RatingComments } from "@/frontend/components/rating-comments";
import {
  getPortfolioCategories,
  getPublicPortfolioProjects
} from "@/backend/public-content";
import { getSiteSettings } from "@/backend/admin-store";
import { getPortfolioReviewSummary } from "@/backend/portfolio-reviews";

export const metadata: Metadata = {
  title: "Portfolio | ERISHOT",
  description: "Selected cinematic photography and videography works by ERISHOT."
};

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const [projects, settings, reviewSummary] = await Promise.all([
    getPublicPortfolioProjects(),
    getSiteSettings(),
    getPortfolioReviewSummary()
  ]);
  const categories = getPortfolioCategories(projects);

  return (
    <>
      <Navbar currentPath="/portfolio" settings={settings} />
      <main>
        <PortfolioGallery categories={categories} projects={projects} />
        <RatingComments
          averageRating={reviewSummary.averageRating}
          reviewCount={reviewSummary.reviewCount}
          reviews={reviewSummary.reviews}
        />
      </main>
      <Footer settings={settings} />
    </>
  );
}

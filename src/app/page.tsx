import { AboutPreview } from "@/frontend/components/about-preview";
import { CTASection } from "@/frontend/components/cta-section";
import { FeaturedProjects } from "@/frontend/components/featured-projects";
import { Footer } from "@/frontend/components/footer";
import { CreativeStatement } from "@/frontend/components/creative-statement";
import { GalleryPreview } from "@/frontend/components/gallery-preview";
import { HeroSection } from "@/frontend/components/hero-section";
import { Navbar } from "@/frontend/components/navbar";
import { RatingComments } from "@/frontend/components/rating-comments";
import { Testimonials } from "@/frontend/components/testimonials";
import { getHomepageShowcase } from "@/backend/public-content";
import { getPortfolioReviewSummary } from "@/backend/portfolio-reviews";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [showcase, reviewSummary] = await Promise.all([
    getHomepageShowcase(),
    getPortfolioReviewSummary()
  ]);

  return (
    <>
      <Navbar settings={showcase.settings} />
      <main>
        <HeroSection
          eyebrow={showcase.settings.homepage.heroEyebrow}
          headline={showcase.settings.homepage.heroHeadline}
          primaryLabel={showcase.settings.homepage.heroPrimaryLabel}
          secondaryLabel={showcase.settings.homepage.heroSecondaryLabel}
          showVideo
          subtitle={showcase.settings.homepage.heroSubtitle}
          videoUrl="/videos/erishot-hero.mp4"
        />
        {showcase.settings.homepage.featuredProjectsEnabled ? (
          <FeaturedProjects
            heading={showcase.settings.homepage.featuredSectionTitle}
            projects={showcase.featuredProjects}
          />
        ) : null}
        <CreativeStatement imageUrl={showcase.carStatementImageUrl} />
        <GalleryPreview
          categories={showcase.categoryNames}
          items={showcase.galleryPreviewItems}
        />
        <AboutPreview />
        <Testimonials />
        {showcase.settings.homepage.bookingCtaEnabled ? (
          <CTASection
            headline={showcase.settings.homepage.bookingCta}
          />
        ) : null}
        {showcase.settings.homepage.ratingCommentsEnabled ? (
          <RatingComments
            averageRating={reviewSummary.averageRating}
            reviewCount={reviewSummary.reviewCount}
            reviews={reviewSummary.reviews}
          />
        ) : null}
      </main>
      <Footer settings={showcase.settings} />
    </>
  );
}

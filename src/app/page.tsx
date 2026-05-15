import { AboutPreview } from "@/components/about-preview";
import { CTASection } from "@/components/cta-section";
import { FeaturedProjects } from "@/components/featured-projects";
import { Footer } from "@/components/footer";
import { CreativeStatement } from "@/components/creative-statement";
import { GalleryPreview } from "@/components/gallery-preview";
import { HeroSection } from "@/components/hero-section";
import { Navbar } from "@/components/navbar";
import { Testimonials } from "@/components/testimonials";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedProjects />
        <CreativeStatement />
        <GalleryPreview />
        <AboutPreview />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { ContactPage } from "@/frontend/components/contact-page";
import { Footer } from "@/frontend/components/footer";
import { Navbar } from "@/frontend/components/navbar";
import { getSiteSettings } from "@/backend/admin-store";
import {
  getPortfolioCategories,
  getPublicPortfolioProjects
} from "@/backend/public-content";

export const metadata: Metadata = {
  title: "Contact | ERISHOT",
  description: "Contact ERISHOT for cinematic photography and videography bookings."
};

export const dynamic = "force-dynamic";

export default async function ContactRoute() {
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getPublicPortfolioProjects()
  ]);
  const services = getPortfolioCategories(projects).filter(
    (category) => category !== "All"
  );
  const contactImageUrl =
    projects.find((project) => project.category === "Street")?.imageUrl ??
    projects.find((project) => project.category === "Commercial")?.imageUrl ??
    projects[0]?.imageUrl;

  return (
    <>
      <Navbar settings={settings} />
      <ContactPage
        imageUrl={contactImageUrl}
        services={services}
        settings={settings}
      />
      <Footer settings={settings} />
    </>
  );
}

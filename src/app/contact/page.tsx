import type { Metadata } from "next";
import { ContactPage } from "@/frontend/components/contact-page";
import { Footer } from "@/frontend/components/footer";
import { Navbar } from "@/frontend/components/navbar";
import { getSiteSettings } from "@/backend/admin-store";

export const metadata: Metadata = {
  title: "Contact | ERISHOT",
  description: "Contact ERISHOT for cinematic photography and videography bookings."
};

export const dynamic = "force-dynamic";

export default async function ContactRoute() {
  const settings = await getSiteSettings();

  return (
    <>
      <Navbar />
      <ContactPage settings={settings} />
      <Footer settings={settings} />
    </>
  );
}

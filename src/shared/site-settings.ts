import type { AdminSiteSettings } from "@/shared/admin-types";

export const defaultAdminSiteSettings: AdminSiteSettings = {
  branding: {
    logoUrl: "/images/erishot-logo-transparent.png"
  },
  homepage: {
    heroVideoEnabled: true,
    featuredProjectsEnabled: true,
    ratingCommentsEnabled: true,
    bookingCtaEnabled: true,
    heroEyebrow: "ERISHOT presents",
    heroHeadline: "Raw Visions",
    heroSubtitle:
      "Cinematic photography and videography with a documentary pulse, editorial tension, and emotion held in every frame.",
    heroVideoUrl:
      "https://videos.pexels.com/video-files/30728858/13145862_2160_3840_30fps.mp4",
    heroImageUrl:
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=2200&q=85",
    heroPrimaryLabel: "Explore Portfolio",
    heroSecondaryLabel: "Book a Shoot",
    featuredSectionTitle: "Work",
    bookingCta: "Book Now"
  },
  channels: {
    displayName: "ERISHOT Studio",
    email: "Benalemu25@gmail.com",
    instagram: "Eritshot",
    tiktok: "Eritshot"
  }
};

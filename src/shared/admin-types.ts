export type AdminMediaType = "Photo" | "Video" | "Gallery";

export type AdminProjectStatus = "Draft" | "Review" | "Published" | "Featured";

export type ContactMessageStatus = "Unread" | "Open" | "Replied";

export type AdminSiteSettings = {
  branding: {
    logoUrl: string;
  };
  homepage: {
    heroVideoEnabled: boolean;
    featuredProjectsEnabled: boolean;
    ratingCommentsEnabled: boolean;
    bookingCtaEnabled: boolean;
    heroEyebrow: string;
    heroHeadline: string;
    heroSubtitle: string;
    heroVideoUrl: string;
    heroImageUrl: string;
    heroPrimaryLabel: string;
    heroSecondaryLabel: string;
    featuredSectionTitle: string;
    bookingCta: string;
  };
  channels: {
    displayName: string;
    email: string;
    instagram: string;
    tiktok: string;
  };
};

export type AdminProject = {
  id: string;
  title: string;
  category: string;
  status: AdminProjectStatus;
  date: string;
  description: string;
  mediaType: AdminMediaType;
  featured: boolean;
  thumbnailUrl?: string;
  updatedAt: string;
};

export type AdminMediaAsset = {
  id: string;
  projectId: string;
  title: string;
  category: string;
  mediaType: AdminMediaType;
  description: string;
  status: "Stored";
  createdAt: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  url?: string;
};

export type ContactMessage = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
};

export type PortfolioReview = {
  id: string;
  name: string;
  rating: number;
  note: string;
  createdAt: string;
};

export type AdminStore = {
  projects: AdminProject[];
  media: AdminMediaAsset[];
  messages: ContactMessage[];
  settings: AdminSiteSettings;
};

import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/backend/prisma";
import type {
  AdminMediaAsset,
  AdminMediaType,
  AdminProject,
  AdminProjectStatus,
  AdminSiteSettings,
  AdminStore,
  ContactMessage,
  ContactMessageStatus,
  PortfolioReview
} from "@/shared/admin-types";
import { defaultAdminSiteSettings } from "@/shared/site-settings";

type AddAdminMediaInput = {
  title: string;
  category: string;
  mediaType: AdminMediaType;
  description: string;
};

type AddContactMessageInput = Pick<
  ContactMessage,
  "firstName" | "lastName" | "email" | "phone" | "service" | "message"
>;

type UpdateSiteSettingsInput = AdminSiteSettings;

type UpdateAdminMediaInput = AddAdminMediaInput;

type StoredUpload = Pick<
  AdminMediaAsset,
  "fileName" | "fileType" | "fileSize" | "url"
>;

type ProjectRecord = {
  id: string;
  title: string;
  category: string;
  status: AdminProjectStatus;
  date: string;
  description: string;
  mediaType: AdminMediaType;
  featured: boolean;
  thumbnailUrl: string | null;
  updatedAt: Date;
};

type MediaRecord = {
  id: string;
  projectId: string;
  title: string;
  category: string;
  mediaType: AdminMediaType;
  description: string;
  status: "Stored";
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  url: string | null;
  createdAt: Date;
};

type MessageRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: Date;
};

type ReviewRecord = {
  id: string;
  name: string;
  rating: number;
  note: string;
  createdAt: Date;
};

const uploadDirectory = path.join(process.cwd(), "public", "uploads", "admin");
const readOnlyFileSystemCodes = new Set([
  "EACCES",
  "ENOENT",
  "ENOTDIR",
  "EPERM",
  "EROFS"
]);

const starterProjects: AdminProject[] = [
  {
    id: "project-raw-visions",
    title: "Raw Visions",
    category: "Commercial",
    status: "Published",
    date: "May 2026",
    description: "Homepage hero film and campaign selects.",
    mediaType: "Video",
    featured: true,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80",
    updatedAt: "2026-05-18T00:00:00.000Z"
  },
  {
    id: "project-street-machine",
    title: "Street Machine",
    category: "Cars",
    status: "Featured",
    date: "Apr 2026",
    description: "Automotive story with night-grade editorial energy.",
    mediaType: "Photo",
    featured: true,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
    updatedAt: "2026-04-12T00:00:00.000Z"
  },
  {
    id: "project-story-teller",
    title: "The Story Teller",
    category: "Street",
    status: "Draft",
    date: "Mar 2026",
    description: "Portrait session pending final notes.",
    mediaType: "Gallery",
    featured: false,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1400&q=80",
    updatedAt: "2026-03-30T00:00:00.000Z"
  }
];

const starterMedia: AdminMediaAsset[] = [
  {
    id: "media-raw-visions",
    projectId: "project-raw-visions",
    title: "Raw Visions",
    category: "Commercial",
    mediaType: "Video",
    description: "Hero video record.",
    status: "Stored",
    createdAt: "2026-05-18T00:00:00.000Z"
  },
  {
    id: "media-street-machine",
    projectId: "project-street-machine",
    title: "Street Machine",
    category: "Cars",
    mediaType: "Photo",
    description: "Featured automotive gallery.",
    status: "Stored",
    createdAt: "2026-04-12T00:00:00.000Z"
  }
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
}

function isReadOnlyFileSystemError(error: unknown) {
  return (
    error instanceof Error &&
    readOnlyFileSystemCodes.has(
      String((error as NodeJS.ErrnoException).code ?? "")
    )
  );
}

function toInlineDataUrl(fileType: string, fileBuffer: Buffer) {
  return `data:${fileType};base64,${fileBuffer.toString("base64")}`;
}

function formatProjectDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric"
  }).format(date);
}

function toProject(project: ProjectRecord): AdminProject {
  return {
    id: project.id,
    title: project.title,
    category: project.category,
    status: project.status,
    date: project.date,
    description: project.description,
    mediaType: project.mediaType,
    featured: project.featured,
    thumbnailUrl: project.thumbnailUrl ?? undefined,
    updatedAt: project.updatedAt.toISOString()
  };
}

function toMedia(asset: MediaRecord): AdminMediaAsset {
  return {
    id: asset.id,
    projectId: asset.projectId,
    title: asset.title,
    category: asset.category,
    mediaType: asset.mediaType,
    description: asset.description,
    status: asset.status,
    createdAt: asset.createdAt.toISOString(),
    fileName: asset.fileName ?? undefined,
    fileType: asset.fileType ?? undefined,
    fileSize: asset.fileSize ?? undefined,
    url: asset.url ?? undefined
  };
}

function toMessage(message: MessageRecord): ContactMessage {
  return {
    id: message.id,
    firstName: message.firstName,
    lastName: message.lastName,
    email: message.email,
    phone: message.phone,
    service: message.service,
    message: message.message,
    status: message.status,
    createdAt: message.createdAt.toISOString()
  };
}

function toPortfolioReview(
  review: ReviewRecord,
  hiddenReviewIds: string[]
): PortfolioReview {
  return {
    id: review.id,
    name: review.name,
    rating: review.rating,
    note: review.note,
    createdAt: review.createdAt.toISOString(),
    hidden: hiddenReviewIds.includes(review.id)
  };
}

async function saveUploadedFile(
  file: File | null,
  title: string
): Promise<StoredUpload> {
  if (!file || file.size === 0) {
    return {};
  }

  const extension = path.extname(file.name) || ".bin";
  const fileName = `${Date.now()}-${slugify(title) || "media"}${extension}`;
  const filePath = path.join(uploadDirectory, fileName);
  const fileType = file.type || "application/octet-stream";
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  try {
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(filePath, fileBuffer);

    return {
      fileName,
      fileType,
      fileSize: file.size,
      url: `/uploads/admin/${fileName}`
    };
  } catch (error) {
    if (!isReadOnlyFileSystemError(error)) {
      throw error;
    }

    return {
      fileName,
      fileType,
      fileSize: file.size,
      url: toInlineDataUrl(fileType, fileBuffer)
    };
  }
}

async function deleteStoredUpload(url: string | null) {
  if (!url?.startsWith("/uploads/admin/")) {
    return;
  }

  const fileName = path.basename(url);
  const filePath = path.join(uploadDirectory, fileName);

  if (!filePath.startsWith(uploadDirectory)) {
    return;
  }

  await unlink(filePath).catch(() => null);
}

async function ensureStarterData() {
  const projectCount = await prisma.project.count();

  if (projectCount > 0) {
    return;
  }

  for (const project of starterProjects) {
    await prisma.project.create({
      data: {
        id: project.id,
        title: project.title,
        category: project.category,
        status: project.status,
        date: project.date,
        description: project.description,
        mediaType: project.mediaType,
        featured: project.featured,
        thumbnailUrl: project.thumbnailUrl,
        updatedAt: new Date(project.updatedAt)
      }
    });
  }

  for (const media of starterMedia) {
    await prisma.mediaAsset.create({
      data: {
        id: media.id,
        projectId: media.projectId,
        title: media.title,
        category: media.category,
        mediaType: media.mediaType,
        description: media.description,
        status: media.status,
        fileName: media.fileName,
        fileType: media.fileType,
        fileSize: media.fileSize,
        url: media.url,
        createdAt: new Date(media.createdAt)
      }
    });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0
    )
    .map((item) => item.trim());
}

function normalizeSiteSettings(value: unknown): AdminSiteSettings {
  if (!isRecord(value)) {
    return defaultAdminSiteSettings;
  }

  const homepage = isRecord(value.homepage) ? value.homepage : {};
  const branding = isRecord(value.branding) ? value.branding : {};
  const channels = isRecord(value.channels) ? value.channels : {};
  const reviews = isRecord(value.reviews) ? value.reviews : {};
  const savedLogoUrl = readString(
    branding.logoUrl,
    defaultAdminSiteSettings.branding.logoUrl
  );

  return {
    branding: {
      logoUrl:
        savedLogoUrl === "/images/erishot-logo.svg" ||
        savedLogoUrl === "/images/erishot-logo.jpg"
          ? defaultAdminSiteSettings.branding.logoUrl
          : savedLogoUrl
    },
    homepage: {
      heroVideoEnabled: readBoolean(
        homepage.heroVideoEnabled,
        defaultAdminSiteSettings.homepage.heroVideoEnabled
      ),
      featuredProjectsEnabled: readBoolean(
        homepage.featuredProjectsEnabled,
        defaultAdminSiteSettings.homepage.featuredProjectsEnabled
      ),
      ratingCommentsEnabled: readBoolean(
        homepage.ratingCommentsEnabled,
        defaultAdminSiteSettings.homepage.ratingCommentsEnabled
      ),
      bookingCtaEnabled: readBoolean(
        homepage.bookingCtaEnabled,
        defaultAdminSiteSettings.homepage.bookingCtaEnabled
      ),
      heroEyebrow: readString(
        homepage.heroEyebrow,
        defaultAdminSiteSettings.homepage.heroEyebrow
      ),
      heroHeadline: readString(
        homepage.heroHeadline,
        defaultAdminSiteSettings.homepage.heroHeadline
      ),
      heroSubtitle: readString(
        homepage.heroSubtitle,
        defaultAdminSiteSettings.homepage.heroSubtitle
      ),
      heroVideoUrl: readString(
        homepage.heroVideoUrl,
        defaultAdminSiteSettings.homepage.heroVideoUrl
      ),
      heroImageUrl: readString(
        homepage.heroImageUrl,
        defaultAdminSiteSettings.homepage.heroImageUrl
      ),
      heroPrimaryLabel: readString(
        homepage.heroPrimaryLabel,
        defaultAdminSiteSettings.homepage.heroPrimaryLabel
      ),
      heroSecondaryLabel: readString(
        homepage.heroSecondaryLabel,
        defaultAdminSiteSettings.homepage.heroSecondaryLabel
      ),
      featuredSectionTitle: readString(
        homepage.featuredSectionTitle,
        defaultAdminSiteSettings.homepage.featuredSectionTitle
      ),
      bookingCta: readString(
        homepage.bookingCta,
        defaultAdminSiteSettings.homepage.bookingCta
      )
    },
    channels: {
      displayName: readString(
        channels.displayName,
        defaultAdminSiteSettings.channels.displayName
      ),
      email: readString(channels.email, defaultAdminSiteSettings.channels.email),
      instagram: readString(
        channels.instagram,
        defaultAdminSiteSettings.channels.instagram
      ),
      tiktok: readString(channels.tiktok, defaultAdminSiteSettings.channels.tiktok)
    },
    reviews: {
      hiddenReviewIds: readStringArray(reviews.hiddenReviewIds)
    }
  };
}

export async function getSiteSettings() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "site-settings" }
  });

  return normalizeSiteSettings(setting?.value);
}

export async function getAdminData(): Promise<AdminStore> {
  await ensureStarterData();

  const [projects, media, messages, reviews, settings] = await Promise.all([
    prisma.project.findMany({
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }]
    }),
    prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" }
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" }
    }),
    prisma.portfolioReview.findMany({
      orderBy: { createdAt: "desc" }
    }),
    getSiteSettings()
  ]);
  const hiddenReviewIds = settings.reviews.hiddenReviewIds;

  return {
    projects: projects.map(toProject),
    media: media.map(toMedia),
    messages: messages.map(toMessage),
    reviews: reviews.map((review) => toPortfolioReview(review, hiddenReviewIds)),
    settings
  };
}

export async function addAdminMedia(input: AddAdminMediaInput, file: File | null) {
  const title = input.title.trim();

  if (!title) {
    throw new Error("Project title is required.");
  }

  const now = new Date();
  const projectId = `project-${now.getTime()}`;
  const mediaId = `media-${now.getTime()}`;
  const uploadedFile = await saveUploadedFile(file, title);

  await prisma.project.create({
    data: {
      id: projectId,
      title,
      category: input.category,
      status: "Draft",
      date: formatProjectDate(now),
      description: input.description.trim(),
      mediaType: input.mediaType,
      featured: false,
      thumbnailUrl:
        uploadedFile.fileType?.startsWith("image/") && uploadedFile.url
          ? uploadedFile.url
          : undefined
    }
  });

  await prisma.mediaAsset.create({
    data: {
      id: mediaId,
      projectId,
      title,
      category: input.category,
      mediaType: input.mediaType,
      description: input.description.trim(),
      status: "Stored",
      fileName: uploadedFile.fileName,
      fileType: uploadedFile.fileType,
      fileSize: uploadedFile.fileSize,
      url: uploadedFile.url
    }
  });

  return getAdminData();
}

export async function updateAdminMedia(
  mediaId: string,
  input: UpdateAdminMediaInput
) {
  const title = input.title.trim();

  if (!title) {
    throw new Error("Project title is required.");
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: mediaId },
    include: { project: true }
  });

  if (!asset) {
    throw new Error("Media record not found.");
  }

  const description = input.description.trim();

  await prisma.project.update({
    where: { id: asset.projectId },
    data: {
      title,
      category: input.category,
      description,
      mediaType: input.mediaType,
      thumbnailUrl:
        asset.fileType?.startsWith("image/") && asset.url
          ? asset.url
          : asset.project.thumbnailUrl
    }
  });

  await prisma.mediaAsset.update({
    where: { id: mediaId },
    data: {
      title,
      category: input.category,
      mediaType: input.mediaType,
      description
    }
  });

  return getAdminData();
}

export async function deleteAdminMedia(mediaId: string) {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id: mediaId },
    select: {
      projectId: true,
      url: true
    }
  });

  if (!asset) {
    throw new Error("Media record not found.");
  }

  await prisma.project.delete({
    where: { id: asset.projectId }
  });
  await deleteStoredUpload(asset.url);

  return getAdminData();
}

export async function updateAdminProjectStatus(
  projectId: string,
  status: AdminProjectStatus
) {
  const result = await prisma.project.updateMany({
    where: { id: projectId },
    data: {
      status,
      featured: status === "Featured"
    }
  });

  if (result.count === 0) {
    throw new Error("Project not found.");
  }

  return getAdminData();
}

export async function addContactMessage(input: AddContactMessageInput) {
  const message = await prisma.contactMessage.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      service: input.service,
      message: input.message,
      status: "Unread"
    }
  });

  return toMessage(message);
}

export async function updateContactMessageStatus(
  messageId: string,
  status: ContactMessageStatus
) {
  const result = await prisma.contactMessage.updateMany({
    where: { id: messageId },
    data: { status }
  });

  if (result.count === 0) {
    throw new Error("Message not found.");
  }

  return getAdminData();
}

export async function updatePortfolioReviewVisibility(
  reviewId: string,
  hidden: boolean
) {
  const settings = await getSiteSettings();
  const hiddenReviewIds = new Set(settings.reviews.hiddenReviewIds);

  if (hidden) {
    hiddenReviewIds.add(reviewId);
  } else {
    hiddenReviewIds.delete(reviewId);
  }

  return updateSiteSettings({
    ...settings,
    reviews: {
      hiddenReviewIds: Array.from(hiddenReviewIds)
    }
  });
}

export async function updateSiteSettings(input: UpdateSiteSettingsInput) {
  await prisma.siteSetting.upsert({
    where: { key: "site-settings" },
    update: { value: input },
    create: {
      key: "site-settings",
      value: input
    }
  });

  return getAdminData();
}

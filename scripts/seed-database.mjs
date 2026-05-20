import { readFile } from "node:fs/promises";
import nextEnv from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd(), true);

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://user:password@localhost:5432/erishot_studio";
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});
const storePath = new URL("../data/admin-store.json", import.meta.url);
const defaultSiteSettings = {
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

function readOptional(value) {
  return value === undefined ? null : value;
}

async function main() {
  const store = JSON.parse(await readFile(storePath, "utf8"));
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (adminEmail && adminPasswordHash) {
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { passwordHash: adminPasswordHash },
      create: {
        email: adminEmail,
        passwordHash: adminPasswordHash
      }
    });
  }

  const existingSiteSettings = await prisma.siteSetting.findUnique({
    where: { key: "site-settings" }
  });

  if (!existingSiteSettings) {
    await prisma.siteSetting.create({
      data: {
        key: "site-settings",
        value: defaultSiteSettings
      }
    });
  }

  for (const project of store.projects ?? []) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {
        title: project.title,
        category: project.category,
        status: project.status,
        date: project.date,
        description: project.description ?? "",
        mediaType: project.mediaType,
        featured: project.featured ?? false,
        thumbnailUrl: readOptional(project.thumbnailUrl),
        updatedAt: new Date(project.updatedAt)
      },
      create: {
        id: project.id,
        title: project.title,
        category: project.category,
        status: project.status,
        date: project.date,
        description: project.description ?? "",
        mediaType: project.mediaType,
        featured: project.featured ?? false,
        thumbnailUrl: readOptional(project.thumbnailUrl),
        updatedAt: new Date(project.updatedAt)
      }
    });
  }

  for (const asset of store.media ?? []) {
    await prisma.mediaAsset.upsert({
      where: { id: asset.id },
      update: {
        projectId: asset.projectId,
        title: asset.title,
        category: asset.category,
        mediaType: asset.mediaType,
        description: asset.description ?? "",
        status: asset.status,
        fileName: readOptional(asset.fileName),
        fileType: readOptional(asset.fileType),
        fileSize: readOptional(asset.fileSize),
        url: readOptional(asset.url),
        createdAt: new Date(asset.createdAt)
      },
      create: {
        id: asset.id,
        projectId: asset.projectId,
        title: asset.title,
        category: asset.category,
        mediaType: asset.mediaType,
        description: asset.description ?? "",
        status: asset.status,
        fileName: readOptional(asset.fileName),
        fileType: readOptional(asset.fileType),
        fileSize: readOptional(asset.fileSize),
        url: readOptional(asset.url),
        createdAt: new Date(asset.createdAt)
      }
    });
  }

  for (const message of store.messages ?? []) {
    await prisma.contactMessage.upsert({
      where: { id: message.id },
      update: {
        firstName: message.firstName,
        lastName: message.lastName,
        email: message.email,
        phone: message.phone ?? "",
        service: message.service,
        message: message.message,
        status: message.status,
        createdAt: new Date(message.createdAt)
      },
      create: {
        id: message.id,
        firstName: message.firstName,
        lastName: message.lastName,
        email: message.email,
        phone: message.phone ?? "",
        service: message.service,
        message: message.message,
        status: message.status,
        createdAt: new Date(message.createdAt)
      }
    });
  }

  console.log("Database seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import nextEnv from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd(), true);

const sourceRoot = process.argv[2];

if (!sourceRoot) {
  console.error("Usage: npm run import:erishot-images -- /path/to/EriShot Image");
  process.exit(1);
}

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://user:password@localhost:5432/erishot_studio";
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});
const uploadDirectory = path.join(process.cwd(), "public", "uploads", "admin");
const supportedExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp"
]);
const categoryMap = new Map([
  ["animal", "Animal"],
  ["car", "Cars"],
  ["cars", "Cars"],
  ["nature", "Nature"],
  ["sport", "Sport"],
  ["sports", "Sport"],
  ["street", "Street"]
]);

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function hashValue(value) {
  return createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function getContentType(extension) {
  switch (extension) {
    case ".avif":
      return "image/avif";
    case ".gif":
      return "image/gif";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
}

function formatProjectDate(date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric"
  }).format(date);
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (entry.isFile() && supportedExtensions.has(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  await mkdir(uploadDirectory, { recursive: true });

  const categoryDirectories = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  const importSummary = [];

  for (const directoryName of categoryDirectories) {
    const category = categoryMap.get(directoryName.toLowerCase());

    if (!category) {
      continue;
    }

    const categoryPath = path.join(sourceRoot, directoryName);
    const imagePaths = (await collectFiles(categoryPath)).sort((left, right) =>
      left.localeCompare(right)
    );
    let imported = 0;
    let index = 0;

    for (const imagePath of imagePaths) {
      index += 1;

      const extension = path.extname(imagePath).toLowerCase();
      const relativePath = path.relative(sourceRoot, imagePath);
      const hash = hashValue(relativePath);
      const categorySlug = slugify(category);
      const fileName = `erishot-${categorySlug}-${String(index).padStart(
        3,
        "0"
      )}-${hash}${extension}`;
      const targetPath = path.join(uploadDirectory, fileName);
      const url = `/uploads/admin/${fileName}`;
      const imageStats = await stat(imagePath);
      const date = formatProjectDate(imageStats.mtime);
      const title = `${category} ${String(index).padStart(2, "0")}`;
      const projectId = `import-project-${hash}`;
      const mediaId = `import-media-${hash}`;
      const description = `Imported ERISHOT ${category.toLowerCase()} image from the provided image folder.`;

      await copyFile(imagePath, targetPath);
      await prisma.project.upsert({
        where: { id: projectId },
        update: {
          title,
          category,
          date,
          description,
          mediaType: "Photo",
          thumbnailUrl: url
        },
        create: {
          id: projectId,
          title,
          category,
          status: "Published",
          date,
          description,
          mediaType: "Photo",
          featured: false,
          thumbnailUrl: url
        }
      });
      await prisma.mediaAsset.upsert({
        where: { id: mediaId },
        update: {
          projectId,
          title,
          category,
          mediaType: "Photo",
          description,
          status: "Stored",
          fileName,
          fileType: getContentType(extension),
          fileSize: imageStats.size,
          url
        },
        create: {
          id: mediaId,
          projectId,
          title,
          category,
          mediaType: "Photo",
          description,
          status: "Stored",
          fileName,
          fileType: getContentType(extension),
          fileSize: imageStats.size,
          url,
          createdAt: imageStats.mtime
        }
      });
      imported += 1;
    }

    importSummary.push(`${category}: ${imported}`);
  }

  console.log("Imported ERISHOT images");
  console.log(importSummary.join("\n"));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

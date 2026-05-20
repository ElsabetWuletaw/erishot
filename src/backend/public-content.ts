import type { AdminProjectStatus, Prisma } from "@prisma/client";
import { prisma } from "@/backend/prisma";
import { getSiteSettings } from "@/backend/admin-store";
import {
  portfolioProjects as fallbackPortfolioProjects,
  type PortfolioProject
} from "@/frontend/content/portfolio-content";
import type {
  FeaturedProject,
  GalleryPreviewItem
} from "@/frontend/content/homepage-content";

type PublicProjectRecord = Prisma.ProjectGetPayload<{
  include: {
    media: true;
  };
}>;

const publicStatuses: AdminProjectStatus[] = ["Published", "Featured"];

const gallerySizes: GalleryPreviewItem["size"][] = [
  "tall",
  "wide",
  "standard",
  "standard",
  "wide"
];

async function readPublishedProjects() {
  return prisma.project.findMany({
    where: {
      status: {
        in: publicStatuses
      }
    },
    include: {
      media: {
        orderBy: {
          createdAt: "desc"
        }
      }
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }]
  });
}

function findFallbackProject(project: PublicProjectRecord, index: number) {
  return (
    fallbackPortfolioProjects.find(
      (fallbackProject) =>
        fallbackProject.title.toLowerCase() === project.title.toLowerCase()
    ) ??
    fallbackPortfolioProjects.find(
      (fallbackProject) =>
        fallbackProject.category.toLowerCase() === project.category.toLowerCase()
    ) ??
    fallbackPortfolioProjects[index % fallbackPortfolioProjects.length]
  );
}

function getProjectImage(project: PublicProjectRecord, index: number) {
  const uploadedImage = project.media.find((asset) =>
    asset.fileType?.startsWith("image/")
  );
  const fallbackProject = findFallbackProject(project, index);

  return project.thumbnailUrl ?? uploadedImage?.url ?? fallbackProject.imageUrl;
}

function toPortfolioProject(
  project: PublicProjectRecord,
  index: number
): PortfolioProject {
  const fallbackProject = findFallbackProject(project, index);

  return {
    id: project.id,
    title: project.title,
    category: project.category,
    rating: project.featured ? "4.9" : "4.8",
    imageUrl: getProjectImage(project, index),
    shootDate: project.date,
    description: project.description || fallbackProject.description,
    tags: [
      project.category,
      project.mediaType,
      project.status,
      project.featured ? "Featured" : "Published"
    ]
  };
}

export async function getPublicPortfolioProjects() {
  try {
    const projects = await readPublishedProjects();

    if (!projects.length) {
      return fallbackPortfolioProjects;
    }

    return projects.map(toPortfolioProject);
  } catch (error) {
    console.error("Could not load public projects from the database.", error);
    return fallbackPortfolioProjects;
  }
}

export function getPortfolioCategories(projects: PortfolioProject[]) {
  return [
    "All",
    ...Array.from(new Set(projects.map((project) => project.category)))
  ];
}

export async function getHomepageShowcase() {
  const [portfolioProjects, settings] = await Promise.all([
    getPublicPortfolioProjects(),
    getSiteSettings()
  ]);
  const featuredProjects: FeaturedProject[] = portfolioProjects
    .slice(0, 3)
    .map((project) => ({
      id: project.id,
      title: project.title,
      category: project.category,
      imageUrl: project.imageUrl
    }));
  const galleryPreviewItems: GalleryPreviewItem[] = portfolioProjects
    .slice(0, 5)
    .map((project, index) => ({
      id: project.id,
      title: project.title,
      category: project.category,
      imageUrl: project.imageUrl,
      size: gallerySizes[index % gallerySizes.length]
    }));

  return {
    featuredProjects,
    galleryPreviewItems,
    settings
  };
}

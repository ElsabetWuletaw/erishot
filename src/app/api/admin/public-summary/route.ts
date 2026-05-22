import { NextResponse } from "next/server";
import { prisma } from "@/backend/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [publicProjects, mediaAssets, categories] = await Promise.all([
    prisma.project.count({
      where: {
        status: {
          in: ["Published", "Featured"]
        }
      }
    }),
    prisma.mediaAsset.count(),
    prisma.project.groupBy({
      by: ["category"],
      where: {
        status: {
          in: ["Published", "Featured"]
        }
      }
    })
  ]);

  return NextResponse.json({
    publicProjects,
    mediaAssets,
    categories: categories.length
  });
}

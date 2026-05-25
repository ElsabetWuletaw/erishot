"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { PortfolioLightbox } from "@/frontend/components/portfolio-lightbox";
import type { PortfolioProject } from "@/frontend/content/portfolio-content";

type PortfolioGalleryProps = {
  categories: string[];
  projects: PortfolioProject[];
};

type ActiveCategory = string;

const categoryPageSize = 6;

function slugifyCategory(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getPageCount(totalItems: number) {
  return Math.max(1, Math.ceil(totalItems / categoryPageSize));
}

export function PortfolioGallery({
  categories,
  projects
}: PortfolioGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>("All");
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<
    number | null
  >(null);
  const [categoryPage, setCategoryPage] = useState(1);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") {
      return projects;
    }

    return projects.filter(
      (project) => project.category === activeCategory
    );
  }, [activeCategory, projects]);
  const categoryPageCount = getPageCount(filteredProjects.length);
  const safeCategoryPage = Math.min(categoryPage, categoryPageCount);
  const visibleCategoryProjects = useMemo(() => {
    const startIndex = (safeCategoryPage - 1) * categoryPageSize;

    return filteredProjects.slice(startIndex, startIndex + categoryPageSize);
  }, [filteredProjects, safeCategoryPage]);
  const categoryPreviews = useMemo(
    () =>
      categories
        .filter((category) => category !== "All")
        .map((category) => {
          const categoryProjects = projects.filter(
            (project) => project.category === category
          );

          return {
            category,
            projects: categoryProjects.slice(0, 2),
            total: categoryProjects.length
          };
        })
        .filter((group) => group.projects.length),
    [categories, projects]
  );

  function handleCategoryView(category: string) {
    setActiveCategory(category);
    setCategoryPage(1);
    setSelectedProjectIndex(null);
    window.requestAnimationFrame(() => {
      document.getElementById("top")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  function handleCategoryOpen(category: string) {
    setActiveCategory(category);
    setCategoryPage(1);
    setSelectedProjectIndex(0);
  }

  function handleGroupedProjectOpen(project: PortfolioProject) {
    const categoryProjects = projects.filter(
      (item) => item.category === project.category
    );
    const projectIndex = categoryProjects.findIndex(
      (item) => item.id === project.id
    );

    setActiveCategory(project.category);
    setCategoryPage(
      projectIndex >= 0 ? Math.floor(projectIndex / categoryPageSize) + 1 : 1
    );
    setSelectedProjectIndex(projectIndex >= 0 ? projectIndex : 0);
  }

  return (
    <section
      id="top"
      className="min-h-[100svh] bg-ink px-5 pb-20 pt-24 text-white sm:px-8 md:min-h-screen lg:pb-28 lg:pt-28"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[4rem_1fr]">
        <motion.div
          className="hidden lg:flex lg:items-start lg:justify-center"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <p className="rotate-180 text-6xl font-black uppercase leading-none text-white [writing-mode:vertical-rl]">
            INDEX
          </p>
        </motion.div>

        <div>
          <div className="mb-10 grid gap-8 border-b border-white/10 pb-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-[0.68rem] font-black uppercase text-gold">
                ERISHOT Archive
              </p>
              <h1 className="mt-3 text-5xl font-black uppercase leading-[0.82] text-white sm:text-7xl lg:text-8xl">
                Portfolio
              </h1>
            </div>

            <div className="lg:justify-self-end">
              <p className="max-w-xl text-sm font-bold uppercase leading-6 text-white/60">
                Selected frames organized by story, mood, and shoot type.
                Browse the work through cinematic categories and open each
                project for details.
              </p>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-white/10 pb-6">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryView(category)}
                className={`border-b pb-1 text-[0.68rem] font-black uppercase transition ${
                  activeCategory === category
                    ? "border-gold text-gold"
                    : "border-transparent text-white/50 hover:border-white hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {activeCategory === "All" ? (
            <div className="space-y-12">
              {categoryPreviews.map((group, groupIndex) => (
                <motion.section
                  key={group.category}
                  id={`portfolio-${slugifyCategory(group.category)}`}
                  className="border-b border-white/10 pb-10 last:border-b-0"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: groupIndex * 0.04,
                    ease: "easeOut"
                  }}
                >
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-gold">
                        Category {String(groupIndex + 1).padStart(2, "0")}
                      </p>
                      <h2 className="mt-2 text-4xl font-black uppercase leading-none text-white sm:text-5xl">
                        {group.category}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCategoryOpen(group.category)}
                      className="w-fit border border-gold/45 px-5 py-3 text-[0.65rem] font-black uppercase tracking-[0.18em] text-gold transition hover:bg-gold hover:text-ink"
                    >
                      View More
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {group.projects.map((project, index) => (
                      <PortfolioProjectTile
                        key={project.id}
                        index={index}
                        project={project}
                        onOpen={() => handleGroupedProjectOpen(project)}
                      />
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>
          ) : (
            <div>
              <motion.div layout className="grid gap-4 md:grid-cols-2">
                {visibleCategoryProjects.map((project, index) => {
                  const projectIndex =
                    (safeCategoryPage - 1) * categoryPageSize + index;

                  return (
                    <PortfolioProjectTile
                      key={project.id}
                      index={projectIndex}
                      project={project}
                      onOpen={() => setSelectedProjectIndex(projectIndex)}
                    />
                  );
                })}
              </motion.div>

              <PortfolioPagination
                page={safeCategoryPage}
                pageCount={categoryPageCount}
                totalItems={filteredProjects.length}
                onPageChange={(page) => {
                  setCategoryPage(page);
                  setSelectedProjectIndex(null);
                  window.requestAnimationFrame(() => {
                    document.getElementById("top")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start"
                    });
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>

      <PortfolioLightbox
        projects={filteredProjects}
        selectedIndex={selectedProjectIndex}
        onClose={() => setSelectedProjectIndex(null)}
        onNavigate={setSelectedProjectIndex}
      />
    </section>
  );
}

function PortfolioPagination({
  page,
  pageCount,
  totalItems,
  onPageChange
}: {
  page: number;
  pageCount: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems <= categoryPageSize) {
    return null;
  }

  return (
    <nav
      aria-label="Portfolio category pagination"
      className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-white/45">
        Page {page} of {pageCount} / {totalItems} projects
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="border border-white/10 px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.18em] text-white/60 transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              aria-current={pageNumber === page ? "page" : undefined}
              onClick={() => onPageChange(pageNumber)}
              className={`min-w-11 border px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.18em] transition ${
                pageNumber === page
                  ? "border-gold bg-gold text-ink"
                  : "border-white/10 text-white/60 hover:border-gold hover:text-gold"
              }`}
            >
              {pageNumber}
            </button>
          )
        )}
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="border border-white/10 px-4 py-3 text-[0.62rem] font-black uppercase tracking-[0.18em] text-white/60 transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </nav>
  );
}

function PortfolioProjectTile({
  index,
  layoutClass = "",
  project,
  onOpen
}: {
  index: number;
  layoutClass?: string;
  project: PortfolioProject;
  onOpen: () => void;
}) {
  return (
    <motion.article
      layout
      className={`group relative min-h-[21rem] overflow-hidden bg-black sm:min-h-[26rem] ${
        layoutClass ? "md:min-h-0" : ""
      } ${layoutClass}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.04,
        ease: "easeOut"
      }}
    >
      <Image
        src={project.imageUrl}
        alt={`${project.title} portfolio cover`}
        fill
        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="object-contain grayscale transition duration-700 group-hover:grayscale-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent opacity-90 transition group-hover:opacity-100" />

      <div className="absolute left-5 top-5 text-[0.62rem] font-black uppercase text-gold">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <div className="mb-3 flex items-center justify-between gap-4 text-[0.65rem] font-black uppercase text-white/60">
          <p className="text-gold">{project.category}</p>
          <p>{project.rating} / 5</p>
        </div>
        <h3 className="text-2xl font-black uppercase leading-none sm:text-3xl">
          {project.title}
        </h3>
        <button
          type="button"
          onClick={onOpen}
          className="mt-4 border-b border-gold pb-1 text-[0.65rem] font-black uppercase text-gold opacity-100 transition md:opacity-0 md:group-hover:opacity-100"
        >
          View Project
        </button>
      </div>
    </motion.article>
  );
}

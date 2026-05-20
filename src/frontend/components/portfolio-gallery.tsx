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

const layoutClasses = [
  "md:col-span-4 md:row-span-3",
  "md:col-span-2 md:row-span-2",
  "md:col-span-3 md:row-span-3",
  "md:col-span-3 md:row-span-2",
  "md:col-span-2 md:row-span-3",
  "md:col-span-4 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-3"
];

export function PortfolioGallery({
  categories,
  projects
}: PortfolioGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>("All");
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<
    number | null
  >(null);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") {
      return projects;
    }

    return projects.filter(
      (project) => project.category === activeCategory
    );
  }, [activeCategory, projects]);

  return (
    <section
      id="top"
      className="min-h-screen bg-ink px-5 pb-20 pt-24 text-white sm:px-8 lg:pb-28 lg:pt-28"
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
              <h1 className="mt-3 text-6xl font-black uppercase leading-[0.82] text-white sm:text-7xl lg:text-8xl">
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
                onClick={() => {
                  setActiveCategory(category);
                  setSelectedProjectIndex(null);
                }}
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

          <motion.div
            layout
            className="grid auto-rows-[12rem] gap-4 md:grid-cols-6 lg:auto-rows-[13rem]"
          >
            {filteredProjects.map((project, index) => (
              <motion.article
                layout
                key={project.id}
                className={`group relative min-h-[26rem] overflow-hidden bg-charcoal md:min-h-0 ${
                  layoutClasses[index % layoutClasses.length]
                }`}
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
                  className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition group-hover:opacity-100" />

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
                    onClick={() => setSelectedProjectIndex(index)}
                    className="mt-4 border-b border-gold pb-1 text-[0.65rem] font-black uppercase text-gold opacity-0 transition group-hover:opacity-100"
                  >
                    View Project
                  </button>
                </div>
              </motion.article>
            ))}
          </motion.div>
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

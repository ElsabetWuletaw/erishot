"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { PortfolioProject } from "@/frontend/content/portfolio-content";

type PortfolioLightboxProps = {
  projects: PortfolioProject[];
  selectedIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function PortfolioLightbox({
  projects,
  selectedIndex,
  onClose,
  onNavigate
}: PortfolioLightboxProps) {
  const project =
    selectedIndex === null ? null : projects[selectedIndex] ?? null;

  useEffect(() => {
    if (!project) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft") {
        onNavigate(
          selectedIndex === 0 ? projects.length - 1 : Number(selectedIndex) - 1
        );
      }

      if (event.key === "ArrowRight") {
        onNavigate(
          selectedIndex === projects.length - 1 ? 0 : Number(selectedIndex) + 1
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onNavigate, project, projects.length, selectedIndex]);

  const previousIndex =
    selectedIndex === null
      ? 0
      : selectedIndex === 0
        ? projects.length - 1
        : selectedIndex - 1;
  const nextIndex =
    selectedIndex === null
      ? 0
      : selectedIndex === projects.length - 1
        ? 0
        : selectedIndex + 1;

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[80] overflow-y-auto bg-black/95 px-5 py-5 text-white sm:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="fixed inset-0 cursor-default"
            aria-label="Close project viewer"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="portfolio-lightbox-title"
            className="relative z-10 mx-auto grid min-h-[calc(100svh-2.5rem)] max-w-7xl gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:items-stretch"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="relative min-h-[55svh] overflow-hidden bg-charcoal lg:min-h-full">
              <Image
                src={project.imageUrl}
                alt={`${project.title} expanded project view`}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />
            </div>

            <aside className="flex flex-col justify-between border border-white/10 bg-ink p-5 sm:p-8">
              <div>
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[0.65rem] font-black uppercase text-gold">
                      {project.category} / {project.rating}
                    </p>
                    <h2
                      id="portfolio-lightbox-title"
                      className="mt-4 text-5xl font-black uppercase leading-[0.86] text-white sm:text-6xl"
                    >
                      {project.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="border border-white/20 px-4 py-3 text-[0.65rem] font-black uppercase text-white transition hover:bg-white hover:text-ink"
                  >
                    X
                  </button>
                </div>

                <dl className="mt-10 grid gap-5 border-y border-white/10 py-6 text-[0.68rem] font-black uppercase sm:grid-cols-2">
                  <div>
                    <dt className="text-white/40">Shoot Date</dt>
                    <dd className="mt-2 text-white">{project.shootDate}</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">Category</dt>
                    <dd className="mt-2 text-white">{project.category}</dd>
                  </div>
                </dl>

                <p className="mt-7 text-sm font-bold uppercase leading-6 text-white/70">
                  {project.description}
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-white/10 px-3 py-2 text-[0.62rem] font-black uppercase text-white/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate(previousIndex)}
                  className="border border-white/20 px-5 py-4 text-left text-[0.65rem] font-black uppercase text-white transition hover:bg-white hover:text-ink"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate(nextIndex)}
                  className="border border-white/20 px-5 py-4 text-right text-[0.65rem] font-black uppercase text-white transition hover:bg-white hover:text-ink"
                >
                  Next
                </button>
              </div>
            </aside>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

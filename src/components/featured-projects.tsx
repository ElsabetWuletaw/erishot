"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { featuredProjects } from "@/lib/homepage-content";

export function FeaturedProjects() {
  const mainProject = featuredProjects[0];
  const sideProject = featuredProjects[1];
  const detailProject = featuredProjects[2];

  return (
    <section
      id="featured-projects"
      className="bg-ink px-5 py-20 text-white sm:px-8 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[4rem_1fr]">
        <motion.div
          className="hidden lg:flex lg:items-start lg:justify-center"
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <p className="rotate-180 text-7xl font-black leading-none text-white [writing-mode:vertical-rl]">
            WORK
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.article
            className="group relative min-h-[32rem] overflow-hidden bg-charcoal lg:min-h-[46rem]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <Image
              src={mainProject.imageUrl}
              alt={`${mainProject.title} project preview`}
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-[0.65rem] font-black uppercase text-white/60">
                {mainProject.category}
              </p>
              <h2 className="mt-2 text-4xl font-black leading-none text-white sm:text-5xl">
                {mainProject.title}
              </h2>
            </div>
          </motion.article>

          <div className="grid gap-5">
            <motion.div
              className="grid gap-5 sm:grid-cols-[0.88fr_1.12fr]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
            >
              <div className="relative min-h-[19rem] overflow-hidden bg-charcoal">
                <Image
                  src={sideProject.imageUrl}
                  alt={`${sideProject.title} project preview`}
                  fill
                  sizes="(min-width: 1024px) 22vw, 100vw"
                  className="object-cover grayscale"
                />
              </div>
              <div className="flex flex-col justify-between border-y border-white/10 py-5">
                <div>
                  <p className="text-[0.65rem] font-black uppercase text-gold">
                    Selected Work
                  </p>
                  <h3 className="mt-2 text-3xl font-black leading-none text-white">
                    {sideProject.title}
                  </h3>
                  <p className="mt-4 text-sm font-bold uppercase leading-5 text-white/50">
                    A raw editorial treatment with hard contrast, quiet motion,
                    and images that feel pulled from a larger story.
                  </p>
                </div>
                <a
                  href="#gallery"
                  className="mt-6 inline-flex w-fit border border-white/25 px-5 py-3 text-[0.65rem] font-black uppercase text-white transition hover:bg-white hover:text-ink"
                >
                  View archive
                </a>
              </div>
            </motion.div>

            <motion.div
              className="grid gap-5 sm:grid-cols-[1fr_0.78fr]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, delay: 0.16, ease: "easeOut" }}
            >
              <div className="border-t border-white/10 pt-5">
                <p className="text-[0.65rem] font-black uppercase text-white/50">
                  Method
                </p>
                <dl className="mt-5 grid gap-4 text-[0.68rem] font-black uppercase text-white/60">
                  <div className="grid grid-cols-[4rem_1fr] gap-4">
                    <dt className="text-white">01</dt>
                    <dd>Observe the scene before directing it.</dd>
                  </div>
                  <div className="grid grid-cols-[4rem_1fr] gap-4">
                    <dt className="text-white">02</dt>
                    <dd>Use shadow, pace, and texture as storytelling tools.</dd>
                  </div>
                  <div className="grid grid-cols-[4rem_1fr] gap-4">
                    <dt className="text-white">03</dt>
                    <dd>Deliver edits that feel cinematic, not overworked.</dd>
                  </div>
                </dl>
              </div>
              <div className="relative min-h-[18rem] overflow-hidden bg-charcoal">
                <Image
                  src={detailProject.imageUrl}
                  alt={`${detailProject.title} project preview`}
                  fill
                  sizes="(min-width: 1024px) 16vw, 100vw"
                  className="object-cover grayscale"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

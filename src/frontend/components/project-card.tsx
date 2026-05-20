"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { FeaturedProject } from "@/frontend/content/homepage-content";

type ProjectCardProps = {
  project: FeaturedProject;
  index: number;
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.article
      className="group relative min-h-[28rem] overflow-hidden rounded border border-white/10 bg-charcoal"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: "easeOut" }}
    >
      <Image
        src={project.imageUrl}
        alt={`${project.title} project preview`}
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        className="object-cover transition duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition group-hover:from-black/95" />

      <div className="absolute bottom-0 left-0 right-0 translate-y-3 p-6 transition duration-300 group-hover:translate-y-0">
        <p className="text-xs font-bold uppercase text-gold">
          {project.category}
        </p>
        <h3 className="mt-3 text-3xl font-black text-white">{project.title}</h3>
        <span className="mt-5 inline-flex text-sm font-semibold uppercase text-white/0 transition group-hover:text-white/80">
          View Project
        </span>
      </div>
    </motion.article>
  );
}

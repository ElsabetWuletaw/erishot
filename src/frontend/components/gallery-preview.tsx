"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  galleryPreviewItems,
  type GalleryPreviewItem
} from "@/frontend/content/homepage-content";

const sizeClasses: Record<GalleryPreviewItem["size"], string> = {
  wide: "sm:col-span-2",
  tall: "sm:row-span-2",
  standard: ""
};

const imageHeights: Record<GalleryPreviewItem["size"], string> = {
  wide: "min-h-[20rem]",
  tall: "min-h-[34rem]",
  standard: "min-h-[20rem]"
};

type GalleryPreviewProps = {
  items?: GalleryPreviewItem[];
};

export function GalleryPreview({ items }: GalleryPreviewProps) {
  const previewItems = items?.length ? items : galleryPreviewItems;

  return (
    <section
      id="gallery"
      className="bg-ink px-5 py-16 text-white sm:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="text-[0.65rem] font-black uppercase text-gold">
              Gallery Index
            </p>
            <h2 className="mt-4 text-5xl font-black leading-[0.88] text-white sm:text-6xl lg:text-7xl">
              FRAGMENTS
            </h2>
          </motion.div>

          <motion.p
            className="max-w-2xl text-sm font-bold uppercase leading-6 text-white/50 lg:justify-self-end"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          >
            A quick scan of portraits, events, cars, weddings, and natural
            scenes before visitors step into the full archive.
          </motion.p>
        </div>

        <div className="grid auto-rows-[20rem] gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {previewItems.map((item, index) => (
            <motion.article
              key={item.id}
              className={`group relative overflow-hidden bg-charcoal ${sizeClasses[item.size]} ${imageHeights[item.size]}`}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.55,
                delay: index * 0.05,
                ease: "easeOut"
              }}
            >
              <Image
                src={item.imageUrl}
                alt={`${item.title} gallery preview`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90 transition group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-[0.62rem] font-black uppercase text-white/50">
                  {item.category}
                </p>
                <h3 className="mt-2 text-2xl font-black uppercase leading-none">
                  {item.title}
                </h3>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

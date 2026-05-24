"use client";

import { motion } from "framer-motion";

const defaultHeroVideo = "/videos/erishot-hero.mp4";

type HeroSectionProps = {
  eyebrow?: string;
  headline?: string;
  imageUrl?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  showVideo?: boolean;
  subtitle?: string;
  videoUrl?: string;
};

export function HeroSection({
  eyebrow = "ERISHOT presents",
  headline = "Raw Visions",
  imageUrl,
  primaryLabel = "Explore Portfolio",
  secondaryLabel = "Book a Shoot",
  showVideo = true,
  subtitle = "Cinematic photography and videography with a documentary pulse, editorial tension, and emotion held in every frame.",
  videoUrl = defaultHeroVideo
}: HeroSectionProps) {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pb-8 pt-16 sm:px-8 md:min-h-screen md:pb-0"
    >
      {showVideo ? (
        <motion.video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={imageUrl || undefined}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
        >
          <source src={videoUrl} type="video/mp4" />
        </motion.video>
      ) : (
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
        />
      )}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-ink" />
      <div className="absolute left-5 top-1/2 z-10 hidden -translate-y-1/2 md:block">
        <p className="rotate-180 text-[0.65rem] font-black uppercase text-white/50 [writing-mode:vertical-rl]">
          Visual archive
        </p>
      </div>

      <motion.div
        className="relative z-10 mx-auto max-w-6xl text-center"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <p className="mb-4 text-[0.68rem] font-black uppercase text-white/60">
          {eyebrow}
        </p>
        <h1 className="break-words text-5xl font-black leading-[0.82] text-white sm:text-8xl lg:text-[10rem]">
          {headline}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm font-bold uppercase leading-6 text-gold sm:text-base">
          {subtitle}
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="/portfolio"
            className="border border-white bg-white px-7 py-3 text-[0.68rem] font-black uppercase text-ink transition hover:bg-gold"
          >
            {primaryLabel}
          </a>
          <a
            href="/contact"
            className="border border-white/35 px-7 py-3 text-[0.68rem] font-black uppercase text-white transition hover:border-white hover:bg-white hover:text-ink"
          >
            {secondaryLabel}
          </a>
        </div>
      </motion.div>

      <div className="absolute bottom-6 right-5 z-10 hidden text-right text-[0.65rem] font-black uppercase text-white/40 sm:block">
        <p>Photo / Film / Editorial</p>
        <p className="mt-1 text-white/70">Visual stories in motion</p>
      </div>
    </section>
  );
}

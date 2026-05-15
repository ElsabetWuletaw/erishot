"use client";

import { motion } from "framer-motion";

const heroPoster =
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=2200&q=85";
const heroVideo =
  "https://videos.pexels.com/video-files/30728858/13145862_2160_3840_30fps.mp4";

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden px-5 pt-16 sm:px-8"
    >
      <motion.video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={heroPoster}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
      >
        <source src={heroVideo} type="video/mp4" />
      </motion.video>
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
          ERISHOT presents
        </p>
        <h1 className="text-6xl font-black leading-[0.82] text-white sm:text-8xl lg:text-[10rem]">
          RAW VISIONS
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm font-bold uppercase leading-6 text-white/60 sm:text-base">
          Cinematic photography and videography with a documentary pulse,
          editorial tension, and emotion held in every frame.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="#featured-projects"
            className="border border-white bg-white px-7 py-3 text-[0.68rem] font-black uppercase text-ink transition hover:bg-gold"
          >
            Explore Portfolio
          </a>
          <a
            href="#contact"
            className="border border-white/35 px-7 py-3 text-[0.68rem] font-black uppercase text-white transition hover:border-white hover:bg-white hover:text-ink"
          >
            Book a Shoot
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

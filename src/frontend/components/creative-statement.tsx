"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const streetImage =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1300&q=80";

type CreativeStatementProps = {
  imageUrl?: string;
};

export function CreativeStatement({ imageUrl = streetImage }: CreativeStatementProps) {
  return (
    <section className="bg-[#0d0d0c] px-5 py-16 text-white sm:px-8 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          className="relative min-h-[24rem] overflow-hidden bg-charcoal sm:min-h-[28rem] lg:min-h-[36rem]"
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image
            src={imageUrl}
            alt="Cinematic car photographed in street light"
            fill
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover grayscale"
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        <motion.div
          className="lg:max-w-xl"
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
        >
          <p className="text-[0.65rem] font-black uppercase text-gold">
            Featured Direction
          </p>
          <h2 className="mt-4 text-4xl font-black leading-[0.86] text-white sm:text-6xl lg:text-7xl">
            STREET MACHINE
          </h2>
          <p className="mt-5 max-w-lg text-sm font-bold uppercase leading-6 text-white/60">
            A focused visual system for movement, chrome, concrete, night air,
            and the tension between speed and stillness.
          </p>
          <a
            href="#contact"
            className="mt-8 inline-flex border border-white/30 px-6 py-3 text-[0.65rem] font-black uppercase text-white transition hover:bg-white hover:text-ink"
          >
            Book this mood
          </a>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";

type CTASectionProps = {
  headline?: string;
};

export function CTASection({
  headline = "Book Now"
}: CTASectionProps) {
  return (
    <section
      id="contact"
      className="bg-ink px-5 py-28 text-white sm:px-8 lg:py-40"
    >
      <motion.div
        className="mx-auto max-w-5xl text-center"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <p className="text-[0.65rem] font-black uppercase text-white/40">
          Available for select shoots
        </p>
        <h2 className="mt-5 text-6xl font-black uppercase leading-[0.82] text-white sm:text-8xl lg:text-9xl">
          {headline}
        </h2>
        <p className="mx-auto mt-4 w-fit border-b-2 border-white pb-1 text-sm font-black uppercase italic text-white">
          Let&apos;s collaborate
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="/contact"
            className="border border-white bg-white px-7 py-3 text-[0.65rem] font-black uppercase text-ink transition hover:bg-gold"
          >
            Contact Me
          </a>
          <a
            href="/contact"
            className="border border-white/30 px-7 py-3 text-[0.65rem] font-black uppercase text-white transition hover:bg-white hover:text-ink"
          >
            Book a Session
          </a>
        </div>
      </motion.div>
    </section>
  );
}

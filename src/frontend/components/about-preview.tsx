"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const aboutImage =
  "/images/storyteller.jpg";

const craftNotes = [
  { label: "01", value: "Watch the moment before shaping it." },
  { label: "02", value: "Use light and shadow like punctuation." },
  { label: "03", value: "Keep the edit raw, precise, and memorable." }
];

export function AboutPreview() {
  return (
    <section id="about" className="bg-ink px-5 py-16 text-white sm:px-8 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-[0.65rem] font-black uppercase text-gold">
            About Erishot
          </p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-[0.86] text-white sm:text-6xl lg:text-7xl">
            THE STORY
            <br />
            TELLER
          </h2>
          <p className="mt-7 max-w-xl text-sm font-bold uppercase leading-6 text-white/60">
            Erishot creates cinematic visual stories through photography and
            film. The work sits between documentary instinct and editorial
            control: intimate faces, hard light, grain, motion, and memory.
          </p>
          <p className="mt-5 max-w-xl text-sm font-bold uppercase leading-6 text-white/40">
            Every project starts with atmosphere. The goal is not just to make
            a clean image, but to make a frame that feels like it belongs to a
            larger scene.
          </p>

          <div className="mt-10 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-3">
            {craftNotes.map((note) => (
              <div
                key={note.label}
                className="border-t border-white/10 pt-4 sm:border-t-0 sm:pt-0"
              >
                <p className="text-sm font-black uppercase text-gold">
                  {note.label}
                </p>
                <p className="mt-3 text-[0.68rem] font-black uppercase leading-5 text-white/50">
                  {note.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative min-h-[26rem] overflow-hidden bg-charcoal sm:min-h-[34rem] lg:min-h-[42rem]"
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          <Image
            src={aboutImage}
            alt="Story teller portrait against a city skyline"
            fill
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <p className="max-w-sm text-3xl font-black uppercase leading-none text-white sm:text-4xl">
              Mood first.
              <br />
              Detail always.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

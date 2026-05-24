"use client";

import { motion } from "framer-motion";

const methodSteps = [
  {
    number: "01",
    title: "Pre-Production",
    description:
      "Define the visual mood, location, references, wardrobe, and story before the camera comes out."
  },
  {
    number: "02",
    title: "Shoot Direction",
    description:
      "Guide the scene without flattening it. Let natural behavior, light, and movement lead the frame."
  },
  {
    number: "03",
    title: "Post-Production",
    description:
      "Shape the final sequence with contrast, color restraint, texture, and clean cinematic delivery."
  }
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-ink px-5 py-16 text-white sm:px-8 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-6 sm:mb-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="text-[0.65rem] font-black uppercase text-gold">
              Method
            </p>
            <h2 className="mt-4 text-4xl font-black uppercase leading-[0.86] text-white sm:text-6xl lg:text-7xl">
              HOW WE BUILD
              <br />
              THE FRAME
            </h2>
          </motion.div>

          <motion.p
            className="max-w-xl text-sm font-bold uppercase leading-6 text-white/50 lg:justify-self-end"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          >
            A simple process keeps the work cinematic without losing the human
            feeling inside the scene.
          </motion.p>
        </div>

        <div className="grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-3">
          {methodSteps.map((step, index) => (
            <motion.article
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.55,
                delay: index * 0.08,
                ease: "easeOut"
              }}
            >
              <p className="text-2xl font-black text-gold">{step.number}</p>
              <h3 className="mt-7 text-sm font-black uppercase text-white">
                {step.title}
              </h3>
              <p className="mt-4 text-[0.68rem] font-black uppercase leading-5 text-white/50">
                {step.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

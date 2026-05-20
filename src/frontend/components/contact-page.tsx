"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FormEvent, useState } from "react";
import type { AdminSiteSettings } from "@/shared/admin-types";

const contactImage =
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85";

const services = ["Wedding", "Portrait", "Cars", "Event", "Commercial"];

type ContactPageProps = {
  settings: AdminSiteSettings;
};

function getSocialHref(platform: "instagram" | "tiktok", value: string) {
  const handle = value.replace(/^@/, "");

  if (value.startsWith("http")) {
    return value;
  }

  return platform === "instagram"
    ? `https://www.instagram.com/${handle}`
    : `https://www.tiktok.com/@${handle}`;
}

export function ContactPage({ settings }: ContactPageProps) {
  const contactLinks = [
    {
      label: "Email",
      title: "Direct Booking",
      value: settings.channels.email,
      href: `mailto:${settings.channels.email}`
    },
    {
      label: "Instagram",
      title: "Visual Updates",
      value: settings.channels.instagram,
      href: getSocialHref("instagram", settings.channels.instagram)
    },
    {
      label: "TikTok",
      title: "Behind The Scenes",
      value: settings.channels.tiktok,
      href: getSocialHref("tiktok", settings.channels.tiktok)
    }
  ];
  const [formStatus, setFormStatus] = useState<{
    tone: "idle" | "success" | "error";
    message: string;
  }>({
    tone: "idle",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    setFormStatus({ tone: "idle", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          service: formData.get("service"),
          message: formData.get("message")
        })
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not submit the message.");
      }

      form.reset();
      setFormStatus({
        tone: "success",
        message: payload.message ?? "Your message has been saved."
      });
    } catch (error) {
      setFormStatus({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not submit the message."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink px-5 pb-16 pt-24 text-white sm:px-8 lg:pb-24 lg:pt-28">
      <section
        id="top"
        className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]"
      >
        <motion.div
          className="relative min-h-[32rem] overflow-hidden bg-charcoal lg:min-h-[calc(100svh-8rem)]"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <Image
            src={contactImage}
            alt="Minimal studio interior with architectural light"
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <p className="text-[0.65rem] font-black uppercase text-gold">
              Reach out to us
            </p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-[0.86] text-white sm:text-6xl lg:text-7xl">
              Let&apos;s get
              <br />
              in touch.
            </h1>
            <p className="mt-5 max-w-lg text-sm font-bold uppercase leading-6 text-white/60">
              Tell us the story, the date, the location, and the mood. We will
              help shape the frame from there.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="border border-white/10 bg-white/[0.035] p-5 sm:p-8 lg:p-10"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
        >
          <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.65rem] font-black uppercase text-gold">
                Contact Form
              </p>
              <h2 className="mt-3 text-4xl font-black uppercase leading-none text-white sm:text-5xl">
                Start a project
              </h2>
            </div>
            <p className="max-w-sm text-[0.7rem] font-black uppercase leading-5 text-white/50">
              Or reach out manually at {settings.channels.email}.
            </p>
          </div>

          <form
            className="grid gap-5"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="firstName"
                label="First Name"
                placeholder="First name"
              />
              <Field id="lastName" label="Last Name" placeholder="Last name" />
            </div>

            <Field
              id="email"
              label="Email Address"
              placeholder="Your email address"
              type="email"
            />

            <div className="grid gap-5 sm:grid-cols-[0.8fr_1.2fr]">
              <Field
                id="phone"
                label="Phone Number"
                placeholder="Phone number"
              />
              <label className="grid gap-2" htmlFor="service">
                <span className="text-[0.65rem] font-black uppercase text-gold">
                  Service Needed
                </span>
                <select
                  id="service"
                  name="service"
                  className="h-12 border border-white/10 bg-ink px-4 text-sm font-bold text-white outline-none transition focus:border-gold"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select service
                  </option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2" htmlFor="message">
              <span className="text-[0.65rem] font-black uppercase text-gold">
                Message
              </span>
              <textarea
                id="message"
                name="message"
                placeholder="Tell us about the shoot..."
                rows={7}
                className="resize-none border border-white/10 bg-ink px-4 py-4 text-sm font-bold leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-gold"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 bg-gold px-7 py-4 text-[0.68rem] font-black uppercase text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSubmitting ? "Submitting" : "Submit Form"}
            </button>

            {formStatus.message ? (
              <p
                className={`border px-4 py-3 text-sm font-bold ${
                  formStatus.tone === "success"
                    ? "border-gold/30 bg-gold/10 text-gold"
                    : "border-white/10 bg-white/[0.04] text-white/70"
                }`}
              >
                {formStatus.message}
              </p>
            ) : null}
          </form>
        </motion.div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl border-y border-white/10 py-10">
        <div className="mb-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[0.65rem] font-black uppercase text-gold">
              Direct Lines
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none text-white sm:text-5xl">
              We&apos;d love to hear from you.
            </h2>
          </div>
          <p className="max-w-xl text-sm font-bold uppercase leading-6 text-white/60 lg:justify-self-end">
            Use the form for project details, or contact Erishot directly
            through the channels below.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {contactLinks.map((link, index) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="group border border-white/10 bg-white/[0.025] p-5 transition hover:border-gold hover:bg-white/[0.06]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
            >
              <p className="text-[0.65rem] font-black uppercase text-gold">
                {link.label}
              </p>
              <h3 className="mt-6 text-xl font-black uppercase text-white">
                {link.title}
              </h3>
              <p className="mt-3 text-sm font-bold text-white/60 transition group-hover:text-white">
                {link.value}
              </p>
            </motion.a>
          ))}
        </div>
      </section>
    </main>
  );
}

function Field({
  id,
  label,
  placeholder,
  type = "text"
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2" htmlFor={id}>
      <span className="text-[0.65rem] font-black uppercase text-gold">
        {label}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        className="h-12 border border-white/10 bg-ink px-4 text-sm font-bold text-white outline-none transition placeholder:text-white/30 focus:border-gold"
      />
    </label>
  );
}

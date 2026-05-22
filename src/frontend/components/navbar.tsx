"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/frontend/components/brand-logo";
import { siteNavigation } from "@/frontend/content/site-content";
import type { AdminSiteSettings } from "@/shared/admin-types";

type NavbarProps = {
  settings?: AdminSiteSettings;
};

export function Navbar({ settings }: NavbarProps) {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 16);

    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
        hasScrolled
          ? "border-white/10 bg-ink/92 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 text-[0.68rem] font-black uppercase sm:px-8">
        <a
          href="/"
          className="inline-flex items-center text-white"
          aria-label="ERISHOT homepage"
        >
          <BrandLogo logoUrl={settings?.branding.logoUrl} />
        </a>

        <div className="hidden items-center gap-6 text-white/60 md:flex">
          {siteNavigation.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

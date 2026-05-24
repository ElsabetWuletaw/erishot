"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/frontend/components/brand-logo";
import { siteNavigation } from "@/frontend/content/site-content";
import type { AdminSiteSettings } from "@/shared/admin-types";

type NavbarProps = {
  currentPath?: string;
  settings?: AdminSiteSettings;
};

export function Navbar({ currentPath = "/", settings }: NavbarProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHomePage = currentPath === "/";

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 16);

    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  function isActiveLink(href: string) {
    return href === "/"
      ? currentPath === "/"
      : currentPath.startsWith(href);
  }

  function handleBack() {
    if (document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);

        if (
          referrerUrl.origin === window.location.origin &&
          window.history.length > 1
        ) {
          window.history.back();
          return;
        }
      } catch {
        // Fall through to the homepage when the browser gives us an odd referrer.
      }
    }

    window.location.assign("/");
  }

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
        hasScrolled
          ? "border-white/10 bg-ink/92 backdrop-blur-xl"
          : "border-white/10 bg-ink/78 backdrop-blur-xl md:border-transparent md:bg-transparent md:backdrop-blur-none"
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

        <div className="flex items-center gap-2 md:hidden">
          {!isHomePage ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-10 items-center gap-2 border border-white/15 px-3 text-[0.62rem] font-black uppercase text-white/75 transition active:bg-white active:text-ink"
              aria-label="Go back"
            >
              <span aria-hidden="true">&larr;</span>
              <span>Back</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
            className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-white transition active:bg-white active:text-ink"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span className="sr-only">
              {isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            </span>
            <span
              className="relative flex h-4 w-5 flex-col justify-between"
              aria-hidden="true"
            >
              <span
                className={`block h-[2px] w-full bg-current transition ${
                  isMobileMenuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[2px] w-full bg-current transition ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-[2px] w-full bg-current transition ${
                  isMobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      <div
        id="mobile-navigation"
        className={`fixed left-0 right-0 top-16 z-[70] max-h-[calc(100svh-4rem)] overflow-y-auto bg-ink/98 px-5 pb-5 pt-3 shadow-[0_24px_60px_rgba(0,0,0,0.65)] transition duration-200 md:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="border border-white/10 bg-charcoal p-3 shadow-glow">
          <div className="grid gap-2">
            {siteNavigation.map((link) => {
              const isActive = isActiveLink(link.href);

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex min-h-12 items-center justify-between gap-4 border px-4 py-3 text-[0.68rem] font-black uppercase transition ${
                    isActive
                      ? "border-gold bg-gold text-ink"
                      : "border-white/10 bg-white/[0.04] text-white active:border-white active:bg-white active:text-ink"
                  }`}
                >
                  <span className="whitespace-nowrap">{link.label}</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              );
            })}
          </div>
          <a
            href="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-3 flex min-h-12 items-center justify-center px-4 py-3 text-center text-[0.68rem] font-black uppercase bg-white text-ink transition active:bg-gold"
          >
            Book a Session
          </a>
        </div>
      </div>
    </header>
  );
}

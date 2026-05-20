import { contactEmail, socialLinks } from "@/frontend/content/site-content";
import type { AdminSiteSettings } from "@/shared/admin-types";

type FooterProps = {
  settings?: AdminSiteSettings;
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

export function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const email = settings?.channels.email ?? contactEmail;
  const links = settings
    ? [
        {
          label: "Instagram",
          href: getSocialHref("instagram", settings.channels.instagram)
        },
        {
          label: "TikTok",
          href: getSocialHref("tiktok", settings.channels.tiktok)
        }
      ]
    : socialLinks;

  return (
    <footer className="border-t border-white/10 bg-ink px-5 py-8 text-white sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 text-[0.65rem] font-black uppercase text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>ERISHOT {currentYear} / All Rights Reserved</p>
        <div className="flex flex-wrap gap-5">
          <a
            href={`mailto:${email}`}
            className="transition hover:text-white"
          >
            Email
          </a>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a href="#top" className="transition hover:text-white">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}

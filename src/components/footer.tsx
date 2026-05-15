import { contactEmail, socialLinks } from "@/lib/site-content";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-ink px-5 py-8 text-white sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 text-[0.65rem] font-black uppercase text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>ERISHOT {currentYear} / All Rights Reserved</p>
        <div className="flex flex-wrap gap-5">
          <a
            href={`mailto:${contactEmail}`}
            className="transition hover:text-white"
          >
            Email
          </a>
          {socialLinks.map((link) => (
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
          <a href="/" className="transition hover:text-white">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}

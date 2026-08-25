import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Logo, CrisisBanner, SocialLinks } from "../ui";
import type { SocialLinksProps } from "../ui";

interface LandingFooterProps {
  onCrisisClick: () => void;
}

const SOCIAL_LINKS: SocialLinksProps["links"] = [
  { platform: "instagram", href: "https://instagram.com/wellmindly" },
  { platform: "linkedin", href: "https://linkedin.com/company/wellmindly" },
  { platform: "youtube", href: "https://www.youtube.com/@WellMindly" },
];

const COMPANY_LINKS = [
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "For Universities", path: "/university" },
  { label: "Counselors", path: "/counselors" },
  { label: "Crisis support", path: "/crisis" },
];

export function LandingFooter({ onCrisisClick }: LandingFooterProps) {
  return (
    <footer className="border-t border-ink-200 bg-ink-50/40 pt-12 mt-16 pb-safe text-ink-600">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Column 1: Logo + positioning + credit */}
          <div className="flex flex-col items-start gap-3">
            <Logo size="sm" />
            <p className="text-sm text-ink-600 max-w-sm leading-relaxed mt-1">
              A space for self-discovery and peer support. We fit alongside campus care to help you understand what you carry.
            </p>
            <p className="text-2xs text-ink-500 mt-2">
              Developed by{" "}
              <a
                href="https://www.linkedin.com/in/jai-malani"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-plum-600 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 rounded-sm"
              >
                Jai Malani
              </a>
            </p>
          </div>

          {/* Column 2: Secondary Navigation */}
          <div className="flex flex-col items-start">
            <span className="text-2xs font-bold uppercase tracking-wide text-ink-500 mb-3 block">
              Company
            </span>
            <nav className="flex flex-col items-start gap-0.5" aria-label="Footer company links">
              {COMPANY_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-ink-600 hover:text-plum-600 min-h-11 inline-flex items-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 rounded-md"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Privacy + Socials + Copyright */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-start gap-2 text-sm text-ink-600 leading-relaxed">
              <ShieldCheck className="h-4 w-4 shrink-0 text-sage-600 mt-0.5" aria-hidden="true" />
              <span>
                We do not share your details with your university. You are in control of your data, always.
              </span>
            </div>

            <SocialLinks links={SOCIAL_LINKS} />

            <p className="text-2xs text-ink-500 mt-auto">
              &copy; {new Date().getFullYear()} WellMindly. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Global Crisis Banner */}
      <CrisisBanner onAction={onCrisisClick} className="border-t border-b-0 mt-12" />
    </footer>
  );
}

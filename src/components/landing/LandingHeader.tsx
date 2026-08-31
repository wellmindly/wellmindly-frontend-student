import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/cn";
import { CrisisBanner, Logo, SkipLink, buttonClasses } from "../ui";

interface LandingHeaderProps {
  onCrisisClick: () => void;
}

const navLinks = [
  { label: "Explore", path: "/discover" },
  { label: "For Universities", path: "/university" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export function LandingHeader({ onCrisisClick }: LandingHeaderProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Skip to main content link for keyboard & a11y */}
      <SkipLink />

      {/* Global Crisis Support Banner */}
      <CrisisBanner onAction={onCrisisClick} />

      {/* Header Navigation */}
      <header className="sticky top-0 z-[var(--z-nav)] w-full border-b border-ink-200/60 bg-paper/85 backdrop-blur-md pt-safe">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Logo size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "relative inline-flex items-center min-h-11 px-1 text-sm font-semibold transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 rounded-md",
                    isActive
                      ? "text-plum-700"
                      : "text-ink-600 hover:text-plum-600",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-plum-600 rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            <span className="h-4 w-px bg-ink-200 block" aria-hidden="true" />

            {user ? (
              <Link to="/dashboard" className={buttonClasses("primary", "sm")}>
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className={buttonClasses("secondary", "sm")}>
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button & CTA */}
          <div className="flex md:hidden items-center gap-3">
            {user ? (
              <Link to="/dashboard" className={buttonClasses("primary", "sm")}>
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className={buttonClasses("secondary", "sm")}>
                Sign In
              </Link>
            )}

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-controls="landing-mobile-nav"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-ink-700 hover:text-plum-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 cursor-pointer border-none bg-transparent"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="landing-mobile-nav"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="md:hidden border-t border-ink-200/60 bg-paper overflow-hidden"
            >
              <nav className="px-6 py-4 flex flex-col gap-2" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      cn(
                        "relative flex items-center min-h-11 px-3 py-2 text-sm font-semibold rounded-lg transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
                        isActive
                          ? "text-plum-700 bg-plum-50"
                          : "text-ink-600 hover:text-plum-600 hover:bg-ink-50",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            className="absolute left-0 top-2 bottom-2 w-1 bg-plum-600 rounded-r-full"
                            aria-hidden="true"
                          />
                        )}
                        {link.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

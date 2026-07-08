import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import logoPng from "../../assets/logo.png";

interface LandingHeaderProps {
  onCrisisClick: () => void;
}

export function LandingHeader({ onCrisisClick }: LandingHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" },
    { label: "University", path: "/university" },
    { label: "Counselors", path: "/counselors" },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Global Crisis Support Banner */}
      <div className="w-full bg-paper-2 border-b border-line py-2.5 px-6 text-center text-xs font-semibold text-ember relative z-50">
        <span className="inline-flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
          Need help right now?
          <button 
            onClick={onCrisisClick} 
            className="underline hover:text-coral transition-colors ml-1 font-bold cursor-pointer border-none bg-transparent p-0 text-[inherit]"
          >
            View support helplines &rarr;
          </button>
        </span>
      </div>

      {/* Header Navigation */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 w-full border-b border-line bg-paper/85 backdrop-blur-md transition-all duration-300"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div 
            onClick={() => handleNavClick("/")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-85 select-none transition-opacity"
            id="header-logo-container"
          >
            <img src={logoPng} alt="WellMindly Logo" className="h-8 w-auto block select-none" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className="text-xs font-bold text-ink-soft hover:text-plum transition-colors cursor-pointer border-none bg-transparent p-0"
              >
                {link.label}
              </button>
            ))}
            
            <span className="text-line h-4 w-px block"></span>

            {user ? (
              <button
                onClick={() => handleNavClick("/dashboard")}
                className="rounded-full bg-plum text-white px-5 py-2 text-xs font-bold hover:opacity-95 transition-all active:scale-95 cursor-pointer shadow-sm shadow-plum/20 border-none"
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={() => handleNavClick("/login")}
                className="rounded-full bg-navy text-white px-5 py-2 text-xs font-bold hover:opacity-95 transition-all active:scale-95 cursor-pointer shadow-sm border-none"
              >
                Sign In
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
            {user ? (
              <button
                onClick={() => handleNavClick("/dashboard")}
                className="rounded-full bg-plum text-white px-4 py-1.5 text-[11px] font-bold hover:opacity-95 transition-all active:scale-95 cursor-pointer shadow-sm shadow-plum/20 border-none"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => handleNavClick("/login")}
                className="rounded-full bg-navy text-white px-4 py-1.5 text-[11px] font-bold hover:opacity-95 transition-all active:scale-95 cursor-pointer shadow-sm border-none"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-ink hover:text-plum transition-colors cursor-pointer border-none bg-transparent"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-line bg-paper overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className="text-sm font-bold text-ink-soft hover:text-plum transition-colors text-left py-2 border-none bg-transparent cursor-pointer w-full"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}


import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Search, X } from "lucide-react";
import api from "../services/api";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { BreathingExercise } from "../components/crisis/BreathingExercise";
import { CountrySelect } from "../components/crisis/CountrySelect";
import { HotlineCard } from "../components/crisis/HotlineCard";
import type { CrisisHotline } from "../components/crisis/hotlines";
import { Input } from "../components/ui/Field";
import { IconButton } from "../components/ui/Button";
import { SkeletonCard } from "../components/ui/Skeleton";
import { ErrorState, EmptyState } from "../components/ui/EmptyState";
import { scrollToElement } from "../lib/a11y";

export function CrisisPage() {
  const [hotlines, setHotlines] = useState<CrisisHotline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dropdown combobox state
  const [selectedCountry, setSelectedCountry] = useState("United States");
  
  // Hotline search filter state
  const [hotlineSearchQuery, setHotlineSearchQuery] = useState("");

  const fetchHotlines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/students/hotlines");
      const list = response.data.hotlines || [];
      setHotlines(list);
    } catch (err) {
      console.error("Failed to fetch hotlines:", err);
      setError("Unable to load crisis resources. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Get Help Now | Crisis Support | WellMindly";
    fetchHotlines();
  }, [fetchHotlines]);

  // Update default selected country once data is loaded
  useEffect(() => {
    if (hotlines.length > 0) {
      const unique = Array.from(new Set(hotlines.map(h => h.country))).filter(Boolean).sort();
      if (unique.includes("United States")) {
        setSelectedCountry("United States");
      } else if (unique.length > 0) {
        setSelectedCountry(unique[0]);
      }
    }
  }, [hotlines]);

  // Extract unique countries sorted
  const availableCountries = Array.from(
    new Set(hotlines.map((h) => h.country))
  ).filter(Boolean).sort();

  // Filter hotlines for the selected country and hotlines search query
  const filteredHotlines = hotlines.filter((h) => {
    const matchesCountry = h.country === selectedCountry;
    if (!matchesCountry) return false;

    const q = hotlineSearchQuery.toLowerCase();
    return (
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.description.toLowerCase().includes(q) ||
      h.category.toLowerCase().includes(q)
    );
  });

  const handleShowHelplines = () => {
    const el = document.getElementById("helplines-heading");
    if (el) {
      scrollToElement(el, { block: "start" });
      el.focus();
    }
  };

  const listStatus = loading
    ? "Loading helplines…"
    : error
    ? error
    : `${filteredHotlines.length} helplines in ${selectedCountry}`;

  return (
    <div className="min-h-screen bg-paper text-ink-900 font-sans selection:bg-rose/20 selection:text-ink relative overflow-x-hidden flex flex-col justify-between">
      <div>
        {/* Header Layout */}
        <LandingHeader onCrisisClick={handleShowHelplines} />

        {/* Main Content Area */}
        <main className="mx-auto max-w-4xl px-6 py-16 relative z-10 flex-1" id="main-content" tabIndex={-1}>
          {/* Header Introduction */}
          <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in">
            <span className="text-2xs font-bold text-coral uppercase tracking-widest block mb-3">
              Immediate Support
            </span>
            <h1 className="text-4xl sm:text-5xl font-display text-ink-900 tracking-tight font-medium mb-4">
              Get Help Now
            </h1>
            <p className="text-ink-600 text-sm sm:text-base leading-relaxed">
              If things feel overwhelming right now, you don't have to carry it alone. 
              These are free, confidential resources with real people trained to support you.
            </p>
          </div>

          {/* Interactive De-escalation Breathing Exercise */}
          <BreathingExercise />

          {/* Controls Bar: Country Selector & Hotline Search */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="flex flex-col gap-6">
              {/* Searchable Country Selector Dropdown */}
              <CountrySelect
                countries={availableCountries}
                value={selectedCountry}
                onChange={(country) => {
                  setSelectedCountry(country);
                  setHotlineSearchQuery("");
                }}
              />

              {/* Hotline search input */}
              <div className="w-full">
                <Input
                  label={`Search helplines in ${selectedCountry}`}
                  className="text-base"
                  icon={<Search className="w-4 h-4 text-ink-600" />}
                  trailing={
                    hotlineSearchQuery ? (
                      <IconButton
                        label="Clear search"
                        size="sm"
                        icon={<X className="w-3.5 h-3.5" />}
                        onClick={() => setHotlineSearchQuery("")}
                      />
                    ) : undefined
                  }
                  value={hotlineSearchQuery}
                  onChange={(e) => setHotlineSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Polite live region for screen reader announcements */}
          <p role="status" aria-live="polite" className="sr-only">
            {listStatus}
          </p>

          {/* Helplines Container */}
          <div id="helplines" className="space-y-6">
            <h2 id="helplines-heading" tabIndex={-1} className="text-xl sm:text-2xl font-display font-bold text-ink-900">
              Helplines in {selectedCountry}
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-busy="true">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : error ? (
              <ErrorState
                title="We couldn't load the helplines"
                description="Your connection may have dropped. Try again, or use the breathing exercise above while you wait."
                onRetry={fetchHotlines}
                retrying={loading}
              />
            ) : filteredHotlines.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCountry}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {filteredHotlines.map((hotline) => (
                    <HotlineCard key={hotline.id} hotline={hotline} />
                  ))}
                </motion.div>
              </AnimatePresence>
            ) : hotlineSearchQuery ? (
              <EmptyState
                icon={<HelpCircle className="w-6 h-6 text-ink-600" />}
                title={`No helplines match "${hotlineSearchQuery}"`}
                action={{
                  label: "Clear search",
                  onClick: () => setHotlineSearchQuery(""),
                }}
              />
            ) : (
              <EmptyState
                icon={<HelpCircle className="w-6 h-6 text-ink-600" />}
                title={`No helplines listed for ${selectedCountry} yet`}
              />
            )}
          </div>
        </main>
      </div>

      {/* Footer Layout */}
      <LandingFooter onCrisisClick={handleShowHelplines} />
    </div>
  );
}

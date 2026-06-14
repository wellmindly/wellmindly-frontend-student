import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, AlertTriangle, HelpCircle, 
  Loader2, Globe, ChevronDown, Search, X, Check, ExternalLink 
} from "lucide-react";
import api from "../services/api";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";

interface CrisisHotline {
  id: string;
  name: string;
  description: string;
  phone: string;
  website: string;
  category: string;
  country: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Crisis: "bg-red-50 text-red-700 border-red-200/50",
  "Crisis & Suicide Support": "bg-red-50 text-red-700 border-red-200/50",
  "Mental Health": "bg-teal-50 text-teal-700 border-teal-200/50",
  "LGBTQ+ Support": "bg-indigo-50 text-indigo-700 border-indigo-200/50",
  "Domestic Violence": "bg-rose-50 text-rose-700 border-rose-200/50",
  "Substance Abuse": "bg-amber-50 text-amber-700 border-amber-200/50",
  "Veterans Support": "bg-blue-50 text-blue-700 border-blue-200/50",
  "Youth Support": "bg-violet-50 text-violet-700 border-violet-200/50",
};

export function CrisisPage() {
  const [hotlines, setHotlines] = useState<CrisisHotline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dropdown combobox states
  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Hotline search filter state
  const [hotlineSearchQuery, setHotlineSearchQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.title = "Get Help Now — Crisis Support | WellMindly";

    const fetchHotlines = async () => {
      try {
        setLoading(true);
        const response = await api.get("/students/hotlines");
        const list = response.data.hotlines || [];
        setHotlines(list);
      } catch (err) {
        console.error("Failed to fetch hotlines:", err);
        setError("Unable to load crisis resources. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchHotlines();
  }, []);

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

  // Filter countries inside the dropdown combobox
  const filteredCountries = availableCountries.filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleScrollToContent = () => {
    const el = document.getElementById("crisis-content-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-rose/20 selection:text-ink relative overflow-x-hidden flex flex-col justify-between">
      <div>
        {/* Header Layout */}
        <LandingHeader onCrisisClick={handleScrollToContent} />

        {/* Main Content Area */}
        <main className="mx-auto max-w-4xl px-6 py-16 relative z-10 flex-1" id="crisis-content-section">
          {/* Header Introduction */}
          <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in">
            <span className="text-[11px] font-bold text-coral uppercase tracking-widest block mb-3">
              Immediate Support
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif text-ink tracking-tight font-medium mb-4">
              Get Help Now
            </h1>
            <p className="text-ink-soft text-sm sm:text-base leading-relaxed">
              If things feel overwhelming right now, you don't have to carry it alone. 
              These are free, confidential resources with real people trained to support you.
            </p>
          </div>

          {/* Controls Bar: Country Selector & Hotline Search */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="flex flex-col gap-6">
              
              {/* Searchable Country Selector Dropdown */}
              <div className="relative w-full" ref={dropdownRef}>
                <label
                  htmlFor="country-search-dropdown"
                  className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2 select-none"
                >
                  Select Country / Region
                </label>
                <div className="relative">
                  <button
                    id="country-search-dropdown"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-white border border-line rounded-2xl px-5 py-4 text-sm font-semibold text-ink flex items-center justify-between shadow-sm hover:border-plum/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-plum/30 transition-all duration-300 cursor-pointer h-[54px]"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-ink-soft" />
                      <span>{selectedCountry}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-ink-soft transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-line rounded-2xl shadow-xl z-30 overflow-hidden flex flex-col"
                        style={{ maxHeight: '300px' }}
                      >
                        {/* Search inside the dropdown list */}
                        <div className="p-3 border-b border-line bg-[#F8FAF9] flex items-center gap-2 shrink-0">
                          <Search className="w-4 h-4 text-ink-soft shrink-0" />
                          <input
                            type="text"
                            placeholder="Type to search country..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none text-sm font-medium text-ink focus:outline-none placeholder:text-ink-soft/50"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                          {searchQuery && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchQuery("");
                              }}
                              className="text-ink-soft hover:text-ink cursor-pointer border-none bg-transparent p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Country Options list with explicit scroll constraint */}
                        <div 
                          style={{ maxHeight: '230px' }} 
                          className="overflow-y-auto py-1 flex-1"
                        >
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                              <button
                                key={country}
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setIsOpen(false);
                                  setSearchQuery("");
                                  setHotlineSearchQuery(""); // Clear search on change
                                }}
                                className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer border-none ${
                                  selectedCountry === country
                                    ? "bg-plum/5 text-plum"
                                    : "bg-white hover:bg-slate-50 text-ink-soft hover:text-ink"
                                }`}
                              >
                                <span>{country}</span>
                                {selectedCountry === country && <Check className="w-4 h-4 text-plum shrink-0" />}
                              </button>
                            ))
                          ) : (
                            <div className="px-5 py-4 text-xs font-bold text-ink-soft/60 text-center uppercase tracking-wider select-none">
                              No countries match
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Hotline search input */}
              <div className="relative w-full">
                <label
                  htmlFor="hotline-search"
                  className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2 select-none"
                >
                  Search Helplines in {selectedCountry}
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft/70" />
                  <input
                    id="hotline-search"
                    type="text"
                    placeholder="Search by name, description, category..."
                    value={hotlineSearchQuery}
                    onChange={(e) => setHotlineSearchQuery(e.target.value)}
                    className="w-full bg-white border border-line rounded-2xl pl-11 pr-10 py-4 text-sm font-medium text-ink placeholder:text-ink-soft/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-plum/30 focus:border-plum/40 transition-all duration-300 h-[54px]"
                  />
                  {hotlineSearchQuery && (
                    <button
                      onClick={() => setHotlineSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink cursor-pointer border-none bg-transparent p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Loader or Error */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-plum" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading resources...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-amber-600 gap-4 text-center">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <p className="font-semibold text-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Country-wise filtered hotline cards */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCountry}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {filteredHotlines.length > 0 ? (
                    filteredHotlines.map((hotline) => {
                      const colorClass = CATEGORY_COLORS[hotline.category] || "bg-paper text-ink-soft border-line";

                      return (
                        <div
                          key={hotline.id}
                          className="bg-white border border-line/75 rounded-[2rem] p-7 shadow-sm hover:shadow-md hover:border-line transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-3 mb-4">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider select-none ${colorClass}`}
                              >
                                {hotline.category}
                              </span>
                              <span className="text-[10px] font-semibold text-ink-soft bg-paper-2 px-2 py-0.5 rounded-md border border-line/45 select-none">
                                {hotline.country}
                              </span>
                            </div>
                            <h3 className="font-serif text-lg font-bold text-ink mb-2">
                              {hotline.name}
                            </h3>
                            <p className="text-ink-soft text-xs leading-relaxed mb-6 font-medium">
                              {hotline.description}
                            </p>
                          </div>

                          {/* Call and Website Action Buttons side-by-side */}
                          <div className="flex flex-col sm:flex-row gap-2.5 mt-auto">
                            {hotline.phone &&
                            hotline.phone !== "Online Support" &&
                            hotline.phone !== "Online only" ? (
                              <a
                                href={`tel:${hotline.phone.replace(/[^0-9+]/g, "")}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#121a30] text-white hover:bg-[#1d2843] transition-colors py-3.5 px-4 rounded-xl font-bold text-xs shadow-sm hover:shadow active:scale-[0.99]"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                Call {hotline.phone}
                              </a>
                            ) : null}

                            {hotline.website ? (
                              <a
                                href={hotline.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 bg-white text-ink border border-line hover:bg-slate-50 transition-colors py-3.5 px-4 rounded-xl font-bold text-xs shadow-sm"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-ink-soft" />
                                Website
                              </a>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-16 text-ink-soft font-semibold bg-white border border-line/50 rounded-[2rem] p-8 shadow-sm">
                      <HelpCircle className="w-8 h-8 mx-auto text-ink-soft/40 mb-3" />
                      No helplines match "{hotlineSearchQuery}" in {selectedCountry}.
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* Footer Layout */}
      <LandingFooter onCrisisClick={handleScrollToContent} />
    </div>
  );
}

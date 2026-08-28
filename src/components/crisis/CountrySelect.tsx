import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Search, X, Check } from "lucide-react";
import { useClickOutside, useRovingKeys } from "../../lib/a11y";

interface CountrySelectProps {
  countries: string[];
  value: string;
  onChange: (country: string) => void;
}

export function CountrySelect({ countries, value, onChange }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const containerRef = useClickOutside<HTMLDivElement>(isOpen, () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  });

  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  const handleSelectIndex = (index: number) => {
    const country = filteredCountries[index];
    if (country) {
      onChange(country);
      setIsOpen(false);
      setSearchQuery("");
      triggerRef.current?.focus();
    }
  };

  const rovingKeyDown = useRovingKeys({
    itemCount: filteredCountries.length,
    activeIndex,
    onActiveIndexChange: (i) => {
      setActiveIndex(i);
      const el = document.getElementById(`country-option-${i}`);
      el?.scrollIntoView({ block: "nearest" });
    },
    onSelect: handleSelectIndex,
    onDismiss: () => {
      setIsOpen(false);
      triggerRef.current?.focus();
    },
  });

  return (
    <div className="relative w-full" ref={containerRef}>
      <span
        id="country-select-label"
        className="block text-xs font-bold text-ink-600 uppercase tracking-wider mb-2 select-none"
      >
        Select Country / Region
      </span>
      <div className="relative">
        <button
          ref={triggerRef}
          id="country-search-dropdown"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-labelledby="country-select-label country-select-value"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls="country-listbox"
          className="w-full min-h-12 bg-card border border-ink-200/70 rounded-2xl px-5 py-3 text-sm font-semibold text-ink-900 flex items-center justify-between shadow-sm hover:border-plum/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-plum/30 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-ink-600" />
            <span id="country-select-value">{value}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-ink-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 bg-card border border-ink-200/70 rounded-2xl shadow-xl z-30 overflow-hidden flex flex-col"
              style={{ maxHeight: '300px' }}
            >
              {/* Search inside the dropdown list */}
              <div className="p-3 border-b border-ink-200/70 bg-ink-50 flex items-center gap-2 shrink-0">
                <Search className="w-4 h-4 text-ink-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Type to search country..."
                  aria-label="Search countries"
                  role="combobox"
                  aria-controls="country-listbox"
                  aria-expanded={isOpen}
                  aria-autocomplete="list"
                  aria-activedescendant={activeIndex >= 0 ? `country-option-${activeIndex}` : undefined}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={rovingKeyDown}
                  className="w-full bg-transparent border-none text-sm font-medium text-ink-900 focus:outline-none focus:border-plum-400 focus:ring-4 focus:ring-plum-500/12 placeholder:text-ink-600/50"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery("");
                    }}
                    className="text-ink-600 hover:text-ink-900 cursor-pointer border-none bg-transparent p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Country Options list with explicit scroll constraint */}
              <ul
                id="country-listbox"
                role="listbox"
                aria-labelledby="country-select-label"
                style={{ maxHeight: '230px' }}
                className="overflow-y-auto py-1 flex-1 m-0 list-none p-0"
              >
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country, i) => (
                    <li
                      key={country}
                      role="option"
                      id={`country-option-${i}`}
                      aria-selected={country === value}
                      onClick={() => handleSelectIndex(i)}
                      className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        activeIndex === i ? "ring-2 ring-plum-400/40 ring-inset" : ""
                      } ${
                        value === country
                          ? "bg-plum/5 text-plum"
                          : "bg-card hover:bg-ink-50 text-ink-600 hover:text-ink-900"
                      }`}
                    >
                      <span>{country}</span>
                      {value === country && <Check className="w-4 h-4 text-plum shrink-0" />}
                    </li>
                  ))
                ) : (
                  <li className="px-5 py-4 text-xs font-bold text-ink-600/60 text-center uppercase tracking-wider select-none list-none">
                    No countries match
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

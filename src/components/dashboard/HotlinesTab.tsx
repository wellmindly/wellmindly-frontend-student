import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Globe,
  Search,
  Shield,
  Heart,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import api from "../../services/api";

interface CrisisHotline {
  id: string;
  name: string;
  description: string;
  phone: string;
  website: string;
  category: string;
  country: string;
}

const CATEGORY_ICONS: Record<string, typeof Heart> = {
  Crisis: AlertTriangle,
  "Mental Health": Heart,
  "LGBTQ+ Support": Heart,
  "Domestic Violence": Shield,
  "Substance Abuse": Shield,
  Veterans: Shield,
  "Online Therapy": Globe,
};

const CATEGORY_COLORS: Record<string, string> = {
  Crisis: "bg-red-50 text-red-700 border-red-200",
  "Mental Health": "bg-plum/10 text-plum border-plum/20",
  "LGBTQ+ Support": "bg-violet-50 text-violet-700 border-violet-200",
  "Domestic Violence": "bg-amber-50 text-amber-700 border-amber-200",
  "Substance Abuse": "bg-teal-50 text-teal-700 border-teal-200",
  Veterans: "bg-blue-50 text-blue-700 border-blue-200",
  "Online Therapy": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function HotlinesTab() {
  const [grouped, setGrouped] = useState<Record<string, CrisisHotline[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotlines = async () => {
      try {
        setLoading(true);
        const response = await api.get("/students/hotlines");
        setGrouped(response.data.grouped || {});
      } catch (err) {
        console.error("Failed to fetch hotlines:", err);
        setError("Unable to load crisis resources. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchHotlines();
  }, []);

  // Filter hotlines by search and category
  const filteredGrouped: Record<string, CrisisHotline[]> = {};
  const categories = Object.keys(grouped);

  for (const cat of categories) {
    if (activeCategory && cat !== activeCategory) continue;
    const filtered = grouped[cat]?.filter((h) => {
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q) ||
        h.country.toLowerCase().includes(q)
      );
    });
    if (filtered && filtered.length > 0) {
      filteredGrouped[cat] = filtered;
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="font-medium">Loading crisis resources…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-4">
        <AlertTriangle className="h-10 w-10 text-amber-400" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-5">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-serif">
            Crisis & Support Helplines
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            If you or someone you know is in crisis, these resources are here to help — 24/7.
          </p>
        </div>
      </div>

      {/* Urgent Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 rounded-2xl p-6 flex items-start gap-4"
      >
        <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
          <Phone className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="font-black text-red-900 text-lg">
            In immediate danger? Call 988 (US) or your local emergency number.
          </h3>
          <p className="text-red-700/80 text-sm mt-1 font-medium leading-relaxed">
            If you are in a life-threatening situation, please call emergency services immediately.
            You are not alone — trained counselors are available right now.
          </p>
        </div>
      </motion.div>

      {/* Search + Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, description, or country…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-plum/30 focus:border-plum/40 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              activeCategory === null
                ? "bg-plum text-white border-plum shadow-md"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                activeCategory === cat
                  ? "bg-plum text-white border-plum shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Categorized Hotline Cards */}
      {Object.keys(filteredGrouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Search className="h-8 w-8" />
          <p className="font-medium">No hotlines match your search.</p>
        </div>
      ) : (
        Object.entries(filteredGrouped).map(([category, items]) => {
          const CategoryIcon = CATEGORY_ICONS[category] || Heart;
          const colorClasses = CATEGORY_COLORS[category] || "bg-slate-50 text-slate-700 border-slate-200";

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorClasses.split(" ").slice(0, 1).join(" ")}`}>
                  <CategoryIcon className={`h-4 w-4 ${colorClasses.split(" ").slice(1, 2).join(" ")}`} />
                </div>
                <h3 className="text-xl font-black text-slate-800">{category}</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((hotline, idx) => (
                  <motion.div
                    key={hotline.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 flex flex-col gap-4 group"
                  >
                    {/* Top: Name + Country Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-900 text-base leading-tight">
                          {hotline.name}
                        </h4>
                        <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${colorClasses}`}>
                          {hotline.country}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-500 text-sm leading-relaxed font-medium flex-1">
                      {hotline.description}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                      {hotline.phone !== "Online only" && hotline.phone !== "See website for local numbers" ? (
                        <a
                          href={`tel:${hotline.phone.replace(/[^0-9+]/g, "")}`}
                          className="flex items-center gap-2 bg-plum text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-plum/90 transition-all shadow-sm hover:shadow-md"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Call {hotline.phone}
                        </a>
                      ) : (
                        <span className="flex items-center gap-2 text-slate-400 text-xs font-bold px-4 py-2.5 rounded-full bg-slate-50">
                          <Globe className="h-3.5 w-3.5" />
                          {hotline.phone}
                        </span>
                      )}
                      <a
                        href={hotline.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Visit Website
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

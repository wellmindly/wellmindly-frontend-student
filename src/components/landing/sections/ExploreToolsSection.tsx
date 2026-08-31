import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PenTool, ArrowRight, MessageSquare, Users, LifeBuoy, Sparkles, Shield, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../../lib/cn";

export interface ExploreToolsSectionProps {
  onWriteMindlyClick: () => void;
  onTalkMindlyClick: () => void;
  onCoachingClick: () => void;
}

type CareOption = {
  id: "writemindly" | "talkmindly" | "blueprints";
  keyword: string;
  answer: string;
  support: string;
  chip: string;
  chipIcon: LucideIcon;
  cta: string;
  icon: LucideIcon;
  gradientBg: string;
  iconWrap: string;
  badgeStyle: string;
  hoverBorder: string;
  hoverShadow: string;
  accentText: string;
};

const OPTIONS: CareOption[] = [
  {
    id: "writemindly",
    keyword: "WriteMindly",
    answer: "Self-reflection in your own words",
    support: "Type what's swirling in your head. AI gently reflects it back without judgment so you can gain clarity in 60 seconds.",
    chip: "AI Journaling",
    chipIcon: Sparkles,
    cta: "Start writing with WriteMindly",
    icon: PenTool,
    gradientBg: "bg-gradient-to-br from-teal-500/10 via-teal-50/50 to-emerald-500/5",
    iconWrap: "bg-teal-100/80 text-teal-700 border-teal-200/80 shadow-xs",
    badgeStyle: "bg-teal-100 text-teal-800 border-teal-200",
    hoverBorder: "hover:border-teal-400/90 hover:ring-2 hover:ring-teal-400/20",
    hoverShadow: "hover:shadow-lg hover:shadow-teal-500/10",
    accentText: "text-teal-700 group-hover:text-teal-800",
  },
  {
    id: "talkmindly",
    keyword: "TalkMindly",
    answer: "Talk to people who get it",
    support: "Drop into safe, anonymous text and voice peer spaces. Connect with fellow students facing the exact same pressures.",
    chip: "Anonymous Circles",
    chipIcon: Shield,
    cta: "Join a TalkMindly circle",
    icon: MessageSquare,
    gradientBg: "bg-gradient-to-br from-plum-500/10 via-plum-50/50 to-violet-500/5",
    iconWrap: "bg-plum-100/80 text-plum-700 border-plum-200/80 shadow-xs",
    badgeStyle: "bg-plum-100 text-plum-800 border-plum-200",
    hoverBorder: "hover:border-plum-400/90 hover:ring-2 hover:ring-plum-400/20",
    hoverShadow: "hover:shadow-lg hover:shadow-plum-500/10",
    accentText: "text-plum-700 group-hover:text-plum-800",
  },
  {
    id: "blueprints",
    keyword: "MindlyCoaching",
    answer: "1-on-1 with a student coach",
    support: "Book a confidential 1-on-1 session with a trained student coach from your university who listens and guides you through.",
    chip: "Campus Coaches",
    chipIcon: Clock,
    cta: "Book 1-on-1 Peer Coaching",
    icon: Users,
    gradientBg: "bg-gradient-to-br from-coral-500/10 via-coral-50/50 to-rose-500/5",
    iconWrap: "bg-coral-100/80 text-coral-700 border-coral-200/80 shadow-xs",
    badgeStyle: "bg-coral-100 text-coral-800 border-coral-200",
    hoverBorder: "hover:border-coral-400/90 hover:ring-2 hover:ring-coral-400/20",
    hoverShadow: "hover:shadow-lg hover:shadow-coral-500/10",
    accentText: "text-coral-700 group-hover:text-coral-800",
  },
];

export function ExploreToolsSection({
  onWriteMindlyClick,
  onTalkMindlyClick,
  onCoachingClick,
}: ExploreToolsSectionProps) {
  const handlers: Record<CareOption["id"], () => void> = {
    writemindly: onWriteMindlyClick,
    talkmindly: onTalkMindlyClick,
    blueprints: onCoachingClick,
  };

  return (
    <section className="py-16 sm:py-20 border-t border-ink-200/60" id="explore-tools">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-2xs font-bold text-plum-600 uppercase tracking-widest block mb-3">
            Three ways in · Personalized Support
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink-900 text-balance">
            How do you want to express yourself today?
          </h2>
          <p className="text-base sm:text-lg text-ink-600 text-pretty mt-3 leading-relaxed">
            Everyone processes things differently. Pick what feels easiest right now — switch anytime with zero pressure.
          </p>
        </div>

        {/* 3-column card deck with appealing pastel styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            const ChipIcon = o.chipIcon;
            return (
              <div key={o.id} id={`care-${o.id}`} className="scroll-mt-24 flex">
                <button
                  type="button"
                  onClick={handlers[o.id]}
                  className={cn(
                    "group relative w-full text-left flex flex-col justify-between rounded-3xl border border-ink-200/80 p-6 sm:p-7 shadow-xs",
                    "transition-all duration-200 motion-reduce:transition-none cursor-pointer",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
                    o.gradientBg,
                    o.hoverBorder,
                    o.hoverShadow,
                    "hover:-translate-y-1"
                  )}
                >
                  <div>
                    {/* Top row: Icon + Keyword Badge */}
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <span
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl border",
                          o.iconWrap
                        )}
                        aria-hidden="true"
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-tight border shadow-2xs",
                          o.badgeStyle
                        )}
                      >
                        {o.keyword}
                      </span>
                    </div>

                    {/* Headline and description */}
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-ink-900 mb-2">
                      {o.answer}
                    </h3>
                    <p className="text-sm text-ink-600 leading-relaxed">
                      {o.support}
                    </p>
                  </div>

                  {/* Bottom row: Feature chip + CTA link */}
                  <div className="mt-6 pt-4 border-t border-ink-200/40 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-2xs font-bold text-ink-500">
                      <ChipIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{o.chip}</span>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-sm font-bold transition-colors",
                        o.accentText
                      )}
                    >
                      <span>{o.cta}</span>
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Quiet Crisis Line */}
        <p className="mx-auto max-w-2xl mt-8 sm:mt-10 text-center">
          <Link
            to="/crisis"
            className="inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-danger hover:bg-danger/5 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger transition-colors"
          >
            <LifeBuoy className="h-4 w-4 shrink-0" aria-hidden="true" />
            In crisis right now? Get immediate confidential support
          </Link>
        </p>
      </motion.div>
    </section>
  );
}

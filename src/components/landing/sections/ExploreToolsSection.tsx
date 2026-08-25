import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PenTool, ArrowRight, MessageSquare, Users, LifeBuoy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../../lib/cn";

export interface ExploreToolsSectionProps {
  onWriteMindlyClick: () => void;
  onTalkMindlyClick: () => void;
  onCoachingClick: () => void;
}

type CareOption = {
  id: "writemindly" | "talkmindly" | "blueprints";
  answer: string;
  support: string;
  chip: string;
  cta: string;
  icon: LucideIcon;
  iconWrap: string;
  hoverBorder: string;
  chipTint: string;
};

const OPTIONS: CareOption[] = [
  {
    id: "writemindly",
    answer: "Not out loud",
    support: "Type what's in your head. AI reflects it back so you can see it clearly.",
    chip: "About 60 seconds",
    cta: "Start writing",
    icon: PenTool,
    iconWrap: "bg-teal-50 text-teal-700 border-teal-200",
    hoverBorder: "hover:border-teal-400",
    chipTint: "bg-teal-50 text-teal-700",
  },
  {
    id: "talkmindly",
    answer: "To people who get it",
    support: "Anonymous, moderated peer circles. Open 24/7.",
    chip: "Anonymous",
    cta: "Join a circle",
    icon: MessageSquare,
    iconWrap: "bg-plum-50 text-plum-700 border-plum-200",
    hoverBorder: "hover:border-plum-400",
    chipTint: "bg-plum-50 text-plum-700",
  },
  {
    id: "blueprints",
    answer: "To a real person",
    support: "Book a confidential 1-on-1 with a trained student mentor.",
    chip: "1-on-1",
    cta: "See coaches",
    icon: Users,
    iconWrap: "bg-coral-50 text-coral-700 border-coral-200",
    hoverBorder: "hover:border-coral-400",
    chipTint: "bg-coral-50 text-coral-700",
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
    <section className="py-16 border-t border-ink-200/60" id="explore-tools">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-2xs font-bold text-plum-600 uppercase tracking-wide block mb-3">
            Three ways in
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink-900 text-balance">
            How much do you want to talk right now?
          </h2>
          <p className="text-base text-ink-600 text-pretty mt-3">
            Pick one. You can switch any time — nothing locks you in.
          </p>
        </div>

        <ul className="mx-auto max-w-2xl list-none space-y-3 sm:space-y-4">
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            return (
              <li key={o.id} id={`care-${o.id}`} className="scroll-mt-24">
                <button
                  type="button"
                  onClick={handlers[o.id]}
                  className={cn(
                    "group w-full text-left flex items-start gap-4 rounded-2xl border border-line bg-card p-5 sm:p-6 shadow-xs",
                    "transition-colors motion-reduce:transition-none hover:bg-paper-2/40",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
                    o.hoverBorder,
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 flex h-11 w-11 items-center justify-center rounded-xl border",
                      o.iconWrap,
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-lg sm:text-xl font-bold tracking-tight text-ink-900">
                        {o.answer}
                      </span>
                      <span className={cn("rounded-full px-2 py-0.5 text-2xs font-bold", o.chipTint)}>
                        {o.chip}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm text-ink-600 leading-relaxed">
                      {o.support}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-plum-700">
                      {o.cta}
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* One quiet crisis line. Deliberately not a coral panel — see note below. */}
        <p className="mx-auto max-w-2xl mt-6 text-center">
          <Link
            to="/crisis"
            className="inline-flex min-h-11 items-center justify-center gap-2 px-3 text-sm font-semibold text-danger hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
          >
            <LifeBuoy className="h-4 w-4 shrink-0" aria-hidden="true" />
            In crisis right now? Get immediate support
          </Link>
        </p>
      </motion.div>
    </section>
  );
}

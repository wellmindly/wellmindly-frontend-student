import { motion } from "framer-motion";
import { ClipboardList, ChevronRight } from "lucide-react";

export interface ScreeningCtaProps {
  onStartScreening: () => void;
}

export function ScreeningCta({ onStartScreening }: ScreeningCtaProps) {
  return (
    <section aria-labelledby="screening-cta-heading" className="w-full">
      <motion.div
        whileHover={{ y: -6, boxShadow: "0 25px 45px -15px rgba(122,91,147,0.08)" }}
        className="bg-card rounded-[2rem] p-6 sm:p-10 shadow-sm border border-ink-200/60 flex flex-col sm:flex-row items-center justify-between gap-6 group cursor-pointer transition-all duration-300"
        onClick={onStartScreening}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="h-16 w-16 bg-plum/10 text-plum rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <ClipboardList className="h-8 w-8" />
          </div>
          <div>
            <h2
              id="screening-cta-heading"
              className="text-2xl font-black text-ink-900 mb-2 font-serif"
            >
              Emotional Check-in
            </h2>
            <p className="text-ink-500 font-medium leading-relaxed max-w-xl text-sm">
              A two-minute wellbeing snapshot. See how you're really doing, and watch it shift over
              the weeks.
            </p>
          </div>
        </div>
        <div className="shrink-0 bg-plum text-plum-50 font-extrabold text-sm px-8 py-4 rounded-full transition-all group-hover:bg-plum/95 flex items-center gap-2 shadow-lg shadow-plum/15 min-h-11">
          Start Check-in{" "}
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import type { LatestResult } from "../../../types/student";

export interface LatestScoreCardProps {
  latestResult: LatestResult | null;
}

export function LatestScoreCard({ latestResult }: LatestScoreCardProps) {
  return (
    <section aria-labelledby="latest-score-heading" className="w-full">
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 20px 30px -10px rgba(0,0,0,0.03)" }}
        className="bg-card rounded-3xl p-6 shadow-sm border border-ink-200/60 flex flex-col sm:flex-row items-center justify-between relative overflow-hidden transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-plum/10 text-plum rounded-2xl flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h2
              id="latest-score-heading"
              className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-1"
            >
              {latestResult?.quizTitle || "Latest Assessment"}
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-ink-900 tracking-tight">
                {latestResult ? latestResult.score : "No score"}
              </span>
              {latestResult && (
                <span className="text-sm font-bold text-ink-400">
                  / {latestResult.maxScore ?? (latestResult.quizTitle.includes("PHQ-9") ? 15 : 27)}
                </span>
              )}
            </div>
          </div>
        </div>
        {latestResult ? (
          <span className="mt-4 sm:mt-0 flex items-center gap-1.5 text-xs font-bold text-plum bg-plum/5 border border-plum/10 px-3.5 py-2 rounded-xl relative z-10">
            <Activity className="h-4 w-4" /> Status: {latestResult.classification}
          </span>
        ) : (
          <span className="mt-4 sm:mt-0 flex items-center gap-1.5 text-xs font-bold text-ink-500 bg-ink-50 border border-ink-200/60 px-3.5 py-2 rounded-xl relative z-10">
            No screening taken yet
          </span>
        )}
      </motion.div>
    </section>
  );
}

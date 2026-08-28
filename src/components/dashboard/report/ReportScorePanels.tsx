import { displayClassification } from "../../../lib/wellbeing";
import type { TimelinePoint } from "../../../types/student";

export function ReportScorePanels({ report }: { report: TimelinePoint }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Score Section */}
      <div className="bg-paper-2 rounded-3xl p-6 border border-ink-100 flex flex-col justify-center text-center sm:text-left">
        <h4 className="text-2xs font-black text-ink-400 uppercase tracking-widest mb-3">
          Overall Score
        </h4>
        <div className="flex items-baseline gap-2 justify-center sm:justify-start">
          <span className="text-6xl font-black text-ink-900 tracking-tighter">
            {report.score}
          </span>
          <span className="text-xl font-bold text-ink-400">/ {report.maxScore}</span>
        </div>
        <p className="text-xs text-ink-500 font-medium mt-4 leading-relaxed">
          Your total across the questions you answered. It is one number,
          not a measurement of separate areas of your life.
        </p>
      </div>

      {/* What the score suggests.
          Heading was "Severity Evaluation" and the value was the raw
          stored string, so rows written before lib/wellbeing.ts - and
          every row prisma/seed.js creates - still printed a diagnosis
          here. `displayClassification` maps them onto the shared bands. */}
      <div className="bg-plum/5 rounded-3xl p-6 border border-plum/10 flex flex-col justify-center">
        <h4 className="text-2xs font-black text-plum/70 uppercase tracking-widest mb-2.5">
          What this suggests
        </h4>
        <span className="text-2xl font-black text-plum leading-tight mb-4">
          {displayClassification(
            report.quizTitle,
            report.classification,
            report.score
          )}
        </span>
        <div className="w-full bg-plum/10 h-3 rounded-full overflow-hidden">
          <div
            className="bg-plum h-full rounded-full transition-all duration-1000"
            style={{ width: `${report.percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

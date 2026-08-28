import { Info, Lightbulb, Sparkles } from "lucide-react";
import type { TimelinePoint } from "../../../types/student";
import { ReportBreakdown } from "./ReportBreakdown";
import { ReportNarrative } from "./ReportNarrative";

export function ReportInsights({ report }: { report: TimelinePoint }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-black text-ink-800 uppercase tracking-wider mb-4 border-b border-ink-100 pb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-plum" /> Detailed Dimension Analysis
        </h4>
        {report.aiFeedback?.insights && report.aiFeedback.insights.length > 0 ? (
          <ul className="space-y-2.5">
            {report.aiFeedback.insights.map((insight: string, idx: number) => (
              <li
                key={idx}
                className="flex gap-2.5 items-start text-xs sm:text-sm font-medium text-ink-700 bg-paper-2 p-3.5 rounded-xl border border-ink-100"
              >
                <span className="h-5 w-5 rounded-full bg-plum/10 text-plum flex items-center justify-center text-2xs shrink-0 font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ReportBreakdown report={report} />
        )}
      </div>

      <div className="bg-paper-2 border border-ink-200 rounded-2xl p-5 mt-6">
        <h4 className="text-xs font-black text-ink-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info className="h-4 w-4 text-plum" /> Recommended Action Narrative
        </h4>
        {report.aiFeedback?.narrative ? (
          <div className="space-y-2.5">
            <p className="text-xs sm:text-sm font-bold text-ink-800">
              {report.aiFeedback.headline}
            </p>
            <p className="text-xs sm:text-sm text-ink-600 leading-relaxed font-medium">
              {report.aiFeedback.narrative}
            </p>
            {report.aiFeedback.tip && (
              <p className="text-xs text-plum font-semibold mt-2 bg-plum/5 p-3 rounded-lg border border-plum/10 leading-relaxed flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  <b>Tip</b>: {report.aiFeedback.tip}
                </span>
              </p>
            )}
          </div>
        ) : (
          <ReportNarrative classification={report.classification} score={report.score} />
        )}
      </div>
    </div>
  );
}

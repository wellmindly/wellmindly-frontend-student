import { Info } from "lucide-react";
import { frequencyLabel, isWellbeingCheckin } from "../../../lib/wellbeing";
import type { TimelinePoint } from "../../../types/student";
import { DimensionBar } from "./DimensionBar";

export function ReportBreakdown({ report }: { report: TimelinePoint }) {
  const title = report?.quizTitle || "";
  const t = title.toLowerCase();
  const scores = report?.answers?.scores;

  if (scores) {
    // `isWellbeingCheckin` rather than `t.includes("phq")`: the instrument is
    // now titled "Wellbeing check-in", which would otherwise fall through to
    // the generic check-in branch and relabel a 0-3 frequency scale as
    // "Stable / Moderate / Needs Focus". Legacy titles still match.
    const isPhq9 = isWellbeingCheckin(title);
    const isCheckin = !isPhq9 && (t.includes("check-in") || t.includes("checkin"));

    return (
      <div className="space-y-4">
        {Object.entries(scores).map(([label, val]) => {
          const value = Number(val);
          const status = isPhq9
            ? frequencyLabel(value)
            : isCheckin
              ? (value >= 70 ? 'Stable' : value >= 45 ? 'Moderate' : 'Needs Focus')
              : (value >= 75 ? 'Dominant Strength' : value >= 55 ? 'Strong' : value >= 35 ? 'Developing' : 'Room to grow');

          const statusColor = isPhq9
            ? (value >= 75 ? 'text-rose-700' : value >= 55 ? 'text-coral-700' : value >= 35 ? 'text-gold-700' : 'text-sage-700')
            : (value >= 70 ? 'text-sage-700' : value >= 45 ? 'text-plum-700' : 'text-gold-700');

          const barColor = isPhq9
            ? (value >= 75 ? 'bg-rose-500' : value >= 55 ? 'bg-coral-500' : value >= 35 ? 'bg-gold-500' : 'bg-sage-500')
            : (value >= 70 ? 'bg-sage-500' : value >= 45 ? 'bg-plum-500' : 'bg-gold-500');

          return (
            <DimensionBar
              key={label}
              label={label}
              status={`${status} (${value}%)`}
              statusColor={statusColor}
              barColor={barColor}
              width={`${value}%`}
            />
          );
        })}
      </div>
    );
  }

  // Fallback when the stored result has no per-question `scores` object.
  //
  // This used to invent three bars: "Sleep Quality & Sleep Latency",
  // "Social Connectedness & Support" (a flat 78% with no input at all) and
  // "Study Concentration & Cognitive Load" - all derived from the single total
  // score, presented to the student as measurements. Nothing in the payload
  // supports any of them, so they are gone rather than restyled.
  //
  // Five more sets of invented bars used to sit above this branch, keyed on the
  // quiz title (strengths / personality / values / check-in / mood). A comment
  // here claimed they were "not reachable from this instrument". That was true
  // of the wellbeing check-in and false of everything else: "Signature
  // strengths", "Personality profile", "Emotional check-in" and "Mood snapshot"
  // are all real seeded quiz titles, so a student taking any of them whose
  // stored row lacked `answers.scores` was shown invented percentages as their
  // own measured profile. They are deleted. This fallback is now the only
  // outcome besides the real `scores` branch above - if a future report needs a
  // breakdown, it comes from the payload or it does not render.
  return (
    <div className="flex gap-3 rounded-2xl border border-ink-200/70 bg-ink-50 p-4">
      <Info className="h-4 w-4 shrink-0 text-ink-400 mt-0.5" aria-hidden="true" />
      <p className="text-xs font-medium leading-relaxed text-ink-600">
        This report was saved without a per-question breakdown, so there is
        nothing to chart here. Your total score and what it means are above.
      </p>
    </div>
  );
}

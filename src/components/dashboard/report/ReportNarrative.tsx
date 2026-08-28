import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { bandForResult } from "../../../lib/wellbeing";

export function ReportNarrative({
  classification,
  score,
}: {
  classification: string;
  score: number;
}) {
  // Default — the five-question wellbeing check-in.
  // The band comes from lib/wellbeing.ts rather than the `score > 12 / > 7 / > 4`
  // ladder that used to live here: that was the third hard-coded copy of the
  // same cut points, and its labels ("Severe", diagnosis-shaped) were a claim
  // this product cannot make. `bandForResult` also reads historical rows that
  // still hold the old strings, so old reports stay coherent.
  const band = bandForResult(score, classification);

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-600 leading-relaxed font-medium">
        Your score of {score} sits in <span className="font-semibold text-plum">{band.label}</span>. {band.support}
      </p>
      {band.showCrisisLink && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/70 flex gap-3 text-rose-800">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs font-semibold leading-relaxed">
            If you need to talk to someone now,{" "}
            <Link to="/crisis" className="underline font-bold hover:text-rose-900">
              crisis support and hotlines are here
            </Link>
            . Reaching out is a strength, and you do not have to carry this alone.
          </p>
        </div>
      )}
    </div>
  );
}

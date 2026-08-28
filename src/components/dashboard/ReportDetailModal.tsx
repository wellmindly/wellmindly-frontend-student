import { useRef } from "react";
import { Clock } from "lucide-react";
import { displayQuizTitle, WELLBEING_TITLE } from "../../lib/wellbeing";
import type { TimelinePoint } from "../../types/student";
import { Button, Sheet } from "../ui";
import { ReportScorePanels } from "./report/ReportScorePanels";
import { ReportInsights } from "./report/ReportInsights";

export interface ReportDetailModalProps {
  report: TimelinePoint | null;
  onClose: () => void;
}

export function ReportDetailModal({ report, onClose }: ReportDetailModalProps) {
  // Keep the last report through the exit animation: `report` goes null the
  // instant the parent clears it, but Sheet needs a stable `title` while it
  // animates out.
  const last = useRef<TimelinePoint | null>(null);
  if (report) last.current = report;
  const shown = report ?? last.current;

  return (
    <Sheet
      open={report !== null}
      onClose={onClose}
      title={shown ? displayQuizTitle(shown.quizTitle) || WELLBEING_TITLE : WELLBEING_TITLE}
      description={
        shown ? (
          <span className="flex items-center gap-1.5 text-xs text-ink-500 font-medium">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              Recorded on{" "}
              {new Date(shown.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </span>
        ) : undefined
      }
      size="lg"
      footer={<Button fullWidth onClick={onClose}>Got it</Button>}
    >
      {shown && (
        <>
          <ReportScorePanels report={shown} />
          <ReportInsights report={shown} />
        </>
      )}
    </Sheet>
  );
}

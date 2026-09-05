import { Card, Button } from "../../ui";
import { ClipboardList, Smile, Compass } from "lucide-react";
import { formatRelative } from "../../../lib/format";
import type { LatestResult } from "../../../types/student";

export interface NextStepProps {
  dailyMood: number | null;
  latestResult: LatestResult | null;
  onStartScreening: () => void;
  onExploreDiscover: () => void;
}

// Re-check after 14 days so the wellbeing trajectory stays current.
const STALE_AFTER_DAYS = 14;

export function NextStep({
  dailyMood,
  latestResult,
  onStartScreening,
  onExploreDiscover,
}: NextStepProps) {
  let tone: "primary" | "teal" | "sage" = "primary";
  let eyebrow = "Next";
  let title = "";
  let support = "";
  let ctaLabel: string | null = null;
  let onCtaClick: (() => void) | null = null;
  let icon = <ClipboardList className="h-5 w-5 text-plum" aria-hidden="true" />;
  let iconBg = "bg-plum-100";

  const isStale =
    latestResult &&
    Date.now() - new Date(latestResult.date).getTime() > STALE_AFTER_DAYS * 864e5;

  if (latestResult === null) {
    tone = "primary";
    title = "You haven't done a wellbeing snapshot yet";
    // Home's CTA opens the Emotional check-in (TESTS.checkin, six items) - the
    // Assessments tab's same-named button opens the five-item Wellbeing
    // check-in instead. Count the questions the student will actually be asked.
    support = "Two minutes, six questions. It gives the chart below something to plot.";
    ctaLabel = "Start the check-in";
    onCtaClick = onStartScreening;
    icon = <ClipboardList className="h-5 w-5 text-plum" aria-hidden="true" />;
    iconBg = "bg-plum-100";
  } else if (isStale) {
    tone = "primary";
    title = `Your last snapshot was ${formatRelative(latestResult.date)}`;
    support = "Things change. Re-taking it is how the trajectory below stays true.";
    ctaLabel = "Take it again";
    onCtaClick = onStartScreening;
    icon = <ClipboardList className="h-5 w-5 text-plum" aria-hidden="true" />;
    iconBg = "bg-plum-100";
  } else if (dailyMood === null) {
    tone = "teal";
    title = "Start with today: one tap, no reading";
    support = "Your daily mood takes one tap and builds the mosaic further down this page.";
    ctaLabel = null;
    onCtaClick = null;
    icon = <Smile className="h-5 w-5 text-teal" aria-hidden="true" />;
    iconBg = "bg-teal-100";
  } else {
    tone = "sage";
    title = "You're up to date. Nothing is overdue.";
    support = "Quizzes, journalling and peer circles are all in Discover whenever you want them.";
    ctaLabel = "Explore Discover";
    onCtaClick = onExploreDiscover;
    icon = <Compass className="h-5 w-5 text-sage-600" aria-hidden="true" />;
    iconBg = "bg-sage-100";
  }

  return (
    <section aria-labelledby="next-step-heading">
      <Card tone={tone} padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${iconBg}`}
            >
              {icon}
            </div>

            <div>
              <span className="text-2xs font-bold uppercase tracking-widest text-ink-500 block mb-0.5">
                {eyebrow}
              </span>
              {/* The id sits on the h2, not the eyebrow: the landmark's name has to be
                  the recommendation itself, not the word "Next". */}
              <h2
                id="next-step-heading"
                className="text-base font-bold text-ink-900 leading-snug"
              >
                {title}
              </h2>
              <p className="text-xs text-ink-600 mt-1 leading-relaxed max-w-xl">
                {support}
              </p>
            </div>
          </div>

          {ctaLabel && onCtaClick && (
            <div className="shrink-0 self-start sm:self-center pl-13 sm:pl-0">
              <Button
                variant="primary"
                size="sm"
                onClick={onCtaClick}
                className="whitespace-nowrap"
              >
                {ctaLabel} &rarr;
              </Button>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}

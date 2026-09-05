import { WellbeingChart } from "./WellbeingChart";
import { TodayCard, NextStep, MoodMosaic, QuickActions } from "./overview";
import type { DailyCheckinRow, ResultsData } from "../../types/student";

export interface OverviewTabProps {
  greeting: string;
  firstName: string;
  dailyMood: number | null;
  historicalCheckins?: DailyCheckinRow[];
  resultsData: ResultsData | null;
  onDailyCheckin: (rating: number) => void;
  onRequestCheckin: () => void;
  onExploreDiscover: () => void;
  onViewAssessments: () => void;
  onStartScreening: () => void;
  onComingSoonClick?: (feature: "writemindly" | "talkmindly" | "sessionbooking") => void;
}

export function OverviewTab({
  greeting,
  firstName,
  dailyMood,
  historicalCheckins = [],
  resultsData,
  onDailyCheckin,
  onRequestCheckin,
  onExploreDiscover,
  onViewAssessments,
  onStartScreening,
  onComingSoonClick,
}: OverviewTabProps) {
  /* Both cards speak about the check-in specifically. `latestResult` is already
     the server's own screening filter (students.ts `screeningResults`: the title
     contains "check-in" or "phq-9", or the category is Self-check / Wellbeing /
     Clinical / Depression), and none of the five unscored Discover quizzes match
     it - Mood snapshot is "Quick", What matters most is "Values", Strength &
     shadow is "Insight" - so a two-minute Values sort cannot make this page claim
     a snapshot the student never took. Deriving it from the timeline instead would
     narrow it further and drop seeded wellbeing checks like "Running on empty".
     TodayCard still asks `hasRealScore` before printing a fraction: passing the
     screening filter does not make a row's total sane. */
  const latestCheckinResult = resultsData?.latestResult ?? null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <TodayCard
        greeting={greeting}
        firstName={firstName}
        dailyMood={dailyMood}
        historicalCheckins={historicalCheckins}
        latestResult={latestCheckinResult}
        onDailyCheckin={onDailyCheckin}
      />

      <NextStep
        dailyMood={dailyMood}
        latestResult={latestCheckinResult}
        onStartScreening={onStartScreening}
        onExploreDiscover={onExploreDiscover}
      />

      <WellbeingChart
        timeline={resultsData?.timeline}
        onViewDetails={onViewAssessments}
      />

      <MoodMosaic
        historicalCheckins={historicalCheckins}
        onRequestCheckin={onRequestCheckin}
      />

      <QuickActions onComingSoonClick={onComingSoonClick} />
    </div>
  );
}

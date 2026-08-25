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
  onExploreDiscover,
  onViewAssessments,
  onStartScreening,
  onComingSoonClick,
}: OverviewTabProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <TodayCard
        greeting={greeting}
        firstName={firstName}
        dailyMood={dailyMood}
        historicalCheckins={historicalCheckins}
        latestResult={resultsData?.latestResult ?? null}
        onDailyCheckin={onDailyCheckin}
      />

      <NextStep
        dailyMood={dailyMood}
        latestResult={resultsData?.latestResult ?? null}
        onStartScreening={onStartScreening}
        onExploreDiscover={onExploreDiscover}
      />

      <WellbeingChart
        timeline={resultsData?.timeline}
        onViewDetails={onViewAssessments}
      />

      <MoodMosaic
        historicalCheckins={historicalCheckins}
        onDailyCheckin={onDailyCheckin}
      />

      <QuickActions onComingSoonClick={onComingSoonClick} />
    </div>
  );
}

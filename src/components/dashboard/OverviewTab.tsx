import { WellbeingChart } from "./WellbeingChart";
import {
  WelcomeBanner,
  LatestScoreCard,
  MoodMosaic,
  ScreeningCta,
  QuickActions,
} from "./overview";
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
    <div className="space-y-8">
      <WelcomeBanner
        greeting={greeting}
        firstName={firstName}
        dailyMood={dailyMood}
        onDailyCheckin={onDailyCheckin}
        onExploreDiscover={onExploreDiscover}
      />

      <LatestScoreCard latestResult={resultsData?.latestResult ?? null} />

      <WellbeingChart
        timeline={resultsData?.timeline}
        onViewDetails={onViewAssessments}
      />

      <MoodMosaic
        historicalCheckins={historicalCheckins}
        onDailyCheckin={onDailyCheckin}
      />

      <ScreeningCta onStartScreening={onStartScreening} />

      <QuickActions onComingSoonClick={onComingSoonClick} />
    </div>
  );
}

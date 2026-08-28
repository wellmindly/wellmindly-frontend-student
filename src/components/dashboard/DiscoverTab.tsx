import { HubView } from "../discover/HubView";
import { TestView } from "../discover/TestView";
import { ResultView } from "../discover/ResultView";
import { TESTS } from "../discover/types";
import type { PictureOption } from "../discover/types";
import type { DiscoverResultData } from "../../hooks/useDashboard";
import type { RefObject } from "react";
import { SectionHeader, SkeletonCard, SkeletonText } from "../ui";

interface DiscoverTabProps {
  discoverView: "hub" | "test" | "result" | "results";
  setDiscoverView: (view: "hub" | "test" | "result" | "results") => void;
  curDiscoverId: string | null;
  discoverQi: number;
  setDiscoverQi: (qi: number) => void;
  discoverResp: (number | string)[];
  discoverResultData: DiscoverResultData | null;
  startDiscoverTest: (id: string) => void;
  finishDiscoverTest: (id: string, test: any, responses: (number | string)[]) => void;
  answerDiscoverLikert: (val: number) => void;
  answerDiscoverPair: (val: string) => void;
  answerDiscoverPicture: (opt: PictureOption) => void;
  cardRef: RefObject<HTMLDivElement | null>;
  reportRef: RefObject<HTMLDivElement | null>;
  discoverLoading: boolean;
  resultsData: any;
  onComingSoonClick: (feature: "writemindly" | "talkmindly" | "sessionbooking") => void;
  onSwitchToAssessments: () => void;
  isCheckinMode?: boolean;
  onBackToOverview?: () => void;
}

export function DiscoverTab({
  discoverView,
  setDiscoverView,
  curDiscoverId,
  discoverQi,
  setDiscoverQi,
  discoverResp,
  discoverResultData,
  startDiscoverTest,
  finishDiscoverTest,
  answerDiscoverLikert,
  answerDiscoverPair,
  answerDiscoverPicture,
  cardRef,
  reportRef,
  discoverLoading,
  onSwitchToAssessments,
  resultsData,
  onComingSoonClick,
  isCheckinMode = false,
  onBackToOverview,
}: DiscoverTabProps) {
  // "results" never renders here - the dashboard shows saved results on the
  // Assessments tab, so goTo("results") switches tabs instead. See T-510.
  const goTo = (v: string) => {
    if (v === "results") {
      onSwitchToAssessments();
    } else {
      setDiscoverView(v as "hub" | "test" | "result" | "results");
    }
  };

  if (discoverLoading) {
    return (
      <div className="space-y-6">
        <SkeletonText lines={2} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <SectionHeader
        as="h1"
        title={isCheckinMode ? "Emotional check-in" : "Explore tests"}
        description={
          isCheckinMode
            ? "A two-minute wellbeing snapshot. See how you're really doing"
            : "Discover insights about your strengths, personality, and values"
        }
        className="border-b border-ink-200/70 pb-5"
      />

      <div className="max-w-4xl mx-auto">
        {discoverView === "hub" && <HubView startTest={startDiscoverTest} goTo={goTo} as="h2" />}

        {discoverView === "test" && curDiscoverId && TESTS[curDiscoverId] && (() => {
          const cur = TESTS[curDiscoverId];
          const total = cur.kind === "pairs"
            ? cur.pairs!.length
            : cur.kind === "picture"
            ? 1
            : cur.items!.length;
          const progress = total > 1 ? (discoverQi / (total - 1)) * 100 : 100;
          return (
            <TestView
              cur={cur}
              qi={discoverQi}
              resp={discoverResp}
              total={total}
              progress={progress}
              onBackClick={() => isCheckinMode && onBackToOverview ? onBackToOverview() : setDiscoverView("hub")}
              onPrevQuestion={() => {
                if (discoverQi > 0) setDiscoverQi(discoverQi - 1);
              }}
              onNextQuestion={() => {
                if (discoverQi < total - 1) {
                  setDiscoverQi(discoverQi + 1);
                } else {
                  finishDiscoverTest(curDiscoverId, cur, discoverResp);
                }
              }}
              onPickPicture={answerDiscoverPicture}
              onPickPair={answerDiscoverPair}
              onPickLikert={answerDiscoverLikert}
            />
          );
        })()}

        {discoverView === "result" && discoverResultData && curDiscoverId && TESTS[curDiscoverId] && (
          <div className="max-w-xl mx-auto animate-fade-in">
            <ResultView
              cur={TESTS[curDiscoverId]}
              curId={curDiscoverId}
              data={discoverResultData}
              accent={TESTS[curDiscoverId].accent}
              accentTo={TESTS[curDiscoverId].accentTo}
              cardRef={cardRef}
              reportRef={reportRef}
              onRetake={() => startDiscoverTest(curDiscoverId)}
              goTo={goTo}
              resultsData={resultsData}
              onComingSoonClick={onComingSoonClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}

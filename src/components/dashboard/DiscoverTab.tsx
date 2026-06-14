import { HubView } from "../discover/HubView";
import { TestView } from "../discover/TestView";
import { ResultView } from "../discover/ResultView";
import { TESTS } from "../discover/types";
import type { PictureOption } from "../discover/types";
import type { DiscoverResultData } from "../../hooks/useDashboard";
import type { RefObject } from "react";
import { Heart } from "lucide-react";

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
  doSaveCard: () => void;
  onSaveReportPdf: () => void;
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
  doSaveCard,
  onSaveReportPdf,
  onSwitchToAssessments,
  resultsData,
  onComingSoonClick,
  isCheckinMode = false,
  onBackToOverview,
}: DiscoverTabProps) {
  const goTo = (v: string) => {
    if (v === "results") {
      onSwitchToAssessments();
    } else {
      setDiscoverView(v as "hub" | "test" | "result" | "results");
    }
  };

  if (discoverLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 space-y-6 animate-pulse select-none bg-white/50 border border-white/20 rounded-[32px] shadow-sm backdrop-blur-md">
        <div className="relative w-24 h-24 rounded-full bg-plum/20 flex items-center justify-center shadow-lg shadow-plum/10 border border-plum/30 animate-spin" style={{ animationDuration: '8s' }}>
          <div className="absolute w-12 h-12 rounded-full bg-plum/40 animate-ping" />
          <Heart className="w-8 h-8 text-plum fill-current" />
        </div>
        
        <div className="space-y-2.5">
          <h3 className="text-xl font-extrabold text-slate-800 font-serif">Gathering your self-reflection insights...</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">
            Formulating personalized patterns and observations. This will take just a few seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between border-b border-slate-200/50 pb-5">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-serif">
            {isCheckinMode ? "Emotional Check-in" : "Explore Tests"}
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            {isCheckinMode
              ? "A two-minute wellbeing snapshot — see how you're really doing"
              : "Discover insights about your strengths, personality, and values"}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {discoverView === "hub" && <HubView startTest={startDiscoverTest} goTo={goTo} />}

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
              curId={curDiscoverId}
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
              cardRef={cardRef}
              reportRef={reportRef}
              onSaveCard={doSaveCard}
              onSaveReportPdf={onSaveReportPdf}
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

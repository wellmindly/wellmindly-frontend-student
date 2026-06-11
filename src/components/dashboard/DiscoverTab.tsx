import { HubView } from "../discover/HubView";
import { TestView } from "../discover/TestView";
import { ResultView } from "../discover/ResultView";
import { TESTS } from "../discover/types";
import type { PictureOption } from "../discover/types";
import type { DiscoverResultData } from "../../hooks/useDashboard";
import type { RefObject } from "react";

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
  doSaveCard: () => void;
  onSwitchToAssessments: () => void;
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
  doSaveCard,
  onSwitchToAssessments,
}: DiscoverTabProps) {
  const goTo = (v: string) => {
    if (v === "results") {
      onSwitchToAssessments();
    } else {
      setDiscoverView(v as "hub" | "test" | "result" | "results");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between border-b border-slate-200/50 pb-5">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-serif">Explore Tests</h2>
          <p className="text-slate-500 font-medium mt-1">
            Discover insights about your strengths, personality, and values
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
              onBackClick={() => setDiscoverView("hub")}
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
          <div className="max-w-xl mx-auto">
            <ResultView
              cur={TESTS[curDiscoverId]}
              curId={curDiscoverId}
              data={discoverResultData}
              accent={TESTS[curDiscoverId].accent}
              cardRef={cardRef}
              onSaveCard={doSaveCard}
              onRetake={() => startDiscoverTest(curDiscoverId)}
              goTo={goTo}
            />
          </div>
        )}
      </div>
    </div>
  );
}

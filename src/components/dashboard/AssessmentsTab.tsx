import { motion } from "framer-motion";
import {
  ClipboardList,
  Activity,
  BrainCircuit,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { displayQuizTitle, displayClassification } from "../../lib/wellbeing";
import type { ResultsData, TimelinePoint } from "../../types/student";
import { Button, EmptyState } from "../ui";

interface AssessmentsTabProps {
  resultsData: ResultsData | null;
  setSelectedReport: (report: TimelinePoint) => void;
  historyPage: number;
  setHistoryPage: (page: number) => void;
  onExploreDiscover: () => void;
  onStartScreening: () => void;
}

export function AssessmentsTab({
  resultsData,
  setSelectedReport,
  historyPage,
  setHistoryPage,
  onExploreDiscover,
  onStartScreening,
}: AssessmentsTabProps) {
  const latestResult = resultsData?.latestResult;
  // `maxScore` is a non-nullable column, so the old
  // `?? (quizTitle.includes("PHQ-9") ? 15 : 27)` fallback could never
  // legitimately fire - it existed only to paper over a second, five-question
  // instrument mislabelled "PHQ-9". See lib/wellbeing.ts.
  const latestMaxScore = latestResult?.maxScore ?? 0;
  const latestScore = latestResult?.score ?? 0;

  const pct = latestMaxScore > 0 ? latestScore / latestMaxScore : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-plum-100 text-plum-700 rounded-2xl flex items-center justify-center">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-ink-900">My Quiz Results</h2>
            <p className="text-ink-500 font-medium mt-1">
              Review your recent well-being assessments
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          leadingIcon={<Activity className="h-4 w-4" />}
          onClick={onStartScreening}
        >
          Start the check-in
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Report Card / Empty state */}
        <div className="lg:col-span-2 space-y-6">
          {!resultsData || !resultsData.latestResult ? (
            <EmptyState
              icon={<ClipboardList className="h-8 w-8" />}
              title="No check-ins yet"
              description="Take the five-question wellbeing check-in to start tracking how your weeks are going. It's a reflection tool, not a diagnosis."
              action={{ label: "Take the wellbeing check-in", onClick: onStartScreening }}
            />
          ) : (
            <>
              {/* Latest Result Card */}
              <div className="bg-card rounded-3xl p-8 sm:p-10 shadow-sm border border-ink-200/60 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <BrainCircuit className="w-64 h-64" />
                </div>

                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-ink-100">
                    <div>
                      <h3 className="text-2xl font-black text-ink-900">
                        {displayQuizTitle(resultsData.latestResult.quizTitle)}
                      </h3>
                      <p className="text-ink-500 font-medium mt-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Completed on{" "}
                        {new Date(resultsData.latestResult.date).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="bg-plum/10 text-plum px-4 py-2 rounded-xl font-bold text-xs border border-plum/10">
                      Evaluated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-paper-2 rounded-2xl p-8 border border-ink-100 flex flex-col justify-center">
                      <h4 className="text-xs font-black text-ink-400 uppercase tracking-widest mb-3">
                        Overall Score
                      </h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-ink-900 tracking-tighter">
                          {latestScore}
                        </span>
                        <span className="text-xl font-bold text-ink-400">
                          / {latestMaxScore}
                        </span>
                      </div>
                      <p className="text-xs text-ink-500 font-medium mt-4 leading-relaxed">
                        Your total across the five questions. Higher means more of
                        these turned up for you over the last two weeks.
                      </p>
                    </div>

                    <div className="bg-plum/5 rounded-2xl p-8 border border-plum/10 flex flex-col justify-center">
                      <h4 className="text-xs font-black text-plum/70 uppercase tracking-widest mb-3">
                        What this suggests
                      </h4>
                      <span className="text-2xl font-black text-plum leading-tight">
                        {displayClassification(
                          resultsData.latestResult.quizTitle,
                          resultsData.latestResult.classification,
                          latestScore
                        )}
                      </span>
                      <div className="mt-6 w-full bg-plum-200/50 h-3 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${pct * 100}%`,
                          }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="bg-plum h-full rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown Insights
                  ----------------------------------------------------------
                  This used to be three bars - "Sleep Quality", "Social
                  Connections" and "Study Focus" - presented to the student as
                  measurements. None of them was measured. Sleep and Study were
                  thresholds on the single total score (`pct > 0.33`, `> 0.44`)
                  with hardcoded bar widths, and Social Connections was a flat
                  "Stable / 78%" with no input at all. The instrument asks five
                  questions about interest, mood, sleep, energy and appetite; it
                  does not measure social connection or study focus, and it
                  cannot separate one dimension from the total.
                  The real per-question breakdown lives in the report modal,
                  which renders it only when the stored row actually has one. */}
              <div className="bg-card rounded-3xl p-8 shadow-sm border border-ink-200/60">
                <h3 className="text-xl font-black text-ink-900 mb-2">Detailed Insights</h3>
                <p className="text-sm text-ink-500 font-medium leading-relaxed">
                  Open any result below to see your answer to each question and what
                  the total suggests. This check-in reports one overall score - it
                  doesn't break your weeks down into separate areas.
                </p>
              </div>
            </>
          )}

          {/* Quiz Results History List */}
          <div className="bg-card rounded-3xl p-8 shadow-sm border border-ink-200/60">
            <h3 className="text-xl font-black text-ink-900 mb-6">Assessment History</h3>

            {!resultsData || !resultsData.timeline || resultsData.timeline.length === 0 ? (
              <EmptyState
                size="sm"
                title="Nothing here yet"
                description="Completed check-ins and Discover quizzes will show up here."
              />
            ) : (
              (() => {
                const itemsPerPage = 5;
                const reversedTimeline = [...resultsData.timeline].reverse();
                const totalPages = Math.ceil(reversedTimeline.length / itemsPerPage);
                const validPage = Math.min(Math.max(1, historyPage), totalPages || 1);
                const paginatedTimeline = reversedTimeline.slice(
                  (validPage - 1) * itemsPerPage,
                  validPage * itemsPerPage
                );

                return (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      {paginatedTimeline.map((report) => {
                        const dateStr = new Date(report.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                        return (
                          <button
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className="w-full flex items-center justify-between text-left p-5 bg-paper-2 hover:bg-ink-100/70 border border-ink-100 hover:border-plum/20 rounded-2xl transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-plum-500/12 focus-visible:border-plum-400"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-plum/10 text-plum rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                <ClipboardList className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-ink-800 leading-snug group-hover:text-plum transition-colors">
                                  {displayQuizTitle(report.quizTitle)}
                                </h4>
                                <p className="text-xs text-ink-400 font-medium mt-1">
                                  Completed on {dateStr} ·{" "}
                                  <span className="font-semibold text-ink-500">
                                    {displayClassification(
                                      report.quizTitle,
                                      report.classification,
                                      report.score
                                    )}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <span className="text-lg font-black text-ink-800">
                                  {report.score}
                                </span>
                                <span className="text-xs text-ink-400 font-bold">
                                  /{report.maxScore}
                                </span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-ink-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-ink-100 pt-6 mt-6">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={validPage === 1}
                          onClick={() => setHistoryPage(validPage - 1)}
                        >
                          Previous
                        </Button>
                        <span className="text-xs font-bold text-ink-500">
                          Page {validPage} of {totalPages}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={validPage === totalPages}
                          onClick={() => setHistoryPage(validPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* Recommended Actions Sidebar - Explore Discover */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-plum to-plum-400 rounded-3xl p-8 shadow-md text-plum-50 relative overflow-hidden border border-plum-50/10">
            {/* Ambient glow */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-plum-50/10 blur-xl pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold-300" /> Discover More
              </h3>
              <p className="text-plum-50/90 text-sm font-medium mb-6 leading-relaxed">
                Deepen your insights! Explore interactive tests on signature strengths, core values,
                and cognitive wellness.
              </p>
              <Button
                variant="secondary"
                fullWidth
                trailingIcon={<ChevronRight className="h-4 w-4" />}
                onClick={onExploreDiscover}
              >
                Explore Discover
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

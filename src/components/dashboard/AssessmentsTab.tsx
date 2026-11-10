import { motion } from "framer-motion";
import {
  ClipboardList,
  Activity,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  displayQuizTitle,
  displayClassification,
  hasRealScore,
} from "../../lib/wellbeing";
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

  // The five unscored Discover quizzes submit a placeholder overallScore of 100
  // against a denominator taken from their Quiz row, so this card rendered a
  // Strength & shadow run as "100 / 40" - a score above its own maximum, with the
  // bar below animating to 250% of its track. See hasRealScore in lib/wellbeing.ts.
  const showLatestScore = hasRealScore(
    latestResult?.quizTitle,
    latestScore,
    latestMaxScore
  );

  const pct = showLatestScore ? latestScore / latestMaxScore : 0;


  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">My results</h1>
          <p className="mt-1 text-sm text-ink-500">Your recent check-ins and quizzes.</p>
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
              {/* Latest result: one calm card. What it suggests comes first in
                  words, the number second; no "Evaluated" chip or watermark.
                  Solid tints (not /opacity colours) so it renders on older
                  Android WebViews too. */}
              <div className="rounded-3xl border border-ink-200/70 bg-card p-5 shadow-sm sm:p-7">
                <p className="text-xs font-medium text-ink-500">
                  Latest · {displayQuizTitle(resultsData.latestResult.quizTitle)} ·{" "}
                  {new Date(resultsData.latestResult.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-2 font-display text-2xl font-semibold leading-tight text-plum-700 sm:text-3xl">
                  {displayClassification(
                    resultsData.latestResult.quizTitle,
                    resultsData.latestResult.classification,
                    latestScore
                  )}
                </p>
                {showLatestScore && (
                  <div className="mt-5">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-ink-600">Score</span>
                      <span className="font-semibold text-ink-900">
                        {latestScore}
                        <span className="font-normal text-ink-400"> / {latestMaxScore}</span>
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-plum-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="h-full rounded-full bg-plum-500"
                      />
                    </div>
                  </div>
                )}
                <p className="mt-4 text-xs leading-relaxed text-ink-500">
                  A reflection, not a diagnosis. Tap any result below to see your answers.
                </p>
              </div>
            </>
          )}

          {/* Quiz Results History List */}
          <div className="rounded-3xl border border-ink-200/70 bg-card p-5 shadow-sm sm:p-7">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">History</h2>

            {!resultsData || !resultsData.timeline || resultsData.timeline.length === 0 ? (
              <EmptyState
                size="sm"
                title="Nothing here yet"
                // This list renders resultsData.timeline, the server's history.
                // Signed-in Discover quizzes are posted to the same endpoint
                // (useDashboard submitDiscoverToBackend) and appear here too, so
                // the old pointer to a browser-only "My collection" was wrong.
                description="Your completed check-ins and Discover quizzes will show up here."
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
                        // Same reason as the card above: the unscored quizzes in
                        // this history print a placeholder over a denominator
                        // that was never theirs.
                        const showScore = hasRealScore(
                          report.quizTitle,
                          report.score,
                          report.maxScore
                        );
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
                              {showScore && (
                                <div className="text-right">
                                  <span className="text-lg font-black text-ink-800">
                                    {report.score}
                                  </span>
                                  <span className="text-xs text-ink-400 font-bold">
                                    /{report.maxScore}
                                  </span>
                                </div>
                              )}
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

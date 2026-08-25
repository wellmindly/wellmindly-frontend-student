import { useState } from "react";
import { motion } from "framer-motion";
import { Card, Badge } from "../../ui";
import { MoodFace } from "../../ui/MoodFace";
import { MOODS, moodByRating, type MoodRating } from "../../../lib/mood";
import { formatFullDate, formatRelative } from "../../../lib/format";
import { spring } from "../../../lib/motion";
import { cn } from "../../../lib/cn";
import type { DailyCheckinRow, LatestResult } from "../../../types/student";

export interface TodayCardProps {
  greeting: string;
  firstName: string;
  dailyMood: number | null;
  historicalCheckins: DailyCheckinRow[];
  latestResult: LatestResult | null;
  onDailyCheckin: (rating: number) => void;
}

export function TodayCard({
  greeting,
  firstName,
  dailyMood,
  historicalCheckins,
  latestResult,
  onDailyCheckin,
}: TodayCardProps) {
  const [editing, setEditing] = useState(false);

  const todayStr = new Date().toDateString();
  const lastCheckin = historicalCheckins.find(
    (c) => new Date(c.createdAt).toDateString() !== todayStr
  );

  const isCheckedIn = dailyMood !== null && !editing;
  const currentMood = dailyMood ? moodByRating(dailyMood) : null;

  return (
    <section aria-labelledby="today-heading">
      <div className="mb-4">
        <h1
          id="today-heading"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900"
        >
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">
          {formatFullDate(new Date())}
        </p>
      </div>

      <Card padding="lg">
        {isCheckedIn && currentMood ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xs font-bold uppercase tracking-widest text-ink-500">
                Today · Checked in
              </span>
            </div>

            <div className="flex items-start gap-4">
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  currentMood.soft,
                  currentMood.text
                )}
              >
                <MoodFace rating={dailyMood as MoodRating} className="h-7 w-7" />
              </span>

              <div className="space-y-1">
                <h2 className="text-lg font-bold text-ink-900">
                  {currentMood.affirmation.title}
                </h2>
                <p className="text-sm text-ink-600 leading-relaxed">
                  {currentMood.affirmation.message}
                </p>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="mt-2 text-xs font-semibold text-plum hover:text-plum-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum cursor-pointer"
                >
                  Change today's mood
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <span className="text-2xs font-bold uppercase tracking-widest text-ink-500">
                Today
              </span>
              <h2 className="text-base font-bold text-ink-900 mt-0.5">
                How are you feeling?
              </h2>
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1 pb-2 sm:gap-2.5">
              {MOODS.map((mood) => (
                <motion.button
                  key={mood.rating}
                  type="button"
                  onClick={() => {
                    onDailyCheckin(mood.rating);
                    setEditing(false);
                  }}
                  aria-label={`${mood.label} - ${mood.summary.toLowerCase()}`}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.94 }}
                  transition={spring.snappy}
                  className={cn(
                    "flex min-h-[5.25rem] cursor-pointer flex-col items-center justify-center gap-1.5",
                    "rounded-2xl border bg-card px-0.5 py-2.5 transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum",
                    mood.border,
                    "hover:border-plum-300"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      mood.soft,
                      mood.text
                    )}
                  >
                    <MoodFace rating={mood.rating} className="h-7 w-7" />
                  </span>
                  <span className="text-2xs font-bold tracking-wide text-ink-600">
                    {mood.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Summary Rows */}
        <div className="mt-6 pt-4 border-t border-ink-200/60 space-y-2.5">
          {lastCheckin && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500 font-medium">Last check-in</span>
              <span className="font-semibold text-ink-700">
                {formatRelative(lastCheckin.createdAt)} · {moodByRating(lastCheckin.rating).label}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            {latestResult ? (
              <>
                <span className="text-ink-500 font-medium">
                  {latestResult.quizTitle}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-700">
                    {latestResult.score}/{latestResult.maxScore}
                  </span>
                  <Badge tone="primary">{latestResult.classification}</Badge>
                </div>
              </>
            ) : (
              <span className="text-ink-500 font-medium">
                No wellbeing snapshot yet.
              </span>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
}

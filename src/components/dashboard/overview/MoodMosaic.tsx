import { useState } from "react";
import { motion } from "framer-motion";
import { Smile } from "lucide-react";
import { MOODS, moodByRating } from "../../../lib/mood";
import { formatFullDate, dayKey } from "../../../lib/format";
import { cn } from "../../../lib/cn";
import { EmptyState } from "../../ui";
import type { DailyCheckinRow } from "../../../types/student";

export interface MoodMosaicProps {
  historicalCheckins: DailyCheckinRow[];
  /** Opens the shared check-in sheet. The mosaic never writes a rating itself. */
  onRequestCheckin: () => void;
}

export function MoodMosaic({
  historicalCheckins,
  onRequestCheckin,
}: MoodMosaicProps) {
  const [selectedTile, setSelectedTile] = useState<{
    date: Date;
    checkin: DailyCheckinRow;
  } | null>(null);

  // Last row wins: the per-day upsert landed after some duplicate days existed,
  // and the most recent rating for a day is the one the student meant.
  const byDay = new Map<string, DailyCheckinRow>();
  for (const c of historicalCheckins) byDay.set(dayKey(c.createdAt), c);

  const tiles: Date[] = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    tiles.push(d);
  }

  const todayKeyStr = dayKey(today);
  const todayCheckin = byDay.get(todayKeyStr);
  const activeSelection =
    selectedTile ||
    (todayCheckin
      ? { date: new Date(todayCheckin.createdAt), checkin: todayCheckin }
      : null);

  const isEmpty = historicalCheckins.length === 0;

  return (
    <section aria-labelledby="mood-mosaic-heading">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-[2rem] p-6 sm:p-8 shadow-sm border border-ink-200/60 motion-reduce:transition-none"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2
              id="mood-mosaic-heading"
              className="text-2xl font-black text-ink-900 font-serif"
            >
              Your Mood Mosaic
            </h2>
            <p className="text-ink-500 font-medium text-sm mt-1">
              A visual board of your daily check-in history. Click a tile to view details.
            </p>
          </div>

          {/* Simple legend */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-xs font-bold text-ink-400 mr-1">Legend:</span>
            {MOODS.map((mood) => (
              <span
                key={mood.rating}
                className={cn(
                  "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border",
                  mood.soft,
                  mood.border,
                  mood.text
                )}
              >
                <span className={cn("w-2.5 h-2.5 rounded-full", mood.dot)} />
                <span>{mood.label}</span>
              </span>
            ))}
          </div>
        </div>

        {isEmpty ? (
          <EmptyState
            size="sm"
            icon={<Smile className="h-6 w-6" aria-hidden="true" />}
            title="Your mosaic starts with one tap"
            description="Check in above and this fills in a square a day. Four weeks of squares is usually enough to see a pattern you can't feel day to day."
            action={{ label: "Check in for today", onClick: onRequestCheckin }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center font-sans">
            {/* Left: The Grid */}
            <div className="md:col-span-6 lg:col-span-5 flex flex-col items-center md:items-start">
              {/* WCAG 2.5.8 target exemption: 28-tile month grid sized >=32px, backed by primary picker above and keyboard focus */}
              <ul
                role="list"
                className="grid grid-cols-7 gap-1 sm:gap-2 p-2 sm:p-4 bg-ink-50/80 rounded-[2rem] border border-ink-100 max-w-sm w-full"
              >
                {tiles.map((d) => {
                  const currentDayKey = dayKey(d);
                  const checkin = byDay.get(currentDayKey);
                  const isToday = currentDayKey === todayKeyStr;
                  const isSelected =
                    activeSelection && dayKey(activeSelection.date) === currentDayKey;

                  let style: React.CSSProperties = {};
                  let className =
                    "w-full aspect-square rounded-xl transition-all duration-200 relative flex items-center justify-center border-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 motion-reduce:transition-none ";

                  let ariaLabel = "";

                  if (checkin) {
                    const mood = moodByRating(checkin.rating);
                    ariaLabel = `${formatFullDate(d)} — ${mood.label}, ${mood.summary.toLowerCase()}`;
                    style = {
                      backgroundColor: mood.color,
                      boxShadow:
                        "inset 0 2px 4px rgba(0,0,0,0.06), inset 0 -2.5px 0 rgba(0,0,0,0.15)",
                    };
                    className += isSelected
                      ? "ring-4 ring-offset-2 ring-plum/50 shadow-md scale-105 cursor-pointer"
                      : "shadow-sm hover:shadow-md hover:scale-115 active:scale-95 cursor-pointer";
                  } else if (isToday) {
                    ariaLabel = `Today, ${formatFullDate(d)} — no check-in yet. Add one.`;
                    className +=
                      "border-2 border-dashed border-plum-400 bg-card hover:bg-plum-50 cursor-pointer shadow-sm";
                  } else {
                    ariaLabel = `${formatFullDate(d)} — no check-in`;
                    className += "bg-ink-200/60 opacity-60 cursor-default";
                  }

                  return (
                    <li key={currentDayKey} className="flex items-center justify-center w-full">
                      <button
                        type="button"
                        onClick={() =>
                          checkin
                            ? setSelectedTile({ date: d, checkin })
                            : isToday
                            ? onRequestCheckin()
                            : undefined
                        }
                        onFocus={() => checkin && setSelectedTile({ date: d, checkin })}
                        disabled={!checkin && !isToday}
                        aria-label={ariaLabel}
                        className={className}
                        style={style}
                      >
                        {isToday && !checkin && (
                          <span
                            className="text-2xs font-black text-plum font-sans"
                            aria-hidden="true"
                          >
                            +
                          </span>
                        )}
                        {checkin && (
                          <span
                            className="text-2xs select-none opacity-90"
                            aria-hidden="true"
                          >
                            {moodByRating(checkin.rating).affirmation.emoji}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="flex justify-between w-full max-w-sm mt-2.5 px-2 text-2xs font-bold text-ink-400 uppercase tracking-widest">
                <span>28 days ago</span>
                <span>Today</span>
              </div>
            </div>

            {/* Right: The Info Panel */}
            <div className="md:col-span-6 lg:col-span-7 bg-ink-50 rounded-3xl p-6 border border-ink-100 flex flex-col justify-center min-h-[160px]">
              {activeSelection ? (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-ink-400 uppercase tracking-wider">
                      {formatFullDate(activeSelection.date)}
                    </span>
                    <span className="text-2xl" aria-hidden="true">
                      {moodByRating(activeSelection.checkin.rating).affirmation.emoji}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-ink-900">
                      {moodByRating(activeSelection.checkin.rating).affirmation.title}
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-card text-ink-500 border border-line">
                      Rating {activeSelection.checkin.rating}/5
                    </span>
                  </div>
                  <p className="text-sm text-ink-500 font-medium leading-relaxed">
                    {moodByRating(activeSelection.checkin.rating).affirmation.message}
                  </p>
                </motion.div>
              ) : (
                <div className="text-center text-ink-400 py-6">
                  <Smile className="h-10 w-10 mx-auto text-ink-300 mb-2" aria-hidden="true" />
                  <p className="text-sm font-bold">
                    Select a tile from your mood board to view details.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}

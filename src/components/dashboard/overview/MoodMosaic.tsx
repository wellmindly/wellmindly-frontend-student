import React, { useState } from "react";
import { motion } from "framer-motion";
import { Smile } from "lucide-react";
import { MOODS, moodByRating } from "../../../lib/mood";
import { cn } from "../../../lib/cn";
import type { DailyCheckinRow } from "../../../types/student";

export interface MoodMosaicProps {
  historicalCheckins: DailyCheckinRow[];
  onDailyCheckin: (rating: number) => void;
}

export function MoodMosaic({ historicalCheckins, onDailyCheckin }: MoodMosaicProps) {
  const [selectedTile, setSelectedTile] = useState<{ date: Date; checkin: DailyCheckinRow } | null>(null);
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);

  const tiles: Date[] = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    tiles.push(d);
  }

  const todayStr = new Date().toDateString();
  const todayCheckin = historicalCheckins.find((c) => new Date(c.createdAt).toDateString() === todayStr);
  const activeSelection = selectedTile || (todayCheckin ? { date: new Date(todayCheckin.createdAt), checkin: todayCheckin } : null);

  return (
    <section aria-labelledby="mood-mosaic-heading">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-[2rem] p-8 shadow-sm border border-ink-200/60"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 id="mood-mosaic-heading" className="text-2xl font-black text-ink-900 font-serif">
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center font-sans">
          {/* Left: The Grid */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col items-center md:items-start">
            <div className="grid grid-cols-7 gap-3.5 p-5 bg-ink-50/80 rounded-[2rem] border border-ink-100 max-w-sm w-full relative overflow-visible">
              {tiles.map((d, index) => {
                const checkin = historicalCheckins.find((c) => new Date(c.createdAt).toDateString() === d.toDateString());
                const isToday = d.toDateString() === new Date().toDateString();
                const isSelected = activeSelection && activeSelection.date.toDateString() === d.toDateString();

                let style: React.CSSProperties = {};
                let className =
                  "aspect-square rounded-xl transition-all duration-300 hover:scale-115 active:scale-95 cursor-pointer relative flex items-center justify-center border-none overflow-visible ";

                if (checkin) {
                  style = {
                    backgroundColor: moodByRating(checkin.rating).color,
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06), inset 0 -2.5px 0 rgba(0,0,0,0.15)",
                  };
                  className += isSelected
                    ? "ring-4 ring-offset-2 ring-plum/50 shadow-md scale-105 z-10"
                    : "shadow-sm hover:shadow-md hover:z-10";
                } else if (isToday) {
                  className +=
                    "border-2 border-dashed border-plum/80 hover:bg-plum/5 bg-card shadow-sm animate-pulse ring-2 ring-plum/20 ring-offset-2";
                } else {
                  className += "bg-ink-200/60 opacity-60 hover:bg-ink-300/80";
                }

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (checkin) {
                        setSelectedTile({ date: d, checkin });
                      } else if (isToday) {
                        onDailyCheckin(3); // default steady checkin
                      }
                    }}
                    onMouseEnter={() => setHoveredTile(index)}
                    onMouseLeave={() => setHoveredTile(null)}
                    className={className}
                    style={style}
                  >
                    {isToday && !checkin && <span className="text-2xs font-black text-plum font-sans">+</span>}
                    {checkin && <span className="text-2xs select-none opacity-90">{moodByRating(checkin.rating).affirmation.emoji}</span>}

                    {/* Custom hover tooltip */}
                    {hoveredTile === index && checkin && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-30 bg-ink-900/95 text-ink-50 text-xs rounded-xl p-3 shadow-xl w-48 text-left pointer-events-none border border-ink-700/40 transition-all font-sans leading-relaxed overflow-visible">
                        <p className="font-extrabold text-2xs text-ink-400 uppercase tracking-widest">
                          {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                        <p className="font-black mt-1 flex items-center gap-1.5 text-xs text-ink-50">
                          <span>{moodByRating(checkin.rating).affirmation.emoji}</span>
                          <span>{moodByRating(checkin.rating).affirmation.title}</span>
                        </p>
                        <p className="text-2xs text-ink-300 font-bold mt-1">Rating: {checkin.rating}/5</p>
                        {/* Tiny triangle arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-ink-900/95" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between w-full max-w-sm mt-2.5 px-2 text-2xs font-bold text-ink-400 uppercase tracking-widest">
              <span>28 days ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Right: The Info Panel */}
          <div className="md:col-span-6 lg:col-span-7 bg-ink-50 rounded-3xl p-6 border border-ink-100 flex flex-col justify-center min-h-[160px]">
            {activeSelection ? (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-ink-400 uppercase tracking-wider">
                    {activeSelection.date.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-2xl">{moodByRating(activeSelection.checkin.rating).affirmation.emoji}</span>
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-ink-900">{moodByRating(activeSelection.checkin.rating).affirmation.title}</h3>
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
                <Smile className="h-10 w-10 mx-auto text-ink-300 mb-2" />
                <p className="text-sm font-bold">Select a tile from your mood board to view details.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

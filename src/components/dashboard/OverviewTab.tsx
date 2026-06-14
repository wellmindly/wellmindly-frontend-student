import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Smile,
  Activity,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import { WellbeingChart } from "./WellbeingChart";

interface OverviewTabProps {
  greeting: string;
  firstName: string;
  dailyMood: number | null;
  historicalCheckins?: any[];
  resultsData: any;
  onDailyCheckin: (rating: number) => void;
  onExploreDiscover: () => void;
  onViewAssessments: () => void;
  onStartScreening: () => void;
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
}: OverviewTabProps) {
  const [selectedTile, setSelectedTile] = useState<any>(null);
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);

  const moodConfig: Record<number, { color: string; emoji: string; text: string; msg: string }> = {
    1: {
      color: "var(--rose)",
      emoji: "💜",
      text: "Gentle Reminder",
      msg: "It's okay to have tough days. Remember to take gentle breaths and reach out to campus resources or someone you trust.",
    },
    2: {
      color: "var(--sage-brand)",
      emoji: "🌿",
      text: "Self-Care Moment",
      msg: "Be gentle with yourself today. Taking a short break, walking in nature, or listening to a favorite song might help ease things.",
    },
    3: {
      color: "var(--sky)",
      emoji: "🌱",
      text: "Steady & Balanced",
      msg: "A steady, balanced day. Keep taking it one step at a time!",
    },
    4: {
      color: "var(--gold)",
      emoji: "☀️",
      text: "Bright Energy",
      msg: "Keep riding this positive wave. Try sharing some of your good energy with a friend or colleague today.",
    },
    5: {
      color: "var(--coral)",
      emoji: "🎉",
      text: "Thriving & Strong",
      msg: "Your light is shining bright today. Celebrate this moment and keep doing what makes you thrive!",
    },
  };

  const tiles: Date[] = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    tiles.push(d);
  }

  const todayStr = new Date().toDateString();
  const todayCheckin = (historicalCheckins || []).find(
    (c: any) => new Date(c.createdAt).toDateString() === todayStr
  );
  
  const activeSelection = selectedTile || (todayCheckin ? { date: new Date(todayCheckin.createdAt), checkin: todayCheckin } : null);

  return (
    <div className="space-y-8">
      {/* Vibrant Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-plum via-[#8E74A5] to-[#AD95C4] p-8 sm:p-12 shadow-xl shadow-plum-900/10 text-white"
      >
        {/* Floating background elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-20 h-40 w-40 rounded-full bg-plum/20 blur-2xl pointer-events-none"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
              {greeting},<br /> {firstName}!
            </h1>
            <p className="text-white/95 text-base sm:text-lg leading-relaxed font-medium">
              Taking time for your mental well-being is the first step towards academic and personal
              balance. Explore your insights and self-reflection results to track your wellness
              journey.
            </p>
            <button
              onClick={onExploreDiscover}
              className="mt-8 bg-white text-plum px-8 py-4 rounded-full font-bold text-sm hover:bg-slate-50 transition-colors shadow-lg flex items-center gap-2 group cursor-pointer border-none"
            >
              Explore Discover
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Interactive Daily Mood Tracker */}
          <div className="shrink-0 bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 w-full lg:w-80 shadow-2xl">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-12 w-12 bg-white/25 rounded-2xl flex items-center justify-center">
                <Smile className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-white/80 uppercase tracking-widest mb-1">
                  Daily Check-in
                </p>
                <p className="text-base font-bold text-white">How are you feeling?</p>
              </div>
            </div>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onDailyCheckin(rating)}
                  className={`h-11 w-11 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-300 border-none cursor-pointer ${
                    dailyMood === rating
                      ? "bg-white text-plum scale-110 shadow-lg"
                      : "bg-white/10 text-white hover:bg-white/30"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            {dailyMood !== null && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-xs font-semibold text-white/90 text-center"
              >
                Thank you for checking in. Your mood has been recorded.
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Executive Summaries Row */}
      <div className="w-full">
        {/* Latest Assessment Score */}
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 20px 30px -10px rgba(0,0,0,0.03)" }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 flex flex-col sm:flex-row items-center justify-between relative overflow-hidden transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-plum/10 text-plum rounded-2xl flex items-center justify-center shrink-0">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                {resultsData?.latestResult?.quizTitle || "Latest Assessment"}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 tracking-tight">
                  {resultsData?.latestResult ? resultsData.latestResult.score : "No score"}
                </span>
                {resultsData?.latestResult && (
                  <span className="text-sm font-bold text-slate-400">
                    / {resultsData.latestResult.maxScore ?? (resultsData.latestResult.quizTitle.includes("PHQ-9") ? 15 : 27)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {resultsData?.latestResult ? (
            <span className="mt-4 sm:mt-0 flex items-center gap-1.5 text-xs font-bold text-plum bg-plum/5 border border-plum/10 px-3.5 py-2 rounded-xl relative z-10">
              <Activity className="h-4 w-4" /> Status: {resultsData.latestResult.classification}
            </span>
          ) : (
            <span className="mt-4 sm:mt-0 flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200/60 px-3.5 py-2 rounded-xl relative z-10">
              No screening taken yet
            </span>
          )}
        </motion.div>
      </div>

      {/* Historical Scores Line Chart */}
      <WellbeingChart timeline={resultsData?.timeline} onViewDetails={onViewAssessments} />

      {/* Mood Board Widget */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-serif">Your Mood Mosaic</h3>
            <p className="text-slate-500 font-medium text-sm mt-1">
              A visual board of your daily check-in history. Click a tile to view details.
            </p>
          </div>
          
          {/* Simple legend */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-xs font-bold text-slate-400 mr-1">Legend:</span>
            {[1, 2, 3, 4, 5].map(rating => {
              const config = moodConfig[rating];
              return (
                <span key={rating} className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border border-line" style={{ backgroundColor: `${config.color}15` }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                  <span>{config.emoji}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center font-sans">
          {/* Left: The Grid */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col items-center md:items-start">
            <div className="grid grid-cols-7 gap-3.5 p-5 bg-slate-50/80 rounded-[2rem] border border-slate-100 max-w-sm w-full relative overflow-visible">
              {tiles.map((d, index) => {
                const checkin = (historicalCheckins || []).find((c: any) => {
                  const cDate = new Date(c.createdAt);
                  return cDate.toDateString() === d.toDateString();
                });
                const isToday = d.toDateString() === new Date().toDateString();
                const isSelected = activeSelection && activeSelection.date.toDateString() === d.toDateString();
                
                let style: React.CSSProperties = {};
                let className = "aspect-square rounded-xl transition-all duration-300 hover:scale-115 active:scale-95 cursor-pointer relative flex items-center justify-center border-none overflow-visible ";
                
                if (checkin) {
                  style = { 
                    backgroundColor: moodConfig[checkin.rating].color,
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06), inset 0 -2.5px 0 rgba(0,0,0,0.15)"
                  };
                  className += isSelected ? "ring-4 ring-offset-2 ring-plum/50 shadow-md scale-105 z-10" : "shadow-sm hover:shadow-md hover:z-10";
                } else if (isToday) {
                  className += "border-2 border-dashed border-plum/80 hover:bg-plum/5 bg-white shadow-sm animate-pulse ring-2 ring-plum/20 ring-offset-2";
                } else {
                  className += "bg-slate-200/60 opacity-60 hover:bg-slate-300/80";
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
                    {isToday && !checkin && (
                      <span className="text-[10px] font-black text-plum font-sans">+</span>
                    )}
                    {checkin && (
                      <span className="text-[10px] select-none opacity-90">{moodConfig[checkin.rating].emoji}</span>
                    )}

                    {/* Custom hover tooltip */}
                    {hoveredTile === index && checkin && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-30 bg-slate-900/95 text-white text-xs rounded-xl p-3 shadow-xl w-48 text-left pointer-events-none border border-white/10 transition-all font-sans leading-relaxed overflow-visible">
                        <p className="font-extrabold text-[9px] text-slate-400 uppercase tracking-widest">
                          {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="font-black mt-1 flex items-center gap-1.5 text-xs text-white">
                          <span>{moodConfig[checkin.rating].emoji}</span>
                          <span>{moodConfig[checkin.rating].text}</span>
                        </p>
                        <p className="text-[9px] text-slate-300 font-bold mt-1">
                          Rating: {checkin.rating}/5
                        </p>
                        {/* Tiny triangle arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900/95" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-between w-full max-w-sm mt-2.5 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>28 days ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Right: The Info Panel */}
          <div className="md:col-span-6 lg:col-span-7 bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-center min-h-[160px]">
            {activeSelection ? (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {activeSelection.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-2xl">{moodConfig[activeSelection.checkin.rating].emoji}</span>
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-black text-slate-900">
                    {moodConfig[activeSelection.checkin.rating].text}
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-white text-slate-500 border border-line">
                    Rating {activeSelection.checkin.rating}/5
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {moodConfig[activeSelection.checkin.rating].msg}
                </p>
              </motion.div>
            ) : (
              <div className="text-center text-slate-400 py-6">
                <Smile className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold">Select a tile from your mood board to view details.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Feature 1: Emotional Check-in Link */}
      <div className="w-full">
        <motion.div
          whileHover={{ y: -6, boxShadow: "0 25px 45px -15px rgba(122,91,147,0.08)" }}
          className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-6 group cursor-pointer transition-all duration-300"
          onClick={onStartScreening}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="h-16 w-16 bg-plum/10 text-plum rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <ClipboardList className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Emotional Check-in</h3>
              <p className="text-slate-500 font-medium leading-relaxed max-w-xl">
                A two-minute wellbeing snapshot. See how you're really doing — and watch it shift over the weeks.
              </p>
            </div>
          </div>
          <div className="shrink-0 bg-plum text-white font-extrabold text-sm px-8 py-4 rounded-full transition-all group-hover:bg-plum/95 flex items-center gap-2 shadow-lg shadow-plum/15">
            Start Check-in{" "}
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { ArrowRight, Smile } from "lucide-react";

export interface WelcomeBannerProps {
  greeting: string;
  firstName: string;
  dailyMood: number | null;
  onDailyCheckin: (rating: number) => void;
  onExploreDiscover: () => void;
}

export function WelcomeBanner({
  greeting,
  firstName,
  dailyMood,
  onDailyCheckin,
  onExploreDiscover,
}: WelcomeBannerProps) {
  return (
    <section aria-labelledby="welcome-banner-heading">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2rem] bg-plum-700 p-8 sm:p-12 shadow-xl shadow-plum-900/10 text-plum-50"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-xl">
            <h1
              id="welcome-banner-heading"
              className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-tight text-plum-50"
            >
              {greeting},<br /> {firstName}!
            </h1>
            <p className="text-plum-100 text-base sm:text-lg leading-relaxed font-medium">
              Taking time for your mental well-being is the first step towards academic and personal
              balance. Explore your insights and self-reflection results to track your wellness
              journey.
            </p>
            <button
              onClick={onExploreDiscover}
              className="mt-8 bg-plum-50 text-plum-800 px-8 py-4 rounded-full font-bold text-sm hover:bg-plum-100 transition-colors shadow-lg flex items-center gap-2 group cursor-pointer border-none"
            >
              Explore Discover
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Interactive Daily Mood Tracker */}
          <div className="shrink-0 bg-plum-800/60 backdrop-blur-xl rounded-3xl p-6 border border-plum-500/40 w-full lg:w-80 shadow-2xl">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-12 w-12 bg-plum-600 rounded-2xl flex items-center justify-center">
                <Smile className="h-6 w-6 text-gold-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-plum-200 uppercase tracking-widest mb-1">
                  Daily Check-in
                </p>
                <p className="text-base font-bold text-plum-50">How are you feeling?</p>
              </div>
            </div>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onDailyCheckin(rating)}
                  className={`h-11 w-11 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-300 border-none cursor-pointer ${
                    dailyMood === rating
                      ? "bg-plum-50 text-plum-800 scale-110 shadow-lg"
                      : "bg-plum-800/60 text-plum-50 hover:bg-plum-600"
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
                className="mt-4 text-xs font-semibold text-plum-100 text-center"
              >
                Thank you for checking in. Your mood has been recorded.
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

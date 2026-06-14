import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";

interface DailyCheckinPopupProps {
  show: boolean;
  onClose: () => void;
  onSelect: (rating: number) => void;
}

const EMOJIS = [
  {
    rating: 1,
    label: "Awful",
    color: "from-rose-400 to-red-500",
    bgHover: "hover:bg-rose-50",
    svg: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" />
        <path d="M8 15h8" strokeLinecap="round" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
        <circle cx="15" cy="9" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    rating: 2,
    label: "Down",
    color: "from-amber-400 to-orange-500",
    bgHover: "hover:bg-amber-50",
    svg: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 16a3 3 0 0 1 6 0" strokeLinecap="round" />
        <circle cx="9" cy="9.5" r="1" fill="currentColor" />
        <circle cx="15" cy="9.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    rating: 3,
    label: "Okay",
    color: "from-emerald-400 to-teal-500",
    bgHover: "hover:bg-emerald-50",
    svg: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="15" x2="16" y2="15" strokeLinecap="round" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
        <circle cx="15" cy="9" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    rating: 4,
    label: "Good",
    color: "from-blue-400 to-indigo-500",
    bgHover: "hover:bg-blue-50",
    svg: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
        <circle cx="15" cy="9" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    rating: 5,
    label: "Great",
    color: "from-plum to-[#8E74A5]",
    bgHover: "hover:bg-purple-50",
    svg: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 13s1.5 3.5 4 3.5 4-3.5 4-3.5" strokeLinecap="round" />
        <circle cx="9" cy="9" r="1.5" fill="currentColor" />
        <circle cx="15" cy="9" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

export function DailyCheckinPopup({ show, onClose, onSelect }: DailyCheckinPopupProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="w-full max-w-[460px] bg-white/95 rounded-[2rem] p-8 shadow-2xl relative border border-slate-100/80 backdrop-blur-md"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors border-none cursor-pointer outline-none z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="text-center space-y-6">
              <div className="h-12 w-12 bg-plum/10 text-plum rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Heart className="h-6 w-6 fill-current animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 font-serif leading-tight">
                  How are you feeling today?
                </h3>
                <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto">
                  Take a brief self-reflection moment to check in with your mind.
                </p>
              </div>

              {/* Emoji Selectors */}
              <div className="flex justify-between gap-2.5 pt-2">
                {EMOJIS.map((emoji) => (
                  <motion.button
                    key={emoji.rating}
                    onClick={() => {
                      onSelect(emoji.rating);
                      onClose();
                    }}
                    whileHover={{ scale: 1.15, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl border border-slate-100 hover:border-plum/20 transition-all cursor-pointer bg-slate-50/50 ${emoji.bgHover} group outline-none`}
                  >
                    <div className={`p-1.5 rounded-xl text-slate-400 group-hover:bg-gradient-to-br ${emoji.color} group-hover:text-white transition-all duration-300`}>
                      {emoji.svg}
                    </div>
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase group-hover:text-slate-700 transition-colors">
                      {emoji.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

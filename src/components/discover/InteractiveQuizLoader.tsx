import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Wind, Gamepad2, BrainCircuit } from "lucide-react";
import { cn } from "../../lib/cn";

interface BubbleItem {
  id: number;
  text: string;
  emoji: string;
  x: number; // percentage
  y: number; // percentage
  size: number;
  color: string;
}

const INITIAL_BUBBLES: Omit<BubbleItem, "id">[] = [
  { text: "Breathe", emoji: "🌿", x: 18, y: 25, size: 76, color: "from-teal-400/20 to-teal-500/30 border-teal-300/60 text-teal-800" },
  { text: "Calm", emoji: "✨", x: 68, y: 20, size: 70, color: "from-plum-400/20 to-plum-500/30 border-plum-300/60 text-plum-800" },
  { text: "Release", emoji: "🍃", x: 42, y: 55, size: 82, color: "from-sage-400/20 to-sage-500/30 border-sage-300/60 text-sage-800" },
  { text: "Clarity", emoji: "🌊", x: 12, y: 70, size: 74, color: "from-sky-400/20 to-sky-500/30 border-sky-300/60 text-sky-800" },
  { text: "Kindness", emoji: "💜", x: 74, y: 65, size: 80, color: "from-violet-400/20 to-violet-500/30 border-violet-300/60 text-violet-800" },
  { text: "Patience", emoji: "🌸", x: 82, y: 35, size: 68, color: "from-rose-400/20 to-rose-500/30 border-rose-300/60 text-rose-800" },
];

const ROTATING_AFFIRMATIONS = [
  "Taking intentional time for self-reflection is a sign of strength.",
  "Your feelings are valid, and today is just one chapter in your journey.",
  "AI is analyzing your patterns to produce safe, non-judgmental guidance.",
  "Clearer minds come from gentle awareness, not pressure.",
  "Almost there — polishing your personalized reflection breakdown...",
];

const STEPS = [
  "Analyzing response patterns...",
  "Mapping emotional wellness dimensions...",
  "Synthesizing personalized AI reflection...",
  "Formatting your private report...",
];

interface InteractiveQuizLoaderProps {
  quizTitle?: string;
  subtitle?: string;
}

export function InteractiveQuizLoader({
  quizTitle = "your assessment",
  subtitle = "Synthesizing your personalized reflection & insights...",
}: InteractiveQuizLoaderProps) {
  const [mode, setMode] = useState<"bubbles" | "breathing">("bubbles");
  const [poppedCount, setPoppedCount] = useState(0);
  const [bubbles, setBubbles] = useState<BubbleItem[]>(() =>
    INITIAL_BUBBLES.map((b, i) => ({ ...b, id: i + 1 }))
  );
  const [affirmationIdx, setAffirmationIdx] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");

  // Step progression animation
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);

    const affirmationInterval = setInterval(() => {
      setAffirmationIdx((prev) => (prev + 1) % ROTATING_AFFIRMATIONS.length);
    }, 3200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(affirmationInterval);
    };
  }, []);

  // 4-7-8 Breathing cycle simulation
  useEffect(() => {
    if (mode !== "breathing") return;

    let timer: ReturnType<typeof setTimeout>;
    const runCycle = () => {
      setBreathPhase("Inhale");
      timer = setTimeout(() => {
        setBreathPhase("Hold");
        timer = setTimeout(() => {
          setBreathPhase("Exhale");
          timer = setTimeout(() => {
            runCycle();
          }, 4000);
        }, 3500);
      }, 3500);
    };

    runCycle();
    return () => clearTimeout(timer);
  }, [mode]);

  const handlePopBubble = (id: number) => {
    setPoppedCount((c) => c + 1);
    setBubbles((prev) => prev.filter((b) => b.id !== id));

    // Respawn a new bubble with random positions after 1.2s
    setTimeout(() => {
      const randomWords = [
        { text: "Peace", emoji: "🕊️", color: "from-teal-400/20 to-teal-500/30 border-teal-300/60 text-teal-800" },
        { text: "Grounded", emoji: "🌱", color: "from-emerald-400/20 to-emerald-500/30 border-emerald-300/60 text-emerald-800" },
        { text: "Space", emoji: "🌌", color: "from-plum-400/20 to-plum-500/30 border-plum-300/60 text-plum-800" },
        { text: "Courage", emoji: "🦁", color: "from-coral-400/20 to-coral-500/30 border-coral-300/60 text-coral-800" },
        { text: "Balance", emoji: "⚖️", color: "from-violet-400/20 to-violet-500/30 border-violet-300/60 text-violet-800" },
        { text: "Rest", emoji: "🌙", color: "from-sky-400/20 to-sky-500/30 border-sky-300/60 text-sky-800" },
      ];
      const pick = randomWords[Math.floor(Math.random() * randomWords.length)];
      const newBubble: BubbleItem = {
        id: Date.now(),
        text: pick.text,
        emoji: pick.emoji,
        x: Math.floor(Math.random() * 70) + 10,
        y: Math.floor(Math.random() * 65) + 15,
        size: Math.floor(Math.random() * 20) + 68,
        color: pick.color,
      };
      setBubbles((curr) => [...curr, newBubble]);
    }, 1000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-6 rounded-3xl border border-ink-200/80 bg-card/90 backdrop-blur-md p-6 sm:p-8 shadow-xl overflow-hidden relative">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-12 -left-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-drift" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 w-64 h-64 bg-plum-500/10 rounded-full blur-3xl animate-drift" style={{ animationDelay: "-4s" }} />

      {/* Header Area */}
      <div className="text-center relative z-10 mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-plum-100/80 text-plum-800 border border-plum-200/70 text-xs font-bold shadow-2xs mb-3">
          <BrainCircuit className="w-4 h-4 animate-pulse text-plum-600" />
          <span>Generating AI Insights</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-ink-900 tracking-tight">
          Generating results for {quizTitle}
        </h2>
        <p className="text-xs sm:text-sm text-ink-500 font-medium mt-1">
          {subtitle}
        </p>

        {/* Live Step Progress Indicator */}
        <div className="mt-5 w-full bg-paper-2 rounded-2xl p-3 border border-ink-200/60">
          <div className="flex items-center justify-between text-2xs font-bold text-ink-600 mb-2">
            <span className="flex items-center gap-1.5 text-plum-700">
              <Sparkles className="w-3.5 h-3.5" />
              {STEPS[activeStep]}
            </span>
            <span>{Math.round(((activeStep + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-ink-200/50 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-500 via-plum-500 to-coral-500 rounded-full"
              initial={{ width: "15%" }}
              animate={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center gap-2 mb-4 relative z-10">
        <button
          type="button"
          onClick={() => setMode("bubbles")}
          className={cn(
            "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
            mode === "bubbles"
              ? "bg-plum-600 text-white shadow-sm"
              : "bg-paper-2 hover:bg-ink-100 text-ink-600 border border-ink-200/60"
          )}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Pop Mindful Bubbles</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("breathing")}
          className={cn(
            "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
            mode === "breathing"
              ? "bg-plum-600 text-white shadow-sm"
              : "bg-paper-2 hover:bg-ink-100 text-ink-600 border border-ink-200/60"
          )}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Paced Breathing Guide</span>
        </button>
      </div>

      {/* Interactive Activity Canvas */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-paper/60 border border-ink-200/60 overflow-hidden shadow-inner flex items-center justify-center">
        {mode === "bubbles" ? (
          <>
            {/* Pop Score Counter */}
            <div className="absolute top-3 left-4 z-20 flex items-center gap-1.5 text-xs font-bold text-plum-700 bg-card/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-ink-200/60 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>{poppedCount} mindful breaths popped!</span>
            </div>

            <div className="absolute top-3 right-4 z-20 text-2xs text-ink-400 font-semibold select-none">
              Tap bubbles to release
            </div>

            {/* Floating pop-able bubbles */}
            <div className="relative w-full h-full">
              <AnimatePresence>
                {bubbles.map((b) => (
                  <motion.button
                    key={b.id}
                    type="button"
                    onClick={() => handlePopBubble(b.id)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [1, 1.06, 0.96, 1],
                      opacity: 1,
                      y: [0, -8, 4, 0],
                    }}
                    exit={{
                      scale: 1.5,
                      opacity: 0,
                      filter: "blur(4px)",
                      transition: { duration: 0.25 },
                    }}
                    transition={{
                      y: { duration: 3.5 + (b.id % 3), repeat: Infinity, ease: "easeInOut" },
                      scale: { duration: 2.8 + (b.id % 2), repeat: Infinity, ease: "easeInOut" },
                    }}
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      width: `${b.size}px`,
                      height: `${b.size}px`,
                    }}
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-sm backdrop-blur-xs",
                      "flex flex-col items-center justify-center cursor-pointer select-none",
                      "hover:scale-110 active:scale-90 transition-transform bg-gradient-to-tr",
                      b.color
                    )}
                  >
                    <span className="text-base select-none">{b.emoji}</span>
                    <span className="text-2xs font-extrabold tracking-tight mt-0.5 leading-none">
                      {b.text}
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* Paced Breathing Guide */
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
              animate={{
                scale: breathPhase === "Inhale" ? 1.45 : breathPhase === "Hold" ? 1.45 : 0.85,
                backgroundColor:
                  breathPhase === "Inhale"
                    ? "rgba(45, 212, 191, 0.3)"
                    : breathPhase === "Hold"
                    ? "rgba(168, 85, 247, 0.35)"
                    : "rgba(251, 146, 60, 0.25)",
              }}
              transition={{ duration: 3.5, ease: "easeInOut" }}
              className="w-32 h-32 rounded-full border-2 border-plum-400/60 shadow-lg flex items-center justify-center flex-col text-center"
            >
              <Wind className="w-6 h-6 text-plum-700 animate-spin" style={{ animationDuration: "12s" }} />
              <span className="text-sm font-black text-ink-900 mt-1">{breathPhase}</span>
            </motion.div>
            <p className="text-xs font-bold text-ink-600">
              {breathPhase === "Inhale" && "Breathe in deeply through your nose..."}
              {breathPhase === "Hold" && "Hold and feel the stillness..."}
              {breathPhase === "Exhale" && "Slowly exhale out through your mouth..."}
            </p>
          </div>
        )}
      </div>

      {/* Rotating Uplifting Thought Footer */}
      <div className="mt-5 p-3.5 rounded-2xl bg-plum-50/70 border border-plum-200/60 flex items-start gap-2.5 text-left">
        <Heart className="w-4 h-4 text-plum-600 shrink-0 mt-0.5" />
        <AnimatePresence mode="wait">
          <motion.p
            key={affirmationIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="text-xs font-semibold text-plum-900 leading-relaxed"
          >
            {ROTATING_AFFIRMATIONS[affirmationIdx]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

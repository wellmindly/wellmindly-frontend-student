import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import api from "../../services/api";

interface FeedbackFormProps {
  resultId: string;
  onComplete: () => void;
}

const SMILEYS = [
  { rating: 1, char: "😠", label: "Not useful" },
  { rating: 2, char: "🙁", label: "Slightly useful" },
  { rating: 3, char: "😐", label: "Okay" },
  { rating: 4, char: "🙂", label: "Useful" },
  { rating: 5, char: "😀", label: "Very useful" },
];

export function FeedbackForm({ resultId, onComplete }: FeedbackFormProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === null) {
      setError("Please select a rating.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post(`/quizzes/${resultId}/feedback`, { rating, comments });
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err) {
      console.error("Failed to submit quiz feedback:", err);
      setError("Unable to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-50/80 border border-emerald-200/50 rounded-3xl p-6 text-center space-y-3 select-none backdrop-blur-sm shadow-sm"
      >
        <span className="text-3xl">🎉</span>
        <h4 className="text-base font-black text-emerald-950 font-serif">Thank you for your feedback!</h4>
        <p className="text-xs text-emerald-800/80 font-semibold leading-relaxed">
          Your response has been saved. We use student feedback to continuously improve our wellness algorithms.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 border border-white/20 rounded-[2rem] p-6 sm:p-8 shadow-sm backdrop-blur-md space-y-6 select-none font-sans"
    >
      <div className="space-y-1">
        <h4 className="text-base font-black text-slate-900 font-serif leading-tight">
          How insightful was this assessment?
        </h4>
        <p className="text-slate-500 font-medium text-xs">
          Help us improve WellMindly's wellness check-ins.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Smileys Selection Row */}
        <div className="flex justify-between gap-2.5">
          {SMILEYS.map((item) => (
            <button
              key={item.rating}
              type="button"
              onClick={() => {
                setRating(item.rating);
                setError(null);
              }}
              className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer outline-none bg-slate-50/40 hover:bg-slate-50 hover:scale-105 active:scale-95 ${
                rating === item.rating
                  ? "border-plum bg-plum/5 ring-2 ring-plum/10 text-plum shadow-sm"
                  : "border-slate-100 text-slate-400 hover:border-slate-200"
              }`}
            >
              <span className={`text-2xl transition-transform ${rating === item.rating ? "scale-110" : ""}`}>
                {item.char}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-wider ${rating === item.rating ? "text-plum" : "text-slate-400"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Optional comments text area */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
            Add your comments (optional)
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="What could be improved? Was the AI guidance helpful?"
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-plum/30 focus:border-plum/40 p-3.5 resize-none transition-all leading-relaxed"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-semibold text-center leading-relaxed">
            ⚠️ {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || rating === null}
          className="w-full bg-plum hover:bg-plum/90 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-xs py-3.5 px-6 rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 outline-none cursor-pointer border-none"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              Submitting feedback…
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              Submit Feedback
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenTool, MessageSquare, Mail, Check, Loader2, Calendar } from "lucide-react";
import api from "../../services/api";

interface ComingSoonModalProps {
  show: boolean;
  onClose: () => void;
  feature: "writemindly" | "talkmindly" | "sessionbooking" | null;
}

const FEATURE_DETAILS = {
  writemindly: {
    title: "WriteMindly",
    tagline: "Private. Instant. Always awake.",
    description: "Type whatever's on your mind: messy, half-formed, 2am, all of it. WriteMindly helps you slow down long enough to hear your own thoughts. Sometimes that's all you need. No advice unless you want it.",
    icon: PenTool,
    colorClass: "bg-teal/10 text-teal",
    bulletPoints: [
      "Say it to something that won't judge you",
      "100% private to your local device",
      "No advice, no clinical jargon, no pressure"
    ]
  },
  talkmindly: {
    title: "TalkMindly",
    tagline: "Anonymous. Moderated. Real people.",
    description: "Anonymous spaces where students talk about the things they usually keep to themselves. The pressure. The loneliness. The self-doubt. Sometimes hearing 'I've felt that too' changes everything. No names, no judgment.",
    icon: MessageSquare,
    colorClass: "bg-plum/10 text-plum",
    bulletPoints: [
      "Real conversations with students who get it",
      "Strictly moderated around the clock to keep it safe",
      "No profiles, no direct messages, leave anytime"
    ]
  },
  sessionbooking: {
    title: "1-on-1 Coaching",
    tagline: "Real people. Your terms. Around your schedule.",
    description: "When you'd rather talk it through, book a session with a wellbeing coach. Talk about stress, confidence, motivation, relationships, or sleep. Always anonymous, always on your terms.",
    icon: Calendar,
    colorClass: "bg-coral/10 text-coral",
    bulletPoints: [
      "Real human wellbeing coaches, not therapists",
      "4 free sessions funded by your university",
      "Choose your own coach and time slot"
    ]
  }
};

export function ComingSoonModal({ show, onClose, feature }: ComingSoonModalProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/auth/waitlist", {
        email: email.trim(),
        feature: feature || "unknown"
      });
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to join waitlist. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentFeature = feature ? FEATURE_DETAILS[feature] : null;

  return (
    <AnimatePresence>
      {show && currentFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white border border-slate-200/60 rounded-[2rem] max-w-md w-full p-8 shadow-2xl relative text-left"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                onClose();
                // Reset form state on close
                setSuccess(false);
                setError("");
              }}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors border-none cursor-pointer outline-none"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Feature Icon & Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${currentFeature.colorClass}`}>
                <currentFeature.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-black text-slate-900 leading-tight">
                  {currentFeature.title}
                </h3>
                <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  Coming Soon &bull; Version 2.0
                </div>
              </div>
            </div>

            {/* Subtitle / Tagline */}
            <div className="text-sm font-bold text-slate-800 mb-3 italic">
              {currentFeature.tagline}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
              {currentFeature.description}
            </p>

            {/* Bullet points */}
            <ul className="space-y-2.5 mb-8">
              {currentFeature.bulletPoints.map((pt) => (
                <li key={pt} className="flex items-start gap-2.5 text-xs font-bold text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            {/* Waitlist Subscription */}
            <div className="border-t border-slate-100 pt-6">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4.5 text-center flex flex-col items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <Check className="w-4.5 h-4.5" />
                    </div>
                    <h4 className="text-sm font-black text-emerald-950">You're on the list!</h4>
                    <p className="text-xs font-medium text-emerald-800/80 leading-normal">
                      We'll reach out to your student email address as soon as this space opens up.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubscribe}
                    className="space-y-3"
                  >
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Join the beta waitlist
                    </div>
                    
                    <div className="flex gap-2.5">
                      <div className="relative flex-1 group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white transition-all placeholder:text-slate-400"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-navy hover:bg-navy/90 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer border-none shrink-0 flex items-center justify-center min-w-[110px]"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Notify Me"
                        )}
                      </button>
                    </div>
                    {error && (
                      <div className="text-xs font-bold text-red-500 flex items-center gap-1">
                        &bull; {error}
                      </div>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

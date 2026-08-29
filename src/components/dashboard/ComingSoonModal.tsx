import { useState } from "react";
import { Mail, Check, NotebookPen } from "lucide-react";
import api, { apiErrorMessage } from "../../services/api";
import { Sheet, Input, Button } from "../ui";

interface ComingSoonModalProps {
  show: boolean;
  onClose: () => void;
  feature: "writemindly" | null;
}

const FEATURE_DETAILS = {
  writemindly: {
    title: "WriteMindly",
    tagline: "A blank page that answers back.",
    description: "Type whatever's on your mind: messy, half-formed, 2am, all of it. WriteMindly helps you slow down long enough to hear your own thoughts. Sometimes that's all you need.",
    icon: NotebookPen,
    colorClass: "bg-teal-100 text-teal-700",
    bulletPoints: [
      "Say it to something that won't judge you",
      "We don't store what you write, only the date and time to apply daily limits",
      "There's a cap on how many messages you get each day, and it resets tomorrow"
    ]
  }
};

export function ComingSoonModal({ show, onClose, feature }: ComingSoonModalProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    onClose();
    setSuccess(false);
    setError("");
    setEmail("");
  };

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
      setError(apiErrorMessage(err, "Failed to join waitlist. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const currentFeature = feature ? FEATURE_DETAILS[feature] : null;

  return (
    <Sheet
      open={show && !!currentFeature}
      onClose={handleClose}
      title={currentFeature?.title || "WriteMindly"}
      size="sm"
    >
      {currentFeature && (
        <div className="space-y-6 text-left">
          {/* Icon & Eyebrow */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${currentFeature.colorClass}`}>
              <currentFeature.icon className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-bold text-ink-500 uppercase tracking-wider">
                Not switched on yet
              </div>
              <div className="text-sm font-semibold text-ink-800">
                {currentFeature.tagline}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-ink-600 leading-relaxed font-normal">
            {currentFeature.description}
          </p>

          {/* Bullet points */}
          <ul className="space-y-2.5">
            {currentFeature.bulletPoints.map((pt) => (
              <li key={pt} className="flex items-start gap-2.5 text-xs text-ink-700">
                <Check className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>

          {/* Waitlist Subscription */}
          <div className="border-t border-ink-100 pt-5">
            {success ? (
              <div
                role="status"
                className="bg-sage-50 border border-sage-200/60 rounded-2xl p-4 text-center flex flex-col items-center gap-1.5"
              >
                <div className="w-8 h-8 rounded-full bg-sage-600 text-sage-50 flex items-center justify-center shadow-sm">
                  <Check className="w-4.5 h-4.5" aria-hidden="true" />
                </div>
                <h4 className="text-sm font-bold text-sage-900">You're on the list</h4>
                <p className="text-xs text-sage-700 leading-relaxed">
                  We've saved this address and we'll only use it to tell you when WriteMindly opens up.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="text-xs font-bold text-ink-500 uppercase tracking-wider">
                  Join the beta waitlist
                </div>

                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <div className="flex-1">
                    <Input
                      label="Email address"
                      type="email"
                      className="text-base"
                      icon={<Mail />}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={error || undefined}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    fullWidth
                    className="sm:w-auto self-end"
                  >
                    Notify Me
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Sheet>
  );
}

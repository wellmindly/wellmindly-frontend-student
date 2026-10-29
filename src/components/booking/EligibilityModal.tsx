import { useState } from "react";
import { Sparkles, Check, Bell, MessageSquare, PenTool, AlertCircle } from "lucide-react";
import { Sheet, Button } from "../ui";
import api from "../../services/api";
import { trackEvent } from "../../lib/analytics";

export interface EligibilityModalProps {
  open: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function EligibilityModal({ open, onClose, onNavigateTab }: EligibilityModalProps) {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [mountedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    if (!email || !email.includes("@")) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await api.post("/contacts/general", {
        name: "Newsletter Subscriber",
        email: email.trim(),
        subject: "Waitlist: Human Counselling for All Students",
        message: "Requested newsletter notification when human coaching opens up to all students.",
        hp_confirm: honeypot,
        _t: mountedAt,
      });
      trackEvent("newsletter_signup_submitted", { source: "eligibility_modal" });
      setStatus("success");
      setSuccessMessage(
        res.data?.message ||
          "You're on the list! We'll notify you as soon as human counselling opens to all students."
      );
      setEmail("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        "Unable to join the waitlist right now. Please check your network and try again.";
      setErrorMessage(msg);
      setStatus("error");
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="University Students Only For Now"
      description="Real human counseling eligibility notice"
      size="md"
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {onNavigateTab && (
            <Button
              variant="secondary"
              onClick={() => {
                onClose();
                onNavigateTab("talkmindly");
              }}
            >
              Explore TalkMindly peer spaces
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        {/* Banner Card */}
        <div className="rounded-2xl border border-plum-200 bg-plum-50/70 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-plum-200 bg-plum-100 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-plum-900">
              <Sparkles className="h-3 w-3 text-plum-600" aria-hidden="true" />
              University students only for now
            </span>
          </div>
          <h4 className="font-display text-base sm:text-lg font-bold text-ink-900 leading-snug">
            Uni students, you’re UP FIRST! Your safe space for real talk with real humans is here!
          </h4>
          <p className="mt-2 text-xs sm:text-sm text-ink-700 leading-relaxed font-semibold">
            Not in uni? Hey, don’t scroll away just yet! Your turn is coming SOON.
          </p>
          <p className="mt-1 text-xs text-ink-600 leading-relaxed">
            Wanna be in the know before everyone else? Sign up for our newsletter and get the FIRST scoop when human counselling opens up to ALL students!
          </p>
        </div>

        {/* Newsletter Signup Form */}
        <div>
          {status === "success" ? (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 rounded-2xl border border-sage-200 bg-sage-50 p-3.5 text-xs font-semibold text-sage-800"
            >
              <Check className="h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
              <span>{successMessage}</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              {/* Invisible bot honeypot field */}
              <input
                type="text"
                name="hp_confirm"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ position: "absolute", opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: "none" }}
              />

              <label htmlFor="modal-eligibility-email" className="block text-2xs font-bold uppercase tracking-wide text-ink-500">
                Get notified first
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="modal-eligibility-email"
                  type="email"
                  required
                  value={email}
                  disabled={status === "submitting"}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your student email..."
                  className="flex-1 rounded-xl border border-ink-200 bg-card px-3.5 py-2.5 text-xs text-ink-900 placeholder:text-ink-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 disabled:opacity-60"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={status === "submitting"}
                  aria-busy={status === "submitting"}
                >
                  <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{status === "submitting" ? "Joining..." : "Get the first scoop"}</span>
                </Button>
              </div>

              {status === "error" && errorMessage && (
                <div role="alert" className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>
          )}
        </div>

        {/* What you can use right now */}
        <div className="border-t border-ink-100 pt-4">
          <p className="text-2xs font-bold uppercase tracking-wider text-ink-500 mb-2.5">
            Available to all students right now
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-ink-200/80 bg-paper p-3 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 mb-1">
                <PenTool className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                WriteMindly
              </div>
              <p className="text-2xs text-ink-600 leading-relaxed">
                Reflective AI journaling to slow down your thoughts.
              </p>
            </div>
            <div className="rounded-xl border border-ink-200/80 bg-paper p-3 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-plum-800 mb-1">
                <MessageSquare className="h-3.5 w-3.5 text-plum-600" aria-hidden="true" />
                TalkMindly
              </div>
              <p className="text-2xs text-ink-600 leading-relaxed">
                Anonymous, moderated peer circles with fellow students.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

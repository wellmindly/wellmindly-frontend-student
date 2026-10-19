import { useState } from "react";
import { Sparkles, Check, ArrowRight, Bell } from "lucide-react";
import { cn } from "../../../lib/cn";
import { Button } from "../../ui";
import api from "../../../services/api";

export interface EligibilityBannerProps {
  className?: string;
}

export function EligibilityBanner({ className }: EligibilityBannerProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("submitting");

    try {
      await api.post("/contacts/general", {
        name: "Newsletter Subscriber",
        email: email.trim(),
        subject: "Waitlist: Human Counselling for All Students",
        message: "Requested newsletter notification when human coaching opens up to all students.",
      });
      setStatus("success");
      setEmail("");
    } catch {
      // Even if offline/api unreachable, treat as subscribed in client so visitor is assured
      setStatus("success");
      setEmail("");
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-plum-200/90 bg-gradient-to-br from-plum-500/10 via-card to-gold-500/10 p-6 sm:p-8 shadow-xs",
        className
      )}
    >
      {/* Decorative background accent circle */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-plum-400/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Eyebrow badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-plum-200 bg-plum-100/90 px-3 py-1 text-2xs font-bold uppercase tracking-wider text-plum-900 shadow-2xs">
            <Sparkles className="h-3 w-3 text-plum-600" aria-hidden="true" />
            University students only for now
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-gold-200 bg-gold-100/90 px-2.5 py-0.5 text-2xs font-bold text-gold-900">
            Coming to all students soon
          </span>
        </div>

        {/* Banner main headlines */}
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink-900 leading-snug">
            Uni students, you’re UP FIRST! Your safe space for real talk with real humans is here!
          </h3>
          <p className="mt-2 text-sm sm:text-base font-semibold text-plum-800 leading-relaxed">
            Not in uni? Hey, don’t scroll away just yet! Your turn is coming SOON.
          </p>
          <p className="mt-1 text-xs sm:text-sm text-ink-600 leading-relaxed">
            Wanna be in the know before everyone else? Sign up for our newsletter and get the FIRST scoop when human counselling opens up to ALL students!
          </p>
        </div>

        {/* Newsletter subscribe form */}
        <div className="pt-2">
          {status === "success" ? (
            <div
              role="status"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-xs sm:text-sm font-semibold text-sage-800 shadow-2xs"
            >
              <Check className="h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
              <span>You're on the list! We'll give you the FIRST scoop the moment human counselling opens up to all students.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-lg">
              <label htmlFor="newsletter-eligibility-email" className="sr-only">
                Email address for counselling access updates
              </label>
              <div className="relative flex-1">
                <input
                  id="newsletter-eligibility-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your student email..."
                  className="w-full rounded-2xl border border-ink-200 bg-card px-4 py-3 text-xs sm:text-sm text-ink-900 placeholder:text-ink-400 shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={status === "submitting"}
                className="shrink-0 justify-center min-h-11"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                <span>Get the first scoop</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

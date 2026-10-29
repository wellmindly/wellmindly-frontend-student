import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, AlertCircle, Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { Button, Input } from "../components/ui";
import api, { apiErrorMessage } from "../services/api";

export function VerifySubscriptionPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [state, setState] = useState<"loading" | "success" | "error" | "already_confirmed">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [resendFeedback, setResendFeedback] = useState("");

  const handleCrisisClick = () => {
    navigate("/crisis");
  };

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("No verification token was provided. Please check the link in your email.");
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const res = await api.post("/contacts/verify", { token });
        if (!isMounted) return;
        if (res.data?.success) {
          if (res.data?.message?.includes("already confirmed")) {
            setState("already_confirmed");
          } else {
            setState("success");
          }
          setMessage(res.data.message || "Your subscription has been verified successfully!");
        } else {
          setState("error");
          setMessage(res.data?.error || "Verification failed. The link may have expired.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setState("error");
        setMessage(apiErrorMessage(err, "Verification failed or this token has expired."));
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || !resendEmail.includes("@")) return;

    setResendStatus("sending");
    try {
      const res = await api.post("/contacts/resend-verification", {
        email: resendEmail.trim(),
        subject: "Waitlist: Human Counselling for All Students",
      });
      setResendStatus("sent");
      setResendFeedback(res.data?.message || "A new verification email has been sent if a pending subscription exists.");
      setResendEmail("");
    } catch (err: any) {
      setResendStatus("failed");
      setResendFeedback(apiErrorMessage(err, "Failed to send verification email. Please try again later."));
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans text-ink-900 antialiased selection:bg-plum-100 selection:text-plum-900">
      <LandingHeader onCrisisClick={handleCrisisClick} />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-lg rounded-3xl border border-plum-200/90 bg-card p-6 sm:p-10 shadow-sm text-center">
          {state === "loading" && (
            <div className="py-12 space-y-4">
              <Loader2 className="h-10 w-10 text-plum-600 animate-spin mx-auto" aria-hidden="true" />
              <h1 className="font-display text-xl font-bold text-ink-900">Verifying Your Subscription...</h1>
              <p className="text-sm text-ink-600">Please hold on while we confirm your email address.</p>
            </div>
          )}

          {(state === "success" || state === "already_confirmed") && (
            <div className="space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-plum-200 bg-plum-100 px-3 py-1 text-2xs font-bold uppercase tracking-wider text-plum-900 mb-3">
                  <Sparkles className="h-3 w-3 text-plum-600" aria-hidden="true" />
                  Subscription Active
                </span>
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
                  {state === "already_confirmed" ? "Already Confirmed!" : "You're On The Waitlist!"}
                </h1>
                <p className="mt-2 text-sm text-ink-600 leading-relaxed max-w-md mx-auto">
                  {message ||
                    "Thank you! Your email is verified. We will notify you first when human counselling opens up to all students."}
                </p>
              </div>

              <div className="rounded-2xl border border-ink-100 bg-paper p-4 text-left text-xs text-ink-600">
                <p className="font-bold text-ink-800 mb-1">Campaign:</p>
                <p>Waitlist: Human Counselling for All Students</p>
                <p className="mt-2 font-bold text-ink-800 mb-1">Privacy Guarantee:</p>
                <p>We respect your privacy. You will receive updates only for this announcement.</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="primary" size="md" onClick={() => navigate("/")}>
                  <span>Back to Home</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button variant="secondary" size="md" onClick={() => navigate("/discover")}>
                  <span>Explore Mental Wellbeing Tools</span>
                </Button>
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertCircle className="h-10 w-10" aria-hidden="true" />
              </div>

              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
                  Verification Failed or Expired
                </h1>
                <p className="mt-2 text-sm text-ink-600 leading-relaxed max-w-md mx-auto">
                  {message || "The verification link is invalid or has expired after 24 hours."}
                </p>
              </div>

              {/* Resend form */}
              <div className="rounded-2xl border border-plum-200 bg-plum-50/50 p-5 text-left space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-plum-600" aria-hidden="true" />
                  <h2 className="text-xs font-bold uppercase tracking-wide text-ink-800">
                    Request a New Verification Link
                  </h2>
                </div>
                <p className="text-2xs text-ink-600 leading-relaxed">
                  Enter your email address to receive a fresh single-use verification link.
                </p>

                {resendStatus === "sent" ? (
                  <div role="status" className="rounded-xl bg-sage-100 p-3 text-xs font-semibold text-sage-800">
                    {resendFeedback}
                  </div>
                ) : (
                  <form onSubmit={handleResend} className="space-y-3">
                    <Input
                      label="Your Email"
                      type="email"
                      required
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="student@university.edu"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={resendStatus === "sending"}
                      className="w-full justify-center"
                    >
                      {resendStatus === "sending" ? "Sending Link..." : "Resend Verification Link"}
                    </Button>
                    {resendStatus === "failed" && (
                      <p role="alert" className="text-xs text-rose-600 font-semibold">
                        {resendFeedback}
                      </p>
                    )}
                  </form>
                )}
              </div>

              <div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                  <span>Return to Homepage</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <LandingFooter onCrisisClick={handleCrisisClick} />
    </div>
  );
}

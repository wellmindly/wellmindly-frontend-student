import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Mail,
  KeyRound,
  ArrowRight,
  HelpCircle,
  Smartphone,
  ChevronRight,
  Info,
} from "lucide-react";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import api, { apiErrorMessage } from "../services/api";

export function DeleteAccountPage() {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"enter-email" | "enter-otp" | "success">("enter-email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/delete-account/send-otp", {
        email: email.trim().toLowerCase(),
      });
      setInfoMsg(res.data?.message || "Verification code sent to your email.");
      setStep("enter-otp");
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to send verification code. Please check the email and try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.post("/auth/delete-account/confirm", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      setStep("success");
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to delete account. The verification code may be invalid or expired."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <LandingHeader onCrisisClick={() => navigate("/crisis")} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {/* App Identification Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-coral/10 text-coral rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Trash2 className="w-3.5 h-3.5" />
            Data Protection & Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 font-display tracking-tight">
            Delete Account & Associated Data
          </h1>
          <p className="text-sm sm:text-base text-ink-600 mt-2 max-w-2xl leading-relaxed">
            Manage your personal data for the <strong>WellMindly</strong> application (Package:{" "}
            <code className="text-xs bg-ink-100 text-ink-800 px-1.5 py-0.5 rounded font-mono">
              com.wellmindly.app
            </code>
            ). You can permanently delete your account and all associated records using this self-serve form or directly inside the app.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* Left Column: Interactive Web Deletion Form (7 cols) */}
          <div className="lg:col-span-7 bg-card border border-ink-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-ink-900 font-display mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-coral" />
              Online Account Deletion Request
            </h2>
            <p className="text-xs text-ink-500 mb-6">
              Complete verification to delete your account without needing the app installed.
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-coral/10 border border-coral/20 text-coral text-xs leading-relaxed flex items-start gap-2.5"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {infoMsg && step === "enter-otp" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-teal/10 border border-teal/20 text-teal-800 text-xs leading-relaxed flex items-start gap-2.5"
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-teal" />
                <span>{infoMsg}</span>
              </motion.div>
            )}

            {step === "enter-email" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label htmlFor="delete-email" className="block text-xs font-semibold text-ink-800 mb-1.5">
                    Registered Student Email Address <span className="text-coral">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-ink-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="delete-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. alice@wellmindly.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-paper rounded-xl border border-ink-200 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-plum-400 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-2xs text-ink-500 mt-1.5">
                    We will send a 6-digit confirmation code to verify account ownership.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-coral text-white font-semibold text-sm hover:bg-coral/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Deletion Code <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === "enter-otp" && (
              <form onSubmit={handleConfirmDelete} className="space-y-4">
                <div className="p-3.5 bg-paper-2 border border-ink-200/60 rounded-xl mb-4 text-xs text-ink-700 flex items-center justify-between">
                  <span className="truncate">{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("enter-email");
                      setError(null);
                    }}
                    className="text-plum-600 hover:underline font-semibold ml-2 shrink-0"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label htmlFor="delete-otp" className="block text-xs font-semibold text-ink-800 mb-1.5">
                    6-Digit Verification Code <span className="text-coral">*</span>
                  </label>
                  <input
                    id="delete-otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-paper rounded-xl border border-ink-200 text-center tracking-widest text-lg font-mono font-bold text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent transition-all"
                  />
                  <p className="text-2xs text-ink-500 mt-1.5 text-center">
                    Check your spam or promotions folder if you don't see the email within 1 minute.
                  </p>
                </div>

                <div className="p-3.5 bg-coral/5 border border-coral/20 rounded-xl text-xs text-ink-700 leading-relaxed">
                  <strong className="text-coral block mb-1">Permanent Action Notice:</strong>
                  Confirming this action will immediately purge your profile, check-in histories, quiz submissions, and scheduled appointments. This cannot be undone.
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3 px-4 rounded-xl bg-coral text-white font-semibold text-sm hover:bg-coral/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Permanently Delete My Account & Data
                    </>
                  )}
                </button>
              </form>
            )}

            {step === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-14 h-14 bg-teal/15 text-teal rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-ink-900 font-display">Account Deleted Successfully</h3>
                <p className="text-xs sm:text-sm text-ink-600 mt-2 max-w-md mx-auto leading-relaxed">
                  Your WellMindly account, check-in history, quiz results, and community contributions have been permanently removed from our databases.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/"
                    className="py-2.5 px-5 rounded-xl bg-plum text-white text-xs font-semibold hover:bg-plum/90 transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    Return to Homepage
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Policy Details & Alternative Paths (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* In-App Deletion Steps Card */}
            <div className="bg-card border border-ink-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-ink-900 uppercase tracking-wide flex items-center gap-2 mb-3">
                <Smartphone className="w-4 h-4 text-plum" />
                How to Delete In-App
              </h3>
              <ol className="text-xs text-ink-600 space-y-2.5 list-decimal pl-4 leading-relaxed">
                <li>
                  Open the <strong>WellMindly</strong> app on your Android device.
                </li>
                <li>
                  Tap the menu icon (<code className="bg-ink-100 px-1 py-0.5 rounded text-2xs">☰</code>) in the top navigation bar.
                </li>
                <li>
                  Locate your profile card at the bottom of the drawer and tap <strong>Delete Account</strong>.
                </li>
                <li>
                  Review the summary of data to be erased and confirm deletion.
                </li>
              </ol>
            </div>

            {/* Email Support Request Card */}
            <div className="bg-card border border-ink-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-ink-900 uppercase tracking-wide flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-teal" />
                Manual Request via Email
              </h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                If you cannot access your email verification code, you can send an account deletion request directly to our Data Protection Officer:
              </p>
              <div className="mt-3 p-3 bg-paper rounded-xl border border-ink-200/60 text-xs">
                <p className="font-semibold text-ink-900">Email: <a href="mailto:privacy@wellmindly.com" className="text-plum-600 hover:underline">privacy@wellmindly.com</a></p>
                <p className="text-ink-500 mt-1">Subject: <em>Account & Data Deletion Request</em></p>
                <p className="text-ink-500 text-2xs mt-1">Please write from your registered account email address.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Scope & Retention Schedule (Google Play Policy Disclosures) */}
        <section className="mt-14 border-t border-ink-200/80 pt-10">
          <h2 className="text-xl font-bold text-ink-900 font-display mb-2">
            Data Deletion Scope & Retention Schedule
          </h2>
          <p className="text-xs sm:text-sm text-ink-600 mb-6 leading-relaxed">
            In compliance with Google Play Store User Data policies and global privacy regulations, below is the transparent breakdown of what records are permanently purged and what limited metadata is retained.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Category 1: Permanently Deleted */}
            <div className="bg-card border border-ink-200/80 rounded-2xl p-5 shadow-sm">
              <span className="inline-block px-2.5 py-1 bg-coral/10 text-coral text-2xs font-bold rounded-full mb-3 uppercase">
                Permanently Deleted
              </span>
              <h3 className="text-sm font-bold text-ink-900 mb-2">Personal & Activity Data</h3>
              <ul className="text-xs text-ink-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Full name, registered email address, and authentication tokens</li>
                <li>University domain association and student verification status</li>
                <li>Daily emotional check-ins, moodboard trajectories, and streak logs</li>
                <li>All assessment responses, questionnaires, and PHQ-9 survey logs</li>
                <li>TalkMindly community handle, posts, replies, and reactions</li>
                <li>Counseling appointment bookings, notes, and session requests</li>
              </ul>
            </div>

            {/* Category 2: Retained (If Any) */}
            <div className="bg-card border border-ink-200/80 rounded-2xl p-5 shadow-sm">
              <span className="inline-block px-2.5 py-1 bg-ink-200/60 text-ink-700 text-2xs font-bold rounded-full mb-3 uppercase">
                Anonymized / Legal Only
              </span>
              <h3 className="text-sm font-bold text-ink-900 mb-2">Aggregated Records</h3>
              <ul className="text-xs text-ink-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Non-personally identifiable statistical counts (e.g. total assessments taken across the campus)</li>
                <li>Fully stripped aggregate telemetry used strictly for service uptime and error monitoring</li>
                <li>Records required by statutory legal or financial audit regulations (e.g. invoice records if a paid service was contracted)</li>
              </ul>
            </div>

            {/* Category 3: Retention Timeline */}
            <div className="bg-card border border-ink-200/80 rounded-2xl p-5 shadow-sm">
              <span className="inline-block px-2.5 py-1 bg-teal/10 text-teal text-2xs font-bold rounded-full mb-3 uppercase">
                Retention Timelines
              </span>
              <h3 className="text-sm font-bold text-ink-900 mb-2">Processing Time</h3>
              <ul className="text-xs text-ink-600 space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>
                  <strong>Online & In-App Requests:</strong> Processed <em>immediately and permanently</em> in real time upon confirmation.
                </li>
                <li>
                  <strong>Email Verification Requests:</strong> Manually verified and completed within <em>30 calendar days</em>.
                </li>
                <li>
                  <strong>Database Backups:</strong> Residual system snapshots expire and overwrite automatically within 30 days.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer Navigation Back to Legal Policies */}
        <div className="mt-12 p-4 bg-paper-2 rounded-xl border border-ink-200/70 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-600">
          <span>Need more details on how WellMindly handles your data?</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-plum-600 hover:underline font-semibold flex items-center gap-1">
              Privacy Policy <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/terms" className="text-plum-600 hover:underline font-semibold flex items-center gap-1">
              Terms of Service <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter onCrisisClick={() => navigate("/crisis")} />
    </div>
  );
}

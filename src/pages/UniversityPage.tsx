import React, { useState } from "react";
import { motion } from "framer-motion";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { School, BarChart2, ShieldCheck, CheckCircle2, Send, Check, AlertTriangle, Download } from "lucide-react";


export function UniversityPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    universityName: "",
    role: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCrisisClick = () => {
    navigate("/crisis");
  };

  const handleDownloadSampleReport = () => {
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Colors

      // Draw Title Page / Header
      doc.setFillColor(77, 41, 91); // Plum
      doc.rect(0, 0, 210, 45, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      doc.text("WellMindly Campus Analytics", 15, 18);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(220, 220, 220);
      doc.text("Anonymized aggregate reports for campus administration", 15, 25);
      doc.text("Gulf International University — Spring Cohort", 15, 30);

      // Report metadata box
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 55, 180, 25, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 55, 180, 25, "S");

      doc.setTextColor(71, 85, 105);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.text("REPORT METADATA", 20, 61);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("Generated: June 2026", 20, 67);
      doc.text("License Type: Campus-Wide Beta", 20, 72);
      doc.text("Total Registered Seats: 8,000", 110, 67);
      doc.text("Cohort Coverage / Active: 61% (4,880 active)", 110, 72);

      // Section 1: Executive Summary
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(77, 41, 91);
      doc.text("1. Executive Summary", 15, 95);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const summaryText = "WellMindly provides a safe, anonymous precursor to clinical support systems. This report compiles macroscopic, aggregate emotional landscape trends. Student identities are protected by strict cryptographic tenant isolation. No individual names, emails, check-ins, or chat logs are ever visible to campus administration.";
      const splitSummary = doc.splitTextToSize(summaryText, 180);
      doc.text(splitSummary, 15, 101);

      // Section 2: Macro-Level Cohort Indicators
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(77, 41, 91);
      doc.text("2. Macro-Level Indicators", 15, 125);

      // Draw score card
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 131, 55, 30, "F");
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(18);
      doc.text("6.8 / 10", 25, 144);
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("Campus Wellness Index", 21, 152);

      // Draw engagement card
      doc.setFillColor(241, 245, 249);
      doc.rect(77, 131, 55, 30, "F");
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(18);
      doc.text("61%", 94, 144);
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("Student Cohort Coverage", 83, 152);

      // Draw referral card
      doc.setFillColor(241, 245, 249);
      doc.rect(140, 131, 55, 30, "F");
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(18);
      doc.text("4.2%", 157, 144);
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("Support Opt-In Rate", 149, 152);

      // Section 3: Severity Segmentation
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(77, 41, 91);
      doc.text("3. Severity Segmentation (Risk Distribution)", 15, 175);

      // Draw progress indicators
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);

      // Mild Risk: 64%
      doc.text("Mild Tiers (Safe / Self-Discovery Enabled)", 15, 183);
      doc.setFillColor(224, 242, 254);
      doc.rect(15, 186, 180, 4, "F");
      doc.setFillColor(14, 165, 233);
      doc.rect(15, 186, 180 * 0.64, 4, "F");
      doc.text("64%", 185, 183);

      // Moderate Risk: 24%
      doc.text("Moderate Tiers (Surfacing Peer Coaching Sessions)", 15, 196);
      doc.setFillColor(254, 243, 199);
      doc.rect(15, 199, 180, 4, "F");
      doc.setFillColor(245, 158, 11);
      doc.rect(15, 199, 180 * 0.24, 4, "F");
      doc.text("24%", 185, 196);

      // Severe Risk: 12%
      doc.text("Severe Tiers (Helpline Directory Routing)", 15, 209);
      doc.setFillColor(254, 226, 226);
      doc.rect(15, 212, 180, 4, "F");
      doc.setFillColor(239, 68, 68);
      doc.rect(15, 212, 180 * 0.12, 4, "F");
      doc.text("12%", 185, 209);

      // Section 4: Key Insights & Recommendations
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(77, 41, 91);
      doc.text("4. Academic Insights & Intervention Strategy", 15, 230);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("• Stress spikes are concentrated around pre-exam period (Weeks 10-11). Recommended action: launch targeted peer support campaigns in Week 9.", 15, 237);
      doc.text("• Medicine and Engineering faculties report elevated burnout flags. Action: coordinate with department deans to embed relaxation resources.", 15, 243);
      doc.text("• Early onboarding has protected student retention: engaged student cohorts show a 93% term retention vs 86% in control groups.", 15, 249);

      // Footer
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("CONFIDENTIAL · PREPARED FOR GULF INTERNATIONAL UNIVERSITY · POWERED BY WELLMINDLY", 15, 280);
      doc.text("Page 1 of 1", 185, 280);

      doc.save("WellMindly_GIU_Sample_Report.pdf");
    });
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await api.post("/contacts/university", formData);
      if (response.data?.success) {
        setStatus({
          type: "success",
          message: "Onboarding request submitted! Our partnerships coordinator will reach out to you within 48 hours.",
        });
        setFormData({ name: "", email: "", universityName: "", role: "", phone: "", message: "" });
      } else {
        setStatus({
          type: "error",
          message: "Submission failed. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("University contact submit failed:", error);
      setStatus({
        type: "error",
        message: error.response?.data?.error || "Connection failed. Please check your network and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: <BarChart2 className="w-8 h-8 text-plum" />,
      title: "Anonymized Analytics",
      description: "Gain macro-level reports on student wellness categories and timelines. Track campus-wide sentiment trends without violating personal student trust.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-teal" />,
      title: "Secure Domain Gating",
      description: "Restrict registrations to verified university email domains (e.g. yourschool.edu) instantly. Safe, secure, and isolated database clusters.",
    },
    {
      icon: <School className="w-8 h-8 text-coral" />,
      title: "Integration With On-Campus Care",
      description: "Seamlessly route students who flag critical scores directly to your existing university counseling hotlines, phone lines, and physical clinics.",
    },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <LandingHeader onCrisisClick={handleCrisisClick} />

      {/* Hero Banner */}
      <section className="py-20 px-6 bg-gradient-to-r from-navy to-[#2C3B53] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block px-3 py-1 bg-white/10 text-gold rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
          >
            Partnerships
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold font-serif leading-tight mb-6"
          >
            Equipping Institutions with Preventive Mental Health Tools
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Onboard your university with WellMindly to offer students private self-reflection modules, AI companions, and moderated community support before they experience burnout.
          </motion.p>
        </div>
      </section>

      {/* Benefits / Services Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink font-serif">What Universities Gain</h2>
          <p className="text-sm text-ink-soft mt-2">Preventive care that protects students and reduces load on counseling systems.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-card p-8 rounded-2xl border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-lg font-bold text-ink mb-2">{benefit.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Reports Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full border-t border-line/60">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] font-bold text-coral uppercase tracking-widest block mb-3">Data Transparency</span>
          <h2 className="text-3xl font-serif text-ink tracking-tight font-medium">
            Sample Analytics Reports
          </h2>
          <p className="text-sm text-ink-soft mt-3">
            Preview the anonymized, macro-level cohort analytics that your administration receives. Strict student privacy and anonymity are cryptographically preserved.
          </p>
        </div>

        <div className="bg-card border border-line rounded-[2.5rem] p-6 sm:p-10 shadow-sm grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="bg-teal/10 text-teal text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Anonymized Dashboard Preview</span>
              <h3 className="text-xl font-bold text-ink mt-3">Gulf International University Report</h3>
              <p className="text-xs text-ink-soft mt-2 leading-relaxed">
                Aggregated cohort intelligence provides a clear timeline of stress hotspots and support uptake rates across departments, helping you allocate counselor resources where they are needed most.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-paper-2 rounded-2xl border border-line text-center">
                <div className="text-lg font-bold text-ink">6.8 / 10</div>
                <div className="text-[10px] text-ink-soft font-semibold mt-1 font-sans">Campus Index</div>
              </div>
              <div className="p-4 bg-paper-2 rounded-2xl border border-line text-center">
                <div className="text-lg font-bold text-ink">61%</div>
                <div className="text-[10px] text-ink-soft font-semibold mt-1 font-sans">Cohort Coverage</div>
              </div>
              <div className="p-4 bg-paper-2 rounded-2xl border border-line text-center">
                <div className="text-lg font-bold text-ink">4.2%</div>
                <div className="text-[10px] text-ink-soft font-semibold mt-1 font-sans">Support Uptake</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-ink">Anonymized Stress Distribution:</div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] text-ink-soft font-semibold mb-1 font-sans">
                    <span>Mild Strain Tiers</span>
                    <span>64%</span>
                  </div>
                  <div className="w-full bg-paper-2 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal h-full rounded-full" style={{ width: "64%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-ink-soft font-semibold mb-1 font-sans">
                    <span>Moderate Strain Tiers</span>
                    <span>24%</span>
                  </div>
                  <div className="w-full bg-paper-2 h-2 rounded-full overflow-hidden">
                    <div className="bg-plum h-full rounded-full" style={{ width: "24%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-paper-2 border border-line rounded-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-plum/10 text-plum rounded-full flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-ink text-sm">Download Sample PDF Report</h4>
              <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                Get a copy of the high-fidelity sample PDF report showing aggregate department benchmarks, cohort retention correlations, and quarterly trends.
              </p>
            </div>
            <button
              onClick={handleDownloadSampleReport}
              className="w-full py-3 bg-plum text-white font-bold rounded-full text-xs shadow-md shadow-plum/20 hover:opacity-95 transition-all active:scale-95 cursor-pointer border-none flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF (A4)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Form and Info Section */}
      <section className="py-16 px-6 bg-paper-2/40 border-y border-line w-full">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          {/* Details Column */}
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-ink font-serif leading-snug">Bring WellMindly to Your Campus</h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              We collaborate with administration leaders, student affairs directors, and counseling center managers to build secure onboarding models tailored for your size.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-ink">Zero Setup Fees</h4>
                  <p className="text-xs text-ink-soft mt-0.5">Custom school landing portal configured within 3 business days.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-ink">Private Beta Onboarding</h4>
                  <p className="text-xs text-ink-soft mt-0.5">Enable student registration for your domain on our cloud environment instantly.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-ink">Co-Branded Directory Customization</h4>
                  <p className="text-xs text-ink-soft mt-0.5">Embed your specific crisis hotline resources, scheduling links, and office maps directly into the portal.</p>
                </div>
              </div>
            </div>

            {/* Pricing Section (Future placeholder) */}
            <div className="bg-card p-6 rounded-2xl border border-line/80 mt-8">
              <span className="text-[10px] font-bold text-plum uppercase tracking-wider block mb-1">Pricing Model</span>
              <h4 className="text-sm font-bold text-ink">Flexible Campus Licensing (Pricing Coming Soon)</h4>
              <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                We are currently onboarding institutions under a complimentary Private Beta Program for the upcoming semester. Active beta partners will receive priority pricing structures thereafter.
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-card p-8 rounded-2xl border border-line shadow-sm">
            <h3 className="text-lg font-bold text-ink mb-6">University Onboarding Request</h3>

            {status.type && (
              <div className={`p-4 rounded-xl text-xs font-semibold mb-6 flex items-start gap-3 border ${
                status.type === "success" 
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                  : "bg-ember/10 text-ember border-ember/20"
              }`}>
                {status.type === "success" ? <Check className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-semibold text-ink">Your Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Dean Henderson"
                  className="px-4 py-2 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-ink">Work Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="henderson@university.edu"
                    className="px-4 py-2 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-xs font-semibold text-ink">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+971 50 123 4567"
                    className="px-4 py-2 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="universityName" className="text-xs font-semibold text-ink">University / College *</label>
                  <input
                    type="text"
                    id="universityName"
                    name="universityName"
                    required
                    value={formData.universityName}
                    onChange={handleInputChange}
                    placeholder="Gulf International University"
                    className="px-4 py-2 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="role" className="text-xs font-semibold text-ink">Your Title / Role *</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="Director of Student Affairs"
                    className="px-4 py-2 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-semibold text-ink">Message Details *</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us about your campus context and how we can support you..."
                  className="px-4 py-2 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-plum text-white font-bold rounded-full text-xs shadow-md shadow-plum/20 hover:opacity-95 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 border-none mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <LandingFooter onCrisisClick={handleCrisisClick} />
    </div>
  );
}

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { School, BarChart2, ShieldCheck, CheckCircle2, Send, Check, AlertTriangle } from "lucide-react";

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

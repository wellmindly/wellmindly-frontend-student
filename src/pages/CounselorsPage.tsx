import React, { useState } from "react";
import { motion } from "framer-motion";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { UserPlus, Award, Heart, Send, Check, AlertTriangle } from "lucide-react";

export function CounselorsPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    credentials: "",
    experience: "",
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
      const response = await api.post("/contacts/counselor", formData);
      if (response.data?.success) {
        setStatus({
          type: "success",
          message: "Application submitted! Our clinical vetting board will review your credentials and contact you within 5 business days.",
        });
        setFormData({ name: "", email: "", phone: "", credentials: "", experience: "", message: "" });
      } else {
        setStatus({
          type: "error",
          message: "Application submission failed. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Counselor contact submit failed:", error);
      setStatus({
        type: "error",
        message: error.response?.data?.error || "Connection failed. Please check your network and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      icon: <Award className="w-8 h-8 text-teal" />,
      title: "Earn Extra Income",
      description: "Supplement your income with flexible hours. Set your own availability and get compensated per completed consultation or peer supervision hours.",
    },
    {
      icon: <Heart className="w-8 h-8 text-rose" />,
      title: "Support Student Success",
      description: "Directly impact Gen Z students by helping them untangle their daily emotional loads. Provide feedback and preventive guidance early in their journey.",
    },
    {
      icon: <UserPlus className="w-8 h-8 text-plum" />,
      title: "Collaborative Community",
      description: "Connect with our panel of clinical psychologists and coaches. Gain access to modern training, toolkits, and case peer reviews.",
    },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <LandingHeader onCrisisClick={handleCrisisClick} />

      {/* Hero Header */}
      <section className="py-20 px-6 bg-gradient-to-r from-plum to-[#614777] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block px-3 py-1 bg-white/10 text-rose rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
          >
            Clinical Network
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold font-serif leading-tight mb-6"
          >
            Join Our Panel of Counselors & Student Coaches
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base text-purple-100 max-w-2xl mx-auto leading-relaxed"
          >
            Deliver non-diagnostic support, review student assessments, and provide guidance to a growing community of university students looking for clarity.
          </motion.p>
        </div>
      </section>

      {/* Rationale Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink font-serif">Why Onboard With WellMindly?</h2>
          <p className="text-sm text-ink-soft mt-2">Maximize your impact while maintaining control over your schedule.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {columns.map((col, idx) => (
            <div key={idx} className="bg-card p-8 rounded-2xl border border-line shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">{col.icon}</div>
              <h3 className="text-lg font-bold text-ink mb-2">{col.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{col.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Counselor Onboarding Details & Form */}
      <section className="py-16 px-6 bg-paper-2/40 border-y border-line w-full">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          {/* Vetting Criteria Details */}
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-ink font-serif leading-snug">Become an Active Partner</h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              We value professionalism and clinical safety. Every counselor and coach on our platform undergoes a detailed credentials and license audit before onboarding.
            </p>

            <div className="space-y-6 pt-4">
              <div>
                <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                  <span className="w-5 h-5 bg-teal/10 text-teal rounded-full flex items-center justify-center text-xs">1</span>
                  Credentials Vetting
                </h4>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed pl-7">
                  You must hold a valid license or registration (e.g. CDA license, DHA license, or international equivalent like BACP, ACA, HCPC) in psychology, counseling, or social work.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                  <span className="w-5 h-5 bg-teal/10 text-teal rounded-full flex items-center justify-center text-xs">2</span>
                  Digital Care Training
                </h4>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed pl-7">
                  Complete our 2-hour onboarding course on non-diagnostic student self-reflection tools, privacy gating protocols, and emergency escalation workflows.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                  <span className="w-5 h-5 bg-teal/10 text-teal rounded-full flex items-center justify-center text-xs">3</span>
                  Earn and Support
                </h4>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed pl-7">
                  Log into our clinical dashboard, claim student assessment consultation tickets, and conduct private chat reviews. Earn steady payouts processed twice a month.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-card p-8 rounded-2xl border border-line shadow-sm">
            <h3 className="text-lg font-bold text-ink mb-6">Counselor Application Form</h3>

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
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-ink">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Dr. Sarah Al-Jamil"
                    className="px-4 py-2 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-ink">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="sarah@clinic.com"
                    className="px-4 py-2 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-xs font-semibold text-ink">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+971 55 987 6543"
                    className="px-4 py-2 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="credentials" className="text-xs font-semibold text-ink">Professional Credentials / Licenses *</label>
                  <input
                    type="text"
                    id="credentials"
                    name="credentials"
                    required
                    value={formData.credentials}
                    onChange={handleInputChange}
                    placeholder="CDA Licensed Psychologist / BACP Register"
                    className="px-4 py-2 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="experience" className="text-xs font-semibold text-ink">Brief Experience Summary *</label>
                <textarea
                  id="experience"
                  name="experience"
                  required
                  rows={3}
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="5+ years in adolescent therapy, specialized in cognitive behavioral frameworks..."
                  className="px-4 py-2 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors resize-none"
                ></textarea>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-xs font-semibold text-ink">Additional Message / Cover Note *</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Why would you like to join the WellMindly team?"
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
                    <span>Submit Application</span>
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

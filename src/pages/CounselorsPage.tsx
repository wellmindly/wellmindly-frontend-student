import React, { useState } from "react";
import { motion } from "framer-motion";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { UserPlus, Award, Heart, Send, Check, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Field";

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
          message: "Application submitted. Our clinical team will review your credentials and email you at the address above.",
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

      <main id="main-content" tabIndex={-1}>
        {/* Hero Header */}
        <section className="py-20 px-6 bg-gradient-to-r from-plum-700 via-plum-800 to-plum-900 text-plum-50">
          <div className="max-w-4xl mx-auto text-center">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-block px-3 py-1 bg-plum-500/20 text-plum-200 border border-plum-400/30 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            >
              Clinical Network
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold font-display leading-tight mb-6"
            >
              Join Our Panel of Counselors & Student Coaches
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base text-plum-100 max-w-2xl mx-auto leading-relaxed"
            >
              Deliver non-diagnostic support, review student assessments, and provide guidance to a growing community of university students looking for clarity.
            </motion.p>
          </div>
        </section>

        {/* Rationale Grid */}
        <section className="py-16 px-6 max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink-900 font-display">Why Onboard With WellMindly?</h2>
            <p className="text-sm text-ink-soft mt-2">Maximize your impact while maintaining control over your schedule.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {columns.map((col, idx) => (
              <div key={idx} className="bg-card p-8 rounded-2xl border border-line shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{col.icon}</div>
                <h3 className="text-lg font-bold text-ink-900 mb-2">{col.title}</h3>
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
              <h2 className="text-3xl font-extrabold text-ink-900 font-display leading-snug">Become an Active Partner</h2>
              <p className="text-sm text-ink-soft leading-relaxed">
                We value professionalism and clinical safety. Every counselor and coach on our platform undergoes a detailed credentials and license audit before onboarding.
              </p>

              <div className="space-y-6 pt-4">
                <div>
                  <h4 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                    <span className="w-5 h-5 bg-teal/10 text-teal rounded-full flex items-center justify-center text-xs">1</span>
                    Credentials Vetting
                  </h4>
                  <p className="text-xs text-ink-soft mt-1 leading-relaxed pl-7">
                    You must hold a valid license or registration (e.g. CDA license, DHA license, or international equivalent like BACP, ACA, HCPC) in psychology, counseling, or social work.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                    <span className="w-5 h-5 bg-teal/10 text-teal rounded-full flex items-center justify-center text-xs">2</span>
                    Digital Care Training
                  </h4>
                  <p className="text-xs text-ink-soft mt-1 leading-relaxed pl-7">
                    Complete our 2-hour onboarding course on non-diagnostic student self-reflection tools, privacy gating protocols, and emergency escalation workflows.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-ink-900 flex items-center gap-2">
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
              <h3 className="text-lg font-bold text-ink-900 mb-4">Counselor Application Form</h3>

              <div className="space-y-4 mb-6">
                <p role="status" aria-live="polite" className={`min-h-5 text-sm font-medium ${status.type === "success" ? "text-sage-700" : status.type === "error" ? "text-danger" : "text-transparent"}`}>
                  {status.message}
                </p>

                {status.type && (
                  <div className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-3 border ${
                    status.type === "success" 
                      ? "bg-sage-50 text-sage-800 border-sage-200" 
                      : "bg-coral-50 text-coral-900 border-coral-200"
                  }`}>
                    {status.type === "success" ? <Check className="w-5 h-5 shrink-0 text-sage-600" /> : <AlertTriangle className="w-5 h-5 shrink-0 text-coral-600" />}
                    <span>{status.message}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Full name"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Dr. Sarah Al-Jamil"
                    className="text-base"
                  />

                  <Input
                    label="Email address"
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="sarah@clinic.com"
                    className="text-base"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Phone number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+971 55 987 6543"
                    className="text-base"
                  />

                  <Input
                    label="Professional credentials / licenses"
                    required
                    name="credentials"
                    value={formData.credentials}
                    onChange={handleInputChange}
                    placeholder="CDA Licensed Psychologist / BACP Register"
                    className="text-base"
                  />
                </div>

                <Textarea
                  label="Brief experience summary"
                  required
                  rows={3}
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="5+ years in adolescent therapy, specialized in cognitive behavioral frameworks..."
                  className="text-base"
                />

                <Textarea
                  label="Additional message"
                  required
                  rows={3}
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Why would you like to join the WellMindly team?"
                  className="text-base"
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                    leadingIcon={<Send className="w-4 h-4" />}
                  >
                    Submit application
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter onCrisisClick={handleCrisisClick} />
    </div>
  );
}

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Mail, MessageSquare, Send, Check, AlertTriangle, Phone, Globe } from "lucide-react";


export function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
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
      const response = await api.post("/contacts/general", formData);
      if (response.data?.success) {
        setStatus({
          type: "success",
          message: "Thank you! Your message has been sent successfully. We will get back to you shortly.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({
          type: "error",
          message: "Something went wrong. Please try again later.",
        });
      }
    } catch (error: any) {
      console.error("General contact submit failed:", error);
      setStatus({
        type: "error",
        message: error.response?.data?.error || "Connection failed. Please check your network and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <LandingHeader onCrisisClick={handleCrisisClick} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block px-3 py-1 bg-teal/10 text-teal rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
          >
            Get In Touch
          </motion.span>
          <h1 className="text-4xl font-extrabold text-ink font-serif tracking-tight">Contact Our Team</h1>
          <p className="text-sm text-ink-soft max-w-md mx-auto mt-2">
            Have questions about our blueprints, support systems, or features? Send us a message and we'll reply as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start mt-8">
          {/* Left Column: Direct Info & Socials */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card p-8 rounded-2xl border border-line shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-ink">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-paper-2 rounded-lg text-plum shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Email Address</h4>
                    <p className="text-sm text-ink-soft font-medium mt-0.5">Info@wellmindly.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-paper-2 rounded-lg text-teal shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Phone Number</h4>
                    <p className="text-sm text-ink-soft font-medium mt-0.5">+971507312108</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-paper-2 rounded-lg text-teal shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Support Chat</h4>
                    <p className="text-sm text-ink-soft font-medium mt-0.5">Response timeframe within 24 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-paper-2 rounded-lg text-coral shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Countries</h4>
                    <p className="text-sm text-ink-soft font-medium mt-0.5">UAE, Oman, Malaysia, Australia, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Connect Card */}
            <div className="bg-card p-8 rounded-2xl border border-line shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Follow Us On Social Media</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                Connect with us for student advocacy tips, update notices, and new blueprint announcements.
              </p>
              <div className="flex gap-3 pt-2">
                <a href="https://instagram.com/wellmindly" target="_blank" rel="noreferrer" className="p-3 bg-paper-2 hover:bg-rose/10 hover:text-rose rounded-full transition-all text-ink-soft flex items-center justify-center" title="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a href="https://linkedin.com/company/wellmindly" target="_blank" rel="noreferrer" className="p-3 bg-paper-2 hover:bg-sky/10 hover:text-sky rounded-full transition-all text-ink-soft flex items-center justify-center" title="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a href="https://www.youtube.com/@WellMindly" target="_blank" rel="noreferrer" className="p-3 bg-paper-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all text-ink-soft flex items-center justify-center" title="YouTube">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
                    <polygon points="10 15 15 12 10 9" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-card p-8 rounded-2xl border border-line shadow-sm">
              <h3 className="text-lg font-bold text-ink mb-6">Send Us a Message</h3>

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

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-ink">Your Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Jai Malani"
                      className="px-4 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors"
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
                      placeholder="jai@wellmindly.edu"
                      className="px-4 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="subject" className="text-xs font-semibold text-ink">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Feedback, Feature Request, Inquiry..."
                    className="px-4 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-xs font-semibold text-ink">Message Details *</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your inquiry or suggestions here..."
                    className="px-4 py-2.5 rounded-xl border border-line text-sm text-ink bg-paper/30 focus:border-plum focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-plum text-white font-bold rounded-full text-xs shadow-md shadow-plum/20 hover:opacity-95 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 border-none"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter onCrisisClick={handleCrisisClick} />
    </div>
  );
}

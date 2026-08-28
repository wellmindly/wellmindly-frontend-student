import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Mail, MessageSquare, Send, Check, AlertTriangle, Phone, Globe } from "lucide-react";
import { Input, Textarea, Button, SocialLinks } from "../components/ui";

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
  const statusRef = useRef<HTMLDivElement>(null);

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
          message:
            "Thank you! Your message has been sent successfully. We will get back to you shortly.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({
          type: "error",
          message: "Something went wrong. Please try again later.",
        });
        statusRef.current?.focus();
      }
    } catch (error: any) {
      console.error("General contact submit failed:", error);
      setStatus({
        type: "error",
        message:
          error.response?.data?.error ||
          "Connection failed. Please check your network and try again.",
      });
      statusRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <LandingHeader onCrisisClick={handleCrisisClick} />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block px-3 py-1 bg-teal/10 text-teal rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
          >
            Get In Touch
          </motion.span>
          <h1 className="text-4xl font-extrabold text-ink-900 font-display tracking-tight">
            Contact Our Team
          </h1>
          <p className="text-sm text-ink-600 max-w-md mx-auto mt-2">
            Have questions about our blueprints, support systems, or features? Send us a message and
            we'll reply as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start mt-8">
          {/* Left Column: Direct Info & Socials */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card p-8 rounded-2xl border border-ink-200/70 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-ink-900">Contact Information</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-paper-2 rounded-lg text-plum shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                      Email Address
                    </h4>
                    <p className="text-sm text-ink-600 font-medium mt-0.5">
                      <a href="mailto:Info@wellmindly.com" className="hover:text-plum transition-colors">
                        Info@wellmindly.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-paper-2 rounded-lg text-teal shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                      Phone Number
                    </h4>
                    <p className="text-sm text-ink-600 font-medium mt-0.5">
                      <a href="tel:+971507312108" className="hover:text-teal transition-colors">
                        +971 50 731 2108
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-paper-2 rounded-lg text-teal shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                      How we reply
                    </h4>
                    <p className="text-sm text-ink-600 font-medium mt-0.5">
                      Messages sent through this form are recorded and reviewed by the team, and we
                      reply by email.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-paper-2 rounded-lg text-coral shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                      Regions we're onboarding
                    </h4>
                    <p className="text-sm text-ink-600 font-medium mt-0.5">
                      UAE, Oman, Malaysia, Australia, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Connect Card */}
            <div className="bg-card p-8 rounded-2xl border border-ink-200/70 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-ink-900 uppercase tracking-wider">
                Follow Us On Social Media
              </h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Connect with us for student advocacy tips, update notices, and new blueprint
                announcements.
              </p>
              <div className="pt-2">
                <SocialLinks
                  links={[
                    { platform: "instagram", href: "https://instagram.com/wellmindly" },
                    { platform: "linkedin", href: "https://linkedin.com/company/wellmindly" },
                    { platform: "youtube", href: "https://www.youtube.com/@WellMindly" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-card p-8 rounded-2xl border border-ink-200/70 shadow-sm">
              <h3 className="text-lg font-bold text-ink-900 mb-6">Send Us a Message</h3>

              <div ref={statusRef} tabIndex={-1}>
                {status.type === "success" && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-4 rounded-xl text-sm font-semibold mb-6 flex items-start gap-3 border bg-success-soft text-success border-success/20"
                  >
                    <Check className="w-5 h-5 shrink-0" />
                    <span>{status.message}</span>
                  </div>
                )}
                {status.type === "error" && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="p-4 rounded-xl text-sm font-semibold mb-6 flex items-start gap-3 border bg-danger-soft text-danger border-danger/20"
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{status.message}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <Input
                    label="Your Name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="text-base"
                  />

                  <Input
                    type="email"
                    label="Email Address"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@university.edu"
                    className="text-base"
                  />
                </div>

                <Input
                  label="Subject (Optional)"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Feedback, Feature Request, Inquiry..."
                  className="text-base"
                />

                <Textarea
                  label="Message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Describe your inquiry or suggestions here..."
                  className="text-base"
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    loadingLabel="Sending message"
                    leadingIcon={<Send className="w-4 h-4" />}
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter onCrisisClick={handleCrisisClick} />
    </div>
  );
}

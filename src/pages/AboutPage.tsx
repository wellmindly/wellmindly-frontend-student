import { motion } from "framer-motion";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";
import { Heart, Compass, Shield, Users, CheckCircle } from "lucide-react";

export function AboutPage() {
  const navigate = useNavigate();

  const handleCrisisClick = () => {
    navigate("/crisis");
  };

  const stats = [
    { label: "Daily Active Students", value: "12,000+" },
    { label: "Assessments Completed", value: "150,000+" },
    { label: "Partner Universities", value: "15+" },
    { label: "Privacy Satisfaction", value: "99.8%" },
  ];

  const corePillars = [
    {
      icon: <Compass className="w-6 h-6 text-plum" />,
      title: "Interactive Blueprints",
      description: "Self-discovery modules covering mental load, headspace, seasons, and personality without diagnostic clinical labels."
    },
    {
      icon: <Shield className="w-6 h-6 text-teal" />,
      title: "Absolute Privacy",
      description: "No institutional records, no admin tracking. Students control their data entirely, enabling honest reflection."
    },
    {
      icon: <Users className="w-6 h-6 text-coral" />,
      title: "Peer Engagement",
      description: "TalkMindly moderated chat rooms offering students community support without corporate clinical branding."
    }
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <LandingHeader onCrisisClick={handleCrisisClick} />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 bg-gradient-to-b from-paper-2/50 to-paper">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 bg-plum/10 text-plum rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
          >
            Who We Are
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-ink font-serif mb-6 leading-tight"
          >
            Fitting Alongside Campus Care to Help You Understand What You Carry
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed mb-8"
          >
            WellMindly is a student-first self-discovery and peer-support environment. We design space for students to reflect, connect, and seek resources privately before they reach a crisis point.
          </motion.p>
        </div>
      </section>

      {/* Services/Pillars Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink font-serif">What Services We Provide</h2>
          <p className="text-sm text-ink-soft mt-2 max-w-md mx-auto">Providing non-clinical tools that support students in their day-to-day journey.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {corePillars.map((pillar, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card p-8 rounded-2xl border border-line shadow-sm hover:shadow-md transition-shadow flex flex-col items-center md:items-start text-center md:text-left"
            >
              <div className="p-3 bg-paper-2 rounded-xl mb-4 inline-block">
                {pillar.icon}
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">{pillar.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Showable to Universities (Value Prop) */}
      <section className="py-16 px-6 bg-paper-2/40 border-y border-line w-full">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-teal font-bold text-xs uppercase tracking-wider block mb-2">Designed For Campus Communities</span>
            <h2 className="text-3xl font-extrabold text-ink font-serif mb-6 leading-snug">
              Why Universities Partner with WellMindly
            </h2>
            <p className="text-ink-soft text-sm leading-relaxed mb-6">
              Modern campus counseling centers are overwhelmed. WellMindly offers a preventative gateway that acts as a safe, anonymous precursor to clinical support systems.
            </p>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <span className="text-sm text-ink font-medium">De-escalates mild/moderate challenges through self-awareness and peer validation.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <span className="text-sm text-ink font-medium">Provides anonymous aggregate health trends to administrative stakeholders.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <span className="text-sm text-ink font-medium">Builds a culture of proactive care, reducing friction to onboard into official campus resources.</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-card p-6 rounded-2xl border border-line text-center">
                <div className="text-3xl font-extrabold text-plum font-serif mb-1">{stat.value}</div>
                <div className="text-xs text-ink-soft font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center max-w-3xl mx-auto">
        <Heart className="w-12 h-12 text-rose mx-auto mb-6 animate-pulse" />
        <h2 className="text-2xl md:text-3xl font-extrabold text-ink font-serif mb-4">Want to Bring WellMindly to Your Campus?</h2>
        <p className="text-sm text-ink-soft leading-relaxed max-w-lg mx-auto mb-8">
          Join leading universities in transforming student engagement with proactive tools. Explore our onboarding models or contact our support team.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => navigate("/university")}
            className="px-6 py-3 bg-plum text-white font-bold rounded-full text-xs shadow-md shadow-plum/20 hover:opacity-95 transition-all active:scale-95 cursor-pointer border-none"
          >
            Partner with Us
          </button>
          <button 
            onClick={() => navigate("/contact")}
            className="px-6 py-3 bg-navy text-white font-bold rounded-full text-xs shadow-md hover:opacity-95 transition-all active:scale-95 cursor-pointer border-none"
          >
            Get in Touch
          </button>
        </div>
      </section>

      <LandingFooter onCrisisClick={handleCrisisClick} />
    </div>
  );
}

import { motion } from "framer-motion";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";
import { Heart, Compass, Shield, Users, CheckCircle } from "lucide-react";
import { Button } from "../components/ui";

export function AboutPage() {
  const navigate = useNavigate();

  const handleCrisisClick = () => {
    navigate("/crisis");
  };

  const corePillars = [
    {
      icon: <Compass className="w-6 h-6 text-plum" />,
      title: "Interactive Blueprints",
      description:
        "Self-discovery modules covering mental load, headspace, seasons, and personality without diagnostic clinical labels.",
    },
    {
      icon: <Shield className="w-6 h-6 text-teal" />,
      title: "Private by Default",
      description:
        "Reflection without a grade. Nothing you write here is scored, ranked, or handed back to you as a diagnosis.",
    },
    {
      icon: <Users className="w-6 h-6 text-coral" />,
      title: "Peer Engagement",
      description:
        "TalkMindly moderated chat rooms offering students community support without corporate clinical branding.",
    },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <LandingHeader onCrisisClick={handleCrisisClick} />

      <main id="main-content" tabIndex={-1}>
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
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-ink-900 font-display mb-6 leading-tight"
            >
              Fitting Alongside Campus Care to Help You Understand What You Carry
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-ink-600 max-w-2xl mx-auto leading-relaxed mb-8"
            >
              WellMindly is an accessible, evidence-informed mental health self-discovery platform tailored for modern university students.
            </motion.p>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="py-16 px-6 max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink-900 font-display">
              What Drives Our Mission
            </h2>
            <p className="text-sm text-ink-600 mt-2">
              Built to empower proactive student self-care before clinical intervention is needed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {corePillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card p-8 rounded-2xl border border-ink-200/70 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-3 bg-paper-2 rounded-xl w-fit mb-6">{pillar.icon}</div>
                <h3 className="text-lg font-bold text-ink-900 mb-3">{pillar.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mission Statement & Vision */}
        <section className="py-16 px-6 bg-paper-2 border-y border-ink-200/70">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink-900 font-display text-center mb-6">
              Bridging the Gap in Higher Education
            </h2>
            <p className="text-ink-600 text-sm leading-relaxed mb-6 text-center">
              Modern campus counseling centers are overwhelmed. WellMindly offers a preventative gateway that acts as a safe, anonymous precursor to clinical support systems.
            </p>
            <ul className="space-y-3.5 max-w-xl mx-auto">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <span className="text-sm text-ink-900 font-medium">
                  De-escalates mild/moderate challenges through self-awareness and peer validation.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <span className="text-sm text-ink-900 font-medium">
                  Provides anonymous aggregate trends to administrative stakeholders.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                <span className="text-sm text-ink-900 font-medium">
                  Builds a culture of proactive care, reducing friction to onboard into official campus resources.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 text-center max-w-3xl mx-auto">
          <Heart className="w-12 h-12 text-rose mx-auto mb-6" aria-hidden="true" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-ink-900 font-display mb-4">
            Want to Bring WellMindly to Your Campus?
          </h2>
          <p className="text-sm text-ink-600 leading-relaxed max-w-lg mx-auto mb-8">
            Bring WellMindly to your campus. We're onboarding institutions now, under a complimentary private beta.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary" onClick={() => navigate("/university")}>
              Partner with Us
            </Button>
            <Button
              onClick={() => navigate("/contact")}
              className="bg-ink-900 text-ink-50 hover:bg-ink-800"
            >
              Get in Touch
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter onCrisisClick={handleCrisisClick} />
    </div>
  );
}

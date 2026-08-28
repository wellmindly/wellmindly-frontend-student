import { motion } from "framer-motion";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { UniversityBenefits } from "../components/university/UniversityBenefits";
import { SampleReportSection } from "../components/university/SampleReportSection";
import { UniversityOnboardingForm } from "../components/university/UniversityOnboardingForm";

export function UniversityPage() {
  const navigate = useNavigate();

  const handleCrisisClick = () => {
    navigate("/crisis");
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <LandingHeader onCrisisClick={handleCrisisClick} />

      <main id="main-content" tabIndex={-1}>
        {/* Hero Banner */}
        <section className="py-20 px-6 bg-gradient-to-r from-ink-900 to-ink-700 text-ink-50">
          <div className="max-w-4xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-block px-3 py-1 bg-ink-50/10 text-gold rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            >
              Partnerships
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold font-display leading-tight mb-6"
            >
              Equipping Institutions with Preventive Mental Health Tools
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base text-ink-300 max-w-2xl mx-auto leading-relaxed"
            >
              Onboard your university with WellMindly to offer students private self-reflection modules, AI companions, and moderated community support before they experience burnout.
            </motion.p>
          </div>
        </section>

        {/* Benefits / Services Grid */}
        <section className="py-16 px-6 max-w-6xl mx-auto w-full">
          <UniversityBenefits />
        </section>

        {/* Sample Reports Section */}
        <section className="py-16 px-6 max-w-5xl mx-auto w-full border-t border-ink-200/60">
          <SampleReportSection />
        </section>

        {/* Form and Info Section */}
        <section className="py-16 px-6 bg-paper-2/40 border-y border-ink-200/70 w-full">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
            {/* Details Column */}
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-ink-900 font-display leading-snug">
                Bring WellMindly to Your Campus
              </h2>
              <p className="text-sm text-ink-600 leading-relaxed">
                We collaborate with administration leaders, student affairs directors, and counseling center managers to build secure onboarding models tailored for your size.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-ink-900">Zero Setup Fees</h4>
                    <p className="text-xs text-ink-600 mt-0.5">
                      Custom school landing portal configured within 3 business days.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-ink-900">Private Beta Onboarding</h4>
                    <p className="text-xs text-ink-600 mt-0.5">
                      Enable student registration for your domain on our cloud environment instantly.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-ink-900">Co-Branded Directory Customization</h4>
                    <p className="text-xs text-ink-600 mt-0.5">
                      Embed your specific crisis hotline resources, scheduling links, and office maps directly into the portal.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Section (Future placeholder) */}
              <div className="bg-card p-6 rounded-2xl border border-ink-200/80 mt-8">
                <span className="text-2xs font-bold text-plum uppercase tracking-wider block mb-1">
                  Pricing Model
                </span>
                <h4 className="text-sm font-bold text-ink-900">
                  Flexible Campus Licensing (Pricing Coming Soon)
                </h4>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  We are currently onboarding institutions under a complimentary Private Beta Program for the upcoming semester. Active beta partners will receive priority pricing structures thereafter.
                </p>
              </div>
            </div>

            {/* Form Column */}
            <UniversityOnboardingForm />
          </div>
        </section>
      </main>

      <LandingFooter onCrisisClick={handleCrisisClick} />
    </div>
  );
}

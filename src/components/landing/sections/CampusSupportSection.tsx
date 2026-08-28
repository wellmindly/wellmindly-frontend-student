import { Link } from "react-router-dom";
import { ShieldCheck, Building2, LifeBuoy, ArrowRight } from "lucide-react";
import { buttonClasses } from "../../ui";

export interface CampusSupportSectionProps {
  className?: string;
}

export function CampusSupportSection({ className }: CampusSupportSectionProps) {
  return (
    <section
      className={`py-16 sm:py-20 border-t border-ink-200 ${className || ""}`}
      id="campus-support"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-2xs font-bold text-plum-600 uppercase tracking-wide block mb-3">
            Institutional Trust
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink-900 text-balance">
            Your business, not your campus's
          </h2>
          <p className="text-base text-ink-600 max-w-2xl text-pretty mt-3">
            WellMindly is a private space for you. We never share individual check-ins, messages, or identities with your institution.
          </p>
        </div>
        <Link
          to="/university"
          className={buttonClasses("secondary", "md", "shrink-0 min-h-11 justify-center")}
        >
          For universities
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {/* Item 1: Private by default */}
        <div className="bg-card border border-ink-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-sage-50 text-sage-700 flex items-center justify-center mb-4">
            <ShieldCheck className="h-5 w-5 text-sage-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-900 mb-1.5">
              Private by default
            </h3>
            <p className="text-sm text-ink-600 leading-relaxed">
              We do not share your individual details, journals, or chat conversations with your university or peers.
            </p>
          </div>
        </div>

        {/* Item 2: Works with your campus */}
        <div className="bg-card border border-ink-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-sage-50 text-sage-700 flex items-center justify-center mb-4">
            <Building2 className="h-5 w-5 text-sage-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-900 mb-1.5">
              Works with your campus
            </h3>
            <p className="text-sm text-ink-600 leading-relaxed">
              Your campus sees aggregate wellbeing trends only, never individual check-ins, messages, or identities.
            </p>
          </div>
        </div>

        {/* Item 3: Help when it's urgent */}
        <div className="bg-card border border-ink-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-coral-50 text-coral-700 flex items-center justify-center mb-4">
            <LifeBuoy className="h-5 w-5 text-coral-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-900 mb-1.5">
              Help when it's urgent
            </h3>
            <p className="text-sm text-ink-600 leading-relaxed">
              Confidential crisis hotlines and grounding tools are listed by country on our crisis page.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

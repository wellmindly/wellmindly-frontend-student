import { BarChart2, ShieldCheck, School } from "lucide-react";

const BENEFITS = [
  {
    icon: <BarChart2 className="w-8 h-8 text-plum" />,
    title: "Anonymized Analytics",
    description:
      "Gain macro-level reports on student wellness categories and timelines. Track campus-wide sentiment trends without violating personal student trust.",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-teal" />,
    title: "Secure Domain Gating",
    description:
      "Restrict registrations to verified university email domains (e.g. wellmindly.com) instantly. Safe, secure, and isolated database clusters.",
  },
  {
    icon: <School className="w-8 h-8 text-coral" />,
    title: "Integration With On-Campus Care",
    description:
      "Connect students who flag high distress directly to your campus counseling center, local hotlines, and health clinics.",
  },
];

export function UniversityBenefits() {
  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-extrabold text-ink-900 font-display">
          What Universities Gain
        </h2>
        <p className="text-sm text-ink-600 mt-2">
          Preventive care that protects students and reduces load on counseling systems.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {BENEFITS.map((benefit, idx) => (
          <div
            key={idx}
            className="bg-card p-8 rounded-2xl border border-ink-200/70 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-4">{benefit.icon}</div>
            <h3 className="text-lg font-bold text-ink-900 mb-2">{benefit.title}</h3>
            <p className="text-sm text-ink-600 leading-relaxed">{benefit.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}

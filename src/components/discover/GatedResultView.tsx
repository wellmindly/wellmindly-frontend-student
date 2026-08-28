import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Badge, SectionHeader } from "../ui";

interface GatedResultViewProps {
  curId: string;
  onBackClick: () => void;
}

export function GatedResultView({ curId, onBackClick }: GatedResultViewProps) {
  const navigate = useNavigate();

  // Custom teaser copy depending on the quiz type
  const getTeaserInfo = (id: string) => {
    switch (id) {
      case "checkin":
        return {
          header: "Emotional snapshot captured!",
          desc: "We've mapped your well-being snapshot across 6 dimensions. Your responses indicate a specific emotional posture today, but you need to log in to see the full detailed profile.",
          feature: "Emotional dimensions breakdown",
        };
      case "mood":
        return {
          header: "Mood snapshot recorded!",
          desc: "Your mood snapshot tile has been created. To add it to your personal wellness board and track it over time, please create an account.",
          feature: "Daily mood tiles & tracking",
        };
      case "strengths":
        return {
          header: "Signature strengths mapped!",
          desc: "Your top 5 signature strengths have been calculated! Log in to reveal your signature strength cards and share them.",
          feature: "Top 5 character strengths card",
        };
      case "bigfive":
        return {
          header: "Personality archetype ready!",
          desc: "Your Big Five personality traits have been calculated, revealing your distinct character archetype. Sign up to unlock your detailed archetype report.",
          feature: "Big Five character archetype report",
        };
      case "values":
        return {
          header: "Personal values mapped!",
          desc: "Your core personal values have been mapped based on your choices. Log in to see your leading values and second-tier drivers.",
          feature: "Leading values hierarchy card",
        };
      case "strengthshadow":
        return {
          header: "Strength & shadow analyzed!",
          desc: "Your core strength and its shadow (the flip side of your greatest trait) have been analyzed. Sign up to read your detailed shadow warnings and tips.",
          feature: "Personal strength & shadow card",
        };
      default:
        return {
          header: "Self-reflection complete!",
          desc: "Your results are analyzed and ready to view. Sign in or create a free student account to unlock your full detailed report.",
          feature: "Personalized wellness insights",
        };
    }
  };

  const teaser = getTeaserInfo(curId);

  return (
    <Card padding="lg" elevation="floating" className="relative overflow-hidden text-center">
      {/* Decorative Aura Glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-plum-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-sage-500/5 blur-3xl" />

      {/* Lock Icon Header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-plum-100 text-plum-600 shadow-sm"
      >
        <Lock className="h-7 w-7" />
      </motion.div>

      <SectionHeader align="center" as="h2" title={teaser.header} description={teaser.desc} />

      <Card elevation="sunken" padding="md" className="mx-auto mt-8 max-w-sm">
        <Badge tone="primary" icon={<Sparkles />}>Unlocks with Account</Badge>
        <p className="mt-2.5 text-xs font-bold leading-normal text-ink-600">
          Unlock your <b className="font-bold text-plum-700">{teaser.feature}</b>.
        </p>
      </Card>

      {/* Redirection CTAs */}
      <div className="mx-auto mt-8 flex max-w-md flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <Button onClick={() => navigate(`/login?redirect=/discover&testId=${curId}`)}>
          Sign up / Sign in
        </Button>
        <Button variant="outline" onClick={onBackClick}>
          Back to all tests
        </Button>
      </div>
    </Card>
  );
}

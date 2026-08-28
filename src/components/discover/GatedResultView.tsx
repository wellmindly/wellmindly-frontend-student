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
          header: "Check-in completed",
          desc: "We've mapped your wellbeing responses across key areas. Sign in to view your complete breakdown and history.",
          feature: "Emotional wellbeing breakdown",
        };
      case "mood":
        return {
          header: "Mood logged",
          desc: "Your mood entry is ready. Create a free student account to save it to your wellness board and see how you trend over time.",
          feature: "Daily mood history and trends",
        };
      case "strengths":
        return {
          header: "Your strengths are ready",
          desc: "We've identified your top 5 strengths from your responses. Sign in to view your full strengths card.",
          feature: "Top 5 character strengths card",
        };
      case "bigfive":
        return {
          header: "Personality profile ready",
          desc: "Your Big Five personality traits have been calculated. Sign in to see your full personality profile.",
          feature: "Big Five personality profile",
        };
      case "values":
        return {
          header: "Core values mapped",
          desc: "Your primary personal values have been mapped from your answers. Sign in to explore your top values and motivators.",
          feature: "Core values summary card",
        };
      case "strengthshadow":
        return {
          header: "Strengths and growth areas ready",
          desc: "We've mapped your primary strengths alongside potential blind spots. Sign in to read your personalized reflection guide.",
          feature: "Personal strengths and growth card",
        };
      default:
        return {
          header: "Reflection completed",
          desc: "Your responses are ready. Sign in or create a free student account to see your full report.",
          feature: "Personalized reflection report",
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
          View your <b className="font-bold text-plum-700">{teaser.feature}</b>.
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

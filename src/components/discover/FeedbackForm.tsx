import { useId, useState } from "react";
import { motion } from "framer-motion";
import { Check, Send } from "lucide-react";
import api from "../../services/api";
import { Button, Card, Chip, Textarea } from "../ui";
import { scaleIn } from "../../lib/motion";

interface FeedbackFormProps {
  resultId: string;
  onComplete: () => void;
}

export function FeedbackForm({ resultId, onComplete }: FeedbackFormProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [firstFeeling, setFirstFeeling] = useState("");
  const [feltSeen, setFeltSeen] = useState("");
  const [wouldUse, setWouldUse] = useState<string | null>(null);
  const [reachFirst, setReachFirst] = useState<string | null>(null);
  const [feltOff, setFeltOff] = useState("");
  const [wouldChange, setWouldChange] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const ratingId = useId();
  const wouldUseId = useId();
  const reachFirstId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === null) {
      setError("Please tell us how useful this was.");
      return;
    }
    if (!wouldUse) {
      setError("Please select if you would actually use something like this.");
      return;
    }
    if (!reachFirst) {
      setError("Please select which option you would reach for first.");
      return;
    }

    setSubmitting(true);
    setError(null);

    // Serialize all answers into the comments field
    const formattedComments = [
      `In the first few seconds, what did you feel?\n${firstFeeling || "(No answer)"}`,
      `Did anything here feel like it was describing you?\n${feltSeen || "(No answer)"}`,
      `Would you actually use something like this?\n${wouldUse}`,
      `Which would you reach for first?\n${reachFirst}`,
      `What felt off, fake, or like "just an app"?\n${feltOff || "(No answer)"}`,
      `Anything you'd change or wish it did?\n${wouldChange || "(No answer)"}`,
    ].join("\n\n");

    try {
      await api.post(`/quizzes/${resultId}/feedback`, {
        rating,
        comments: formattedComments,
      });
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2500);
    } catch (err) {
      console.error("Failed to submit quiz feedback:", err);
      setError("Unable to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div variants={scaleIn} initial="hidden" animate="show">
        <Card tone="sage" padding="md" elevation="flat" className="space-y-2.5 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sage-100 text-sage-700">
            <Check aria-hidden className="h-5 w-5" />
          </span>
          <h2 className="font-display text-base font-semibold text-sage-800">
            Thank you for being honest!
          </h2>
          <p className="text-sm leading-relaxed text-sage-700">
            That actually helps more than you know. Thank you for your feedback.
          </p>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card padding="lg" elevation="raised" className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-lg font-semibold text-ink-900">
          Before you go, tell us the truth.
        </h2>
        <p className="text-sm text-ink-600">There are no wrong answers, only honest ones.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Q0 - rating */}
        <div className="space-y-2.5">
          <h3 id={ratingId} className="text-sm font-semibold text-ink-800">
            How useful was this report to you?
          </h3>
          <div role="group" aria-labelledby={ratingId} className="flex flex-wrap gap-2">
            {[
              { value: 1, label: "Not at all" },
              { value: 2, label: "A little" },
              { value: 3, label: "Somewhat" },
              { value: 4, label: "Quite a bit" },
              { value: 5, label: "A lot" },
            ].map((opt) => (
              <Chip
                key={opt.value}
                selected={rating === opt.value}
                onClick={() => {
                  setRating(opt.value);
                  setError(null);
                }}
              >
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Q1 */}
        <Textarea
          label="In the first few seconds, what did you feel?"
          value={firstFeeling}
          onChange={(e) => setFirstFeeling(e.target.value)}
          placeholder="Tell us what initially came to mind..."
        />

        {/* Q2 */}
        <Textarea
          label="Did anything here feel like it was describing you?"
          value={feltSeen}
          onChange={(e) => setFeltSeen(e.target.value)}
          placeholder="Did the report or check-ins feel accurate?"
        />

        {/* Q3 */}
        <div className="space-y-2.5">
          <h3 id={wouldUseId} className="text-sm font-semibold text-ink-800">
            Would you actually use something like this?
          </h3>
          <div role="group" aria-labelledby={wouldUseId} className="flex flex-wrap gap-2">
            {["Yes, definitely", "Maybe", "Probably not"].map((opt) => (
              <Chip
                key={opt}
                selected={wouldUse === opt}
                onClick={() => {
                  setWouldUse(opt);
                  setError(null);
                }}
              >
                {opt}
              </Chip>
            ))}
          </div>
        </div>

        {/* Q4 */}
        <div className="space-y-2.5">
          <h3 id={reachFirstId} className="text-sm font-semibold text-ink-800">
            Which would you reach for first?
          </h3>
          <div role="group" aria-labelledby={reachFirstId} className="flex flex-wrap gap-2">
            {["Write on my own", "Talk with others", "Not sure"].map((opt) => (
              <Chip
                key={opt}
                selected={reachFirst === opt}
                onClick={() => {
                  setReachFirst(opt);
                  setError(null);
                }}
              >
                {opt}
              </Chip>
            ))}
          </div>
        </div>

        {/* Q5 */}
        <Textarea
          label={'What felt off, fake, or like "just an app"?'}
          value={feltOff}
          onChange={(e) => setFeltOff(e.target.value)}
          placeholder="Be brutal: what was cringy or artificial?"
        />

        {/* Q6 */}
        <Textarea
          label="Anything you'd change or wish it did?"
          value={wouldChange}
          onChange={(e) => setWouldChange(e.target.value)}
          placeholder="Tell us what you wish was different..."
        />

        <p
          role="status"
          aria-live="polite"
          className="min-h-5 text-center text-xs font-medium text-danger"
        >
          {error}
        </p>

        <Button
          type="submit"
          fullWidth
          size="md"
          loading={submitting}
          loadingLabel="Submitting feedback…"
          disabled={rating === null || !wouldUse || !reachFirst}
          leadingIcon={<Send />}
        >
          Submit feedback
        </Button>
      </form>
    </Card>
  );
}

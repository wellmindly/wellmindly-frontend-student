import { Sheet, Button } from "../ui";
import { MoodFace } from "../ui/MoodFace";
import { moodByRatingOrNull } from "../../lib/mood";
import { cn } from "../../lib/cn";

export interface CheckinModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
  mood: number | null;
}

export function CheckinModal({
  show,
  onClose,
  title,
  message,
  mood,
}: CheckinModalProps) {
  const level = moodByRatingOrNull(mood);

  return (
    <Sheet
      open={show}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <Button fullWidth onClick={onClose}>
          Got it
        </Button>
      }
    >
      {level && (
        <div
          className={cn(
            "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl",
            level.soft,
            level.text
          )}
        >
          <MoodFace rating={level.rating} className="h-9 w-9" />
        </div>
      )}
      <p className="text-center text-sm leading-relaxed text-ink-600">{message}</p>
    </Sheet>
  );
}

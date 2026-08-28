import { useId } from "react";
import { cn } from "../../lib/cn";

const L5: [string, number][] = [
  ["Strongly agree", 5], 
  ["Agree", 4], 
  ["Neither", 3], 
  ["Disagree", 2], 
  ["Strongly disagree", 1]
];

interface LikertModeProps {
  intro: string;
  question: string;
  selected?: number;
  onPick: (v: number) => void;
  scale?: [string, number][];
}

export function LikertMode({ intro, question, selected, onPick, scale }: LikertModeProps) {
  const groupId = useId();
  const options = scale || L5;
  return (
    <div>
      <p className="text-ink-soft text-sm mb-4">{intro}</p>
      <h2 id={groupId} className="font-display font-medium text-xl sm:text-2xl leading-snug mb-5 text-ink-900">
        {question}
      </h2>
      <div role="group" aria-labelledby={groupId} className="flex flex-col gap-2.5">
        {options.map(([label, val]) => (
          <button
            key={val}
            type="button"
            onClick={() => onPick(val)}
            aria-pressed={selected === val}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-3.5 rounded-xl border px-5 py-4 text-left text-sm font-semibold transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
              selected === val
                ? "border-plum-500 bg-plum-50 text-plum-700 shadow-sm"
                : "border-line bg-card text-ink-800 hover:border-plum-300",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                selected === val ? "border-plum-500 bg-plum-500" : "border-ink-200",
              )}
            >
              {selected === val && <span className="h-2 w-2 rounded-full bg-card" />}
            </span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

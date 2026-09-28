import { AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";

export interface CrisisBannerProps {
  /** What "view helplines" does. Landing opens a modal; dashboard navigates to /crisis. */
  onAction: () => void;
  className?: string;
}

export function CrisisBanner({ onAction, className }: CrisisBannerProps) {
  return (
    <div
      className={cn(
        "w-full border-b border-coral-200 bg-coral-50 px-3 py-1.5 text-center",
        className,
      )}
    >
      <div className="inline-flex max-w-full items-center justify-center gap-1.5">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-coral-600" aria-hidden="true" />
        <span className="truncate text-2xs font-semibold text-coral-800 sm:text-xs">
          Need help right now?
        </span>
        <button
          type="button"
          onClick={onAction}
          className="inline-flex min-h-9 shrink-0 items-center whitespace-nowrap px-1 text-2xs font-bold text-coral-700 underline underline-offset-2 hover:text-coral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-500 sm:text-xs"
        >
          View helplines &rarr;
        </button>
      </div>
    </div>
  );
}

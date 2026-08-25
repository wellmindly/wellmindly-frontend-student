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
        "w-full border-b border-coral-200 bg-coral-50 px-4 py-2.5 text-center",
        className,
      )}
    >
      <div className="inline-flex items-center gap-2 flex-wrap justify-center">
        <AlertCircle className="h-4 w-4 shrink-0 text-coral-600" aria-hidden="true" />
        <span className="text-2xs font-semibold text-coral-800 sm:text-xs">
          Need help right now?
        </span>
        <button
          type="button"
          onClick={onAction}
          className="min-h-11 px-1 text-2xs font-bold text-coral-700 underline underline-offset-2 hover:text-coral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-500 sm:text-xs"
        >
          View support helplines &rarr;
        </button>
      </div>
    </div>
  );
}

import { cn } from "../../lib/cn";

export interface SkipLinkProps {
  targetId?: string;
  className?: string;
  label?: string;
}

export function SkipLink({
  targetId = "main-content",
  className,
  label = "Skip to main content",
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[var(--z-max)]",
        "focus:rounded-xl focus:bg-plum-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-plum-50",
        "focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-plum-400",
        className,
      )}
    >
      {label}
    </a>
  );
}

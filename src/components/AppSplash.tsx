import { cn } from "../lib/cn";

/**
 * Full-screen branded loading state, used while auth resolves and while a
 * lazily-loaded route chunk arrives. Deliberately calm and near-instant-looking
 * rather than a spinner on a white void - this is the first thing a returning
 * student sees, and it sets the tone for the whole product.
 */
export function AppSplash({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-paper px-6"
    >
      <span aria-hidden className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-breathe rounded-3xl bg-plum-200/60" />
        <span className="absolute inset-2 rounded-2xl bg-plum-500" />
      </span>
      <span className={cn("text-sm font-medium text-ink-500")}>{label}…</span>
    </div>
  );
}

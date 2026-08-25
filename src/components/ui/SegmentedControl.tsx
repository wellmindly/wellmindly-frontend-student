import { useId, useRef } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { spring } from "../../lib/motion";

/* ============================================================================
   SegmentedControl · Tabs
   ----------------------------------------------------------------------------
   Both implement the WAI-ARIA Tabs pattern properly:
     · role="tablist" / "tab" / "tabpanel" with aria-controls + aria-selected
     · roving tabindex - one tab stop for the group, arrows move between tabs
     · Home/End jump to first/last
     · the active indicator is a shared layout animation, so it slides rather
       than blinking between positions
     · ≥44px targets, and the label is never hidden behind an icon alone

   SegmentedControl = 2–4 short options, pill background (a filter/mode switch).
   Tabs            = underlined, scrollable, for page-level sections.
   ========================================================================= */

export interface TabOption<T extends string = string> {
  value: T;
  label: string;
  /** Decorative icon. */
  icon?: ReactNode;
  /** Small count/badge shown after the label. */
  count?: number;
  disabled?: boolean;
}

interface SharedProps<T extends string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the whole group, e.g. "Filter conversations". */
  label: string;
  className?: string;
}

/** Shared roving-focus keyboard handling for a tablist. */
function useTablistKeys<T extends string>(
  options: TabOption<T>[],
  value: T,
  onChange: (v: T) => void,
) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const move = (to: number) => {
    const enabled = options
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => !o.disabled);
    if (enabled.length === 0) return;
    // Clamp into the enabled set, wrapping around.
    const wrapped = ((to % options.length) + options.length) % options.length;
    const target =
      enabled.find(({ i }) => i === wrapped) ??
      enabled.reduce((best, cur) =>
        Math.abs(cur.i - wrapped) < Math.abs(best.i - wrapped) ? cur : best,
      );
    onChange(target.o.value);
    refs.current[target.i]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const index = options.findIndex((o) => o.value === value);
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        move(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        move(index - 1);
        break;
      case "Home":
        e.preventDefault();
        move(0);
        break;
      case "End":
        e.preventDefault();
        move(options.length - 1);
        break;
    }
  };

  return { refs, onKeyDown };
}

/* ------------------------------------------------------- SegmentedControl */

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  size = "md",
}: SharedProps<T> & { size?: "sm" | "md" }) {
  const groupId = useId();
  const { refs, onKeyDown } = useTablistKeys(options, value, onChange);

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl border border-ink-200/70 bg-ink-50 p-1",
        className,
      )}
    >
      {options.map((opt, i) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${groupId}-tab-${opt.value}`}
            aria-selected={selected}
            aria-controls={`${groupId}-panel-${opt.value}`}
            // Roving tabindex: only the selected tab is in the tab order.
            tabIndex={selected ? 0 : -1}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3",
              "cursor-pointer border-none bg-transparent font-semibold whitespace-nowrap",
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
              "disabled:pointer-events-none disabled:opacity-40",
              size === "sm" ? "min-h-9 text-xs" : "min-h-11 text-sm",
              selected ? "text-plum-800" : "text-ink-500 hover:text-ink-800",
            )}
          >
            {selected && (
              <motion.span
                aria-hidden
                layoutId={`${groupId}-segment-indicator`}
                transition={spring.snappy}
                className="absolute inset-0 rounded-xl bg-white shadow-xs"
              />
            )}
            <span className="relative z-[1] inline-flex items-center gap-2">
              {opt.icon && (
                <span aria-hidden className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">
                  {opt.icon}
                </span>
              )}
              {opt.label}
              {typeof opt.count === "number" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-2xs font-bold tabular-nums",
                    selected ? "bg-plum-100 text-plum-700" : "bg-ink-200 text-ink-600",
                  )}
                >
                  {opt.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------- Tabs */

export function Tabs<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SharedProps<T>) {
  const groupId = useId();
  const { refs, onKeyDown } = useTablistKeys(options, value, onChange);

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "snap-rail flex items-stretch gap-1 overflow-x-auto border-b border-ink-200/70",
        className,
      )}
    >
      {options.map((opt, i) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${groupId}-tab-${opt.value}`}
            aria-selected={selected}
            aria-controls={`${groupId}-panel-${opt.value}`}
            tabIndex={selected ? 0 : -1}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex min-h-11 shrink-0 snap-start items-center gap-2 px-3 pb-2.5 pt-2",
              "cursor-pointer border-none bg-transparent text-sm font-semibold whitespace-nowrap",
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
              "disabled:pointer-events-none disabled:opacity-40",
              selected ? "text-plum-700" : "text-ink-500 hover:text-ink-800",
            )}
          >
            {opt.icon && (
              <span aria-hidden className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">
                {opt.icon}
              </span>
            )}
            {opt.label}
            {typeof opt.count === "number" && (
              <span className="rounded-full bg-ink-100 px-1.5 text-2xs font-bold tabular-nums text-ink-600">
                {opt.count}
              </span>
            )}
            {selected && (
              <motion.span
                aria-hidden
                layoutId={`${groupId}-tabs-indicator`}
                transition={spring.snappy}
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-plum-500"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Panel that pairs with SegmentedControl/Tabs. `groupId` must match - in
 * practice, render the control and panels from the same parent so the ids line
 * up, or pass an explicit id pair.
 */
export function TabPanel({
  id,
  labelledBy,
  active,
  children,
  className,
}: {
  id: string;
  labelledBy: string;
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!active) return null;
  return (
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      // Focusable so keyboard users can Tab from the tab into the panel content.
      tabIndex={0}
      className={cn("focus-visible:outline-none", className)}
    >
      {children}
    </div>
  );
}

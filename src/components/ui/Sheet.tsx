import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { useFocusTrap } from "../../lib/a11y";
import { bottomSheet, dialogPanel, scrim } from "../../lib/motion";
import { Button, IconButton } from "./Button";

/* ============================================================================
   Sheet
   ----------------------------------------------------------------------------
   One component for both mobile and desktop overlays, because they are the same
   thing at different sizes:
     mobile  → bottom sheet, thumb-reachable, grab handle, swipe-down to dismiss
     ≥sm     → centred dialog

   Every overlay in the app goes through here so it inherits, for free:
     · role="dialog" + aria-modal + aria-labelledby
     · focus trap, Escape to close, focus returned to the trigger
     · background scroll lock without the page jumping
     · a real <button> close control with an accessible name
     · safe-area padding at the bottom on notched devices
   ========================================================================= */

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Sub-line under the title. */
  description?: ReactNode;
  children?: ReactNode;
  /** Pinned action row at the bottom - stays visible while the body scrolls. */
  footer?: ReactNode;
  /** Max width of the desktop dialog. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Hide the visible title row (title is still announced). */
  hideHeader?: boolean;
  /** Clicking the scrim closes. Turn off for destructive confirmations. */
  dismissOnScrimClick?: boolean;
  className?: string;
}

const SIZES = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
} as const;

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  hideHeader = false,
  dismissOnScrimClick = true,
  className,
}: SheetProps) {
  const { ref, dialogProps } = useFocusTrap<HTMLDivElement>(open, onClose);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.("(min-width: 640px)").matches,
  );

  // Sheet vs dialog changes the enter animation, so we need the real breakpoint
  // rather than guessing - Tailwind classes can't switch a JS variant.
  useEffect(() => {
    const mq = window.matchMedia?.("(min-width: 640px)");
    if (!mq) return;
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    // iOS Safari < 14 (still a real share of student phones) only has addListener.
    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener?.(onChange);
    return () => mq.removeListener?.(onChange);
  }, []);

  const titleId = `sheet-title-${title.replace(/\W+/g, "-").toLowerCase()}`;

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            variants={scrim}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={dismissOnScrimClick ? onClose : undefined}
            className="absolute inset-0 bg-ink-900/45 backdrop-blur-[3px]"
          />

          <motion.div
            ref={ref}
            {...dialogProps}
            aria-labelledby={titleId}
            variants={isDesktop ? dialogPanel : bottomSheet}
            initial="hidden"
            animate="show"
            exit="exit"
            drag={isDesktop ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              // Flick down or drag past ~110px dismisses, matching iOS/Android.
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-card",
              "rounded-t-4xl sm:rounded-3xl",
              "shadow-2xl",
              SIZES[size],
              className,
            )}
          >
            {/* Grab handle: mobile only, and it's the drag affordance. */}
            <div aria-hidden className="flex justify-center pt-2.5 pb-1 sm:hidden">
              <span className="h-1.5 w-10 rounded-full bg-ink-200" />
            </div>

            <div
              className={cn(
                "flex items-start gap-3 px-5 sm:px-6",
                hideHeader ? "sr-only" : "pt-3 pb-4 sm:pt-6",
              )}
            >
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="font-display text-xl font-semibold text-ink-900">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-sm text-ink-600">{description}</p>
                )}
              </div>
              {!hideHeader && (
                <IconButton
                  label="Close"
                  size="sm"
                  variant="ghost"
                  icon={<X />}
                  onClick={onClose}
                  className="-mr-2 -mt-1"
                />
              )}
            </div>

            {children && (
              <div
                className={cn(
                  "scroll-panel min-h-0 flex-1 px-5 sm:px-6",
                  // Without a footer the body is the last thing on screen, so it
                  // owns the safe-area inset on notched devices.
                  footer ? "pb-5 sm:pb-6" : "pb-[calc(1.25rem+var(--safe-area-bottom))] sm:pb-6",
                )}
              >
                {children}
              </div>
            )}

            {footer && (
              <div className="border-t border-ink-100 bg-card/95 px-5 py-4 pb-[calc(1rem+var(--safe-area-bottom))] backdrop-blur-sm sm:px-6 sm:pb-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ------------------------------------------------------------- ConfirmSheet */

export interface ConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive. */
  destructive?: boolean;
  loading?: boolean;
}

/**
 * Replacement for the native `confirm()` calls scattered through the app -
 * those can't be styled, can't be dismissed by keyboard consistently, and on
 * mobile web they look like a browser error.
 */
export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
}: ConfirmSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      dismissOnScrimClick={!loading}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            data-autofocus
          >
            {confirmLabel}
          </Button>
        </div>
      }
    />
  );
}

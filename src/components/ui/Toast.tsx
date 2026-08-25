import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import { toast as toastVariants } from "../../lib/motion";

/* ============================================================================
   Toast
   ----------------------------------------------------------------------------
   Transient confirmation. Deliberate constraints:
     · announced via aria-live="polite" - never steals focus mid-task
     · the dismiss button is real, so a toast is never keyboard-inescapable
     · auto-dismiss pauses on hover/focus, so it can actually be read
     · bottom-centre above the nav on mobile, top-right on desktop
     · errors do NOT auto-dismiss - the user must acknowledge them
   ========================================================================= */

export type ToastTone = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  /** Optional single action, e.g. "Undo". */
  action?: { label: string; onClick: () => void };
  duration: number;
}

interface ToastApi {
  toast: (
    message: string,
    opts?: { tone?: ToastTone; duration?: number; action?: ToastItem["action"] },
  ) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Access the toast queue. Throws if used outside the provider, by design. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const TONES: Record<ToastTone, { cls: string; icon: ReactNode; role: "status" | "alert" }> = {
  success: {
    cls: "bg-white border-success/25 text-ink-900",
    icon: <CheckCircle2 className="h-5 w-5 text-success" />,
    role: "status",
  },
  error: {
    cls: "bg-white border-danger/30 text-ink-900",
    icon: <XCircle className="h-5 w-5 text-danger" />,
    role: "alert",
  },
  warning: {
    cls: "bg-white border-warning/30 text-ink-900",
    icon: <AlertTriangle className="h-5 w-5 text-warning" />,
    role: "status",
  },
  info: {
    cls: "bg-white border-plum-200 text-ink-900",
    icon: <Info className="h-5 w-5 text-plum-600" />,
    role: "status",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastApi["toast"]>((message, opts) => {
    const tone = opts?.tone ?? "success";
    setItems((prev) => {
      const item: ToastItem = {
        id: nextId.current++,
        message,
        tone,
        action: opts?.action,
        // Errors persist until acknowledged; everything else self-dismisses.
        duration: opts?.duration ?? (tone === "error" ? 0 : 4500),
      };
      // Cap the stack so a loop can't paper over the screen.
      return [...prev, item].slice(-3);
    });
  }, []);

  const api = useMemo<ToastApi>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      // The live region must exist in the DOM before the message arrives,
      // otherwise many screen readers never announce it.
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        "pointer-events-none fixed z-[var(--z-modal)] flex flex-col gap-2",
        // Mobile: above the bottom nav, full width minus gutters.
        "inset-x-3 bottom-[calc(var(--bottom-nav-height)+var(--safe-area-bottom)+0.75rem)]",
        // Desktop: top-right, out of the way of content.
        "sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-6 sm:w-96",
      )}
    >
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const [paused, setPaused] = useState(false);
  const tone = TONES[item.tone];

  useEffect(() => {
    if (item.duration <= 0 || paused) return;
    const t = window.setTimeout(() => onDismiss(item.id), item.duration);
    return () => window.clearTimeout(t);
  }, [item.duration, item.id, paused, onDismiss]);

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      role={tone.role}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg",
        tone.cls,
      )}
    >
      <span aria-hidden className="mt-px shrink-0">
        {tone.icon}
      </span>
      <p className="min-w-0 flex-1 text-sm font-medium leading-snug">{item.message}</p>

      {item.action && (
        <button
          type="button"
          onClick={() => {
            item.action?.onClick();
            onDismiss(item.id);
          }}
          className={cn(
            "shrink-0 cursor-pointer rounded-lg border-none bg-transparent px-2 py-1",
            "text-sm font-bold text-plum-600 transition-colors hover:bg-plum-50",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
          )}
        >
          {item.action.label}
        </button>
      )}

      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className={cn(
          "-mr-1.5 -mt-1 shrink-0 cursor-pointer rounded-lg border-none bg-transparent p-2",
          "text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
        )}
      >
        <X aria-hidden className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

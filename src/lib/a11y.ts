import { useCallback, useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusableWithin(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

/**
 * Make a dialog behave like a dialog: trap Tab inside it, close on Escape, lock
 * background scroll, and return focus to whatever opened it.
 *
 * Attach the returned ref to the dialog panel and spread `dialogProps` onto it.
 *
 *   const { ref, dialogProps } = useFocusTrap(open, onClose);
 *   <div ref={ref} {...dialogProps} aria-labelledby="my-title"> … </div>
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  active: boolean,
  onClose?: () => void,
  options: { closeOnEscape?: boolean; autoFocus?: boolean } = {},
) {
  const { closeOnEscape = true, autoFocus = true } = options;
  const ref = useRef<T | null>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  // Keep the latest onClose without re-running the effect on every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!active) return;
    const panel = ref.current;
    if (!panel) return;

    restoreTo.current = document.activeElement as HTMLElement | null;

    if (autoFocus) {
      // Prefer an explicitly marked target, else the first focusable, else the
      // panel itself - so screen readers announce the dialog, not the page.
      const preferred = panel.querySelector<HTMLElement>("[data-autofocus]");
      const target = preferred ?? focusableWithin(panel)[0] ?? panel;
      if (target === panel && !panel.hasAttribute("tabindex")) {
        panel.setAttribute("tabindex", "-1");
      }
      // Defer past the mount/animation frame so the element is really visible.
      const raf = requestAnimationFrame(() => target.focus({ preventScroll: true }));
      return () => cancelAnimationFrame(raf);
    }
  }, [active, autoFocus]);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = ref.current;
      if (!panel) return;
      const items = focusableWithin(panel);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const activeEl = document.activeElement;

      if (e.shiftKey && (activeEl === first || activeEl === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      } else if (activeEl && !panel.contains(activeEl)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [active, closeOnEscape]);

  // Lock background scroll while open, compensating for the scrollbar so the
  // page behind doesn't visibly jump.
  useEffect(() => {
    if (!active) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [active]);

  // Restore focus to the trigger on unmount/close.
  useEffect(() => {
    if (active) return;
    const el = restoreTo.current;
    if (!el) return;
    restoreTo.current = null;
    if (document.body.contains(el)) el.focus({ preventScroll: true });
  }, [active]);

  return {
    ref,
    dialogProps: {
      role: "dialog" as const,
      "aria-modal": true as const,
    },
  };
}

/** Run a handler when a pointer press lands outside `ref`. */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  active: boolean,
  onOutside: () => void,
) {
  const ref = useRef<T | null>(null);
  const handlerRef = useRef(onOutside);
  handlerRef.current = onOutside;

  useEffect(() => {
    if (!active) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (el && !el.contains(e.target as Node)) handlerRef.current();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [active]);

  return ref;
}

/**
 * Roving-focus keyboard handler for listbox/combobox/menu patterns.
 * Returns an onKeyDown to spread onto the container.
 */
export function useRovingKeys(opts: {
  itemCount: number;
  activeIndex: number;
  onActiveIndexChange: (i: number) => void;
  onSelect: (i: number) => void;
  onDismiss?: () => void;
  orientation?: "vertical" | "horizontal";
}) {
  const {
    itemCount,
    activeIndex,
    onActiveIndexChange,
    onSelect,
    onDismiss,
    orientation = "vertical",
  } = opts;

  const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
  const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";

  return useCallback(
    (e: React.KeyboardEvent) => {
      if (itemCount === 0) return;
      switch (e.key) {
        case nextKey:
          e.preventDefault();
          onActiveIndexChange((activeIndex + 1) % itemCount);
          break;
        case prevKey:
          e.preventDefault();
          onActiveIndexChange((activeIndex - 1 + itemCount) % itemCount);
          break;
        case "Home":
          e.preventDefault();
          onActiveIndexChange(0);
          break;
        case "End":
          e.preventDefault();
          onActiveIndexChange(itemCount - 1);
          break;
        case "Enter":
          if (activeIndex >= 0) {
            e.preventDefault();
            onSelect(activeIndex);
          }
          break;
        case "Escape":
          onDismiss?.();
          break;
      }
    },
    [itemCount, activeIndex, onActiveIndexChange, onSelect, onDismiss, nextKey, prevKey],
  );
}

/**
 * Read the user's reduced-motion preference at call time and scroll to an element.
 * Programmatic smooth scrolls ignore the stylesheet's `scroll-behavior: auto !important`,
 * so this helper switches to "auto" when prefers-reduced-motion is active.
 */
export function scrollToElement(
  el: Element | null | undefined,
  options?: ScrollIntoViewOptions,
) {
  if (!el) return;
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    ...options,
  });
}

/** Single place that reads the media query, so no caller can forget to. */
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Send the window back to the top, smoothly unless the user asked for less motion.
 * Same caveat as `scrollToElement`: a programmatic smooth scroll ignores the
 * stylesheet's `scroll-behavior` override, so the preference is read here.
 */
export function scrollToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/**
 * Return to the top whenever `key` changes - a route path, a dashboard tab, a
 * step in a flow. Skips the first run so landing deep in a page (or on a hash
 * link) is not yanked upward.
 */
export function useScrollTopOnChange(key: unknown) {
  const previous = useRef(key);
  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    scrollToTop();
  }, [key]);
}



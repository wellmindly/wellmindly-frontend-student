import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/* ============================================================================
   native.ts - the thin native-integration layer
   ----------------------------------------------------------------------------
   The student app ships to the web AND to a Capacitor Android APK from the same
   React build. On the web every function here is a no-op, so callers never need
   to branch. On device these are the touches that separate a native app from a
   wrapped webpage: haptic feedback, a themed status bar, a real cold-start
   splash, keyboard resize, and a working hardware back button.

   Every native call is fire-and-forget and error-swallowed: a missing plugin or
   a failed bridge call must never take down a UI interaction. Polish is optional;
   the tap it decorates is not.
   ========================================================================= */

const native = Capacitor.isNativePlatform();

export const isNativeApp = (): boolean => native;

/** Run a native call, swallowing rejection. No-op on web. */
function run(fn: () => Promise<unknown> | void): void {
  if (!native) return;
  try {
    const result = fn();
    if (result && typeof (result as Promise<unknown>).catch === "function") {
      (result as Promise<unknown>).catch(() => {});
    }
  } catch {
    /* plugin unavailable or bridge error - never let native polish throw */
  }
}

/* ------------------------------------------------------------------ haptics */
/* Light tap for taps/nav, a firmer impact for confirmations, and the OS
   "success" pattern for a completed action (check-in saved, feedback sent). */
export const hapticTap = (): void => run(() => Haptics.impact({ style: ImpactStyle.Light }));
export const hapticImpact = (): void => run(() => Haptics.impact({ style: ImpactStyle.Medium }));
export const hapticSuccess = (): void =>
  run(() => Haptics.notification({ type: NotificationType.Success }));

/* --------------------------------------------------------------- status bar */
/* "light" = a light app surface, so the OS needs dark icons (Style.Light).
   "dark"  = the immersive dark surface (TalkMindly), so it needs light icons. */
export function setStatusBarTheme(theme: "light" | "dark"): void {
  run(() => StatusBar.setStyle({ style: theme === "dark" ? Style.Dark : Style.Light }));
}

/* ------------------------------------------------------------------- splash */
export const hideSplash = (): void => run(() => SplashScreen.hide());

/* ------------------------------------------------------------- back button */
/* A stack of consumers, most-recent-first. A handler returns true when it has
   handled the back press (e.g. closed a drawer); the global listener then stops.
   If nobody consumes it, we walk the SPA history, and exit the app only when
   there is nowhere left to go - the platform-correct Android behaviour. */
type BackHandler = () => boolean;
const backHandlers: BackHandler[] = [];

export function registerBackHandler(handler: BackHandler): () => void {
  backHandlers.push(handler);
  return () => {
    const i = backHandlers.indexOf(handler);
    if (i !== -1) backHandlers.splice(i, 1);
  };
}

/* --------------------------------------------------------------- bootstrap */
/* Called once, before render. Sets up the status bar, keyboard resize, and the
   hardware back button. Idempotent and safe to call on web (no-op). */
export function initNativeShell(): void {
  if (!native) return;

  // Lets index.css apply native-only rules (no overscroll glow, non-selectable
  // chrome) without those leaking into the web build from the same bundle.
  document.documentElement.classList.add("native");

  run(async () => {
    // Keep the webview BELOW the status bar. Drawing behind it relied on
    // env(safe-area-inset-top), which Android WebViews older than ~Chrome 136
    // report as 0px, so the crisis strip and header sat under the clock and
    // status icons (seen on an Android 13 emulator, WebView 109). `pt-safe`
    // stays harmless: with no overlay the inset is 0.
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: "#FFFFFF" });
    await StatusBar.setStyle({ style: Style.Light });
  });

  // Resize the whole webview when the keyboard opens so the fixed bottom nav
  // and inputs ride above it instead of being covered.
  run(() => Keyboard.setResizeMode({ mode: KeyboardResize.Native }));
  run(() => Keyboard.setAccessoryBarVisible({ isVisible: false })); // iOS-only, no-ops elsewhere

  // `canGoBack` comes from the WebView itself. `window.history.length` cannot
  // stand in for it: it counts forward entries too and never shrinks on back,
  // so after a single navigation the app could never be exited with back.
  run(() =>
    CapApp.addListener("backButton", ({ canGoBack }) => {
      for (let i = backHandlers.length - 1; i >= 0; i--) {
        if (backHandlers[i]()) return;
      }
      if (canGoBack) {
        window.history.back();
      } else {
        run(() => CapApp.exitApp());
      }
    }),
  );
}

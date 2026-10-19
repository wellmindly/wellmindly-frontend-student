import { config } from "../config";

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

let gaInitialized = false;
let clarityInitialized = false;

/**
 * Initializes Google Analytics 4 and Microsoft Clarity if their respective
 * IDs are present in the environment configuration.
 *
 * Safe & Zero-Dependency:
 * - If keys are absent, this is a clean no-op without network errors.
 * - In local development, logs simulated events for developer verification.
 * - Respects student privacy: masks inputs and anonymizes IP by default.
 */
export function initAnalytics(): void {
  // Prevent duplicate execution in StrictMode or fast reloads
  if (typeof window === "undefined") return;

  const { gaMeasurementId, clarityProjectId } = config;

  // 1. Google Analytics 4 (GA4)
  if (gaMeasurementId && !gaInitialized) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer?.push(arguments);
      };

      window.gtag("js", new Date());
      // send_page_view: false ensures we control SPA navigation accurately without double counting
      window.gtag("config", gaMeasurementId, {
        send_page_view: false,
        anonymize_ip: true,
      });

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
      document.head.appendChild(script);

      gaInitialized = true;
      if (import.meta.env.DEV) {
        console.info(`[Analytics] GA4 initialized with ID: ${gaMeasurementId}`);
      }
    } catch (err) {
      console.warn("[Analytics] Failed to initialize GA4:", err);
    }
  }

  // 2. Microsoft Clarity (Session recordings, heatmaps, behavior analysis)
  if (clarityProjectId && !clarityInitialized) {
    try {
      (function (c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
        c[a] =
          c[a] ||
          function () {
            // eslint-disable-next-line prefer-rest-params
            (c[a].q = c[a].q || []).push(arguments);
          };
        t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", clarityProjectId);

      clarityInitialized = true;
      if (import.meta.env.DEV) {
        console.info(`[Analytics] Microsoft Clarity initialized with ID: ${clarityProjectId}`);
      }
    } catch (err) {
      console.warn("[Analytics] Failed to initialize Microsoft Clarity:", err);
    }
  }

  if (import.meta.env.DEV && !gaMeasurementId && !clarityProjectId) {
    console.info(
      "[Analytics] In development mode with no tracking IDs set. Events will be logged to console only."
    );
  }
}

/**
 * Filter out sensitive personal details before dispatching to external analytics.
 * Protects student privacy: raw passwords, journal text, and email tokens are dropped.
 */
function sanitizeParams(
  params?: Record<string, string | number | boolean | undefined | null>
): Record<string, string | number | boolean> {
  if (!params) return {};
  const clean: Record<string, string | number | boolean> = {};

  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null) continue;
    const lowerKey = key.toLowerCase();
    // Never forward raw student email, passwords, notes, or message content
    if (
      lowerKey.includes("password") ||
      lowerKey.includes("journal") ||
      lowerKey.includes("message") ||
      lowerKey.includes("token")
    ) {
      continue;
    }
    // If an email address is passed, hash or truncate to domain for safety
    if (lowerKey === "email" && typeof val === "string") {
      const parts = val.split("@");
      clean[key] = parts.length > 1 ? `...@${parts[1]}` : "[masked]";
      continue;
    }
    clean[key] = val;
  }
  return clean;
}

/**
 * Track virtual pageviews across the React Single Page Application.
 */
export function trackPageView(path: string, title?: string): void {
  const pageTitle = title || document.title;
  const sanitizedPath = path.startsWith("/") ? path : `/${path}`;

  if (import.meta.env.DEV) {
    console.debug(`[Analytics:PageView] ${sanitizedPath} ("${pageTitle}")`);
  }

  if (window.gtag && config.gaMeasurementId) {
    window.gtag("event", "page_view", {
      page_path: sanitizedPath,
      page_title: pageTitle,
      page_location: window.location.origin + sanitizedPath,
    });
  }

  if (window.clarity && config.clarityProjectId) {
    window.clarity("set", "page", sanitizedPath);
  }
}

/**
 * Track custom student interaction events across GA4 and Microsoft Clarity.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined | null>
): void {
  const cleanParams = sanitizeParams(params);

  if (import.meta.env.DEV) {
    console.debug(`[Analytics:Event] ${eventName}`, cleanParams);
  }

  if (window.gtag && config.gaMeasurementId) {
    window.gtag("event", eventName, cleanParams);
  }

  if (window.clarity && config.clarityProjectId) {
    window.clarity("event", eventName);
  }
}

/**
 * Associate anonymous user classification (e.g. university student status)
 * without leaking personally identifiable student records.
 */
export function setStudentContext(context: {
  isUniversityStudent?: boolean;
  role?: string;
  anonymousId?: string;
}): void {
  if (window.clarity && config.clarityProjectId && context.anonymousId) {
    window.clarity("identify", context.anonymousId);
  }

  if (window.gtag && config.gaMeasurementId) {
    window.gtag("set", "user_properties", {
      is_uni_student: context.isUniversityStudent ? "yes" : "no",
      user_role: context.role || "guest",
    });
  }
}

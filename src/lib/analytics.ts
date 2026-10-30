/**
 * WellMindly Production Analytics & Consent Management System
 * 
 * Supports:
 * - Google Analytics 4 (GA4) with Basic Consent Mode (no tag loading before consent)
 * - Microsoft Clarity with Consent V2 and sensitive route exclusions
 * - First-party cookie & localStorage consent records with cross-subdomain sharing (.wellmindly.com)
 * - Multi-tab synchronization via BroadcastChannel & storage events
 * - Strict PII sanitization (passwords, tokens, journals, assessment answers, student records)
 * - Safe virtual SPA pageviews and clean UTM attribution tracking
 */

import { config as appConfig } from "../config";

/* ----------------------------------------------------------------------------
   Type Definitions
----------------------------------------------------------------------------- */
export type PlatformId = 'student' | 'counselor' | 'admin' | 'university';
export type Environment = 'development' | 'staging' | 'production';

export interface ConsentCategories {
  /** Core essential functionality (auth, security, session). Always true. */
  strictly_necessary: true;
  /** Aggregate usage telemetry, pageviews, and performance (GA4 & Clarity). */
  analytics: boolean;
  /** Advertising, remarketing, promotional campaigns. Disabled/not used. */
  marketing: boolean;
}

export type ConsentDecision = 'accepted_all' | 'rejected_all' | 'customized';

export interface ConsentRecord {
  version: number;
  timestamp: string;
  updatedAt: string;
  decision: ConsentDecision;
  categories: ConsentCategories;
}

export type ConsentListener = (consent: ConsentRecord | null) => void;

export interface AnalyticsConfig {
  platform: PlatformId;
  gaMeasurementId?: string;
  clarityProjectId?: string;
  /**
   * Microsoft Clarity eligibility gate: Clarity Terms of Use strictly prohibit
   * use on websites or apps targeting users under 18. Because WellMindly serves
   * students who may be minors and lacks an age-verification gate, Clarity is
   * disabled by default (false) until formal age verification is implemented.
   */
  enableClarity?: boolean;
  environment?: Environment;
  cookieDomain?: string;
  debug?: boolean;
}

export interface StandardEventParams {
  platform?: PlatformId;
  environment?: Environment;
  page_group?: string;
  source?: string;
  cta_id?: string;
  cta_location?: string;
  feature_id?: string;
  step_name?: string;
  category?: string;
  outcome?: 'started' | 'completed' | 'failed' | 'cancelled' | 'abandoned';
  duration_bucket?: string;
  rating?: number;
  is_university_student?: boolean;
  role?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

/* ----------------------------------------------------------------------------
   Constants & Event Taxonomy
----------------------------------------------------------------------------- */
export const CONSENT_VERSION = 1;
export const CONSENT_COOKIE_NAME = 'wm_consent_v1';
export const CONSENT_STORAGE_KEY = 'wellmindly_cookie_consent_v1';
export const CONSENT_MAX_AGE_SECONDS = 365 * 24 * 60 * 60; // 365 days
export const SYNC_CHANNEL_NAME = 'wellmindly_consent_sync';

export const ALLOWED_EVENTS = new Set([
  // Acquisition, Consent & Core Navigation
  'page_view',
  'cookie_consent_update',
  'primary_cta_clicked',
  'navigation_clicked',
  'waitlist_joined',
  'registration_started',
  'registration_completed',
  'login_completed',

  // Low-Risk Generic Product Engagement (Zero clinical or wellbeing state)
  'feature_opened',
  'onboarding_started',
  'onboarding_completed',
  'newsletter_signup_submitted',

  // Administrative & Institutional Navigation (Non-sensitive aggregations)
  'counselor_dashboard_viewed',
  'university_dashboard_viewed',
  'admin_dashboard_viewed',
  'admin_tab_switched',
]);

const PROHIBITED_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'auth',
  'jwt',
  'bearer',
  'code',
  'session',
  'journal',
  'reflection',
  'message',
  'transcript',
  'note',
  'prompt',
  'answer',
  'score',
  'diagnosis',
  'student_name',
  'first_name',
  'last_name',
  'phone',
  'address',
  'ssn',
];

const SENSITIVE_QUERY_PARAMS = [
  'token',
  'auth',
  'code',
  'access_token',
  'refresh_token',
  'id_token',
  'state',
  'session_id',
  'auth_token',
  'key',
  'email',
  'student_id',
  'user_id',
  'name',
  'phone',
  'password',
  'note',
  'message',
  'query',
  'search',
  'q',
  'answer',
  'score',
];

export const EXCLUDED_CLARITY_ROUTES = [
  '/crisis',
  '/dashboard?tab=talkmindly',
  '/students',
  '/sessions',
  '/moderation',
  '/counselor-mgmt',
];

/* ----------------------------------------------------------------------------
   Module State
----------------------------------------------------------------------------- */
const listeners: Set<ConsentListener> = new Set();
let broadcastChannel: BroadcastChannel | null = null;
let gaLoaded = false;
let gaScriptAppended = false;
let currentGaId: string | null = null;
let clarityLoaded = false;
let currentClarityId: string | null = null;

let activeConfig: AnalyticsConfig = {
  platform: 'student',
  gaMeasurementId: appConfig.gaMeasurementId,
  clarityProjectId: appConfig.clarityProjectId,
  enableClarity: false, // Explicitly disabled by default due to Microsoft Clarity under-18 restriction
  environment: (import.meta.env.MODE as Environment) || 'development',
  debug: import.meta.env.DEV,
};

// Initialize BroadcastChannel & storage listeners for multi-tab sync
if (typeof window !== 'undefined') {
  if ('BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'CONSENT_UPDATED') {
          notifyListeners(event.data.consent);
        }
      };
    } catch {
      broadcastChannel = null;
    }
  }

  window.addEventListener('storage', (e) => {
    if (e.key === CONSENT_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as ConsentRecord;
        if (isValidConsentRecord(parsed)) {
          notifyListeners(parsed);
        }
      } catch {
        // ignore malformed storage values
      }
    }
  });
}

function notifyListeners(record: ConsentRecord | null): void {
  for (const listener of listeners) {
    try {
      listener(record);
    } catch (err) {
      console.warn('[Analytics:Consent] Listener error:', err);
    }
  }
}

/* ----------------------------------------------------------------------------
   Cookie & Storage Helpers
----------------------------------------------------------------------------- */
export function getRootCookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const hostname = window.location.hostname.toLowerCase();
  if (hostname === 'wellmindly.com' || hostname.endsWith('.wellmindly.com')) {
    return '.wellmindly.com';
  }
  return undefined;
}

export function isValidConsentRecord(data: unknown): data is ConsentRecord {
  if (!data || typeof data !== 'object') return false;
  const c = data as Record<string, unknown>;
  if (c.version !== CONSENT_VERSION) return false;
  if (typeof c.timestamp !== 'string' || typeof c.updatedAt !== 'string') return false;
  if (!['accepted_all', 'rejected_all', 'customized'].includes(c.decision as string)) return false;
  if (!c.categories || typeof c.categories !== 'object') return false;

  const cats = c.categories as Record<string, unknown>;
  return (
    cats.strictly_necessary === true &&
    typeof cats.analytics === 'boolean' &&
    typeof cats.marketing === 'boolean'
  );
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const domain = getRootCookieDomain();
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
    if (domain) {
      cookieStr += `; domain=${domain}`;
    }
    if (isSecure) {
      cookieStr += '; Secure';
    }
    document.cookie = cookieStr;
    return true;
  } catch {
    return false;
  }
}

export function eraseCookie(name: string): void {
  if (typeof document === 'undefined') return;
  const domain = getRootCookieDomain();
  const pastDate = 'Expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';

  document.cookie = `${name}=; ${pastDate}`;
  if (domain) {
    document.cookie = `${name}=; domain=${domain}; ${pastDate}`;
  }
}

/* ----------------------------------------------------------------------------
   Consent Management Operations
----------------------------------------------------------------------------- */
export function getConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null;

  // 1. Try reading cross-subdomain cookie
  const cookieVal = readCookie(CONSENT_COOKIE_NAME);
  if (cookieVal) {
    try {
      const parsed = JSON.parse(cookieVal);
      if (isValidConsentRecord(parsed)) {
        const updatedMs = new Date(parsed.updatedAt || parsed.timestamp).getTime();
        if (Date.now() - updatedMs < CONSENT_MAX_AGE_SECONDS * 1000) {
          return parsed;
        }
      }
    } catch {
      // ignore parse failure, try storage fallback
    }
  }

  // 2. Try localStorage fallback
  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (isValidConsentRecord(parsed)) {
        const updatedMs = new Date(parsed.updatedAt || parsed.timestamp).getTime();
        if (Date.now() - updatedMs < CONSENT_MAX_AGE_SECONDS * 1000) {
          writeCookie(CONSENT_COOKIE_NAME, JSON.stringify(parsed), CONSENT_MAX_AGE_SECONDS);
          return parsed;
        }
      }
    }
  } catch {
    // localStorage might be disabled in private browsing
  }

  return null;
}

export function hasAnalyticsConsent(): boolean {
  const record = getConsent();
  return Boolean(record && record.categories.analytics === true);
}

export function saveConsent(
  decision: ConsentDecision,
  categories: { analytics: boolean; marketing?: boolean }
): ConsentRecord {
  const existing = getConsent();
  const now = new Date().toISOString();

  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    timestamp: existing ? existing.timestamp : now,
    updatedAt: now,
    decision,
    categories: {
      strictly_necessary: true,
      analytics: Boolean(categories.analytics),
      marketing: Boolean(categories.marketing),
    },
  };

  const serialized = JSON.stringify(record);

  writeCookie(CONSENT_COOKIE_NAME, serialized, CONSENT_MAX_AGE_SECONDS);

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
  } catch {
    // gracefully ignore localStorage write failures
  }

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'CONSENT_UPDATED', consent: record });
    } catch {
      // ignore
    }
  }

  notifyListeners(record);
  return record;
}

export function acceptAllConsent(): ConsentRecord {
  return saveConsent('accepted_all', { analytics: true, marketing: true });
}

export function rejectAllConsent(): ConsentRecord {
  return saveConsent('rejected_all', { analytics: false, marketing: false });
}

export function withdrawConsent(): ConsentRecord {
  const record = rejectAllConsent();

  eraseCookie('_ga');
  eraseCookie('_gid');
  eraseCookie('_gat');
  eraseCookie('_clck');
  eraseCookie('_clsk');

  if (typeof document !== 'undefined') {
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const name = cookie.split('=')[0].trim();
        if (name.startsWith('_ga_') || name.startsWith('_cl')) {
          eraseCookie(name);
        }
      }
    } catch {
      // ignore
    }
  }

  return record;
}

export function subscribeConsent(listener: ConsentListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function openConsentPreferences(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wellmindly_open_consent_preferences'));
  }
}

/* ----------------------------------------------------------------------------
   Data Sanitization & URL Cleaning
----------------------------------------------------------------------------- */
export function sanitizeEventParams(
  params?: Record<string, string | number | boolean | undefined | null>,
  platform?: PlatformId,
  environment?: Environment
): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};

  if (platform) clean.platform = platform;
  if (environment) clean.environment = environment;

  if (!params) return clean;

  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null) continue;

    const lowerKey = key.toLowerCase();

    const isProhibited = PROHIBITED_KEYS.some((prohibited) => lowerKey.includes(prohibited));
    if (isProhibited) continue;

    if (lowerKey === 'email' && typeof val === 'string') {
      const parts = val.split('@');
      clean[key] = parts.length > 1 ? `...@${parts[1]}` : '[masked]';
      continue;
    }

    if (typeof val === 'number') {
      if (Number.isFinite(val)) clean[key] = val;
      continue;
    }

    if (typeof val === 'boolean') {
      clean[key] = val;
      continue;
    }

    if (typeof val === 'string') {
      clean[key] = val.length > 100 ? val.slice(0, 100) : val;
    }
  }

  return clean;
}

export function sanitizePagePath(fullPath: string): string {
  try {
    const [pathname, search] = fullPath.split('?');
    if (!search) return pathname.startsWith('/') ? pathname : `/${pathname}`;

    const params = new URLSearchParams(search);
    for (const key of SENSITIVE_QUERY_PARAMS) {
      params.delete(key);
    }

    const cleanSearch = params.toString();
    const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return cleanSearch ? `${cleanPath}?${cleanSearch}` : cleanPath;
  } catch {
    return fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
  }
}

export function extractUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const utm: UtmParams = {};

    const utmKeys: (keyof UtmParams)[] = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
    ];

    for (const key of utmKeys) {
      const val = searchParams.get(key);
      if (val) {
        const sanitized = val.replace(/[^a-zA-Z0-9_\-.]/g, '').slice(0, 50);
        if (sanitized) utm[key] = sanitized;
      }
    }

    return utm;
  } catch {
    return {};
  }
}

/* ----------------------------------------------------------------------------
   GA4 Adapter
----------------------------------------------------------------------------- */
export function setupGaConsentDefaults(): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  }

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500,
  });
}

export function loadGa4(measurementId: string, debug = false): void {
  if (typeof window === 'undefined' || !measurementId) return;
  if (gaLoaded && currentGaId === measurementId) return;

  currentGaId = measurementId;
  setupGaConsentDefaults();

  window.gtag!('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  window.gtag!('js', new Date());

  window.gtag!('config', measurementId, {
    send_page_view: false,
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_flags: 'SameSite=Lax;Secure',
    debug_mode: debug,
  });

  if (!gaScriptAppended) {
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
      gaScriptAppended = true;
      gaLoaded = true;
    } catch (err) {
      console.warn('[Analytics:GA4] Failed to append gtag script:', err);
    }
  } else {
    gaLoaded = true;
  }
}

export function updateGa4Consent(analyticsGranted: boolean, adsGranted: boolean = false): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('consent', 'update', {
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    ad_storage: adsGranted ? 'granted' : 'denied',
    ad_user_data: adsGranted ? 'granted' : 'denied',
    ad_personalization: adsGranted ? 'granted' : 'denied',
  });
}

export function sendGa4PageView(
  path: string,
  title: string,
  platform: PlatformId,
  environment: Environment
): void {
  if (typeof window === 'undefined' || !window.gtag || !gaLoaded) return;

  const cleanPath = sanitizePagePath(path);
  const cleanTitle = title.slice(0, 100);

  window.gtag('event', 'page_view', {
    page_path: cleanPath,
    page_title: cleanTitle,
    page_location: `${window.location.origin}${cleanPath}`,
    platform,
    environment,
  });
}

export function sendGa4Event(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  platform?: PlatformId,
  environment?: Environment
): void {
  if (typeof window === 'undefined' || !window.gtag || !gaLoaded) return;

  const cleanParams = sanitizeEventParams(params, platform, environment);
  window.gtag('event', eventName, cleanParams);
}

/* ----------------------------------------------------------------------------
   Microsoft Clarity Adapter
----------------------------------------------------------------------------- */
export function isRouteExcludedFromClarity(path: string, platform?: PlatformId): boolean {
  if (platform === 'admin' && (path.includes('students') || path.includes('moderation') || path.includes('quizzes'))) {
    return true;
  }
  if (platform === 'counselor' && (path.includes('students') || path.includes('sessions'))) {
    return true;
  }

  const lower = path.toLowerCase();
  return EXCLUDED_CLARITY_ROUTES.some((excluded) => lower.includes(excluded));
}

export function loadClarity(projectId: string): void {
  if (typeof window === 'undefined' || !projectId) return;

  // Microsoft Clarity Eligibility Check: Microsoft Terms of Use prohibit deployment on sites/apps
  // targeting users under 18. Because WellMindly's student audience may include minors and no age-verification
  // gate exists, Clarity remains strictly disabled until formal legal eligibility is confirmed.
  if (!activeConfig.enableClarity) {
    if (activeConfig.debug) {
      console.info(
        '[Analytics:Clarity] Clarity loading prevented: disabled by default due to user age eligibility restrictions (under 18).'
      );
    }
    return;
  }

  if (clarityLoaded && currentClarityId === projectId) return;

  currentClarityId = projectId;

  if (!window.clarity) {
    (function (c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
      c[a] =
        c[a] ||
        function () {
          // eslint-disable-next-line prefer-rest-params
          (c[a].q = c[a].q || []).push(arguments);
        };
      t = l.createElement(r);
      t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + encodeURIComponent(i);
      y = l.getElementsByTagName(r)[0];
      if (y && y.parentNode) {
        y.parentNode.insertBefore(t, y);
      } else {
        document.head.appendChild(t);
      }
    })(window, document, 'clarity', 'script', projectId);
  }

  try {
    if (window.clarity) {
      window.clarity('consent', true);
    }
  } catch {
    // ignore
  }

  clarityLoaded = true;
}

export function updateClarityConsent(granted: boolean): void {
  if (typeof window === 'undefined' || !window.clarity || !activeConfig.enableClarity) return;

  try {
    window.clarity('consent', granted);
  } catch (err) {
    console.warn('[Analytics:Clarity] Failed to update consent:', err);
  }
}

export function setClarityPage(path: string, platform?: PlatformId): void {
  if (typeof window === 'undefined' || !window.clarity || !clarityLoaded || !activeConfig.enableClarity) return;

  if (isRouteExcludedFromClarity(path, platform)) {
    try {
      window.clarity('set', 'sensitive_route', 'true');
    } catch {
      // ignore
    }
    return;
  }

  try {
    window.clarity('set', 'page', path);
    window.clarity('set', 'sensitive_route', 'false');
  } catch {
    // ignore
  }
}

export function sendClarityEvent(eventName: string): void {
  if (typeof window === 'undefined' || !window.clarity || !clarityLoaded || !activeConfig.enableClarity) return;

  try {
    window.clarity('event', eventName);
  } catch {
    // ignore
  }
}

/* ----------------------------------------------------------------------------
   Main Analytics Facade
----------------------------------------------------------------------------- */
export function initAnalytics(overrideConfig?: Partial<AnalyticsConfig>): void {
  if (typeof window === 'undefined') return;

  if (overrideConfig) {
    activeConfig = { ...activeConfig, ...overrideConfig };
  }

  setupGaConsentDefaults();

  subscribeConsent((record) => {
    const isAnalytics = Boolean(record && record.categories.analytics);
    const isMarketing = Boolean(record && record.categories.marketing);
    updateGa4Consent(isAnalytics, isMarketing);
    updateClarityConsent(isAnalytics);

    if (isAnalytics) {
      if (activeConfig.gaMeasurementId) {
        loadGa4(activeConfig.gaMeasurementId, activeConfig.debug);
      }
      if (activeConfig.clarityProjectId) {
        loadClarity(activeConfig.clarityProjectId);
      }
      captureAttributionSnapshot();
    }
  });

  if (hasAnalyticsConsent()) {
    const record = getConsent();
    const isMarketing = Boolean(record && record.categories.marketing);
    updateGa4Consent(true, isMarketing);
    if (activeConfig.gaMeasurementId) {
      loadGa4(activeConfig.gaMeasurementId, activeConfig.debug);
    }
    if (activeConfig.clarityProjectId) {
      loadClarity(activeConfig.clarityProjectId);
    }
    captureAttributionSnapshot();
  } else if (activeConfig.debug && !activeConfig.gaMeasurementId && !activeConfig.clarityProjectId) {
    console.info(
      `[Analytics:${activeConfig.platform}] Running in local development mode without tracking IDs.`
    );
  }
}

function captureAttributionSnapshot(): void {
  if (typeof window === 'undefined') return;
  const utms = extractUtmParams();
  if (Object.keys(utms).length === 0) return;

  try {
    const now = new Date().toISOString();
    if (!window.sessionStorage.getItem('wm_first_touch_utm')) {
      window.sessionStorage.setItem('wm_first_touch_utm', JSON.stringify({ ...utms, timestamp: now }));
    }
    window.sessionStorage.setItem('wm_last_touch_utm', JSON.stringify({ ...utms, timestamp: now }));
  } catch {
    // ignore
  }
}

export function trackPageView(path: string, title?: string): void {
  const pageTitle = title || (typeof document !== 'undefined' ? document.title : '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (activeConfig.debug) {
    console.debug(`[Analytics:${activeConfig.platform}:PageView] ${cleanPath} ("${pageTitle}")`);
  }

  if (!hasAnalyticsConsent()) return;

  sendGa4PageView(cleanPath, pageTitle, activeConfig.platform, activeConfig.environment || 'development');
  setClarityPage(cleanPath, activeConfig.platform);
}

export function trackEvent(
  eventName: string,
  params?: StandardEventParams
): void {
  if (activeConfig.debug) {
    console.debug(`[Analytics:${activeConfig.platform}:Event] ${eventName}`, params);
  }

  if (activeConfig.debug && !ALLOWED_EVENTS.has(eventName)) {
    console.warn(`[Analytics] Unregistered event name "${eventName}". Consider adding to ALLOWED_EVENTS catalog.`);
  }

  if (!hasAnalyticsConsent()) return;

  sendGa4Event(eventName, params, activeConfig.platform, activeConfig.environment || 'development');
  sendClarityEvent(eventName);
}

export function setStudentContext(context: {
  isUniversityStudent?: boolean;
  role?: string;
  anonymousId?: string;
}): void {
  if (!hasAnalyticsConsent()) return;

  if (window.clarity && activeConfig.clarityProjectId && activeConfig.enableClarity && context.anonymousId) {
    window.clarity('identify', context.anonymousId);
  }

  if (window.gtag && activeConfig.gaMeasurementId) {
    window.gtag('set', 'user_properties', {
      is_uni_student: context.isUniversityStudent ? 'yes' : 'no',
      user_role: context.role || 'guest',
      platform: activeConfig.platform,
    });
  }
}

export function resetAnalyticsState(): void {
  gaLoaded = false;
  gaScriptAppended = false;
  currentGaId = null;
  clarityLoaded = false;
  currentClarityId = null;
  activeConfig = {
    platform: 'student',
    gaMeasurementId: appConfig.gaMeasurementId,
    clarityProjectId: appConfig.clarityProjectId,
    enableClarity: false,
    environment: (import.meta.env.MODE as Environment) || 'development',
    debug: import.meta.env.DEV,
  };
}

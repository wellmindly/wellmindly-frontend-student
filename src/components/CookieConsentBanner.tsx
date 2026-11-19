import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Cookie, X, SlidersHorizontal } from 'lucide-react';
import {
  getConsent,
  saveConsent,
  acceptAllConsent,
  ensureNativeDefaultConsent,
  rejectAllConsent,
  type ConsentRecord,
} from '../lib/analytics';
import { isNativeApp } from '../lib/native';

export function CookieConsentBanner() {
  const [, setConsent] = useState<ConsentRecord | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isNativeApp()) {
      // Analytics only - see ensureNativeDefaultConsent in lib/analytics.ts.
      ensureNativeDefaultConsent();
      return;
    }

    const existing = getConsent();
    if (existing) {
      setConsent(existing);
      setAnalyticsEnabled(existing.categories.analytics);
      setMarketingEnabled(existing.categories.marketing || false);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }

    const handleOpenPreferences = () => {
      const current = getConsent();
      if (current) {
        setAnalyticsEnabled(current.categories.analytics);
        setMarketingEnabled(current.categories.marketing || false);
      } else {
        setAnalyticsEnabled(false);
        setMarketingEnabled(false);
      }
      setShowModal(true);
    };

    window.addEventListener('wellmindly_open_consent_preferences', handleOpenPreferences);
    return () => {
      window.removeEventListener('wellmindly_open_consent_preferences', handleOpenPreferences);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
        triggerRef.current?.focus();
      }
    };

    if (showModal) {
      window.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal]);

  const handleAcceptAll = () => {
    const rec = acceptAllConsent();
    setConsent(rec);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleRejectAll = () => {
    const rec = rejectAllConsent();
    setConsent(rec);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSavePreferences = () => {
    const rec = saveConsent('customized', {
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
    });
    setConsent(rec);
    setShowBanner(false);
    setShowModal(false);
  };

  if (isNativeApp()) {
    return null;
  }

  return (
    <>
      {showBanner && !showModal && (
        <aside
          role="region"
          aria-label="Cookie and Privacy Consent"
          className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 mx-auto max-w-4xl sm:bottom-4 sm:left-4 sm:right-4"
        >
          {/* Compact on phones: it used to cover about half the screen and the
              dashboard's bottom nav. Full wording lives in "Customize". */}
          <div className="rounded-2xl border border-ink-200/70 bg-card/95 p-4 shadow-xl backdrop-blur-md sm:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
              <div className="flex items-start gap-3">
                <Cookie className="mt-0.5 hidden h-5 w-5 shrink-0 text-plum sm:block" aria-hidden="true" />
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-ink-900">Cookies</h2>
                  <p className="text-xs leading-relaxed text-ink-600 max-w-2xl">
                    Essential cookies keep you signed in. Optional analytics are anonymous and never include your moods, journal or answers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 md:flex md:shrink-0 md:items-center">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="min-h-11 rounded-xl px-3 py-2 text-xs font-semibold text-ink-700 transition hover:bg-paper-2 cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                    Options
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="min-h-11 rounded-xl border border-ink-200 bg-card px-3 py-2 text-xs font-semibold text-ink-700 transition hover:bg-paper-2 cursor-pointer"
                >
                  Essentials
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="min-h-11 rounded-xl bg-plum px-3 py-2 text-xs font-semibold text-plum-50 shadow-sm transition hover:opacity-90 cursor-pointer"
                >
                  Accept all
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm"
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto overscroll-contain rounded-2xl border border-ink-200 bg-card p-6 shadow-2xl focus:outline-0"
          >
            <div className="flex items-center justify-between border-b border-ink-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Shield className="h-5 w-5 text-plum-600" />
                <h3 id="student-cookie-modal-title" className="text-base font-bold text-ink-900">
                  WellMindly Privacy Preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close preferences"
                className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div className="rounded-xl border border-ink-200/80 bg-ink-50/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink-900">Strictly Necessary Cookies</span>
                  <span className="rounded-full bg-sage-100 px-2 py-0.5 text-2xs font-bold text-sage-800">
                    Always Active
                  </span>
                </div>
                <p className="mt-1 text-ink-600">
                  Required for account authentication, secure session tokens, and essential page navigation.
                </p>
              </div>

              <div className="rounded-xl border border-ink-200/80 bg-ink-50/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-ink-900">Performance &amp; Analytics (GA4)</span>
                    <p className="mt-0.5 text-ink-600">
                      Anonymous aggregate metrics for pageviews and feature performance.
                    </p>
                  </div>
                  <label className="relative ml-4 inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="sr-only peer"
                      aria-label="Enable analytics cookies"
                    />
                    <div className="w-10 h-6 bg-ink-300 peer-focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-plum-600 peer-focus-visible:ring-offset-2 rounded-full peer peer-checked:after:tranink-x-full peer-checked:after:border-card after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-ink-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plum-600"></div>
                  </label>
                </div>
                <div className="mt-2 text-2xs text-ink-500 border-t border-ink-200/60 pt-2">
                  ✓ Mood ratings dropped &bull; ✓ Zero clinical assessment data collected
                </div>
              </div>

              <div className="rounded-xl border border-ink-200/80 bg-ink-50/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-ink-900">Personalization &amp; Campaign Attribution</span>
                    <p className="mt-0.5 text-ink-600">
                      Allows measuring acquisition campaigns and ad signals (Consent Mode v2).
                    </p>
                  </div>
                  <label className="relative ml-4 inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={marketingEnabled}
                      onChange={(e) => setMarketingEnabled(e.target.checked)}
                      className="sr-only peer"
                      aria-label="Enable marketing cookies"
                    />
                    <div className="w-10 h-6 bg-ink-300 peer-focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-plum-600 peer-focus-visible:ring-offset-2 rounded-full peer peer-checked:after:tranink-x-full peer-checked:after:border-card after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-ink-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plum-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
              {/* In-app route, not an absolute wellmindly.com URL: the policy is
                  part of this app, and an external link leaves the page. */}
              <Link
                to="/privacy"
                onClick={() => setShowModal(false)}
                className="inline-flex min-h-11 items-center text-xs font-medium text-plum-600 hover:underline"
              >
                Privacy Notice
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="min-h-11 rounded-xl border border-ink-200 px-3.5 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-50 cursor-pointer"
                >
                  Reject Optional
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="min-h-11 rounded-xl bg-plum-600 px-4 py-1.5 text-xs font-semibold text-plum-50 shadow-sm transition hover:bg-plum-700 cursor-pointer"
                >
                  Save Choices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

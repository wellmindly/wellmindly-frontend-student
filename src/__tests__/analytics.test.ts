import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  initAnalytics,
  trackPageView,
  trackEvent,
  setStudentContext,
  resetAnalyticsState,
  saveConsent,
  withdrawConsent,
  hasAnalyticsConsent,
  sanitizeEventParams,
  sanitizePagePath,
} from '../lib/analytics';

describe('WellMindly Analytics & Consent System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete window.gtag;
    delete window.clarity;
    delete window.dataLayer;
    localStorage.clear();
    resetAnalyticsState();

    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  });

  describe('Basic Consent Mode & Privacy Gates', () => {
    it('defaults to DENIED consent and does NOT send pageviews or events before consent', () => {
      const gtagMock = vi.fn();
      const clarityMock = vi.fn();
      window.gtag = gtagMock;
      window.clarity = clarityMock;

      initAnalytics({
        platform: 'student',
        gaMeasurementId: 'G-TEST123',
        clarityProjectId: 'cl-test-123',
      });

      expect(hasAnalyticsConsent()).toBe(false);

      trackPageView('/dashboard');
      trackEvent('primary_cta_clicked', { cta_id: 'hero_btn' });

      const pageViewCalls = gtagMock.mock.calls.filter((call) => call[1] === 'page_view');
      const customEventCalls = gtagMock.mock.calls.filter((call) => call[1] === 'primary_cta_clicked');
      expect(pageViewCalls).toHaveLength(0);
      expect(customEventCalls).toHaveLength(0);
      expect(clarityMock).not.toHaveBeenCalledWith('event', 'primary_cta_clicked');
    });

    it('enables tracking after explicit consent is granted', () => {
      const gtagMock = vi.fn();
      const clarityMock = vi.fn();
      window.gtag = gtagMock;
      window.clarity = clarityMock;

      initAnalytics({
        platform: 'student',
        gaMeasurementId: 'G-TEST123',
        clarityProjectId: 'cl-test-123',
      });

      saveConsent('accepted_all', { analytics: true });
      expect(hasAnalyticsConsent()).toBe(true);

      trackPageView('/dashboard', 'Student Dashboard');
      trackEvent('primary_cta_clicked', { cta_id: 'explore_feature' });

      expect(gtagMock).toHaveBeenCalledWith(
        'event',
        'page_view',
        expect.objectContaining({
          page_path: '/dashboard',
          page_title: 'Student Dashboard',
          platform: 'student',
        })
      );
      expect(gtagMock).toHaveBeenCalledWith(
        'event',
        'primary_cta_clicked',
        expect.objectContaining({
          cta_id: 'explore_feature',
          platform: 'student',
        })
      );
    });

    it('immediately stops tracking and clears cookies upon consent withdrawal', () => {
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      saveConsent('accepted_all', { analytics: true });
      initAnalytics({
        platform: 'student',
        gaMeasurementId: 'G-TEST123',
      });

      expect(hasAnalyticsConsent()).toBe(true);

      withdrawConsent();
      expect(hasAnalyticsConsent()).toBe(false);

      gtagMock.mockClear();
      trackPageView('/dashboard');
      trackEvent('primary_cta_clicked', { cta_id: 'btn' });

      expect(gtagMock).not.toHaveBeenCalledWith('event', 'page_view', expect.anything());
      expect(gtagMock).not.toHaveBeenCalledWith('event', 'primary_cta_clicked', expect.anything());
    });
  });

  describe('Microsoft Clarity Under-18 Restriction Gate', () => {
    it('keeps Clarity disabled by default due to user age eligibility restrictions', () => {
      const clarityMock = vi.fn();
      window.clarity = clarityMock;
      saveConsent('accepted_all', { analytics: true });

      initAnalytics({
        platform: 'student',
        gaMeasurementId: 'G-TEST123',
        clarityProjectId: 'cl-test-123',
        // enableClarity is omitted; defaults to false
      });

      setStudentContext({
        isUniversityStudent: true,
        role: 'STUDENT',
        anonymousId: 'std_98765432',
      });

      // Clarity identify should NOT be called because Clarity is disabled by default
      expect(clarityMock).not.toHaveBeenCalledWith('identify', 'std_98765432');
    });

    it('allows Clarity only when explicitly enabled following legal/age verification', () => {
      const clarityMock = vi.fn();
      window.clarity = clarityMock;
      saveConsent('accepted_all', { analytics: true });

      initAnalytics({
        platform: 'student',
        gaMeasurementId: 'G-TEST123',
        clarityProjectId: 'cl-test-123',
        enableClarity: true, // Explicitly verified
      });

      setStudentContext({
        isUniversityStudent: true,
        role: 'STUDENT',
        anonymousId: 'std_98765432',
      });

      expect(clarityMock).toHaveBeenCalledWith('identify', 'std_98765432');
    });
  });

  describe('Safe Payload Sanitization & PII Protection', () => {
    it('drops sensitive fields such as passwords, tokens, journals, and reflections', () => {
      const sanitized = sanitizeEventParams(
        {
          rating: 4,
          student_password: 'supersecretpassword',
          jwt_token: 'bearer.token.payload',
          journal_note: 'private emotional thoughts',
          assessment_answer: 'option A',
          email: 'student@campus.ac.in',
        },
        'student',
        'production'
      );

      expect(sanitized.rating).toBe(4);
      expect(sanitized.email).toBe('...@campus.ac.in');
      expect(sanitized.platform).toBe('student');
      expect(sanitized.environment).toBe('production');

      expect(sanitized.student_password).toBeUndefined();
      expect(sanitized.jwt_token).toBeUndefined();
      expect(sanitized.journal_note).toBeUndefined();
      expect(sanitized.assessment_answer).toBeUndefined();
    });

    it('strips authentication callback tokens and sensitive URL parameters', () => {
      const dirtyUrl =
        '/login?token=jwt.secret.value&code=oauth_auth_code_12345&email=student@uni.edu&tab=overview&page=2';
      const cleanUrl = sanitizePagePath(dirtyUrl);

      expect(cleanUrl).toBe('/login?tab=overview&page=2');
      expect(cleanUrl).not.toContain('jwt.secret.value');
      expect(cleanUrl).not.toContain('oauth_auth_code_12345');
      expect(cleanUrl).not.toContain('student@uni.edu');
    });

    it('sets anonymous student context without leaking raw emails or PII', () => {
      saveConsent('accepted_all', { analytics: true });
      const gtagMock = vi.fn();
      window.gtag = gtagMock;

      initAnalytics({
        platform: 'student',
        gaMeasurementId: 'G-TEST123',
      });

      setStudentContext({
        isUniversityStudent: true,
        role: 'STUDENT',
        anonymousId: 'std_98765432',
      });

      expect(gtagMock).toHaveBeenCalledWith('set', 'user_properties', {
        is_uni_student: 'yes',
        user_role: 'STUDENT',
        platform: 'student',
      });
    });
  });

  describe('Missing configuration handling', () => {
    it('handles missing measurement IDs safely without throwing errors', () => {
      expect(() =>
        initAnalytics({
          platform: 'student',
          gaMeasurementId: '',
          clarityProjectId: '',
        })
      ).not.toThrow();

      expect(() => trackPageView('/test')).not.toThrow();
      expect(() => trackEvent('primary_cta_clicked', { cta_id: 'hero_btn' })).not.toThrow();
    });
  });
});

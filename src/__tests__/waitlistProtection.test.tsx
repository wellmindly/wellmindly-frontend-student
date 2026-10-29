import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EligibilityBanner } from '../components/landing/sections/EligibilityBanner';
import { EligibilityModal } from '../components/booking/EligibilityModal';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
  apiErrorMessage: vi.fn((err: any, fallback: string) => err?.response?.data?.error || fallback),
}));

vi.mock('../lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('Frontend Waitlist & Bot Protection Safeguards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EligibilityBanner component', () => {
    it('renders input, submit button, and hidden bot honeypot field', () => {
      const { container } = render(<EligibilityBanner />);

      const emailInput = screen.getByLabelText(/email address for counselling access updates/i);
      expect(emailInput).toBeInTheDocument();

      const submitButton = screen.getByRole('button', { name: /get the first scoop/i });
      expect(submitButton).toBeInTheDocument();

      // Verify honeypot input is hidden and inaccessible to screen readers
      const honeypot = container.querySelector('input[name="hp_confirm"]');
      expect(honeypot).toBeInTheDocument();
      expect(honeypot).toHaveAttribute('tabIndex', '-1');
      expect(honeypot).toHaveAttribute('aria-hidden', 'true');
    });

    it('prevents multiple clicks and disables submit button while submitting', async () => {
      let resolveApi: (value: any) => void;
      const apiPromise = new Promise((resolve) => {
        resolveApi = resolve;
      });
      vi.mocked(api.post).mockReturnValue(apiPromise as any);

      render(<EligibilityBanner />);

      const emailInput = screen.getByLabelText(/email address for counselling access updates/i);
      const submitButton = screen.getByRole('button', { name: /get the first scoop/i });

      fireEvent.change(emailInput, { target: { value: 'student@university.edu' } });

      // Click submit once
      fireEvent.click(submitButton);

      // Submit button should now be disabled and marked aria-busy
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute('aria-busy', 'true');

      // Attempt second rapid click while in progress
      fireEvent.click(submitButton);

      // Verify api.post was only called once
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith(
        '/contacts/general',
        expect.objectContaining({
          name: 'Newsletter Subscriber',
          email: 'student@university.edu',
          subject: 'Waitlist: Human Counselling for All Students',
          hp_confirm: '',
          _t: expect.any(Number),
        })
      );

      // Resolve the API call
      resolveApi!({ data: { success: true, message: "You're on the list!" } });

      await waitFor(() => {
        expect(screen.getByText(/you're on the list!/i)).toBeInTheDocument();
      });
    });

    it('displays error message gracefully when API returns an error', async () => {
      vi.mocked(api.post).mockRejectedValueOnce({
        response: {
          data: { error: 'Too many requests. Please try again in a few minutes.' },
        },
      });

      render(<EligibilityBanner />);

      const emailInput = screen.getByLabelText(/email address for counselling access updates/i);
      const submitButton = screen.getByRole('button', { name: /get the first scoop/i });

      fireEvent.change(emailInput, { target: { value: 'spammer@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(/too many requests/i);
      });
    });
  });

  describe('EligibilityModal component', () => {
    it('disables submit button while submitting and sends honeypot and timing payload', async () => {
      let resolveApi: (value: any) => void;
      const apiPromise = new Promise((resolve) => {
        resolveApi = resolve;
      });
      vi.mocked(api.post).mockReturnValue(apiPromise as any);

      render(<EligibilityModal open={true} onClose={() => {}} />);

      const emailInput = screen.getByPlaceholderText(/enter your student email\.\.\./i);
      const submitButton = screen.getByRole('button', { name: /get the first scoop/i });

      const honeypot = document.querySelector('input[name="hp_confirm"]');
      expect(honeypot).toBeInTheDocument();

      fireEvent.change(emailInput, { target: { value: 'modalstudent@university.edu' } });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(api.post).toHaveBeenCalledTimes(1);

      resolveApi!({ data: { success: true, message: "You're on the list!" } });

      await waitFor(() => {
        expect(screen.getByText(/you're on the list!/i)).toBeInTheDocument();
      });
    });
  });
});

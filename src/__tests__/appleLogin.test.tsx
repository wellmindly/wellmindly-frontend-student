import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import api from '../services/api';
import { LoginPage } from '../pages/Login';

const { initialize, login, loginSuccess } = vi.hoisted(() => ({
  initialize: vi.fn(),
  login: vi.fn(),
  loginSuccess: vi.fn(),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => true, getPlatform: () => 'ios' },
}));
vi.mock('@capgo/capacitor-social-login', () => ({
  SocialLogin: { initialize, login },
}));
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ loginSuccess, user: null }),
}));
vi.mock('../services/api', () => ({
  default: { post: vi.fn() },
  apiErrorMessage: vi.fn((_e: unknown, fallback: string) => fallback),
}));
vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }));

describe('Sign in with Apple (iOS)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests the raw authorization code and sends it to the backend', async () => {
    login.mockResolvedValue({
      provider: 'apple',
      result: {
        idToken: 'id-jwt',
        authorizationCode: 'auth-code-1',
        profile: { givenName: 'Asha', familyName: 'Rao' },
      },
    });
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { token: 't', user: { id: 1 } } });

    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /sign in with apple/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(initialize).toHaveBeenCalledWith({ apple: { useProperTokenExchange: true } });
    const [url, body] = (api.post as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe('/auth/apple/callback');
    expect(body).toMatchObject({
      idToken: 'id-jwt',
      authorizationCode: 'auth-code-1',
      firstName: 'Asha',
      lastName: 'Rao',
    });
    expect(typeof body.nonce).toBe('string');
    expect(loginSuccess).toHaveBeenCalled();
  });
});

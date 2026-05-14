import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      redirect: vi.fn((url: string | URL) => ({ type: 'redirect', url: url.toString() })),
    },
  };
});

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Auth Callback Route', () => {
  const mockSupabase = {
    auth: {
      exchangeCodeForSession: vi.fn(),
      verifyOtp: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
  });

  describe('OAuth callback (type=code)', () => {
    it('should exchange code for session and redirect to dashboard on success', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });

      const request = new NextRequest(new URL('http://localhost:3000/en/auth/callback?type=code&code=abc123'));
      const { GET } = await import('./route');
      const response = await GET(request);

      expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('abc123');
      expect(NextResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/en/dashboard'));
      expect(response.type).toBe('redirect');
    });

    it('should redirect to login with error on OAuth exchange failure', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: new Error('Exchange failed') });

      const request = new NextRequest(new URL('http://localhost:3000/en/auth/callback?type=code&code=abc123'));
      const { GET } = await import('./route');
      await GET(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/en/login?error=oauth_exchange_failed')
      );
    });
  });

  describe('Password reset callback (type=recovery)', () => {
    it('should verify token and redirect to reset-password page on success', async () => {
      mockSupabase.auth.verifyOtp.mockResolvedValue({ error: null });

      const request = new NextRequest(
        new URL('http://localhost:3000/en/auth/callback?type=recovery&token_hash=xyz789')
      );
      const { GET } = await import('./route');
      await GET(request);

      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
        type: 'recovery',
        token_hash: 'xyz789',
      });
      expect(NextResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/en/reset-password'));
    });

    it('should redirect to login with error on token verification failure', async () => {
      mockSupabase.auth.verifyOtp.mockResolvedValue({ error: new Error('Invalid token') });

      const request = new NextRequest(
        new URL('http://localhost:3000/en/auth/callback?type=recovery&token_hash=xyz789')
      );
      const { GET } = await import('./route');
      await GET(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/en/login?error=token_verification_failed')
      );
    });
  });

  describe('Email verification callback (type=signup)', () => {
    it('should verify token and redirect to login with verified=true on success', async () => {
      mockSupabase.auth.verifyOtp.mockResolvedValue({ error: null });

      const request = new NextRequest(
        new URL('http://localhost:3000/en/auth/callback?type=signup&token_hash=verify123')
      );
      const { GET } = await import('./route');
      await GET(request);

      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
        type: 'signup',
        token_hash: 'verify123',
      });
      expect(NextResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/en/login?verified=true'));
    });
  });

  describe('Error handling', () => {
    it('should redirect to login with error if error param is present', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/en/auth/callback?error=access_denied')
      );
      const { GET } = await import('./route');
      await GET(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/en/login?error=access_denied')
      );
    });

    it('should redirect to login with unknown_callback_type for unknown type', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/en/auth/callback?type=unknown&token_hash=abc')
      );
      const { GET } = await import('./route');
      await GET(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/en/login?error=unknown_callback_type')
      );
    });

    it('should handle internal errors gracefully', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockImplementation(() => {
        throw new Error('Internal error');
      });

      const request = new NextRequest(new URL('http://localhost:3000/en/auth/callback?type=code&code=abc123'));
      const { GET } = await import('./route');
      await GET(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/en/login?error=internal_server_error')
      );
    });
  });

  describe('Locale handling', () => {
    it('should preserve Spanish locale in redirects', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });

      const request = new NextRequest(new URL('http://localhost:3000/es/auth/callback?type=code&code=abc123'));
      const { GET } = await import('./route');
      await GET(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/es/dashboard'));
    });

    it('should default to English locale if not specified', async () => {
      mockSupabase.auth.verifyOtp.mockResolvedValue({ error: null });

      const request = new NextRequest(
        new URL('http://localhost:3000/auth/callback?type=signup&token_hash=abc')
      );
      const { GET } = await import('./route');
      await GET(request);

      expect(NextResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('/en/login?verified=true'));
    });
  });
});

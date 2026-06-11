import { describe, it, expect, vi, beforeEach } from "vitest";
import { signIn, signUp, signOut, signInWithOAuth, forgotPassword, updatePassword, sendVerificationEmail, resendVerificationEmail } from "./auth";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/auth/profile-sync", () => ({
  ensureUserProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`Redirect to: ${url}`);
  }),
}));

import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profile-sync";
import { revalidatePath } from "next/cache";

const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    getSession: vi.fn(),
    resend: vi.fn(),
  },
};

describe("signIn Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  it("should return error when email is missing", async () => {
    const formData = new FormData();
    formData.append("password", "password123");

    const result = await signIn({}, formData);

    expect(result.error).toBe("Email and password are required");
  });

  it("should return error when password is missing", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");

    const result = await signIn({}, formData);

    expect(result.error).toBe("Email and password are required");
  });

  it("should return error when credentials are invalid", async () => {
    vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "wrongpassword");

    const result = await signIn({}, formData);

    expect(result.error).toBe("Invalid login credentials");
  });

  it("should call ensureUserProfile on successful sign in", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    vi.mocked(mockSupabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null,
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");

    // Successful sign in redirects to the home dashboard at "/" (middleware
    // localizes it), NOT the phantom /dashboard route. Anchored regex so a
    // stray "/dashboard" cannot satisfy a loose substring match.
    await expect(signIn({}, formData)).rejects.toThrow(/^Redirect to: \/$/);

    expect(ensureUserProfile).toHaveBeenCalledWith(mockUser);
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});

describe("signUp Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  it("should return error when email is missing", async () => {
    const formData = new FormData();
    formData.append("password", "password123");

    const result = await signUp({}, formData);

    expect(result.error).toBe("Email and password are required");
  });

  it("should return error when password is less than 8 characters", async () => {
    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "short");

    const result = await signUp({}, formData);

    expect(result.error).toBe("Password must be at least 8 characters");
  });

  it("should return error when signup fails", async () => {
    vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Email already registered" },
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");

    const result = await signUp({}, formData);

    expect(result.error).toBe("Email already registered");
  });

  it("should call ensureUserProfile on successful signup", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null,
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");

    await expect(signUp({}, formData)).rejects.toThrow();

    expect(ensureUserProfile).toHaveBeenCalledWith(mockUser);
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("should redirect to verification-sent when email is not confirmed", async () => {
    const mockUser = { id: "user-123", email: "test@example.com", email_confirmed_at: null };
    vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null,
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");

    await expect(signUp({}, formData)).rejects.toThrow("Redirect to: /verification-sent?email=test%40example.com");
  });

  it("should redirect to home when email is already confirmed", async () => {
    const mockUser = { id: "user-123", email: "test@example.com", email_confirmed_at: "2024-01-01T00:00:00Z" };
    vi.mocked(mockSupabase.auth.signUp).mockResolvedValue({
      data: { user: mockUser, session: {} },
      error: null,
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("password", "password123");

    await expect(signUp({}, formData)).rejects.toThrow(/^Redirect to: \/$/);
  });
});

describe("signOut Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  it("should call supabase auth signOut", async () => {
    vi.mocked(mockSupabase.auth.signOut).mockResolvedValue({ error: null });

    await expect(signOut()).rejects.toThrow();

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });
});

describe("signInWithOAuth Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  it("should return OAuth URL on success", async () => {
    vi.mocked(mockSupabase.auth.signInWithOAuth).mockResolvedValue({
      data: { url: "https://auth.supabase.com/authorize?..." },
      error: null,
    });

    const result = await signInWithOAuth("google");

    expect(result.url).toBe("https://auth.supabase.com/authorize?...");
    expect(result.error).toBeUndefined();
  });

  it("should return error when OAuth fails", async () => {
    vi.mocked(mockSupabase.auth.signInWithOAuth).mockResolvedValue({
      data: { url: null },
      error: { message: "OAuth provider error" },
    });

    const result = await signInWithOAuth("github");

    expect(result.error).toBe("OAuth provider error");
  });

  it("should return error when no URL is returned", async () => {
    vi.mocked(mockSupabase.auth.signInWithOAuth).mockResolvedValue({
      data: { url: null },
      error: null,
    });

    const result = await signInWithOAuth("google");

    expect(result.error).toBe("Failed to get OAuth URL");
  });

  it("should pass correct provider to OAuth", async () => {
    vi.mocked(mockSupabase.auth.signInWithOAuth).mockResolvedValue({
      data: { url: "https://auth.supabase.com/authorize?..." },
      error: null,
    });

    await signInWithOAuth("github");

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "github",
      options: expect.objectContaining({
        redirectTo: expect.any(String),
      }),
    });
  });
});

describe("forgotPassword Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  it("should return error when email is missing", async () => {
    const formData = new FormData();

    const result = await forgotPassword({}, formData);

    expect(result.error).toBe("Email is required");
  });

  it("should return error when email format is invalid", async () => {
    const formData = new FormData();
    formData.append("email", "not-an-email");

    const result = await forgotPassword({}, formData);

    expect(result.error).toBe("Invalid email format");
  });

  it("should call resetPasswordForEmail with correct email and redirect URL", async () => {
    vi.mocked(mockSupabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: null,
      error: null,
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");

    const result = await forgotPassword({}, formData);

    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "test@example.com",
      expect.objectContaining({
        redirectTo: expect.stringContaining("/auth/callback"),
      })
    );
    expect(result.success).toBe(true);
  });

  it("should return error when resetPasswordForEmail fails", async () => {
    vi.mocked(mockSupabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: null,
      error: { message: "Email not found" },
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");

    const result = await forgotPassword({}, formData);

    expect(result.error).toBe("Email not found");
  });
});

describe("updatePassword Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  it("should return error when password is missing", async () => {
    const formData = new FormData();
    formData.append("confirmPassword", "password123");

    const result = await updatePassword({}, formData);

    expect(result.error).toBe("Password is required");
  });

  it("should return error when password is less than 8 characters", async () => {
    const formData = new FormData();
    formData.append("password", "short");
    formData.append("confirmPassword", "short");

    const result = await updatePassword({}, formData);

    expect(result.error).toBe("Password must be at least 8 characters");
  });

  it("should return error when passwords do not match", async () => {
    const formData = new FormData();
    formData.append("password", "password123");
    formData.append("confirmPassword", "different123");

    const result = await updatePassword({}, formData);

    expect(result.error).toBe("Passwords do not match");
  });

  it("should call updateUser with new password on success", async () => {
    vi.mocked(mockSupabase.auth.updateUser).mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const formData = new FormData();
    formData.append("password", "newpassword123");
    formData.append("confirmPassword", "newpassword123");

    await expect(updatePassword({}, formData)).rejects.toThrow();

    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
      password: "newpassword123",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("should return error when updateUser fails", async () => {
    vi.mocked(mockSupabase.auth.updateUser).mockResolvedValue({
      data: { user: null },
      error: { message: "Session expired" },
    });

    const formData = new FormData();
    formData.append("password", "newpassword123");
    formData.append("confirmPassword", "newpassword123");

    const result = await updatePassword({}, formData);

    expect(result.error).toBe("Session expired");
  });
});

describe("sendVerificationEmail Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  it("should return error when email is missing", async () => {
    const formData = new FormData();

    const result = await sendVerificationEmail({}, formData);

    expect(result.error).toBe("Email is required");
  });

  it("should return error when email format is invalid", async () => {
    const formData = new FormData();
    formData.append("email", "not-an-email");

    const result = await sendVerificationEmail({}, formData);

    expect(result.error).toBe("Invalid email format");
  });

  it("should call resend with type signup and correct email", async () => {
    vi.mocked(mockSupabase.auth.resend).mockResolvedValue({
      data: null,
      error: null,
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");

    const result = await sendVerificationEmail({}, formData);

    expect(mockSupabase.auth.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("should return error when resend fails", async () => {
    vi.mocked(mockSupabase.auth.resend).mockResolvedValue({
      data: null,
      error: { message: "Email already confirmed" },
    });

    const formData = new FormData();
    formData.append("email", "test@example.com");

    const result = await sendVerificationEmail({}, formData);

    expect(result.error).toBe("Email already confirmed");
  });
});

describe("resendVerificationEmail Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  it("should return error when no session exists", async () => {
    vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const result = await resendVerificationEmail();

    expect(result.error).toBe("Not authenticated");
  });

  it("should return error when user has no email", async () => {
    vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: "user-123", email: null } } },
      error: null,
    });

    const result = await resendVerificationEmail();

    expect(result.error).toBe("User has no email");
  });

  it("should call resend with session user's email", async () => {
    vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: "user-123", email: "test@example.com" } } },
      error: null,
    });
    vi.mocked(mockSupabase.auth.resend).mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await resendVerificationEmail();

    expect(mockSupabase.auth.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("should return error when resend fails", async () => {
    vi.mocked(mockSupabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: "user-123", email: "test@example.com" } } },
      error: null,
    });
    vi.mocked(mockSupabase.auth.resend).mockResolvedValue({
      data: null,
      error: { message: "Rate limit exceeded" },
    });

    const result = await resendVerificationEmail();

    expect(result.error).toBe("Rate limit exceeded");
  });
});
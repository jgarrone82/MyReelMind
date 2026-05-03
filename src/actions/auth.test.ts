import { describe, it, expect, vi, beforeEach } from "vitest";
import { signIn, signUp, signOut, signInWithOAuth } from "./auth";

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

    // Should throw redirect but that's expected
    await expect(signIn({}, formData)).rejects.toThrow();

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
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { UserMenu } from "./UserMenu";
import * as auth from "@/lib/auth/server";
import { dictionary } from "@/i18n/dictionaries/en";

// Mock getSession
vi.mock("@/lib/auth/server", () => ({
  getSession: vi.fn(),
}));

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null when not authenticated", async () => {
    vi.mocked(auth.getSession).mockResolvedValue(null);

    const { container } = render(await UserMenu({ dict: dictionary, lang: "en" }));

    expect(container.firstChild).toBeNull();
  });

  it("should render user email when authenticated", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com", email_confirmed_at: "2024-01-01" },
      access_token: "mock-token",
      refresh_token: "mock-refresh",
      expires_in: 3600,
      token_type: "bearer",
    };
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);

    render(await UserMenu({ dict: dictionary, lang: "en" }));

    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("should render logout button when authenticated", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com", email_confirmed_at: "2024-01-01" },
      access_token: "mock-token",
      refresh_token: "mock-refresh",
      expires_in: 3600,
      token_type: "bearer",
    };
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);

    render(await UserMenu({ dict: dictionary, lang: "en" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
    });
  });

  it("should show verification warning when email is not confirmed", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com", email_confirmed_at: null },
      access_token: "mock-token",
      refresh_token: "mock-refresh",
      expires_in: 3600,
      token_type: "bearer",
    };
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);

    render(await UserMenu({ dict: dictionary, lang: "en" }));

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /resend verification/i })).toBeInTheDocument();
    });
  });

  it("should NOT show verification warning when email is confirmed", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com", email_confirmed_at: "2024-01-01" },
      access_token: "mock-token",
      refresh_token: "mock-refresh",
      expires_in: 3600,
      token_type: "bearer",
    };
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);

    render(await UserMenu({ dict: dictionary, lang: "en" }));

    await waitFor(() => {
      expect(screen.queryByRole("link", { name: /resend verification/i })).not.toBeInTheDocument();
    });
  });
});

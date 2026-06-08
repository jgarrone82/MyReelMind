import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { UserMenu } from "./UserMenu";
import * as auth from "@/lib/auth/server";
import { dictionary } from "@/i18n/dictionaries/en";

// Mock getAuthenticatedUser (server-revalidated identity, #52)
vi.mock("@/lib/auth/server", () => ({
  getAuthenticatedUser: vi.fn(),
}));

type User = NonNullable<Awaited<ReturnType<typeof auth.getAuthenticatedUser>>>;

const createMockUser = (emailConfirmedAt: string | null): User => ({
  id: "user-123",
  email: "test@example.com",
  email_confirmed_at: emailConfirmedAt ?? undefined,
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "2024-01-01T00:00:00.000Z",
});

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null when not authenticated", async () => {
    vi.mocked(auth.getAuthenticatedUser).mockResolvedValue(null);

    const { container } = render(await UserMenu({ dict: dictionary, lang: "en" }));

    expect(container.firstChild).toBeNull();
  });

  it("should render user email when authenticated", async () => {
    const mockUser = createMockUser("2024-01-01");
    vi.mocked(auth.getAuthenticatedUser).mockResolvedValue(mockUser);

    render(await UserMenu({ dict: dictionary, lang: "en" }));

    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("should render logout button when authenticated", async () => {
    const mockUser = createMockUser("2024-01-01");
    vi.mocked(auth.getAuthenticatedUser).mockResolvedValue(mockUser);

    render(await UserMenu({ dict: dictionary, lang: "en" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
    });
  });

  it("should show verification warning when email is not confirmed", async () => {
    const mockUser = createMockUser(null);
    vi.mocked(auth.getAuthenticatedUser).mockResolvedValue(mockUser);

    render(await UserMenu({ dict: dictionary, lang: "en" }));

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /resend verification/i })).toBeInTheDocument();
    });
  });

  it("should NOT show verification warning when email is confirmed", async () => {
    const mockUser = createMockUser("2024-01-01");
    vi.mocked(auth.getAuthenticatedUser).mockResolvedValue(mockUser);

    render(await UserMenu({ dict: dictionary, lang: "en" }));

    await waitFor(() => {
      expect(screen.queryByRole("link", { name: /resend verification/i })).not.toBeInTheDocument();
    });
  });
});

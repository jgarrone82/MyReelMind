import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import VerifyEmailPage from "./page";

vi.mock("@/lib/auth/server", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/components/auth/VerifyEmailForm", () => ({
  VerifyEmailForm: ({ email }: { email: string }) => (
    <div data-testid="verify-email-form">{email}</div>
  ),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`Redirect to: ${url}`);
  }),
}));

import { getSession } from "@/lib/auth/server";

describe("VerifyEmailPage", () => {
  it("should redirect to login if no session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const params = Promise.resolve({ lang: "en" });
    await expect(VerifyEmailPage({ params })).rejects.toThrow(
      "Redirect to: /en/login"
    );
  });

  it("should redirect to dashboard if email is confirmed", async () => {
    vi.mocked(getSession).mockResolvedValue({
      user: { id: "1", email: "test@example.com", email_confirmed_at: "2024-01-01" },
    } as any);

    const params = Promise.resolve({ lang: "en" });
    await expect(VerifyEmailPage({ params })).rejects.toThrow(
      "Redirect to: /en/dashboard"
    );
  });

  it("should render VerifyEmailForm with user email", async () => {
    vi.mocked(getSession).mockResolvedValue({
      user: { id: "1", email: "test@example.com", email_confirmed_at: null },
    } as any);

    const params = Promise.resolve({ lang: "en" });
    render(await VerifyEmailPage({ params }));

    expect(screen.getByTestId("verify-email-form")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});

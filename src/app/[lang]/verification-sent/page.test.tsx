import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import VerificationSentPage from "./page";

vi.mock("@/components/auth/VerificationSentView", () => ({
  VerificationSentView: ({ email, lang }: { email: string; lang: string }) => (
    <div data-testid="verification-sent-view">
      <span>{email}</span>
      <span>{lang}</span>
    </div>
  ),
}));

describe("VerificationSentPage", () => {
  it("should render VerificationSentView with email", async () => {
    const params = Promise.resolve({ lang: "en" });
    const searchParams = Promise.resolve({ email: "test@example.com" });

    render(await VerificationSentPage({ params, searchParams }));

    expect(screen.getByTestId("verification-sent-view")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("should show message when no email provided", async () => {
    const params = Promise.resolve({ lang: "en" });
    const searchParams = Promise.resolve({});

    render(await VerificationSentPage({ params, searchParams }));

    expect(screen.getByText(/no email provided/i)).toBeInTheDocument();
  });
});

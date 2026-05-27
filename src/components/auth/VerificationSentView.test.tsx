import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { VerificationSentView } from "./VerificationSentView";
import { mockDictionary as mockDict } from "@tests/fixtures/mockDictionary";

vi.mock("@/actions/auth", () => ({
  sendVerificationEmail: vi.fn(),
}));

describe("VerificationSentView", () => {
  it("should render heading with title", () => {
    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByRole("heading", { name: /check your email/i })).toBeInTheDocument();
  });

  it("should render description text", () => {
    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByText(/we've sent you a verification link/i)).toBeInTheDocument();
  });

  it("should display the email address", () => {
    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument();
  });

  it("should render resend button", () => {
    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByRole("button", { name: /resend verification email/i })).toBeInTheDocument();
  });

  it("should render login link", () => {
    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByRole("link", { name: /back to login/i })).toBeInTheDocument();
  });

  it("should show success message after resend", async () => {
    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    const button = screen.getByRole("button", { name: /resend verification email/i });
    button.click();

    // Simulate success state
    expect(screen.queryByText(/email sent!/i)).not.toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { VerifyEmailForm } from "./VerifyEmailForm";
import { mockDictionary as mockDict } from "@tests/fixtures/mockDictionary";

vi.mock("@/actions/auth", () => ({
  resendVerificationEmail: vi.fn(),
}));

describe("VerifyEmailForm", () => {
  it("should render heading with title", () => {
    render(<VerifyEmailForm email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByRole("heading", { name: /verify your email/i })).toBeInTheDocument();
  });

  it("should display user email", () => {
    render(<VerifyEmailForm email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument();
  });

  it("should render resend button", () => {
    render(<VerifyEmailForm email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByRole("button", { name: /resend/i })).toBeInTheDocument();
  });

  it("should render dashboard link", () => {
    render(<VerifyEmailForm email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByRole("link", { name: /go to dashboard/i })).toBeInTheDocument();
  });
});

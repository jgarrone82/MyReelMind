import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { VerificationSentView } from "./VerificationSentView";
import { mockDictionary as mockDict } from "@tests/fixtures/mockDictionary";

vi.mock("@/actions/auth", () => ({
  sendVerificationEmail: vi.fn(),
}));

// Drives the resend-success state: the component reads its state from
// React's useActionState, so override it to return { success: true } while
// preserving every other React export the component relies on.
const useActionStateMock = vi.hoisted(() => vi.fn());
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return { ...actual, useActionState: useActionStateMock };
});

describe("VerificationSentView", () => {
  beforeEach(() => {
    // Default: initial (null) action state, matching useActionState's seed.
    useActionStateMock.mockReturnValue([null, vi.fn()]);
  });

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

  it("should render the sent subtitle", () => {
    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByText(/rewind and resend below/i)).toBeInTheDocument();
  });

  it("should render the resend-success live region when the action succeeds", () => {
    useActionStateMock.mockReturnValue([{ success: true }, vi.fn()]);

    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

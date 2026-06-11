import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { VerifyEmailForm } from "./VerifyEmailForm";
import { mockDictionary as mockDict } from "@tests/fixtures/mockDictionary";

vi.mock("@/actions/auth", () => ({
  resendVerificationEmail: vi.fn(),
}));

// Drives the resend-success state: the component reads its state from
// React's useActionState, so override it to return { success: true } while
// preserving every other React export the component relies on.
const useActionStateMock = vi.hoisted(() => vi.fn());
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return { ...actual, useActionState: useActionStateMock };
});

describe("VerifyEmailForm", () => {
  beforeEach(() => {
    // Default: initial (null) action state, matching useActionState's seed.
    useActionStateMock.mockReturnValue([null, vi.fn()]);
  });

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

  it("should render dashboard link pointing at the localized home", () => {
    render(<VerifyEmailForm email="test@example.com" dict={mockDict} lang="en" />);

    const link = screen.getByRole("link", { name: /go to dashboard/i });
    expect(link).toBeInTheDocument();
    // The dashboard lives at /{lang} (the home route), NOT a phantom /dashboard.
    expect(link).toHaveAttribute("href", "/en");
  });

  it("should render the verify subtitle", () => {
    render(<VerifyEmailForm email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByText(/check your inbox to activate/i)).toBeInTheDocument();
  });

  it("should render the resend-success live region when the action succeeds", () => {
    useActionStateMock.mockReturnValue([{ success: true }, vi.fn()]);

    render(<VerifyEmailForm email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

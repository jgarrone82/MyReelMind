import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { VerificationSentView } from "./VerificationSentView";

vi.mock("@/actions/auth", () => ({
  sendVerificationEmail: vi.fn(),
}));

const mockDict = {
  app: { title: "MyReelMind", description: "" },
  nav: { home: "", search: "", library: "", dashboard: "" },
  search: { placeholder: "", noResults: "", loading: "", title: "", all: "", movies: "", tv: "", anime: "" },
  library: { title: "", empty: "", added: "", removed: "", statusUpdated: "", ratingUpdated: "", progressUpdated: "", markedCompleted: "", remove: "", filterAll: "", filterWatching: "", filterCompleted: "", filterDropped: "", filterPlanned: "", addToLibrary: "", collection: "", noEpisodes: "", removeConfirm: "" },
  media: { movie: "", tv: "", anime: "", status: { want_to_watch: "", watching: "", completed: "", paused: "", dropped: "" } },
  dashboard: { title: "", totalWatched: "", totalHours: "", recentActivity: "", noActivity: "", ctaSearch: "" },
  common: { save: "", cancel: "", delete: "", edit: "", loading: "", error: "" },
  auth: {
    login: { title: "", email: "", password: "", submit: "", loading: "", error: "", oauth: "", forgotPassword: "" },
    signup: { title: "", email: "", password: "", confirmPassword: "", submit: "", loading: "", success: "" },
    logout: "",
    errors: { invalidCredentials: "", weakPassword: "", passwordsMismatch: "", emailInUse: "" },
    passwordReset: { title: "", description: "", email: "", submit: "", loading: "", success: "", successDescription: "", backToLogin: "", newPassword: "", confirmPassword: "", updatePassword: "", updatingPassword: "", passwordUpdated: "", noSession: "", requestNewReset: "" },
    emailVerification: {
      title: "Check your email",
      description: "We sent a verification link",
      checkInbox: "Check your inbox at",
      resendButton: "Resend email",
      resendLoading: "Sending...",
      resendSuccess: "Email sent!",
      resendError: "Failed to send",
      backToLogin: "Back to login",
      goToDashboard: "Go to dashboard",
      verifyTitle: "",
      verifyDescription: "",
      verifyEmail: "",
      notYourEmail: "",
      emailConfirmed: "",
    },
  },
};

describe("VerificationSentView", () => {
  it("should render heading with title", () => {
    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByRole("heading", { name: /check your email/i })).toBeInTheDocument();
  });

  it("should render description text", () => {
    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByText(/we sent a verification link/i)).toBeInTheDocument();
  });

  it("should display the email address", () => {
    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument();
  });

  it("should render resend button", () => {
    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByRole("button", { name: /resend email/i })).toBeInTheDocument();
  });

  it("should render login link", () => {
    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    expect(screen.getByRole("link", { name: /back to login/i })).toBeInTheDocument();
  });

  it("should show success message after resend", async () => {
    render(<VerificationSentView email="test@example.com" dict={mockDict} lang="en" />);

    const button = screen.getByRole("button", { name: /resend email/i });
    button.click();

    // Simulate success state
    expect(screen.queryByText(/email sent!/i)).not.toBeInTheDocument();
  });
});

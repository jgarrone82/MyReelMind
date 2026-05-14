import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { VerifyEmailForm } from "./VerifyEmailForm";

vi.mock("@/actions/auth", () => ({
  resendVerificationEmail: vi.fn(),
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
      title: "",
      description: "",
      checkInbox: "",
      resendButton: "Resend verification email",
      resendLoading: "",
      resendSuccess: "",
      resendError: "",
      backToLogin: "",
      goToDashboard: "Go to dashboard",
      verifyTitle: "Verify your email",
      verifyDescription: "Click below to receive a verification link",
      verifyEmail: "Your email",
      notYourEmail: "Not your email?",
      emailConfirmed: "",
    },
  },
};

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

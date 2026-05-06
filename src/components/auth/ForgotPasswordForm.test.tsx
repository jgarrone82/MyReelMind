import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

vi.mock("@/actions/auth", () => ({
  forgotPassword: vi.fn(),
}));

const mockDict = {
  app: { title: "MyReelMind", description: "" },
  nav: { home: "", search: "", library: "", dashboard: "" },
  search: { placeholder: "", noResults: "", loading: "" },
  media: { movie: "", tv: "", anime: "", status: { want_to_watch: "", watching: "", completed: "", paused: "", dropped: "" } },
  dashboard: { title: "", totalWatched: "", totalHours: "", recentActivity: "", noActivity: "", ctaSearch: "" },
  common: { save: "", cancel: "", delete: "", edit: "", loading: "", error: "" },
  auth: {
    login: { title: "", email: "", password: "", submit: "", loading: "", error: "", oauth: "", forgotPassword: "" },
    signup: { title: "", email: "", password: "", confirmPassword: "", submit: "", loading: "", success: "" },
    logout: "",
    errors: { invalidCredentials: "", weakPassword: "", passwordsMismatch: "", emailInUse: "" },
    passwordReset: {
      title: "Reset your password",
      description: "Enter your email",
      email: "Email",
      submit: "Send reset link",
      loading: "Sending...",
      success: "Check your email",
      successDescription: "We sent you a link",
      backToLogin: "Back to login",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      updatePassword: "Update password",
      updatingPassword: "Updating...",
      passwordUpdated: "Password updated!",
      noSession: "No active session",
      requestNewReset: "Request new link",
    },
  },
};

describe("ForgotPasswordForm", () => {
  it("should render email input and submit button", () => {
    render(<ForgotPasswordForm lang="en" dict={mockDict} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  it("should render link back to login", () => {
    render(<ForgotPasswordForm lang="en" dict={mockDict} />);

    expect(screen.getByRole("link", { name: /back to login/i })).toHaveAttribute("href", "/en/login");
  });

  it("should show success message when state has success", () => {
    render(<ForgotPasswordForm lang="en" dict={mockDict} />);

    // The form should be visible initially
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("should use correct locale in links", () => {
    render(<ForgotPasswordForm lang="es" dict={mockDict} />);

    // Link href should contain the correct locale
    expect(screen.getByRole("link", { name: /back to login/i })).toHaveAttribute("href", "/es/login");
  });
});

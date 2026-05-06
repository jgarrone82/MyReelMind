import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResetPasswordForm } from "./ResetPasswordForm";

vi.mock("@/actions/auth", () => ({
  updatePassword: vi.fn(),
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
      confirmPassword: "Confirm new password",
      updatePassword: "Update password",
      updatingPassword: "Updating...",
      passwordUpdated: "Password updated!",
      noSession: "No active session",
      requestNewReset: "Request new link",
    },
  },
};

describe("ResetPasswordForm", () => {
  it("should render new password and confirm password inputs", () => {
    render(<ResetPasswordForm dict={mockDict} />);

    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
  });

  it("should render update password submit button", () => {
    render(<ResetPasswordForm dict={mockDict} />);

    expect(screen.getByRole("button", { name: "Update password" })).toBeInTheDocument();
  });

  it("should have minLength attribute on password inputs", () => {
    render(<ResetPasswordForm dict={mockDict} />);

    const passwordInput = screen.getByLabelText("New password");
    const confirmInput = screen.getByLabelText("Confirm new password");

    expect(passwordInput).toHaveAttribute("minlength", "8");
    expect(confirmInput).toHaveAttribute("minlength", "8");
  });
});

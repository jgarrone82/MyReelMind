import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { dictionary } from "@/i18n/dictionaries/en";

vi.mock("@/actions/auth", () => ({
  updatePassword: vi.fn(),
}));

describe("ResetPasswordForm", () => {
  it("should render new password and confirm password inputs", () => {
    render(<ResetPasswordForm dict={dictionary} />);

    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
  });

  it("should render update password submit button", () => {
    render(<ResetPasswordForm dict={dictionary} />);

    expect(screen.getByRole("button", { name: "Update password" })).toBeInTheDocument();
  });

  it("should have minLength attribute on password inputs", () => {
    render(<ResetPasswordForm dict={dictionary} />);

    const passwordInput = screen.getByLabelText("New password");
    const confirmInput = screen.getByLabelText("Confirm new password");

    expect(passwordInput).toHaveAttribute("minlength", "8");
    expect(confirmInput).toHaveAttribute("minlength", "8");
  });
});

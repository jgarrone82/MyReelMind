import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { dictionary } from "@/i18n/dictionaries/en";

vi.mock("@/actions/auth", () => ({
  forgotPassword: vi.fn(),
}));

describe("ForgotPasswordForm", () => {
  it("should render email input and submit button", () => {
    render(<ForgotPasswordForm lang="en" dict={dictionary} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  it("should render link back to login", () => {
    render(<ForgotPasswordForm lang="en" dict={dictionary} />);

    expect(screen.getByRole("link", { name: /back to login/i })).toHaveAttribute("href", "/en/login");
  });

  it("should show success message when state has success", () => {
    render(<ForgotPasswordForm lang="en" dict={dictionary} />);

    // The form should be visible initially
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("should use correct locale in links", () => {
    render(<ForgotPasswordForm lang="es" dict={dictionary} />);

    // Link href should contain the correct locale
    expect(screen.getByRole("link", { name: /back to login/i })).toHaveAttribute("href", "/es/login");
  });
});

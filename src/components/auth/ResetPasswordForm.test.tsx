import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { dictionary } from "@/i18n/dictionaries/en";

vi.mock("@/actions/auth", () => ({
  updatePassword: vi.fn(),
}));

import { updatePassword } from "@/actions/auth";

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render new password and confirm password inputs", () => {
    render(<ResetPasswordForm lang="en" dict={dictionary} />);

    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm new password")).toBeInTheDocument();
  });

  it("should render update password submit button", () => {
    render(<ResetPasswordForm lang="en" dict={dictionary} />);

    expect(screen.getByRole("button", { name: "Update password" })).toBeInTheDocument();
  });

  it("should have minLength attribute on password inputs", () => {
    render(<ResetPasswordForm lang="en" dict={dictionary} />);

    const passwordInput = screen.getByLabelText("New password");
    const confirmInput = screen.getByLabelText("Confirm new password");

    expect(passwordInput).toHaveAttribute("minlength", "8");
    expect(confirmInput).toHaveAttribute("minlength", "8");
  });

  it("binds the active locale as the first arg and submits the password fields", async () => {
    // The action is bound with the active locale via .bind(null, lang), so the
    // underlying mock is invoked as updatePassword(lang, prevState, formData).
    vi.mocked(updatePassword).mockResolvedValue({ success: true });

    render(<ResetPasswordForm lang="en" dict={dictionary} />);

    fireEvent.input(screen.getByLabelText("New password"), {
      target: { value: "password123" },
    });
    fireEvent.input(screen.getByLabelText("Confirm new password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith("en", null, expect.any(Object));
    });

    const formData = vi.mocked(updatePassword).mock.calls[0][2] as FormData;
    expect(formData.get("password")).toBe("password123");
    expect(formData.get("confirmPassword")).toBe("password123");
  });
});

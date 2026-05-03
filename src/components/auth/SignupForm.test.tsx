import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { SignupForm } from "./SignupForm";
import { dictionary } from "@/i18n/dictionaries/en";

// Mock the auth action
vi.mock("@/actions/auth", () => ({
  signUp: vi.fn(),
}));

import { signUp } from "@/actions/auth";

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render email and password fields", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it("should render submit button", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("should call signUp on form submit", async () => {
    vi.mocked(signUp).mockResolvedValue({ success: true });

    render(<SignupForm lang="en" dict={dictionary} />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    fireEvent.input(emailInput, { target: { value: "newuser@example.com" } });
    fireEvent.input(passwordInput, { target: { value: "password123" } });
    fireEvent.input(confirmInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(
        null,
        expect.any(Object)
      );
    });

    const call = signUp.mock.calls[0];
    const formData = call[1] as FormData;
    expect(formData.get("email")).toBe("newuser@example.com");
    expect(formData.get("password")).toBe("password123");
    expect(formData.get("confirmPassword")).toBe("password123");
  });

  it("should display error message when action returns error", async () => {
    vi.mocked(signUp).mockResolvedValue({ error: "Email already registered" });

    render(<SignupForm lang="en" dict={dictionary} />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    fireEvent.input(emailInput, { target: { value: "existing@example.com" } });
    fireEvent.input(passwordInput, { target: { value: "password123" } });
    fireEvent.input(confirmInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Email already registered");
    });
  });

  it("should render link to login", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toHaveAttribute("href", "/en/login");
  });

  it("should render email, password, and confirmPassword fields", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("should have correct input types", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmInput).toHaveAttribute("type", "password");
  });
});
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { LoginForm } from "./LoginForm";
import { dictionary } from "@/i18n/dictionaries/en";

// Mock the auth action
vi.mock("@/actions/auth", () => ({
  signIn: vi.fn(),
}));

import { signIn } from "@/actions/auth";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render email and password fields", () => {
    render(<LoginForm lang="en" dict={dictionary} />);

    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("should render submit button", () => {
    render(<LoginForm lang="en" dict={dictionary} />);

    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("should call signIn on form submit", async () => {
    vi.mocked(signIn).mockResolvedValue({ success: true });

    render(<LoginForm lang="en" dict={dictionary} />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.input(emailInput, { target: { value: "test@example.com" } });
    fireEvent.input(passwordInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        null,
        expect.any(Object)
      );
    });

    const call = signIn.mock.calls[0];
    const formData = call[1] as FormData;
    expect(formData.get("email")).toBe("test@example.com");
    expect(formData.get("password")).toBe("password123");
  });

  it("should display error message when action returns error", async () => {
    vi.mocked(signIn).mockResolvedValue({ error: "Invalid email or password" });

    render(<LoginForm lang="en" dict={dictionary} />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.input(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.input(passwordInput, { target: { value: "wrongpassword" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password");
    });
  });

  it("should render link to signup", () => {
    render(<LoginForm lang="en" dict={dictionary} />);

    const link = screen.getByRole("link", { name: /create account/i });
    expect(link).toHaveAttribute("href", "/en/signup");
  });

  it("should have correct input types", () => {
    render(<LoginForm lang="en" dict={dictionary} />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
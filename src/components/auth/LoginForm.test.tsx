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

    expect(screen.getByRole("textbox", { name: /member email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/pass code/i, { selector: "input" })).toBeInTheDocument();
  });

  it("should render submit button", () => {
    render(<LoginForm lang="en" dict={dictionary} />);

    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("should call signIn on form submit", async () => {
    vi.mocked(signIn).mockResolvedValue({ success: true });

    render(<LoginForm lang="en" dict={dictionary} />);

    const emailInput = screen.getByRole("textbox", { name: /member email/i });
    const passwordInput = screen.getByLabelText(/pass code/i, { selector: "input" });
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.input(emailInput, { target: { value: "test@example.com" } });
    fireEvent.input(passwordInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

    // The action is bound with the active locale via .bind(null, lang), so the
    // underlying mock is invoked as signIn(lang, prevState, formData).
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        "en",
        null,
        expect.any(Object)
      );
    });

    const call = vi.mocked(signIn).mock.calls[0];
    const formData = call[2] as FormData;
    expect(formData.get("email")).toBe("test@example.com");
    expect(formData.get("password")).toBe("password123");
  });

  it("should display an error banner with the action's error message", async () => {
    vi.mocked(signIn).mockResolvedValue({ error: "Invalid email or password" });

    render(<LoginForm lang="en" dict={dictionary} />);

    const emailInput = screen.getByRole("textbox", { name: /member email/i });
    const passwordInput = screen.getByLabelText(/pass code/i, { selector: "input" });
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.input(emailInput, { target: { value: "wrong@example.com" } });
    fireEvent.input(passwordInput, { target: { value: "wrongpassword" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      // banner shows the "TRACKING ERROR" headline plus the real message
      expect(alert).toHaveTextContent(/tracking error/i);
      expect(alert).toHaveTextContent("Invalid email or password");
    });
  });

  it("should fall back to the generic error body when the action gives no message", async () => {
    // signIn returns a truthy error object without a usable string message
    vi.mocked(signIn).mockResolvedValue({ error: "" });

    render(<LoginForm lang="en" dict={dictionary} />);

    fireEvent.input(screen.getByRole("textbox", { name: /member email/i }), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.input(screen.getByLabelText(/pass code/i, { selector: "input" }), {
      target: { value: "x" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        dictionary.auth.login.errorBody,
      );
    });
  });

  it("should toggle the password field between hidden and visible", () => {
    render(<LoginForm lang="en" dict={dictionary} />);

    const passwordInput = screen.getByLabelText(/pass code/i, { selector: "input" });
    const toggle = screen.getByRole("button", { name: /show/i });

    // starts hidden
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);

    // now visible, label flips to Hide
    expect(passwordInput).toHaveAttribute("type", "text");
    const hideToggle = screen.getByRole("button", { name: /hide/i });
    expect(hideToggle).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(hideToggle);

    // back to hidden
    expect(screen.getByLabelText(/pass code/i, { selector: "input" })).toHaveAttribute("type", "password");
  });

  it("should render the forgot-password link", () => {
    render(<LoginForm lang="en" dict={dictionary} />);

    const link = screen.getByRole("link", { name: /forgot your pass code/i });
    expect(link).toHaveAttribute("href", "/en/forgot-password");
  });

  it("should have correct default input types", () => {
    render(<LoginForm lang="en" dict={dictionary} />);

    const emailInput = screen.getByRole("textbox", { name: /member email/i });
    const passwordInput = screen.getByLabelText(/pass code/i, { selector: "input" });

    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});

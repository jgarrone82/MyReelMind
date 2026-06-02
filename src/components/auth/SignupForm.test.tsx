import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { SignupForm } from "./SignupForm";
import { dictionary } from "@/i18n/dictionaries/en";

// Mock the auth action
vi.mock("@/actions/auth", () => ({
  signUp: vi.fn(),
}));

import { signUp } from "@/actions/auth";

const t = dictionary.auth.signup;

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render email and password fields", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^pass code$/i)).toBeInTheDocument();
  });

  it("should render the VHS submit button", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    expect(
      screen.getByRole("button", { name: /issue my card/i })
    ).toBeInTheDocument();
  });

  it("should render email, password, and confirm password fields", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^pass code$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm pass code$/i)).toBeInTheDocument();
  });

  it("should have correct input names and types", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/^pass code$/i);
    const confirmInput = screen.getByLabelText(/^confirm pass code$/i);

    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("name", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("name", "password");
    expect(confirmInput).toHaveAttribute("type", "password");
    expect(confirmInput).toHaveAttribute("name", "confirmPassword");
  });

  it("should require all fields and enforce minLength on pass codes", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/^pass code$/i);
    const confirmInput = screen.getByLabelText(/^confirm pass code$/i);

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmInput).toBeRequired();
    expect(passwordInput).toHaveAttribute("minlength", "8");
    expect(confirmInput).toHaveAttribute("minlength", "8");
    expect(emailInput).toHaveAttribute("autocomplete", "email");
    expect(passwordInput).toHaveAttribute("autocomplete", "new-password");
    expect(confirmInput).toHaveAttribute("autocomplete", "new-password");
  });

  it("submits email, password, and confirmPassword in the FormData", async () => {
    vi.mocked(signUp).mockResolvedValue({ success: true });

    render(<SignupForm lang="en" dict={dictionary} />);

    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInput = screen.getByLabelText(/^pass code$/i);
    const confirmInput = screen.getByLabelText(/^confirm pass code$/i);
    const submitButton = screen.getByRole("button", { name: /issue my card/i });

    fireEvent.input(emailInput, { target: { value: "newuser@example.com" } });
    fireEvent.input(passwordInput, { target: { value: "password123" } });
    fireEvent.input(confirmInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(null, expect.any(Object));
    });

    const call = vi.mocked(signUp).mock.calls[0];
    const formData = call[1] as FormData;
    expect(formData.get("email")).toBe("newuser@example.com");
    expect(formData.get("password")).toBe("password123");
    expect(formData.get("confirmPassword")).toBe("password123");
  });

  it("submits all three fields even when the pass codes do not match", async () => {
    // The server action ignores confirmPassword; the form must never block
    // submit on a client-side mismatch — it still posts all three fields.
    vi.mocked(signUp).mockResolvedValue({ success: true });

    render(<SignupForm lang="en" dict={dictionary} />);

    fireEvent.input(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.input(screen.getByLabelText(/^pass code$/i), {
      target: { value: "password123" },
    });
    fireEvent.input(screen.getByLabelText(/^confirm pass code$/i), {
      target: { value: "different999" },
    });

    fireEvent.click(screen.getByRole("button", { name: /issue my card/i }));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(null, expect.any(Object));
    });

    const formData = vi.mocked(signUp).mock.calls[0][1] as FormData;
    expect(formData.get("password")).toBe("password123");
    expect(formData.get("confirmPassword")).toBe("different999");
  });

  it("displays the VHS error banner when the action returns an error", async () => {
    vi.mocked(signUp).mockResolvedValue({ error: "Email already registered" });

    render(<SignupForm lang="en" dict={dictionary} />);

    fireEvent.input(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "existing@example.com" },
    });
    fireEvent.input(screen.getByLabelText(/^pass code$/i), {
      target: { value: "password123" },
    });
    fireEvent.input(screen.getByLabelText(/^confirm pass code$/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /issue my card/i }));

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(t.errorHeadline);
      expect(alert).toHaveTextContent("Email already registered");
    });
  });

  it("falls back to the generic error body when the action error is empty", async () => {
    vi.mocked(signUp).mockResolvedValue({ error: "" });

    render(<SignupForm lang="en" dict={dictionary} />);

    fireEvent.input(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "existing@example.com" },
    });
    fireEvent.input(screen.getByLabelText(/^pass code$/i), {
      target: { value: "password123" },
    });
    fireEvent.input(screen.getByLabelText(/^confirm pass code$/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /issue my card/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(t.errorBody);
    });
  });

  it("shows the pending/printing state while the signUp action is in flight", async () => {
    // Block the action on an unresolved promise so useFormStatus().pending
    // stays true and the SubmitButton renders its loading state.
    vi.mocked(signUp).mockImplementation(() => new Promise(() => {}));

    render(<SignupForm lang="en" dict={dictionary} />);

    fireEvent.input(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.input(screen.getByLabelText(/^pass code$/i), {
      target: { value: "password123" },
    });
    fireEvent.input(screen.getByLabelText(/^confirm pass code$/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /issue my card/i }));

    // While pending: button disabled, aria-busy true, and the tape label shown
    // (t.loadingTape) instead of the idle submit label (t.submit).
    await waitFor(() => {
      const submitButton = screen.getByRole("button", {
        name: new RegExp(t.loadingTape, "i"),
      });
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveAttribute("aria-busy", "true");
      expect(submitButton).toHaveTextContent(t.loadingTape);
      expect(submitButton).not.toHaveTextContent(t.submit);
    });
  });

  it("toggles each pass code field independently with its own SHOW/HIDE control", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    const passwordInput = screen.getByLabelText(/^pass code$/i);
    const confirmInput = screen.getByLabelText(/^confirm pass code$/i);

    const passwordToggle = screen.getByRole("button", {
      name: /show pass code/i,
    });
    const confirmToggle = screen.getByRole("button", {
      name: /show confirm pass code/i,
    });

    // aria-controls must each target a single, valid input id.
    expect(passwordToggle).toHaveAttribute(
      "aria-controls",
      passwordInput.getAttribute("id")
    );
    expect(confirmToggle).toHaveAttribute(
      "aria-controls",
      confirmInput.getAttribute("id")
    );

    expect(passwordToggle).toHaveAttribute("aria-pressed", "false");
    expect(passwordToggle).toHaveAccessibleName(/show pass code/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(passwordToggle);

    // Only the password field reveals; confirm stays masked.
    expect(passwordToggle).toHaveAttribute("aria-pressed", "true");
    // The accessible name flips from SHOW to HIDE after the reveal.
    expect(passwordToggle).toHaveAccessibleName(/hide pass code/i);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(confirmInput).toHaveAttribute("type", "password");

    // The confirm toggle's accessible name flips on its own click too.
    expect(confirmToggle).toHaveAccessibleName(/show confirm pass code/i);
    fireEvent.click(confirmToggle);
    expect(confirmToggle).toHaveAccessibleName(/hide confirm pass code/i);
    expect(confirmInput).toHaveAttribute("type", "text");
  });

  it("renders an accessible pass-code strength status that updates with input", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    // Empty state — the strength-0 label is shown inside the live region.
    expect(screen.getByText(t.strength0)).toBeInTheDocument();
    // The strength text must live inside a role="status" region so screen
    // readers announce updates — this fails if the live region is removed.
    expect(
      screen.getByText(t.strength0).closest('[role="status"]')
    ).toBeInTheDocument();

    fireEvent.input(screen.getByLabelText(/^pass code$/i), {
      target: { value: "Str0ng!Pass" },
    });

    // A strong code surfaces the vault-grade label, still inside the live region.
    expect(screen.getByText(t.strength4)).toBeInTheDocument();
    expect(
      screen.getByText(t.strength4).closest('[role="status"]')
    ).toBeInTheDocument();
  });

  it("renders a textual confirm-match indicator (not color alone)", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    fireEvent.input(screen.getByLabelText(/^pass code$/i), {
      target: { value: "password123" },
    });
    fireEvent.input(screen.getByLabelText(/^confirm pass code$/i), {
      target: { value: "password123" },
    });

    expect(screen.getByText(t.matchOk)).toBeInTheDocument();
    // The match text must live inside a role="status" region so screen readers
    // announce the change — this fails if the live region is removed.
    expect(
      screen.getByText(t.matchOk).closest('[role="status"]')
    ).toBeInTheDocument();

    fireEvent.input(screen.getByLabelText(/^confirm pass code$/i), {
      target: { value: "nope" },
    });

    expect(screen.getByText(t.matchNo)).toBeInTheDocument();
    expect(
      screen.getByText(t.matchNo).closest('[role="status"]')
    ).toBeInTheDocument();
  });

  it("renders a link to the login page", () => {
    render(<SignupForm lang="en" dict={dictionary} />);

    const link = screen.getByRole("link", { name: /sign in here/i });
    expect(link).toHaveAttribute("href", "/en/login");
  });
});

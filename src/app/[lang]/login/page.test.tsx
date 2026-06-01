import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// Mock child components
vi.mock("@/components/auth/LoginForm", () => ({
  LoginForm: () => <div data-testid="login-form">LoginForm</div>,
}));

vi.mock("@/components/auth/OAuthButtons", () => ({
  OAuthButtons: () => <div data-testid="oauth-buttons">OAuthButtons</div>,
}));

// Mock the dictionary
const mockDict = {
  app: { title: "MyReelMind", description: "Track your movies and anime" },
  nav: { home: "Home", search: "Search", library: "My Library", dashboard: "Dashboard" },
  search: { placeholder: "Search...", noResults: "No results", loading: "Loading...", title: "", all: "", movies: "", tv: "", anime: "" },
  library: { title: "", empty: "", added: "", removed: "", statusUpdated: "", ratingUpdated: "", progressUpdated: "", markedCompleted: "", remove: "", filterAll: "", filterWatching: "", filterCompleted: "", filterDropped: "", filterPlanned: "", addToLibrary: "", collection: "", noEpisodes: "", removeConfirm: "" },
  media: {
    movie: "Movie", tv: "TV Show", anime: "Anime",
    status: {
      want_to_watch: "Want to Watch", watching: "Watching",
      completed: "Completed", paused: "Paused", dropped: "Dropped",
    },
  },
  dashboard: {
    title: "Dashboard", totalWatched: "Completed", totalHours: "Hours",
    recentActivity: "Recent", noActivity: "No activity", ctaSearch: "Find something",
  },
  common: { save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", loading: "Loading...", error: "Error" },
  auth: {
    login: {
      title: "Sign in",
      email: "Email",
      password: "Password",
      submit: "Sign in",
      loading: "Signing in...",
      error: "Failed to sign in",
      oauth: "Continue with",
      divider: "or",
      noAccount: "Don't have an account?",
      forgotPassword: "Forgot your pass code?",
      kicker: "Membership Desk",
      headline: "Member sign-in",
      subtitle: "Insert card to continue",
      emailLabel: "Member email",
      emailPlaceholder: "you@videostore.com",
      emailRequired: "REQ",
      passwordLabel: "Pass code",
      passwordPlaceholder: "••••••••",
      showPassword: "Show",
      hidePassword: "Hide",
      loadingTape: "Reading tape...",
      oauthGoogle: "Continue with Google",
      oauthGithub: "Continue with GitHub",
      errorHeadline: "Tracking error",
      errorBody: "That email or pass code didn't scan. Check the card and try again.",
      newHere: "New here? Get a member card",
      terminalFooter: "Terminal 04 · Sign-in · NTSC",
      finePrint: "By signing in you agree to rewind every tape. Late fees apply.",
    },
    signup: {
      title: "Create account",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      submit: "Create account",
      loading: "Creating account...",
      success: "Account created!",
    },
    logout: "Sign out",
    errors: {
      invalidCredentials: "Invalid email or password",
      weakPassword: "Password must be at least 8 characters",
      passwordsMismatch: "Passwords do not match",
      emailInUse: "This email is already registered",
    },
    passwordReset: {
      title: "", description: "", email: "", submit: "", loading: "",
      success: "", successDescription: "", backToLogin: "",
      newPassword: "", confirmPassword: "", updatePassword: "",
      updatingPassword: "", passwordUpdated: "Password updated successfully!",
      noSession: "", requestNewReset: "",
    },
    emailVerification: {
      title: "", description: "", checkInbox: "", resendButton: "",
      resendLoading: "", resendSuccess: "", resendError: "", backToLogin: "",
      goToDashboard: "", verifyTitle: "", verifyDescription: "", verifyEmail: "",
      notYourEmail: "", emailConfirmed: "Email verified! You can now sign in.",
    },
  },
};

vi.mock("@/i18n", () => ({
  getDictionary: vi.fn(async () => mockDict),
}));

import LoginPage from "./page";

describe("LoginPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render login heading", async () => {
    const page = await LoginPage({
      params: Promise.resolve({ lang: "en" }),
      searchParams: Promise.resolve({}),
    });

    render(page);

    // Design headline is "Member sign-in"; tolerate the hyphen but still
    // require a sign-in heading to be present.
    expect(screen.getByRole("heading", { name: /sign[\s-]in/i })).toBeInTheDocument();
  });

  it("should render LoginForm component", async () => {
    const page = await LoginPage({
      params: Promise.resolve({ lang: "en" }),
      searchParams: Promise.resolve({}),
    });

    render(page);

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("should render OAuthButtons component", async () => {
    const page = await LoginPage({
      params: Promise.resolve({ lang: "en" }),
      searchParams: Promise.resolve({}),
    });

    render(page);

    expect(screen.getByTestId("oauth-buttons")).toBeInTheDocument();
  });

  it("should render the localized OAuth divider (not a hardcoded Spanish 'o')", async () => {
    const page = await LoginPage({
      params: Promise.resolve({ lang: "en" }),
      searchParams: Promise.resolve({}),
    });

    render(page);

    expect(screen.getByText("or")).toBeInTheDocument();
    expect(screen.queryByText("o")).not.toBeInTheDocument();
  });

  it("should render the framed 'new here' signup link", async () => {
    const page = await LoginPage({
      params: Promise.resolve({ lang: "en" }),
      searchParams: Promise.resolve({}),
    });

    render(page);

    const link = screen.getByRole("link", { name: /new here\? get a member card/i });
    expect(link).toHaveAttribute("href", "/en/signup");
  });
});

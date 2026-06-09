import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// Mock child components
vi.mock("@/components/auth/SignupForm", () => ({
  SignupForm: () => <div data-testid="signup-form">SignupForm</div>,
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
      submit: "Issue my card",
      loading: "Creating account...",
      success: "Account created!",
      kicker: "Membership Application",
      formNo: "Form MRM-101 · Membership Application",
      headline: "Get your member card",
      subtitle: "Free for life — bring your own snacks",
      emailLabel: "Email",
      emailPlaceholder: "you@videostore.com",
      emailRequired: "REQ",
      passwordLabel: "Pass code",
      passwordPlaceholder: "min. 8 characters",
      confirmLabel: "Confirm pass code",
      confirmPlaceholder: "type it again",
      showPassword: "Show",
      hidePassword: "Hide",
      strengthLabel: "Pass code strength",
      strength0: "Enter a pass code",
      strength1: "Weak — easily rewound",
      strength2: "Fair — could be tighter",
      strength3: "Good — tracking stable",
      strength4: "Strong — vault-grade",
      matchOk: "Pass codes match",
      matchNo: "Pass codes don't match",
      loadingTape: "Printing card…",
      divider: "or apply with",
      errorHeadline: "Application rejected",
      errorBody: "That email is already on a card in our files. Try signing in instead.",
      already: "Already a member?",
      signin: "Sign in here",
      finePrint: "Signature on file authorizes late fees. Member agrees to be kind and rewind.",
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

import SignupPage from "./page";

describe("SignupPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render the membership kicker", async () => {
    const page = await SignupPage({ params: Promise.resolve({ lang: "en" }) });
    render(page);

    expect(screen.getByText("Membership Application")).toBeInTheDocument();
  });

  it("should render the headline as the page heading", async () => {
    const page = await SignupPage({ params: Promise.resolve({ lang: "en" }) });
    render(page);

    expect(
      screen.getByRole("heading", { name: /get your member card/i })
    ).toBeInTheDocument();
  });

  it("should render the subtitle", async () => {
    const page = await SignupPage({ params: Promise.resolve({ lang: "en" }) });
    render(page);

    expect(
      screen.getByText(/free for life — bring your own snacks/i)
    ).toBeInTheDocument();
  });

  it("should render SignupForm component", async () => {
    const page = await SignupPage({ params: Promise.resolve({ lang: "en" }) });
    render(page);

    expect(screen.getByTestId("signup-form")).toBeInTheDocument();
  });

  it("should render OAuthButtons component", async () => {
    const page = await SignupPage({ params: Promise.resolve({ lang: "en" }) });
    render(page);

    expect(screen.getByTestId("oauth-buttons")).toBeInTheDocument();
  });

  it("should render the localized OAuth divider (not a hardcoded Spanish 'o')", async () => {
    const page = await SignupPage({ params: Promise.resolve({ lang: "en" }) });
    render(page);

    // The localized English divider is rendered (real assertion, not a hollow
    // "no bare 'o'" guard — the previous check only ever saw the EN dictionary).
    expect(screen.getByText(/or apply with/i)).toBeInTheDocument();
  });

  it("should render the membership fine print", async () => {
    const page = await SignupPage({ params: Promise.resolve({ lang: "en" }) });
    render(page);

    expect(
      screen.getByText(/member agrees to be kind and rewind/i)
    ).toBeInTheDocument();
  });
});

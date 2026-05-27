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
      oauth: "Or continue with",
      forgotPassword: "Forgot password?",
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
  },
};

import LoginPage from "./page";

describe("LoginPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render login heading", async () => {
    const page = await LoginPage({
      params: Promise.resolve({ lang: "en" }),
      searchParams: Promise.resolve({}),
      dictionary: mockDict as any,
    });

    render(page);

    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  it("should render LoginForm component", async () => {
    const page = await LoginPage({
      params: Promise.resolve({ lang: "en" }),
      searchParams: Promise.resolve({}),
      dictionary: mockDict as any,
    });

    render(page);

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("should render OAuthButtons component", async () => {
    const page = await LoginPage({
      params: Promise.resolve({ lang: "en" }),
      searchParams: Promise.resolve({}),
      dictionary: mockDict as any,
    });

    render(page);

    expect(screen.getByTestId("oauth-buttons")).toBeInTheDocument();
  });

  it("should render the localized OAuth divider (not a hardcoded Spanish 'o')", async () => {
    const page = await LoginPage({
      params: Promise.resolve({ lang: "en" }),
      searchParams: Promise.resolve({}),
      dictionary: mockDict as any,
    });

    render(page);

    expect(screen.getByText("or")).toBeInTheDocument();
    expect(screen.queryByText("o")).not.toBeInTheDocument();
  });
});
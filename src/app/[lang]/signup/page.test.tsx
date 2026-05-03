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
  search: { placeholder: "Search...", noResults: "No results", loading: "Loading..." },
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
  },
};

import SignupPage from "./page";

describe("SignupPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render signup heading", async () => {
    const page = await SignupPage({
      params: Promise.resolve({ lang: "en" }),
      dictionary: mockDict as any,
    });

    render(page);

    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
  });

  it("should render SignupForm component", async () => {
    const page = await SignupPage({
      params: Promise.resolve({ lang: "en" }),
      dictionary: mockDict as any,
    });

    render(page);

    expect(screen.getByTestId("signup-form")).toBeInTheDocument();
  });

  it("should render OAuthButtons component", async () => {
    const page = await SignupPage({
      params: Promise.resolve({ lang: "en" }),
      dictionary: mockDict as any,
    });

    render(page);

    expect(screen.getByTestId("oauth-buttons")).toBeInTheDocument();
  });
});
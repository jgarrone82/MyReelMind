import { Dictionary } from "../types";

export const dictionary: Dictionary = {
  app: {
    title: "MyReelMind",
    description: "Track your movies and anime",
  },
  nav: {
    home: "Home",
    search: "Search",
    library: "My Library",
    dashboard: "Dashboard",
  },
  search: {
    placeholder: "Search movies or anime...",
    noResults: "No results found",
    loading: "Searching...",
  },
  media: {
    movie: "Movie",
    tv: "TV Show",
    anime: "Anime",
    status: {
      want_to_watch: "Want to Watch",
      watching: "Watching",
      completed: "Completed",
      paused: "Paused",
      dropped: "Dropped",
    },
  },
  dashboard: {
    title: "Your Activity",
    totalWatched: "Completed",
    totalHours: "Hours Watched",
    recentActivity: "Recent Activity",
    noActivity: "No activity yet",
    ctaSearch: "Find something to watch",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    loading: "Loading...",
    error: "Error",
  },
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

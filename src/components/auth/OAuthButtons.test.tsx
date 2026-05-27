import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { OAuthButtons } from "./OAuthButtons";
import { dictionary } from "@/i18n/dictionaries/en";

// Mock the auth action
vi.mock("@/actions/auth", () => ({
  signInWithOAuth: vi.fn(),
}));

import { signInWithOAuth } from "@/actions/auth";

describe("OAuthButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Google and GitHub buttons", () => {
    render(<OAuthButtons dict={dictionary} />);

    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with github/i })).toBeInTheDocument();
  });

  it("should call signInWithOAuth with 'google' when Google button is clicked", async () => {
    vi.mocked(signInWithOAuth).mockResolvedValue({ url: "https://accounts.google.com/oauth/authorize" });

    render(<OAuthButtons dict={dictionary} />);

    const googleButton = screen.getByRole("button", { name: /continue with google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith("google");
    });
  });

  it("should call signInWithOAuth with 'github' when GitHub button is clicked", async () => {
    vi.mocked(signInWithOAuth).mockResolvedValue({ url: "https://github.com/login/oauth/authorize" });

    render(<OAuthButtons dict={dictionary} />);

    const githubButton = screen.getByRole("button", { name: /continue with github/i });
    fireEvent.click(githubButton);

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith("github");
    });
  });

  it("should navigate to OAuth URL when returned", async () => {
    const url = "https://accounts.google.com/oauth/authorize";
    vi.mocked(signInWithOAuth).mockResolvedValue({ url });

    const replaceState = vi.spyOn(window, "location", "get").mockReturnValue({
      ...window.location,
      href: "",
    } as Location);

    render(<OAuthButtons dict={dictionary} />);

    const googleButton = screen.getByRole("button", { name: /continue with google/i });
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(window.location.href).toBe(url);
    });

    replaceState.mockRestore();
  });
});
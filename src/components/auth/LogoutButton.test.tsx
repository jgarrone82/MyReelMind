import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { LogoutButton } from "./LogoutButton";
import { dictionary } from "@/i18n/dictionaries/en";

// Mock the auth action
vi.mock("@/actions/auth", () => ({
  signOut: vi.fn(),
}));

import { signOut } from "@/actions/auth";

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render logout button", () => {
    render(<LogoutButton lang="en" dict={dictionary} />);

    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("should call signOut bound to the active locale when clicked", async () => {
    render(<LogoutButton lang="en" dict={dictionary} />);

    const button = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(button);

    // The form action is signOut.bind(null, lang); the bound call still invokes
    // the underlying signOut mock with the active locale pre-applied as the
    // first argument (a form action also appends FormData after it).
    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
    expect(vi.mocked(signOut).mock.calls[0][0]).toBe("en");
  });
});
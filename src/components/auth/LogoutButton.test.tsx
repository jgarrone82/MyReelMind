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
    render(<LogoutButton dict={dictionary} />);

    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("should call signOut when clicked", async () => {
    render(<LogoutButton dict={dictionary} />);

    const button = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
  });
});
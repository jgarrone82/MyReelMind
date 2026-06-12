import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GuestWelcome } from "./GuestWelcome";
import { dictionary as en } from "@/i18n/dictionaries/en";
import { dictionary as es } from "@/i18n/dictionaries/es";

/**
 * GuestWelcome is the honest logged-OUT landing for the home route. It is NOT
 * the "STORE CLOSED" members-only empty shelf (that is reserved for a genuine
 * logged-IN member with an empty library). It greets a visitor and offers the
 * two account CTAs: sign in (primary) and sign up (secondary).
 *
 * Href assertions are EXACT strings (`/en/login`, not a substring like `login`)
 * because this repo has a documented substring-match trap on locale-prefixed
 * links — a loose matcher would pass on the wrong route.
 */
describe("GuestWelcome", () => {
  it("renders the brand/welcome copy and both CTAs (en)", () => {
    render(<GuestWelcome lang="en" dict={en} />);

    expect(screen.getByText(en.dashboard.guest.headline)).toBeInTheDocument();
    expect(screen.getByText(en.dashboard.guest.body)).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: en.dashboard.guest.signIn }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: en.dashboard.guest.signUp }),
    ).toBeInTheDocument();
  });

  it("points the CTAs at the exact locale-prefixed auth routes (en)", () => {
    render(<GuestWelcome lang="en" dict={en} />);

    const signIn = screen.getByRole("link", {
      name: en.dashboard.guest.signIn,
    });
    const signUp = screen.getByRole("link", {
      name: en.dashboard.guest.signUp,
    });

    // EXACT href — substring matchers are banned here (see file header).
    expect(signIn).toHaveAttribute("href", "/en/login");
    expect(signUp).toHaveAttribute("href", "/en/signup");
  });

  it("locale-prefixes the CTAs for es as well", () => {
    render(<GuestWelcome lang="es" dict={es} />);

    expect(
      screen.getByRole("link", { name: es.dashboard.guest.signIn }),
    ).toHaveAttribute("href", "/es/login");
    expect(
      screen.getByRole("link", { name: es.dashboard.guest.signUp }),
    ).toHaveAttribute("href", "/es/signup");
  });

  it("does NOT render the members-only STORE CLOSED stamp", () => {
    render(<GuestWelcome lang="en" dict={en} />);

    expect(screen.queryByText("CLOSED")).not.toBeInTheDocument();
  });
});

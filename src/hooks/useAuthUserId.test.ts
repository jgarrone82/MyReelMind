import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Mock the auth provider so the hook reads a fake browser Supabase client
// instead of touching the real @supabase/ssr browser client.
vi.mock("@/lib/auth/provider", () => ({
  useAuthClient: vi.fn(),
}));

import { useAuthClient } from "@/lib/auth/provider";
import { useAuthUserId } from "./useAuthUserId";

type AuthChangeCallback = (event: string, session: unknown) => void;

/**
 * Build a fake Supabase client exposing only the two auth methods the hook
 * uses: `getUser()` and `onAuthStateChange()`. Returns the client plus a handle
 * to fire the auth-state-change callback so tests can simulate SIGNED_OUT etc.
 */
function makeAuthClient(initialUserId: string | null) {
  let callback: AuthChangeCallback = () => {};
  const unsubscribe = vi.fn();

  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: initialUserId ? { id: initialUserId } : null },
        error: null,
      }),
      onAuthStateChange: vi.fn((cb: AuthChangeCallback) => {
        callback = cb;
        return { data: { subscription: { unsubscribe } } };
      }),
    },
  };

  return {
    client,
    unsubscribe,
    fire: (event: string, session: unknown) => callback(event, session),
  };
}

/**
 * Build a fake Supabase client whose `getUser()` returns a promise the test
 * controls, so we can interleave a late `getUser()` resolution with an earlier
 * auth-state-change event and assert the event wins.
 */
function makeDeferredAuthClient(resolvedUserId: string | null) {
  let callback: AuthChangeCallback = () => {};
  const unsubscribe = vi.fn();
  let resolveGetUser!: () => void;

  const getUser = vi.fn().mockReturnValue(
    new Promise((resolve) => {
      resolveGetUser = () =>
        resolve({
          data: { user: resolvedUserId ? { id: resolvedUserId } : null },
          error: null,
        });
    })
  );

  const client = {
    auth: {
      getUser,
      onAuthStateChange: vi.fn((cb: AuthChangeCallback) => {
        callback = cb;
        return { data: { subscription: { unsubscribe } } };
      }),
    },
  };

  return {
    client,
    unsubscribe,
    fire: (event: string, session: unknown) => callback(event, session),
    resolveGetUser: () => resolveGetUser(),
  };
}

describe("useAuthUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the user id once the logged-in session resolves", async () => {
    const { client } = makeAuthClient("u1");
    vi.mocked(useAuthClient).mockReturnValue(client as never);

    const { result } = renderHook(() => useAuthUserId());

    await waitFor(() => expect(result.current).toBe("u1"));
  });

  it("returns null when there is no authenticated user", async () => {
    const { client } = makeAuthClient(null);
    vi.mocked(useAuthClient).mockReturnValue(client as never);

    const { result } = renderHook(() => useAuthUserId());

    // Starts null and stays null after getUser resolves with no user.
    expect(result.current).toBeNull();
    await waitFor(() =>
      expect(client.auth.getUser).toHaveBeenCalledTimes(1)
    );
    expect(result.current).toBeNull();
  });

  it("clears the user id when an auth-state-change reports SIGNED_OUT", async () => {
    const { client, fire } = makeAuthClient("u1");
    vi.mocked(useAuthClient).mockReturnValue(client as never);

    const { result } = renderHook(() => useAuthUserId());
    await waitFor(() => expect(result.current).toBe("u1"));

    act(() => {
      fire("SIGNED_OUT", null);
    });

    await waitFor(() => expect(result.current).toBeNull());
  });

  it("adopts the new user id when an auth-state-change reports a session", async () => {
    const { client, fire } = makeAuthClient(null);
    vi.mocked(useAuthClient).mockReturnValue(client as never);

    const { result } = renderHook(() => useAuthUserId());
    await waitFor(() => expect(client.auth.getUser).toHaveBeenCalled());
    expect(result.current).toBeNull();

    act(() => {
      fire("SIGNED_IN", { user: { id: "u2" } });
    });

    await waitFor(() => expect(result.current).toBe("u2"));
  });

  it("keeps a SIGNED_OUT auth event authoritative over a late getUser() resolution", async () => {
    // getUser() is in-flight (slow server round-trip) and has NOT resolved yet.
    const { client, fire, resolveGetUser } = makeDeferredAuthClient("u1");
    vi.mocked(useAuthClient).mockReturnValue(client as never);

    const { result } = renderHook(() => useAuthUserId());
    await waitFor(() => expect(client.auth.getUser).toHaveBeenCalled());

    // A SIGNED_OUT event fires WHILE getUser() is still pending.
    act(() => {
      fire("SIGNED_OUT", null);
    });
    expect(result.current).toBeNull();

    // The late getUser() resolves with a still-valid user — it must NOT
    // override the fresher sign-out.
    await act(async () => {
      resolveGetUser();
    });

    expect(result.current).toBeNull();
  });

  it("unsubscribes from auth-state changes on unmount", async () => {
    const { client, unsubscribe } = makeAuthClient("u1");
    vi.mocked(useAuthClient).mockReturnValue(client as never);

    const { unmount } = renderHook(() => useAuthUserId());
    await waitFor(() => expect(client.auth.onAuthStateChange).toHaveBeenCalled());

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});

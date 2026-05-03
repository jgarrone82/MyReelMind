import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DictionaryProvider, useDictionary } from "./provider";
import type { Dictionary } from "./types";

const mockDict: Dictionary = {
  app: { title: "Test", description: "Desc" },
  nav: { home: "Home", search: "Search", library: "Library", dashboard: "Dashboard" },
  search: { placeholder: "Search...", noResults: "None", loading: "Loading..." },
  media: {
    movie: "Movie",
    tv: "TV",
    anime: "Anime",
    status: {
      want_to_watch: "Want",
      watching: "Watching",
      completed: "Done",
      paused: "Paused",
      dropped: "Dropped",
    },
  },
  common: { save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", loading: "Loading", error: "Error" },
};

function TestConsumer() {
  const dict = useDictionary();
  return <span data-testid="title">{dict.app.title}</span>;
}

describe("DictionaryProvider", () => {
  it("should provide dictionary to children", () => {
    render(
      <DictionaryProvider dictionary={mockDict}>
        <TestConsumer />
      </DictionaryProvider>
    );
    expect(screen.getByTestId("title")).toHaveTextContent("Test");
  });

  it("should throw when useDictionary is used outside provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow();
    consoleError.mockRestore();
  });
});

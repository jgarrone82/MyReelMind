import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DictionaryProvider, useDictionary } from "./provider";
import { mockDictionary as mockDict } from "@tests/fixtures/mockDictionary";

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
    expect(screen.getByTestId("title")).toHaveTextContent("MyReelMind");
  });

  it("should throw when useDictionary is used outside provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow();
    consoleError.mockRestore();
  });
});

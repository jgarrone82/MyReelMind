import { describe, it, expect, vi, beforeEach } from "vitest";
import { mapStatusToBadge } from "./library-state";

describe("mapStatusToBadge", () => {
  it("maps no row (null) to ADD", () => {
    expect(mapStatusToBadge(null)).toBe("add");
  });

  it("maps watching to IN PROGRESS", () => {
    expect(mapStatusToBadge("watching")).toBe("in_progress");
  });

  it("maps paused to IN PROGRESS", () => {
    expect(mapStatusToBadge("paused")).toBe("in_progress");
  });

  it("maps want_to_watch to IN LIBRARY", () => {
    expect(mapStatusToBadge("want_to_watch")).toBe("in_library");
  });

  it("maps completed to IN LIBRARY", () => {
    expect(mapStatusToBadge("completed")).toBe("in_library");
  });

  it("maps dropped to IN LIBRARY (locked — dropped is a real tracked row)", () => {
    expect(mapStatusToBadge("dropped")).toBe("in_library");
  });
});

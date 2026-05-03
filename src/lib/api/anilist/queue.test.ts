import { describe, it, expect, vi, beforeEach } from "vitest";
import { AniListQueue } from "./queue";

describe("AniListQueue", () => {
  let queue: AniListQueue;

  beforeEach(() => {
    queue = new AniListQueue();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it("should execute a single request", async () => {
    const fn = vi.fn().mockResolvedValue("result1");
    const promise = queue.execute("key1", fn);

    const result = await promise;
    expect(result).toBe("result1");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should execute requests serially (one at a time)", async () => {
    const order: string[] = [];

    const fn1 = vi.fn().mockImplementation(async () => {
      order.push("start1");
      await new Promise((r) => setTimeout(r, 50));
      order.push("end1");
      return "result1";
    });

    const fn2 = vi.fn().mockImplementation(async () => {
      order.push("start2");
      return "result2";
    });

    const p1 = queue.execute("key1", fn1);
    const p2 = queue.execute("key2", fn2);

    await Promise.all([p1, p2]);

    expect(order).toEqual(["start1", "end1", "start2"]);
  });

  it("should coalesce duplicate in-flight requests", async () => {
    const fn = vi.fn().mockResolvedValue("shared");

    const p1 = queue.execute("same-key", fn);
    const p2 = queue.execute("same-key", fn);

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toBe("shared");
    expect(r2).toBe("shared");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry on 429 with exponential backoff", async () => {
    let attempts = 0;
    const fn = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts < 3) {
        const error = new Error("Rate limited");
        (error as any).status = 429;
        throw error;
      }
      return "recovered";
    });

    const promise = queue.execute("retry-key", fn);

    // Should wait 1000ms then 2000ms (exponential backoff)
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);

    const result = await promise;
    expect(result).toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("should respect Retry-After header on 429", async () => {
    let attempts = 0;
    const fn = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts === 1) {
        const error = new Error("Rate limited");
        (error as any).status = 429;
        (error as any).response = { headers: { get: () => "3" } };
        throw error;
      }
      return "after-wait";
    });

    const promise = queue.execute("retry-after-key", fn);
    await vi.advanceTimersByTimeAsync(3000);

    const result = await promise;
    expect(result).toBe("after-wait");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should throw after exhausting retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Persistent failure"));

    await expect(queue.execute("fail-key", fn)).rejects.toThrow("Persistent failure");
    expect(fn).toHaveBeenCalledTimes(4); // initial + 3 retries
  });
});

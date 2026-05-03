export class AniListQueue {
  private inFlight = new Map<string, Promise<unknown>>();
  private queue: Array<{
    key: string;
    fn: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }> = [];
  private running = false;
  private lastRequestTime = 0;
  private readonly minIntervalMs: number;
  private readonly maxRetries: number;

  constructor(options?: { minIntervalMs?: number; maxRetries?: number }) {
    this.minIntervalMs = options?.minIntervalMs ?? 0;
    this.maxRetries = options?.maxRetries ?? 3;
  }

  async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = new Promise<T>((resolve, reject) => {
      this.queue.push({
        key,
        fn: fn as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
    });

    this.inFlight.set(key, promise);
    this.processQueue();
    return promise;
  }

  private async processQueue() {
    if (this.running) return;
    this.running = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;

      // Rate limiting: enforce minimum interval between requests
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      if (this.minIntervalMs > 0 && elapsed < this.minIntervalMs) {
        const waitMs = this.minIntervalMs - elapsed;
        await new Promise((r) => setTimeout(r, waitMs));
      }

      try {
        const result = await this.runWithRetry(item.fn);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      } finally {
        this.lastRequestTime = Date.now();
        this.inFlight.delete(item.key);
      }
    }

    this.running = false;
  }

  private async runWithRetry<T>(
    fn: () => Promise<T>,
    attempt = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt < this.maxRetries) {
        let delayMs: number;

        if (error.status === 429) {
          // Use Retry-After header if available
          const retryAfter = error.response?.headers?.get?.("retry-after");
          if (retryAfter) {
            delayMs = parseInt(retryAfter, 10) * 1000;
          } else {
            // Exponential backoff: 1000ms, 2000ms, 4000ms
            delayMs = Math.pow(2, attempt) * 1000;
          }
        } else {
          // For non-429 errors, use smaller exponential backoff to keep tests fast
          delayMs = Math.pow(2, attempt) * 100;
        }

        await new Promise((r) => setTimeout(r, delayMs));
        return this.runWithRetry(fn, attempt + 1);
      }
      throw error;
    }
  }
}

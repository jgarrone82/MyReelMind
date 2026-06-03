import {
  TmdbSearchResponse,
  TmdbMediaDetails,
  TmdbConfiguration,
} from "./types";

const BASE_URL = "https://api.themoviedb.org/3";
const MAX_RETRIES = 3;

export interface TmdbClientOptions {
  apiKey: string;
  baseUrl?: string;
  retryDelayMs?: number;
}

export function createTmdbClient(options: TmdbClientOptions) {
  const { apiKey, baseUrl = BASE_URL, retryDelayMs = 1000 } = options;

  async function fetchWithRetry<T>(
    url: string,
    retries = MAX_RETRIES
  ): Promise<T> {
    const response = await fetch(url);

    if (response.ok) {
      return response.json() as Promise<T>;
    }

    if (response.status >= 500 && retries > 0) {
      // Exponential backoff: 1s, 2s, 4s (or scaled by retryDelayMs)
      const delay = Math.pow(2, MAX_RETRIES - retries) * retryDelayMs;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, retries - 1);
    }

    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  function buildUrl(path: string, params: Record<string, string> = {}): string {
    const url = new URL(`${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`);
    url.searchParams.set("api_key", apiKey);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value);
    });
    return url.toString();
  }

  return {
    async search(query: string, page = 1): Promise<TmdbSearchResponse> {
      const url = buildUrl("/search/multi", {
        query: encodeURIComponent(query),
        page: String(page),
      });
      return fetchWithRetry<TmdbSearchResponse>(url);
    },

    async trending(): Promise<TmdbSearchResponse> {
      const url = buildUrl("/trending/all/week");
      return fetchWithRetry<TmdbSearchResponse>(url);
    },

    async getDetails(
      type: "movie" | "tv",
      id: number,
      opts: { language?: string } = {}
    ): Promise<TmdbMediaDetails> {
      const params: Record<string, string> = {};
      if (opts.language) params.language = opts.language;
      const url = buildUrl(`/${type}/${id}`, params);
      return fetchWithRetry<TmdbMediaDetails>(url);
    },

    async getConfiguration(): Promise<TmdbConfiguration> {
      const url = buildUrl("/configuration");
      return fetchWithRetry<TmdbConfiguration>(url);
    },
  };
}

import { AniListQueue } from "./queue";
import type {
  AniListMedia,
  AniListSearchParams,
  AniListSearchResponse,
  AniListMediaDetailsResponse,
  MediaSort,
} from "./types";

const API_URL = "https://graphql.anilist.co";

export interface AniListClientOptions {
  queue?: AniListQueue;
  baseUrl?: string;
}

function buildSearchQuery(params: AniListSearchParams): string {
  const { query: _query, type: _type, page: _page, perPage: _perPage } = params;

  return `
    query ($search: String, $type: MediaType, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(search: $search, type: $type) {
          id
          title {
            romaji
            english
            native
          }
          type
          format
          status
          description
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          season
          seasonYear
          episodes
          chapters
          volumes
          genres
          averageScore
          popularity
          coverImage {
            large
            medium
          }
          bannerImage
        }
      }
    }
  `.trim();
}

function buildTrendingQuery(): string {
  return `
    query ($sort: [MediaSort], $type: MediaType, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(sort: $sort, type: $type) {
          id
          title {
            romaji
            english
            native
          }
          type
          format
          status
          description
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          season
          seasonYear
          episodes
          chapters
          volumes
          genres
          averageScore
          popularity
          coverImage {
            large
            medium
          }
          bannerImage
        }
      }
    }
  `.trim();
}

function buildMediaByIdQuery(): string {
  return `
    query ($id: Int) {
      Media(id: $id) {
        id
        title {
          romaji
          english
          native
        }
        type
        format
        status
        description
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        season
        seasonYear
        episodes
        chapters
        volumes
        genres
        averageScore
        popularity
        coverImage {
          large
          medium
        }
        bannerImage
      }
    }
  `.trim();
}

export function createAniListClient(options: AniListClientOptions = {}) {
  const { queue = new AniListQueue(), baseUrl = API_URL } = options;

  async function graphqlRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    return queue.execute<T>(
      `graphql:${query}:${JSON.stringify(variables)}`,
      async () => {
        const response = await fetch(baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
          const error = new Error(`AniList API error: ${response.status} ${response.statusText}`);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any).status = response.status;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any).response = response;
          throw error;
        }

        const data = await response.json();
        
        if (data.errors) {
          const error = new Error(`GraphQL error: ${data.errors[0].message}`);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any).status = 400;
          throw error;
        }

        return data;
      }
    );
  }

  return {
    async search(params: AniListSearchParams): Promise<AniListMedia[]> {
      const query = buildSearchQuery(params);
      const variables = {
        search: params.query || "",
        type: params.type || "ANIME",
        page: params.page || 1,
        perPage: params.perPage || 10,
      };

      const response = await graphqlRequest<AniListSearchResponse>(query, variables);
      return response.data.Page.media;
    },

    async trending(perPage = 15): Promise<AniListMedia[]> {
      const query = buildTrendingQuery();
      const sort: MediaSort[] = ["TRENDING_DESC"];
      const variables = {
        sort,
        type: "ANIME",
        page: 1,
        perPage,
      };

      const response = await graphqlRequest<AniListSearchResponse>(query, variables);
      return response.data.Page.media;
    },

    async getMediaById(id: number): Promise<AniListMedia> {
      const query = buildMediaByIdQuery();
      const variables = { id };

      const response = await graphqlRequest<AniListMediaDetailsResponse>(query, variables);
      return response.data.Media;
    },
  };
}

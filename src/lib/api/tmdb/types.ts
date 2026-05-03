export interface TmdbSearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TmdbSearchResponse {
  page: number;
  results: TmdbSearchResult[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  status: string;
  vote_average: number;
  genres: { id: number; name: string }[];
}

export interface TmdbTvDetails {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  episode_run_time: number[];
  status: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  number_of_episodes: number;
}

export interface TmdbConfiguration {
  images: {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string[];
    logo_sizes: string[];
    poster_sizes: string[];
    profile_sizes: string[];
    still_sizes: string[];
  };
  change_keys: string[];
}

export type TmdbMediaDetails = TmdbMovieDetails | TmdbTvDetails;

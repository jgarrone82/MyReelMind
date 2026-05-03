import { Dictionary } from "../types";

export const dictionary: Dictionary = {
  app: {
    title: "MyReelMind",
    description: "Track your movies and anime",
  },
  nav: {
    home: "Home",
    search: "Search",
    library: "My Library",
    dashboard: "Dashboard",
  },
  search: {
    placeholder: "Search movies or anime...",
    noResults: "No results found",
    loading: "Searching...",
  },
  media: {
    movie: "Movie",
    tv: "TV Show",
    anime: "Anime",
    status: {
      want_to_watch: "Want to Watch",
      watching: "Watching",
      completed: "Completed",
      paused: "Paused",
      dropped: "Dropped",
    },
  },
  dashboard: {
    title: "Your Activity",
    totalWatched: "Completed",
    totalHours: "Hours Watched",
    recentActivity: "Recent Activity",
    noActivity: "No activity yet",
    ctaSearch: "Find something to watch",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    loading: "Loading...",
    error: "Error",
  },
};

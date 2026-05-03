export interface Dictionary {
  app: {
    title: string;
    description: string;
  };
  nav: {
    home: string;
    search: string;
    library: string;
    dashboard: string;
  };
  search: {
    placeholder: string;
    noResults: string;
    loading: string;
  };
  media: {
    movie: string;
    tv: string;
    anime: string;
    status: {
      want_to_watch: string;
      watching: string;
      completed: string;
      paused: string;
      dropped: string;
    };
  };
  dashboard: {
    title: string;
    totalWatched: string;
    totalHours: string;
    recentActivity: string;
    noActivity: string;
    ctaSearch: string;
  };
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
  };
}

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
    settings: string;
  };
  search: {
    placeholder: string;
    noResults: string;
    loading: string;
    title: string;
    all: string;
    movies: string;
    tv: string;
    anime: string;
    loadMore: string;
    loadingMore: string;
  };
  library: {
    title: string;
    empty: string;
    added: string;
    removed: string;
    statusUpdated: string;
    ratingUpdated: string;
    progressUpdated: string;
    markedCompleted: string;
    remove: string;
    filterAll: string;
    filterWatching: string;
    filterCompleted: string;
    filterDropped: string;
    filterPlanned: string;
    addToLibrary: string;
    collection: string;
    noEpisodes: string;
    removeConfirm: string;
    progress: string;
    rating: string;
    yourRating: string;
    notRated: string;
    status: string;
  };
  media: {
    movie: string;
    tv: string;
    anime: string;
    episode: string;
    chapter: string;
    of: string;
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
  settings: {
    title: string;
    displayName: string;
    avatarUrl: string;
    privacy: string;
    publicProfile: string;
    save: string;
    saved: string;
    errorNameRequired: string;
    errorNameLength: string;
    errorInvalidUrl: string;
    errorUnauthorized: string;
  };
  profile: {
    title: string;
    privateTitle: string;
    privateMessage: string;
    items: string;
    completed: string;
    watching: string;
    editSettings: string;
    emptyLibrary: string;
    recentActivity: string;
  };
  auth: {
    login: {
      title: string;
      email: string;
      password: string;
      submit: string;
      loading: string;
      error: string;
      oauth: string;
      forgotPassword: string;
    };
    signup: {
      title: string;
      email: string;
      password: string;
      confirmPassword: string;
      submit: string;
      loading: string;
      success: string;
    };
    logout: string;
    errors: {
      invalidCredentials: string;
      weakPassword: string;
      passwordsMismatch: string;
      emailInUse: string;
    };
    passwordReset: {
      title: string;
      description: string;
      email: string;
      submit: string;
      loading: string;
      success: string;
      successDescription: string;
      backToLogin: string;
      newPassword: string;
      confirmPassword: string;
      updatePassword: string;
      updatingPassword: string;
      passwordUpdated: string;
      noSession: string;
      requestNewReset: string;
    };
    emailVerification: {
      title: string;
      description: string;
      checkInbox: string;
      resendButton: string;
      resendLoading: string;
      resendSuccess: string;
      resendError: string;
      backToLogin: string;
      goToDashboard: string;
      verifyTitle: string;
      verifyDescription: string;
      verifyEmail: string;
      notYourEmail: string;
      emailConfirmed: string;
    };
  };
}

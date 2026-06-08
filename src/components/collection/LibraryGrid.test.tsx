import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { LibraryGrid } from "./LibraryGrid";
import { mockDictionary as dict } from "@tests/fixtures/mockDictionary";

vi.mock("@/actions/collection", () => ({
  updateStatus: vi.fn(),
  updateRating: vi.fn(),
  updateProgress: vi.fn(),
  removeFromLibrary: vi.fn(),
}));

// LibraryGrid renders LibraryItem, which reads `useQueryClient()` to invalidate
// library-state after a successful mutation (#42 D8). Provide a client.
function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

const baseItems = [
  {
    id: "um-1",
    mediaItemId: "mi-1",
    publicId: "tmdb-123",
    status: "watching" as const,
    progress: 5,
    rating: null as number | null,
    updatedAt: new Date().toISOString(),
    mediaItem: {
      source: "tmdb" as const,
      sourceId: "123",
      title: "Test Movie 1",
      posterPath: "/poster1.jpg",
      type: "movie" as const,
      runtime: 120,
    },
  },
  {
    id: "um-2",
    mediaItemId: "mi-2",
    publicId: "anilist-456",
    status: "completed" as const,
    progress: 24,
    rating: 8 as number | null,
    updatedAt: new Date().toISOString(),
    mediaItem: {
      source: "anilist" as const,
      sourceId: "456",
      title: "Test Anime",
      posterPath: "/poster2.jpg",
      type: "anime" as const,
      runtime: 24,
    },
  },
];

const baseProps = {
  lang: "en" as const,
  dict: {
    remove: dict.library.remove,
    removeConfirm: dict.library.removeConfirm,
    cancel: dict.common.cancel,
    noEpisodes: dict.library.noEpisodes,
    statusUpdated: dict.library.statusUpdated,
    ratingUpdated: dict.library.ratingUpdated,
    progressUpdated: dict.library.progressUpdated,
    removed: dict.library.removed,
    error: dict.common.error,
    status: dict.media.status,
    statusLabel: dict.library.status,
    rating: dict.library.rating,
    yourRating: dict.library.yourRating,
    notRated: dict.library.notRated,
    clear: dict.common.cancel,
    progress: dict.library.progress,
    episode: dict.media.episode,
    chapter: dict.media.chapter,
    of: dict.media.of,
    previous: dict.library.previous,
    next: dict.library.next,
    page: dict.library.page,
    totalItems: dict.library.totalItems,
    allTypes: dict.library.allTypes,
    filterMovie: dict.library.filterMovie,
    filterTv: dict.library.filterTv,
    filterAnime: dict.library.filterAnime,
  },
};

describe("LibraryGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all items", () => {
    renderWithClient(<LibraryGrid items={baseItems} {...baseProps} />);
    expect(screen.getByText("Test Movie 1")).toBeInTheDocument();
    expect(screen.getByText("Test Anime")).toBeInTheDocument();
  });

  it("should return null when items array is empty", () => {
    const { container } = render(<LibraryGrid items={[]} {...baseProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render with correct number of items", () => {
    renderWithClient(<LibraryGrid items={baseItems} {...baseProps} />);
    expect(screen.getByText("Test Movie 1")).toBeInTheDocument();
    expect(screen.getByText("Test Anime")).toBeInTheDocument();
  });
});
import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import GifGrid from "../components/GifGrid";
import { getTrendingGifs, recordGifUsage, searchGifs } from "../services/gifApi";
import "../styles/dashboard.css";

function Dashboard() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [searchId, setSearchId] = useState(null);
  const [viewMode, setViewMode] = useState("search");
  const [offset, setOffset] = useState(0);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [favoriteGifs, setFavoriteGifs] = useState(() => {
    const saved = localStorage.getItem("favoriteGifs");

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("Failed to load favorite GIFs from local storage.", error);
      return [];
    }
  });

  const favoriteIds = useMemo(
    () => favoriteGifs.map((gif) => gif.id),
    [favoriteGifs]
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    let isActive = true;

    async function loadGifs() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await searchGifs(debouncedQuery, 0, 24);

        if (!isActive) {
          return;
        }

        setGifs(data.results);
        setOffset(data.results.length);
        setHasMoreResults(data.results.length === 24);
        setHasSearched(debouncedQuery.trim().length > 0);
        setSearchId(data.searchId);
        setViewMode("search");
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error("Failed to load GIFs.", error);
        setGifs([]);
        setSearchId(null);
        setHasSearched(debouncedQuery.trim().length > 0);
        setErrorMessage("Could not load GIFs right now. Please try again.");
      } finally {
        if (!isActive) {
          return;
        }

        setIsLoading(false);
      }
    }

    loadGifs();

    return () => {
      isActive = false;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    localStorage.setItem("favoriteGifs", JSON.stringify(favoriteGifs));
  }, [favoriteGifs]);

  const filteredGifs = useMemo(() => {
    if (!showFavoritesOnly) {
      return gifs;
    }

    return favoriteGifs;
  }, [favoriteGifs, gifs, showFavoritesOnly]);

  function handleFavoriteToggle(gif) {
    setFavoriteGifs((currentFavorites) => {
      const alreadyFavorited = currentFavorites.some(
        (favoriteGif) => favoriteGif.id === gif.id
      );

      if (alreadyFavorited) {
        return currentFavorites.filter(
          (favoriteGif) => favoriteGif.id !== gif.id
        );
      }

      return [...currentFavorites, gif];
    });
  }

  async function handleFavoritesViewToggle() {
    const nextShowFavoritesOnly = !showFavoritesOnly;

    setShowFavoritesOnly(nextShowFavoritesOnly);

    if (nextShowFavoritesOnly && viewMode === "trending") {
      setViewMode("search");
      setQuery("");
      setDebouncedQuery("");
      setSearchId(null);
      setHasSearched(false);
      setErrorMessage("");
      setIsLoading(true);

      try {
        const data = await searchGifs("");
        setGifs(data.results);
      } catch (error) {
        console.error("Failed to reload GIFs for favorites.", error);
        setGifs([]);
        setErrorMessage("Could not load favorite GIFs right now. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  }

async function handleClearSearch() {
  setQuery("");
  setDebouncedQuery("");
  setViewMode("search");
  setSearchId(null);
  setHasSearched(false);
  setShowFavoritesOnly(false);
  setErrorMessage("");
  setIsLoading(true);

  try {
    const data = await searchGifs("");
    setGifs(data.results);
  } catch (error) {
    console.error("Failed to reload main GIFs.", error);
    setGifs([]);
    setErrorMessage("Could not load GIFs right now. Please try again.");
  } finally {
    setIsLoading(false);
  }
}

  async function handleGifCopy(gifId) {
  if (!searchId) {
    return;
  }

  try {
    await recordGifUsage(gifId, searchId);
  } catch (error) {
    console.error("Failed to record GIF usage.", error);
  }
}

async function handleLoadTrending() {
  setIsLoading(true);
  setErrorMessage("");
  setSearchId(null);
  setHasSearched(false);
  setShowFavoritesOnly(false);

  try {
    const trendingResults = await getTrendingGifs();
    setGifs(trendingResults);
    setViewMode("trending");
    setQuery("");
  } catch (error) {
    console.error("Failed to load trending GIFs.", error);
    setGifs([]);
    setErrorMessage("Could not load trending GIFs right now. Please try again.");
  } finally {
    setIsLoading(false);
  }
}

function handleGifLoadError(gifId) {
  setGifs((currentGifs) =>
    currentGifs.filter((gif) => gif.id !== gifId)
  );
}

async function handleLoadMore() {
  if (!debouncedQuery.trim()) {
    return;
  }

  setIsLoadingMore(true);
  setErrorMessage("");

  try {
    const data = await searchGifs(debouncedQuery, offset, 24);

    setGifs((currentGifs) => [...currentGifs, ...data.results]);
    setOffset((currentOffset) => currentOffset + data.results.length);
    setHasMoreResults(data.results.length === 24);
  } catch (error) {
    console.error("Failed to load more GIFs.", error);
    setErrorMessage("Could not load more GIFs right now. Please try again.");
  } finally {
    setIsLoadingMore(false);
  }
}

  const statusText = showFavoritesOnly
    ? `❤️ ${filteredGifs.length} saved favorite${
        filteredGifs.length === 1 ? "" : "s"
      } `
    : viewMode === "trending"
    ? `🔥 ${filteredGifs.length} trending GIF${
        filteredGifs.length === 1 ? "" : "s"
      } right now`
    : hasSearched
    ? `Found ${filteredGifs.length} GIF${
        filteredGifs.length === 1 ? "" : "s"
      } for "${query}"`
    : `Start by searching for a GIF`;

  return (
    <div className="app-shell">
      <Header
        favoritesCount={favoriteIds.length}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={handleFavoritesViewToggle}
        viewMode={viewMode}
        onToggleTrending={
          viewMode === "trending" ? handleClearSearch : handleLoadTrending
        }
      />

      <main className="dashboard">
        <section className="dashboard__search-section">
          <div className="dashboard__search-stack">
            <div className="search-bar">
              <span className="search-bar__icon" aria-hidden="true">
                ⌕
              </span>

              <input
                className="search-bar__input"
                type="text"
                placeholder="Search GIFs..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search GIFs"
              />
            </div>

            <div className="dashboard__toolbar">
              <p className="dashboard__status">{statusText}</p>

              {query && (
                <button
                  className="dashboard__clear-button"
                  type="button"
                  onClick={handleClearSearch}
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="dashboard__content">
          {isLoading ? (
            <div className="dashboard__message-card">Loading GIFs...</div>
          ) : errorMessage ? (
            <div className="dashboard__message-card">{errorMessage}</div>
          ) : filteredGifs.length > 0 ? (
          <>
            <GifGrid
              gifs={filteredGifs}
              favoriteIds={favoriteIds}
              onFavoriteToggle={handleFavoriteToggle}
              onGifCopy={handleGifCopy}
              onGifLoadError={handleGifLoadError}
            />

            {hasMoreResults && viewMode === "search" && !showFavoritesOnly && (
              <button
                className="dashboard__clear-button"
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading more..." : "Load More"}
              </button>
            )}
          </>
          ) : (
            <div className="dashboard__message-card">
              {showFavoritesOnly
                ? "No favorite GIFs match this view."
                : hasSearched
                ? "No GIFs found. Try a different search."
                : "Start by searching for a GIF."}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
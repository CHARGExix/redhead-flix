import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ContentRow from './components/ContentRow';
import IndustryFilter from './components/IndustryFilter';
import ContentGrid from './components/ContentGrid';
import FilterPanel from './components/FilterPanel';
import Sidebar from './components/Sidebar';
import WatchPage from './components/WatchPage';
import WatchlistPanel from './components/WatchlistPanel';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import {
  fetchGenres, fetchByCategory, fetchBrowse,
} from './api/tmdb';

function App() {
  // Core state
  const [currentType, setCurrentType] = useState('movie');
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'browse' | 'watch'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndustry, setCurrentIndustry] = useState('all');

  // Watch state
  const [watchItem, setWatchItem] = useState(null); // { id, type }
  const navigationKey = `${currentView}:${currentType}:${watchItem?.type || ''}:${watchItem?.id || ''}`;
  const lastNavigationKey = useRef(navigationKey);

  // Data state
  const [genres, setGenres] = useState([]);
  const [heroItems, setHeroItems] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [popularTv, setPopularTv] = useState([]);
  const [isLoadingHome, setIsLoadingHome] = useState(true);

  // Browse state
  const [browseItems, setBrowseItems] = useState([]);
  const [browsePage, setBrowsePage] = useState(1);
  const [browseTotalPages, setBrowseTotalPages] = useState(1);
  const [isBrowseLoading, setIsBrowseLoading] = useState(false);
  const [sort, setSort] = useState('new');
  const [isListView, setIsListView] = useState(false);
  const [filters, setFilters] = useState({
    genres: [], yearFrom: null, yearTo: null, ratingFrom: null, ratingTo: null,
  });

  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem('redheadflix_watchlist');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Keep in-app navigation in browser history so Android/browser Back returns
  // to the previous view instead of leaving the site or switching tabs.
  useEffect(() => {
    const makeHistoryState = () => ({
      currentType,
      currentView,
      watchItem,
      searchQuery,
      currentIndustry,
      filters,
    });

    const initialState = { ...window.history.state, redheadflix: makeHistoryState() };
    window.history.replaceState(initialState, '', window.location.href);
    lastNavigationKey.current = navigationKey;

    const handlePopState = (event) => {
      const previous = event.state?.redheadflix;
      if (!previous) return;
      setCurrentType(previous.currentType || 'movie');
      setCurrentView(previous.currentView || 'home');
      setWatchItem(previous.watchItem || null);
      setSearchQuery(previous.searchQuery || '');
      setCurrentIndustry(previous.currentIndustry || 'all');
      setFilters(previous.filters || {
        genres: [], yearFrom: null, yearTo: null, ratingFrom: null, ratingTo: null,
      });
      lastNavigationKey.current = `${previous.currentView || 'home'}:${previous.currentType || 'movie'}:${previous.watchItem?.type || ''}:${previous.watchItem?.id || ''}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (lastNavigationKey.current === navigationKey) return;
    const historyState = {
      currentType,
      currentView,
      watchItem,
      searchQuery,
      currentIndustry,
      filters,
    };
    window.history.pushState({ ...window.history.state, redheadflix: historyState }, '', window.location.href);
    lastNavigationKey.current = navigationKey;
  }, [navigationKey, currentType, currentView, watchItem, searchQuery, currentIndustry, filters]);

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('redheadflix_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Load genres when type changes
  useEffect(() => {
    fetchGenres(currentType).then(setGenres);
  }, [currentType]);

  // Load home page data
  useEffect(() => {
    const loadHome = async () => {
      setIsLoadingHome(true);
      try {
        const [trending, newR, top, action] = await Promise.all([
          fetchByCategory(currentType, 'trending'),
          fetchByCategory(currentType, 'new'),
          fetchByCategory(currentType, 'top'),
          fetchByCategory(currentType, 'action'),
        ]);
        setHeroItems(trending.slice(0, 5));
        setTrendingItems(trending);
        setNewReleases(newR);
        setTopRated(top);
        setActionItems(action);

        if (currentType === 'tv') {
          const tvPopular = await fetchByCategory('tv', 'popular_tv');
          setPopularTv(tvPopular);
        } else {
          setPopularTv([]);
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      }
      setIsLoadingHome(false);
    };
    if (currentView === 'home') loadHome();
  }, [currentType, currentView]);

  // Load browse data
  const loadBrowse = useCallback(async (page = 1, append = false) => {
    setIsBrowseLoading(true);
    try {
      const { results, totalPages } = await fetchBrowse(
        currentType, page, sort, currentIndustry, filters, searchQuery
      );
      setBrowseItems(prev => append ? [...prev, ...results] : results);
      setBrowseTotalPages(totalPages);
      setBrowsePage(page);
    } catch (err) {
      console.error('Browse fetch error:', err);
    }
    setIsBrowseLoading(false);
  }, [currentType, sort, currentIndustry, filters, searchQuery]);

  // Switch to browse when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      setCurrentView('browse');
      loadBrowse(1);
    }
  }, [searchQuery]);

  // Reload browse on filter/sort changes
  useEffect(() => {
    if (currentView === 'browse') {
      loadBrowse(1);
    }
  }, [currentView, sort, filters, currentType, currentIndustry]);

  // Reset view when type changes
  useEffect(() => {
    setCurrentView('home');
    setSearchQuery('');
    setCurrentIndustry('all');
    setBrowseItems([]);
    setBrowsePage(1);
    setWatchItem(null);
  }, [currentType]);

  const handleItemClick = (id, type) => {
    setWatchItem({ id, type: type || currentType });
    setCurrentView('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromWatch = () => {
    if (window.history.state?.redheadflix && currentView === 'watch') {
      window.history.back();
      return;
    }
    setWatchItem(null);
    setCurrentView('home');
  };

  const handleSeeAll = () => {
    setCurrentView('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIndustryChange = (industry) => {
    setCurrentIndustry(industry);
    setFilters({ genres: [], yearFrom: null, yearTo: null, ratingFrom: null, ratingTo: null });
    setSearchQuery('');
    setBrowseItems([]);
    setBrowsePage(1);
    setCurrentView('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isInWatchlist = (id) => watchlist.some(item => item.id === id);

  const toggleWatchlist = (item) => {
    setWatchlist(prev => {
      const exists = prev.some(w => w.id === item.id);
      if (exists) return prev.filter(w => w.id !== item.id);
      return [...prev, {
        id: item.id,
        title: item.title,
        name: item.name,
        poster_path: item.poster_path,
        vote_average: item.vote_average,
        release_date: item.release_date,
        first_air_date: item.first_air_date,
        media_type: item.media_type || currentType,
      }];
    });
  };

  const handleGenreClick = (genreId) => {
    setFilters(prev => ({ ...prev, genres: [genreId] }));
    setCurrentView('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleYearClick = (year) => {
    setFilters(prev => ({ ...prev, yearFrom: year, yearTo: year }));
    setCurrentView('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyFilters = (nextFilters) => {
    setFilters(nextFilters);
    setSearchQuery('');
    setBrowseItems([]);
    setBrowsePage(1);
    setCurrentView('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Watch page is rendered full-page, replacing the entire layout
  if (currentView === 'watch' && watchItem) {
    return (
      <AnimatePresence mode="wait">
        <WatchPage
          key={`${watchItem.id}-${watchItem.type}`}
          itemId={watchItem.id}
          itemType={watchItem.type}
          onBack={handleBackFromWatch}
          onItemClick={handleItemClick}
          genres={genres}
          isInWatchlist={isInWatchlist(watchItem.id)}
          onWatchlistToggle={toggleWatchlist}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navbar */}
      <Navbar
        currentType={currentType}
        setCurrentType={setCurrentType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFilterClick={() => setIsFilterOpen(true)}
        onSuggestionClick={handleItemClick}
        onWatchlistClick={() => setIsWatchlistOpen(true)}
        watchlistCount={watchlist.length}
      />

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto">
        <AnimatePresence mode="wait">
          {currentView === 'home' ? (
            /* ===== HOME VIEW ===== */
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="pt-36 sm:pt-40 md:pt-24 lg:pt-28"
            >
              {/* Hero Banner */}
              <div className="px-4 md:px-8 lg:px-12">
                <HeroBanner
                  items={heroItems}
                  type={currentType}
                  onPlayClick={handleItemClick}
                  onInfoClick={handleItemClick}
                />
              </div>

              {/* Industry Filter (movies only) */}
              {currentType === 'movie' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="px-4 md:px-8 lg:px-12"
                >
                  <IndustryFilter
                    currentIndustry={currentIndustry}
                    setIndustry={handleIndustryChange}
                  />
                </motion.div>
              )}

              {/* Content Rows */}
              <div className="px-4 md:px-8 lg:px-12">
                <ContentRow
                  title="🔥 Trending This Week"
                  items={trendingItems}
                  type={currentType}
                  genres={genres}
                  onItemClick={handleItemClick}
                  isLoading={isLoadingHome}
                  onSeeAll={handleSeeAll}
                  size="md"
                  isInWatchlist={isInWatchlist}
                  onWatchlistToggle={toggleWatchlist}
                />

                <ContentRow
                  title="✨ New Releases"
                  items={newReleases}
                  type={currentType}
                  genres={genres}
                  onItemClick={handleItemClick}
                  isLoading={isLoadingHome}
                  onSeeAll={handleSeeAll}
                  size="md"
                  isInWatchlist={isInWatchlist}
                  onWatchlistToggle={toggleWatchlist}
                />

                <ContentRow
                  title="⭐ Top Rated"
                  items={topRated}
                  type={currentType}
                  genres={genres}
                  onItemClick={handleItemClick}
                  isLoading={isLoadingHome}
                  onSeeAll={handleSeeAll}
                  size="md"
                  isInWatchlist={isInWatchlist}
                  onWatchlistToggle={toggleWatchlist}
                />

                <ContentRow
                  title="💥 Action & Adventure"
                  items={actionItems}
                  type={currentType}
                  genres={genres}
                  onItemClick={handleItemClick}
                  isLoading={isLoadingHome}
                  size="md"
                  isInWatchlist={isInWatchlist}
                  onWatchlistToggle={toggleWatchlist}
                />

                {currentType === 'tv' && (
                  <ContentRow
                    title="📺 Popular TV Shows"
                    items={popularTv}
                    type="tv"
                    genres={genres}
                    onItemClick={handleItemClick}
                    isLoading={isLoadingHome}
                    size="md"
                    isInWatchlist={isInWatchlist}
                    onWatchlistToggle={toggleWatchlist}
                  />
                )}

              </div>
            </motion.div>
          ) : (
            /* ===== BROWSE VIEW ===== */
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="pt-36 sm:pt-40 md:pt-32 px-4 md:px-8 lg:px-12 pb-8"
            >
              {searchQuery && (
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Search Results for "{searchQuery}"
                  </h1>
                  <button
                    onClick={() => { setSearchQuery(''); setCurrentView('home'); }}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    ← Back to Home
                  </button>
                </div>
              )}

              {!searchQuery && (
                <div className="mb-8">
                  <button
                    onClick={() => {
                      setCurrentView('home');
                      setCurrentIndustry('all');
                      setFilters({ genres: [], yearFrom: null, yearTo: null, ratingFrom: null, ratingTo: null });
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors mb-4 block"
                  >
                    ← Back to Home
                  </button>
                  {currentIndustry !== 'all' && (
                    <h1 className="text-3xl font-bold text-white">{currentIndustry.charAt(0).toUpperCase() + currentIndustry.slice(1)} Movies</h1>
                  )}
                </div>
              )}

              <div className="flex gap-8">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <ContentGrid
                    items={browseItems}
                    type={currentType}
                    isListView={isListView}
                    setIsListView={setIsListView}
                    genres={genres}
                    onItemClick={handleItemClick}
                    isLoading={isBrowseLoading}
                    onLoadMore={() => loadBrowse(browsePage + 1, true)}
                    hasMore={browsePage < browseTotalPages}
                    sort={sort}
                    setSort={setSort}
                    isSearchMode={!!searchQuery}
                    isInWatchlist={isInWatchlist}
                    onWatchlistToggle={toggleWatchlist}
                  />
                </div>

                {/* Sidebar */}
                <div className="hidden lg:block w-80 shrink-0">
                  <Sidebar
                    genres={genres}
                    trending={trendingItems}
                    type={currentType}
                    onItemClick={handleItemClick}
                    onGenreClick={handleGenreClick}
                    onYearClick={handleYearClick}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll To Top */}
      <ScrollToTop />

      {/* Panels */}
      <FilterPanel
        genres={genres}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
      />

      <WatchlistPanel
        isOpen={isWatchlistOpen}
        setIsOpen={setIsWatchlistOpen}
        watchlist={watchlist}
        onRemove={(id) => setWatchlist(prev => prev.filter(w => w.id !== id))}
        onItemClick={handleItemClick}
      />
    </div>
  );
}

export default App;

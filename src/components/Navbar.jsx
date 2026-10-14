import { useState, useEffect, useRef } from 'react';
import { Search, X, SlidersHorizontal, Tv, Film, Bookmark, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';
import { useClickOutside } from '../hooks/useClickOutside';
import { useSettings } from '../context/SettingsContext';
import { fetchSearchSuggestions, IMG_URL_500 } from '../api/tmdb';

const Navbar = ({
  currentType, setCurrentType, searchQuery, setSearchQuery,
  onFilterClick, onSuggestionClick, onWatchlistClick, watchlistCount,
  user, onAuthClick, onLogout, onAdminClick,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debouncedQuery = useDebounce(localQuery, 300);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const { settings } = useSettings();
  const searchRef = useRef(null);

  useClickOutside(searchRef, () => setShowSuggestions(false));

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      fetchSearchSuggestions(debouncedQuery).then(results => {
        setSuggestions(
          results.filter(r => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path).slice(0, 8)
        );
        setShowSuggestions(true);
      });
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery);
      setShowSuggestions(false);
      saveRecentSearch(localQuery);
    }
  };

  const saveRecentSearch = (q) => {
    let recent = [...recentSearches].filter(r => r.toLowerCase() !== q.toLowerCase());
    recent.unshift(q);
    recent = recent.slice(0, 5);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
  };

  const handleSuggestionClick = (item) => {
    setLocalQuery(item.title || item.name);
    setSearchQuery(item.title || item.name);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setLocalQuery('');
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#030712]/95 backdrop-blur-xl border-b border-blue-500/10 py-2.5 md:py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-gradient-to-b from-[#030712] to-transparent py-3 sm:py-5 md:py-6'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3 md:gap-4">
        {/* Logo + Type Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3 sm:gap-6">
          <a href="/" className="text-xl sm:text-2xl font-black text-white tracking-tighter flex items-center gap-1.5 sm:gap-2 group">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt={settings.theme_name} className="h-8 object-contain" />
            ) : (
              <>
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-blue-500 transition-all">RedHead</span>
                <span className="text-white"> FLIX</span>
              </>
            )}
          </a>

          <div className="flex bg-white/5 rounded-xl p-1 backdrop-blur-md border border-white/10">
            <button
              onClick={() => setCurrentType('movie')}
              aria-label="Browse movies"
              aria-pressed={currentType === 'movie'}
              className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${currentType === 'movie' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/60 hover:text-white'}`}
            >
              <Film size={16} /> <span className="hidden sm:inline">Movies</span>
            </button>
            <button
              onClick={() => setCurrentType('tv')}
              aria-label="Browse TV shows"
              aria-pressed={currentType === 'tv'}
              className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${currentType === 'tv' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/60 hover:text-white'}`}
            >
              <Tv size={16} /> <span className="hidden sm:inline">TV Shows</span>
            </button>
          </div>
        </div>

        {/* Search + Actions */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto flex-1 md:max-w-md lg:max-w-lg relative" ref={searchRef}>
          <form onSubmit={handleSubmit} className="relative w-full flex items-center">
            <Search className="absolute left-4 text-blue-400/50" size={18} />
            <input
              type="text"
              placeholder="Search movies, TV shows..."
              value={localQuery}
              onChange={(e) => { setLocalQuery(e.target.value); if (!e.target.value) setShowSuggestions(false); }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 md:py-3 pl-10 md:pl-12 pr-10 md:pr-12 text-sm md:text-base text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white/10 focus:border-blue-500/30 transition-all backdrop-blur-md"
            />
            {localQuery && (
              <button type="button" onClick={clearSearch} className="absolute right-4 text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            )}
          </form>

          <button onClick={onFilterClick} aria-label="Open filters" className="min-w-11 min-h-11 p-2.5 md:p-3 bg-white/5 hover:bg-blue-600/20 text-white/70 hover:text-blue-400 rounded-full transition-all border border-white/10 backdrop-blur-md shrink-0">
            <SlidersHorizontal size={20} />
          </button>

          <button onClick={onWatchlistClick} aria-label="Open watchlist" className="relative min-w-11 min-h-11 p-2.5 md:p-3 bg-white/5 hover:bg-blue-600/20 text-white/70 hover:text-blue-400 rounded-full transition-all border border-white/10 backdrop-blur-md shrink-0">
            <Bookmark size={20} />
            {watchlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-glow-pulse">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 left-0 right-0 sm:right-14 bg-[#0a1628]/98 backdrop-blur-xl rounded-2xl border border-blue-500/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50 max-h-[60dvh] overflow-y-auto"
              >
                {suggestions.map((item, idx) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => { handleSuggestionClick(item); onSuggestionClick?.(item.id, item.media_type); }}
                    className="flex items-center gap-4 w-full p-3 hover:bg-blue-600/10 transition-colors text-left border-b border-white/5 last:border-b-0"
                  >
                    <img
                      src={item.poster_path ? IMG_URL_500 + item.poster_path : ''}
                      alt={item.title || item.name}
                      className="w-10 h-16 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate text-sm">{item.title || item.name}</p>
                      <p className="text-white/40 text-xs">
                        {item.media_type === 'movie' ? 'Movie' : 'TV Show'} · {item.vote_average?.toFixed(1)} ★
                      </p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

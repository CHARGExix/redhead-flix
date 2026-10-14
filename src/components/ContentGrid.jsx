import { LayoutGrid, List, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import MovieCard from './MovieCard';

const ContentGrid = ({
  items, type, isListView, setIsListView, genres,
  onItemClick, isLoading, onLoadMore, hasMore,
  sort, setSort, isSearchMode,
  isInWatchlist, onWatchlistToggle,
}) => {
  return (
    <div className="w-full">
      {/* Header Controls */}
      {!isSearchMode && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {type === 'movie' ? 'Movies' : 'TV Shows'}
          </h2>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Sort Toggle */}
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setSort('new')}
                aria-pressed={sort === 'new'}
                className={`min-h-10 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 ${sort === 'new' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/50 hover:text-white'}`}
              >
                New Releases
              </button>
              <button
                onClick={() => setSort('top')}
                aria-pressed={sort === 'top'}
                className={`min-h-10 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 ${sort === 'top' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/50 hover:text-white'}`}
              >
                Top Rated
              </button>
            </div>
            {/* View Toggle */}
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 hidden sm:flex">
              <button
                onClick={() => setIsListView(false)}
                aria-label="Grid view"
                aria-pressed={!isListView}
                className={`p-2 rounded-lg transition-all duration-300 ${!isListView ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setIsListView(true)}
                aria-label="List view"
                aria-pressed={isListView}
                className={`p-2 rounded-lg transition-all duration-300 ${isListView ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid / List */}
      {items.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-blue-600/5 rounded-full flex items-center justify-center mb-6 border border-blue-500/10">
            <LayoutGrid size={40} className="text-blue-500/20" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Results Found</h3>
          <p className="text-white/40 max-w-md">Try adjusting your filters or search query to find what you're looking for.</p>
        </div>
      ) : (
        <div className={`grid gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 ${isListView ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}`}>
          {items.map((item, idx) => (
            <motion.div
              key={`${item.id}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.5) }}
            >
              <MovieCard
                item={item}
                type={item.media_type || type}
                isListView={isListView}
                genres={genres}
                onClick={() => onItemClick(item.id, item.media_type || type)}
                isInWatchlist={isInWatchlist?.(item.id)}
                onWatchlistToggle={() => onWatchlistToggle?.(item)}
              />
            </motion.div>
          ))}
          {isLoading && Array.from({ length: 12 }).map((_, i) => (
            <div key={`skeleton-${i}`} className={`animate-shimmer bg-[#0a1628] rounded-xl ${isListView ? 'h-40' : 'aspect-[2/3]'}`} />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && !isLoading && items.length > 0 && (
        <div className="flex justify-center mt-12">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(59, 130, 246, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onLoadMore}
            className="px-8 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-full font-medium transition-all border border-blue-500/20"
          >
            Load More
          </motion.button>
        </div>
      )}

      {isLoading && items.length > 0 && (
        <div className="flex justify-center mt-12">
          <Loader className="animate-spin text-blue-500" size={32} />
        </div>
      )}
    </div>
  );
};

export default ContentGrid;

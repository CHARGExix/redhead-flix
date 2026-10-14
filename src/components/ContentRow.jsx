import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

const ContentRow = ({
  title, items, type, genres, onItemClick, isLoading,
  rows = 1, onSeeAll, size = 'md',
  isInWatchlist, onWatchlistToggle,
  autoPlay = false, autoPlayInterval = 6000,
}) => {
  const scrollRef = useRef(null);

  const sizeClasses = {
    xs: 'w-[90px] sm:w-[110px] md:w-[130px] lg:w-[calc(10%-7.2px)] shrink-0',
    sm: 'w-[105px] sm:w-[130px] md:w-[150px] lg:w-[calc(16.666%-13.4px)] shrink-0',
    md: 'w-[115px] sm:w-[140px] md:w-[170px] lg:w-[200px] shrink-0',
    lg: 'w-[140px] sm:w-[180px] md:w-[220px] lg:w-[260px] shrink-0',
  };
  const widthClass = sizeClasses[size] || sizeClasses.md;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const target = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!autoPlay || isLoading || items.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollTo({ left: scrollLeft + clientWidth, behavior: 'smooth' });
        }
      }
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isLoading, items.length]);

  if (!isLoading && items.length === 0) return null;

  return (
    <div className="mb-8 sm:mb-12 group/row relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-5">
        <h2 className="text-base sm:text-lg md:text-2xl font-bold text-white flex flex-wrap items-center gap-2 md:gap-3">
          {title}
          <span className="h-1 w-8 md:w-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full" />
        </h2>
        {onSeeAll && (
          <button onClick={onSeeAll} className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
            See All <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#0a1628]/80 hover:bg-blue-600 text-white p-4 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center -translate-x-1/2 border border-blue-500/20 backdrop-blur-md hover:scale-110 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
        >
          <ChevronLeft size={28} />
        </button>

        <div
          ref={scrollRef}
          className={`flex overflow-x-auto overscroll-x-contain scrollbar-hide px-0 scroll-smooth snap-x snap-proximity ${size === 'xs' ? 'gap-2' : 'gap-3 md:gap-4'}`}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`${widthClass} flex flex-col ${size === 'xs' ? 'gap-2' : 'gap-3 md:gap-4'}`}>
                  {Array.from({ length: rows }).map((_, j) => (
                    <div key={j} className="w-full aspect-[2/3] bg-[#0a1628] rounded-2xl animate-shimmer" />
                  ))}
                </div>
              ))
            : rows > 1
              ? Array.from({ length: Math.ceil(items.length / rows) }).map((_, colIdx) => {
                  const columnItems = items.slice(colIdx * rows, (colIdx + 1) * rows);
                  return (
                    <div key={colIdx} className={`${widthClass} flex flex-col ${size === 'xs' ? 'gap-2' : 'gap-3 md:gap-4'}`}>
                      {columnItems.map(item => (
                        <div key={item.id} className="w-full">
                          <MovieCard
                            item={item}
                            type={item.media_type || type}
                            isListView={false}
                            genres={genres}
                            onClick={() => onItemClick(item.id, item.media_type || type)}
                            isInWatchlist={isInWatchlist?.(item.id)}
                            onWatchlistToggle={() => onWatchlistToggle?.(item)}
                            size={size}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })
              : items.map(item => (
                  <div key={item.id} className={`${widthClass} snap-start`}>
                    <MovieCard
                      item={item}
                      type={item.media_type || type}
                      isListView={false}
                      genres={genres}
                      onClick={() => onItemClick(item.id, item.media_type || type)}
                      isInWatchlist={isInWatchlist?.(item.id)}
                      onWatchlistToggle={() => onWatchlistToggle?.(item)}
                      size={size}
                    />
                  </div>
                ))
          }
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#0a1628]/80 hover:bg-blue-600 text-white p-4 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center translate-x-1/2 border border-blue-500/20 backdrop-blur-md hover:scale-110 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
};

export default ContentRow;

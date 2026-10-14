import { Star, Calendar, Heart, Check, Play } from 'lucide-react';
import { IMG_URL_300, IMG_URL_500 } from '../api/tmdb';

const MovieCard = ({ item, type, isListView, genres, onClick, isInWatchlist, onWatchlistToggle, size = 'md' }) => {
  const title = type === 'movie' ? item.title : item.name;
  const year = type === 'movie'
    ? item.release_date?.substring(0, 4)
    : item.first_air_date?.substring(0, 4);
  const rating = item.vote_average?.toFixed(1) || 'N/A';
  const genreNames = (item.genre_ids?.map(id => genres.find(g => g.id === id)?.name).filter(Boolean)) || [];

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    onWatchlistToggle?.(e);
  };

  // List view
  if (isListView) {
    return (
      <div onClick={onClick} className="flex bg-white/3 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_4px_30px_rgba(59,130,246,0.1)] group h-40">
        <div className="w-28 shrink-0 relative overflow-hidden">
          <img
            src={item.poster_path ? IMG_URL_300 + item.poster_path : 'https://via.placeholder.com/300x450?text=No+Image'}
            srcSet={item.poster_path ? `${IMG_URL_300}${item.poster_path} 300w, ${IMG_URL_500}${item.poster_path} 500w` : undefined}
            sizes="(max-width: 639px) 44vw, (max-width: 1023px) 30vw, 220px"
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          {onWatchlistToggle && (
            <button
              onClick={handleWatchlistClick}
              className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md transition-all duration-300 z-10 ${isInWatchlist ? 'bg-blue-600 text-white' : 'bg-black/60 text-white/70 hover:bg-white/20'}`}
            >
              {isInWatchlist ? <Check size={14} /> : <Heart size={14} />}
            </button>
          )}
        </div>
        <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
          <div className="flex justify-between items-start gap-4 mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
            <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-md text-yellow-500 text-xs font-medium shrink-0">
              <Star size={12} fill="currentColor" /> {rating}
            </div>
          </div>
          <div className="text-white/40 text-sm mb-2 flex items-center gap-2">
            <Calendar size={14} /> {year || 'N/A'}
          </div>
          <p className="text-white/50 text-sm line-clamp-2 mb-3">{item.overview || 'No overview available.'}</p>
          <div className="flex flex-wrap gap-2 mt-auto">
            {genreNames.slice(0, 3).map((name, i) => (
              <span key={i} className="text-[10px] px-2 py-1 bg-blue-600/10 rounded-full text-blue-300/70 border border-blue-500/10">{name}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Keep poster artwork clear on phones and place readable details beneath it.
  return (
    <>
    <div onClick={onClick} className="sm:hidden group cursor-pointer active:scale-[0.98] transition-transform">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[#0a1628] ring-1 ring-white/10">
        <img
          src={item.poster_path ? IMG_URL_300 + item.poster_path : 'https://via.placeholder.com/300x450?text=No+Image'}
          srcSet={item.poster_path ? `${IMG_URL_300}${item.poster_path} 300w, ${IMG_URL_500}${item.poster_path} 500w` : undefined}
          sizes="(max-width: 639px) 42vw, 220px"
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {onWatchlistToggle && (
          <button
            onClick={handleWatchlistClick}
            aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            className={`absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md z-10 ${isInWatchlist ? 'bg-blue-600 text-white' : 'bg-black/65 text-white/90'}`}
          >
            {isInWatchlist ? <Check size={15} /> : <Heart size={15} />}
          </button>
        )}
        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-yellow-400 text-[11px] font-bold">
          <Star size={11} fill="currentColor" /> {rating}
        </div>
      </div>
      <div className="pt-2 px-0.5">
        <h3 className="text-white text-xs sm:text-sm font-semibold leading-snug line-clamp-2 min-h-[2rem]">{title}</h3>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/55">
          <span>{year || 'Year unavailable'}</span>
          <span aria-hidden="true">·</span>
          <span>{type === 'movie' ? 'Movie' : 'TV show'}</span>
        </div>
      </div>
    </div>
    {/* Grid view (poster card) */}
    <div onClick={onClick} className="hidden sm:block group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer aspect-[2/3] bg-[#0a1628] transition-all duration-300 sm:duration-500 sm:hover:scale-105 sm:hover:z-20 sm:hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] active:scale-[0.98]">
      <img
        src={item.poster_path ? IMG_URL_300 + item.poster_path : 'https://via.placeholder.com/300x450?text=No+Image'}
        srcSet={item.poster_path ? `${IMG_URL_300}${item.poster_path} 300w, ${IMG_URL_500}${item.poster_path} 500w` : undefined}
        sizes="(max-width: 639px) 44vw, (max-width: 1023px) 30vw, 220px"
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />

      {/* Blue border glow on hover */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-500/30 transition-all duration-500 pointer-events-none" />

      {/* Watchlist Button */}
      {onWatchlistToggle && (
        <button
          onClick={handleWatchlistClick}
          className={`absolute top-2 left-2 sm:top-3 sm:left-3 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 ${isInWatchlist ? 'bg-blue-600 text-white' : 'bg-black/60 text-white/80 hover:bg-white/20'}`}
        >
          {isInWatchlist ? <Check size={16} /> : <Heart size={16} />}
        </button>
      )}

      {/* Rating Badge (visible by default, hidden on hover) */}
      <div className={`absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-lg flex items-center gap-1 text-yellow-500 font-bold shadow-lg z-10 opacity-100 sm:group-hover:opacity-0 transition-opacity duration-300 ${size === 'xs' ? 'text-[8px]' : 'text-xs'}`}>
        <Star size={size === 'xs' ? 8 : 12} fill="currentColor" /> {rating}
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/55 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:duration-500 flex flex-col justify-end p-2.5 sm:p-3 translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0">
        {/* Play icon */}
        <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
          <div className="w-12 h-12 rounded-full bg-blue-600/80 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)]">
            <Play size={20} fill="white" className="text-white ml-1" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className={`text-white font-bold leading-tight line-clamp-2 drop-shadow-md ${size === 'xs' ? 'text-[10px]' : 'text-sm'}`}>
            {title}
          </h3>
          <div className={`flex items-center gap-2 text-white/80 font-semibold ${size === 'xs' ? 'text-[7px]' : 'text-[10px]'}`}>
            <span className="text-blue-400">{rating}</span>
            <span>{year || 'N/A'}</span>
            <span className="border border-blue-400/30 px-0.5 rounded text-[7px] uppercase text-blue-300">
              {type === 'movie' ? 'Movie' : 'TV'}
            </span>
          </div>
          {size !== 'xs' && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {genreNames.slice(0, 2).map((name, i) => (
                <span key={i} className="text-[8px] px-1.5 py-0.5 bg-blue-600/15 backdrop-blur-md rounded-full text-blue-200/80 border border-blue-500/10">
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default MovieCard;

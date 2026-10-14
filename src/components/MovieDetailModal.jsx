import { useState, useEffect } from 'react';
import { X, Star, Calendar, Clock, Play, Heart, Check, ChevronLeft, ChevronRight, Maximize, Minimize, Lightbulb, RefreshCw, SkipBack, SkipForward } from 'lucide-react';
import { fetchDetails, fetchActorMovies, IMG_URL_500, IMG_URL_ORIGINAL } from '../api/tmdb';
import MovieCard from './MovieCard';

const SERVERS = [
  // ── Original Servers ──
  {
    name: 'VidLink',
    getMovieUrl: (id) => `https://vidlink.pro/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`
  },
  {
    name: 'VidSrc.to',
    getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
  },


  {
    name: 'VidApi',
    getMovieUrl: (id) => `https://vidapi.xyz/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidapi.xyz/embed/tv/${id}&s=${s}&e=${e}`
  },
  {
    name: '2Embed',
    getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
    getTvUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
  },

  {
    name: 'VidSrc.me',
    getMovieUrl: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
  },
  {
    name: 'SuperEmbed',
    getMovieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    getTvUrl: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
  },
  {
    name: 'AutoEmbed',
    getMovieUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`
  },
  // ── New Servers ──

  {
    name: 'Embed.su',
    getMovieUrl: (id) => `https://embed.su/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`
  },
  {
    name: 'VidSrc.cc',
    getMovieUrl: (id, imdbId) => `https://vidsrc.cc/v2/embed/movie/${imdbId || id}`,
    getTvUrl: (id, s, e, imdbId) => `https://vidsrc.cc/v2/embed/tv/${imdbId || id}/${s}/${e}`
  },
  {
    name: 'MoviesAPI',
    getMovieUrl: (id) => `https://moviesapi.club/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://moviesapi.club/embed/tv/${id}/${s}/${e}`
  },
  {
    name: 'SmashyStream',
    getMovieUrl: (id, imdbId) => `https://player.smashy.stream/movie/${imdbId || id}`,
    getTvUrl: (id, s, e, imdbId) => `https://player.smashy.stream/tv/${imdbId || id}?s=${s}&e=${e}`
  },
  {
    name: 'VidCore',
    getMovieUrl: (id) => `https://vidcore.org/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidcore.org/embed/tv/${id}/${s}/${e}`
  },
  {
    name: 'EmbedMaster',
    getMovieUrl: (id) => `https://embedmaster.com/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://embedmaster.com/embed/tv/${id}/${s}/${e}`
  },
  {
    name: 'Nontongo',
    getMovieUrl: (id) => `https://nontongo.win/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://nontongo.win/embed/tv/${id}/${s}/${e}`
  },
  {
    name: 'VidSrc.pro',
    getMovieUrl: (id) => `https://vidsrc.pro/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`
  },
  {
    name: 'VidSrc.mov',
    getMovieUrl: (id) => `https://vidsrc.mov/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.mov/embed/tv/${id}/${s}/${e}`
  },
  {
    name: 'FilmXY',
    getMovieUrl: (id) => `https://filmxy.vip/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://filmxy.vip/embed/tv/${id}/${s}/${e}`
  },

  {
    name: 'VidSrc',
    getMovieUrl: (id) => `https://vidsrc.xyz/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`
  },

];

const MovieDetailModal = ({ itemId, itemType, isOpen, onClose, genres, isInWatchlist, onWatchlistToggle }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actorMovies, setActorMovies] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeServer, setActiveServer] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [lightsOut, setLightsOut] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const castRef = { current: null };

  useEffect(() => {
    if (!isOpen || !itemId) return;
    setLoading(true);
    setDetails(null);
    setActorMovies(null);
    setSelectedActor(null);
    setShowPlayer(false);
    setActiveServer(0);
    setSelectedSeason(1);
    setSelectedEpisode(1);
    setLightsOut(false);
    setTheaterMode(false);
    setPlayerKey(0);
    fetchDetails(itemId, itemType).then(data => {
      setDetails(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [itemId, itemType, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleActorClick = async (actor) => {
    setSelectedActor(actor);
    const movies = await fetchActorMovies(actor.id);
    setActorMovies(movies);
  };

  const handleBackFromActor = () => {
    setSelectedActor(null);
    setActorMovies(null);
  };

  const handleNextEpisode = () => {
    if (itemType !== 'tv' || !details?.seasons) return;
    const currentSeasonData = details.seasons.find(s => s.season_number === selectedSeason);
    if (currentSeasonData && selectedEpisode < currentSeasonData.episode_count) {
      setSelectedEpisode(prev => prev + 1);
    } else {
      const nextSeason = selectedSeason + 1;
      const nextSeasonData = details.seasons.find(s => s.season_number === nextSeason);
      if (nextSeasonData) {
        setSelectedSeason(nextSeason);
        setSelectedEpisode(1);
      }
    }
  };

  const handlePrevEpisode = () => {
    if (itemType !== 'tv' || !details?.seasons) return;
    if (selectedEpisode > 1) {
      setSelectedEpisode(prev => prev - 1);
    } else {
      const prevSeason = selectedSeason - 1;
      const prevSeasonData = details.seasons.find(s => s.season_number === prevSeason);
      if (prevSeasonData && prevSeasonData.episode_count) {
        setSelectedSeason(prevSeason);
        setSelectedEpisode(prevSeasonData.episode_count);
      }
    }
  };

  if (!isOpen) return null;

  const title = itemType === 'movie' ? details?.title : details?.name;
  const year = itemType === 'movie'
    ? details?.release_date?.substring(0, 4)
    : details?.first_air_date?.substring(0, 4);
  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
    : details?.episode_run_time?.[0]
      ? `${details.episode_run_time[0]}m per ep`
      : null;
  const trailer = details?.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
    || details?.videos?.results?.[0];
  const cast = details?.credits?.cast?.slice(0, 20) || [];
  const similar = details?.similar?.results?.slice(0, 12) || [];

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto px-2 sm:px-4 py-2 sm:py-8 overscroll-contain">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full ${theaterMode ? 'max-w-[95vw]' : 'max-w-5xl'} mx-auto bg-zinc-950 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-10 transition-all duration-500`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-4 right-4 z-50 p-2 bg-black/60 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md"
        >
          <X size={24} />
        </button>

        {loading ? (
          <div className="h-[80vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !details ? (
          <div className="h-[60vh] flex items-center justify-center text-white/50">
            Failed to load details.
          </div>
        ) : actorMovies && selectedActor ? (
          /* Actor Movies View */
          <div className="p-6 md:p-8">
            <button
              onClick={handleBackFromActor}
              className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft size={20} /> Back to {title}
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">{selectedActor.name}</h2>
            <p className="text-white/50 mb-8">Known for {actorMovies.length} movies</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {actorMovies.map(movie => (
                <MovieCard
                  key={movie.id}
                  item={movie}
                  type="movie"
                  isListView={false}
                  genres={genres}
                  onClick={() => {
                    setActorMovies(null);
                    setSelectedActor(null);
                    setLoading(true);
                    fetchDetails(movie.id, 'movie').then(data => {
                      setDetails(data);
                      setLoading(false);
                    });
                  }}
                  size="sm"
                />
              ))}
            </div>
          </div>
        ) : (
          /* Main Detail View */
          <>
            {/* Backdrop Header */}
            <div className="relative h-[38svh] min-h-[260px] md:h-[50vh] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${details.backdrop_path ? IMG_URL_ORIGINAL + details.backdrop_path : ''})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-12">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-2xl leading-tight line-clamp-2">
                  {title}
                </h1>
                {details.tagline && (
                  <p className="text-white/50 text-lg italic mb-4">"{details.tagline}"</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-500 px-3 py-1.5 rounded-full font-bold">
                    <Star size={16} fill="currentColor" /> {details.vote_average?.toFixed(1)}
                  </div>
                  {year && (
                    <div className="flex items-center gap-1.5 text-white/70">
                      <Calendar size={16} /> {year}
                    </div>
                  )}
                  {runtime && (
                    <div className="flex items-center gap-1.5 text-white/70">
                      <Clock size={16} /> {runtime}
                    </div>
                  )}
                  {details.genres?.map(g => (
                    <span key={g.id} className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs font-medium border border-white/10">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 md:p-12 space-y-7 sm:space-y-10">
              {/* Actions + Overview */}
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-4">Overview</h3>
                  <p className="text-white/70 leading-relaxed text-base">
                    {details.overview || 'No overview available.'}
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-4 mt-6">
                    <button
                      onClick={() => setShowPlayer(true)}
                      className="min-h-11 flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-all shadow-lg shadow-red-600/30"
                    >
                      <Play size={20} fill="currentColor" /> Play {itemType === 'movie' ? 'Movie' : 'Show'}
                    </button>
                    {trailer && (
                      <a
                        href={`https://www.youtube.com/watch?v=${trailer.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-11 flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all border border-white/10"
                      >
                        Watch Trailer
                      </a>
                    )}
                    <button
                      onClick={() => onWatchlistToggle?.(details)}
                      className={`min-h-11 flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-full font-bold transition-all border ${isInWatchlist
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                        }`}
                    >
                      {isInWatchlist ? <Check size={20} /> : <Heart size={20} />}
                      {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                    </button>
                  </div>
                </div>

                {/* Info sidebar */}
                {details.poster_path && (
                  <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
                    <img
                      src={IMG_URL_500 + details.poster_path}
                      alt={title}
                      className="w-full rounded-2xl shadow-2xl border border-white/10"
                    />
                  </div>
                )}
              </div>

              {/* Video Player */}
              {showPlayer && (
                <div className={`mt-6 sm:mt-8 p-3 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-500 ${lightsOut ? 'bg-black border-transparent relative z-[3000] shadow-[0_0_100px_rgba(0,0,0,1)]' : 'bg-zinc-900/50 border-white/5'}`}>
                  {/* Lights out explicit backdrop inside modal but covers it */}
                  {lightsOut && <div className="fixed inset-0 bg-black/95 z-[-1]" onClick={() => setLightsOut(false)} />}

                  <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Play size={20} className="text-red-500" fill="currentColor" />
                      <span>Now Playing</span>
                      {itemType === 'tv' && <span className="text-white/50 text-base font-normal"> - S{selectedSeason} E{selectedEpisode}</span>}
                    </h3>

                    {/* Custom Player Controls Bar */}
                    <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-xl border border-white/10 relative z-10">
                      {itemType === 'tv' && (
                        <>
                          <button onClick={handlePrevEpisode} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all" title="Previous Episode">
                            <SkipBack size={18} />
                          </button>
                          <button onClick={handleNextEpisode} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all" title="Next Episode">
                            <SkipForward size={18} />
                          </button>
                          <div className="w-px h-6 bg-white/10 mx-1"></div>
                        </>
                      )}
                      <button onClick={() => setLightsOut(!lightsOut)} className={`p-2 rounded-lg transition-all ${lightsOut ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-white/10 text-white/70 hover:text-white'}`} title="Lights Out">
                        <Lightbulb size={18} />
                      </button>
                      <button onClick={() => setTheaterMode(!theaterMode)} className={`p-2 rounded-lg transition-all ${theaterMode ? 'bg-blue-500/20 text-blue-500' : 'hover:bg-white/10 text-white/70 hover:text-white'}`} title="Theater Mode">
                        {theaterMode ? <Minimize size={18} /> : <Maximize size={18} />}
                      </button>
                      <button onClick={() => setPlayerKey(prev => prev + 1)} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all" title="Reload Player">
                        <RefreshCw size={18} />
                      </button>
                    </div>
                  </div>

                  {itemType === 'tv' && details.seasons && !lightsOut && (
                    <div className="flex flex-wrap gap-4 mb-6">
                      <select
                        value={selectedSeason}
                        onChange={(e) => {
                          setSelectedSeason(Number(e.target.value));
                          setSelectedEpisode(1);
                        }}
                        className="bg-black border border-white/10 text-white px-4 py-2 rounded-xl focus:outline-none focus:border-red-500"
                        style={{ colorScheme: 'dark' }}
                      >
                        {details.seasons.filter(s => s.season_number > 0).map(s => (
                          <option key={s.season_number} value={s.season_number} style={{ backgroundColor: '#111827', color: '#fff' }}>
                            Season {s.season_number}
                          </option>
                        ))}
                      </select>

                      <select
                        value={selectedEpisode}
                        onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                        className="bg-black border border-white/10 text-white px-4 py-2 rounded-xl focus:outline-none focus:border-red-500"
                        style={{ colorScheme: 'dark' }}
                      >
                        {Array.from(
                          { length: details.seasons.find(s => s.season_number === selectedSeason)?.episode_count || 1 },
                          (_, i) => i + 1
                        ).map(ep => (
                          <option key={ep} value={ep} style={{ backgroundColor: '#111827', color: '#fff' }}>Episode {ep}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!lightsOut && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Servers</span>
                        <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full font-bold">{SERVERS.length} available</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 relative">
                        {SERVERS.map((server, idx) => (
                          <button
                            key={server.name}
                            type="button"
                            aria-pressed={activeServer === idx}
                            onClick={() => {
                              setActiveServer(idx);
                              setPlayerKey(key => key + 1);
                            }}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all shrink-0 ${activeServer === idx
                              ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/5'
                              }`}
                          >
                            {server.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`rounded-2xl overflow-hidden border border-white/10 bg-black transition-all duration-500 relative z-10 ${theaterMode ? (itemType === 'movie' ? 'aspect-[21/9]' : 'aspect-video') : 'aspect-video'}`}>
                    <iframe
                      key={`${activeServer}-${playerKey}`}
                      src={itemType === 'movie'
                        ? SERVERS[activeServer].getMovieUrl(details.id, details.imdb_id)
                        : SERVERS[activeServer].getTvUrl(details.id, selectedSeason, selectedEpisode, details.external_ids?.imdb_id || details.imdb_id)
                      }
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay; fullscreen"
                    />
                  </div>
                </div>
              )}

              {/* Trailer Embed */}
              {!showPlayer && trailer && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Trailer</h3>
                  <div className="aspect-video rounded-2xl overflow-hidden border border-white/10">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailer.key}`}
                      title={trailer.name}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Cast */}
              {cast.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Cast</h3>
                  <div className="flex overflow-x-auto gap-4 scrollbar-hide pb-4">
                    {cast.map(actor => (
                      <button
                        key={actor.id}
                        onClick={() => handleActorClick(actor)}
                        className="shrink-0 w-24 text-center group cursor-pointer"
                      >
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-2 border-2 border-transparent group-hover:border-red-500 transition-all">
                          <img
                            src={actor.profile_path ? IMG_URL_500 + actor.profile_path : 'https://via.placeholder.com/200x200?text=?'}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <p className="text-white text-xs font-medium truncate group-hover:text-red-500 transition-colors">{actor.name}</p>
                        <p className="text-white/40 text-[10px] truncate">{actor.character}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar */}
              {similar.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">More Like This</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {similar.map(item => (
                      <MovieCard
                        key={item.id}
                        item={item}
                        type={itemType}
                        isListView={false}
                        genres={genres}
                        onClick={() => {
                          setLoading(true);
                          fetchDetails(item.id, itemType).then(data => {
                            setDetails(data);
                            setLoading(false);
                            window.scrollTo({ top: 0 });
                          });
                        }}
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MovieDetailModal;

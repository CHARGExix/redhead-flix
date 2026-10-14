import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Star, Calendar, Clock, Play, Heart, Check,
  ChevronLeft, ChevronRight, Lightbulb, RefreshCw,
  SkipBack, SkipForward, Maximize, Minimize, X, ExternalLink
} from 'lucide-react';
import { fetchDetails, fetchActorMovies, IMG_URL_500, IMG_URL_ORIGINAL } from '../api/tmdb';
import MovieCard from './MovieCard';

const SERVERS = [
  { name: 'VixCloud', getMovieUrl: (id) => `https://vixsrc.to/movie/${id}`, getTvUrl: (id, s, e) => `https://vixsrc.to/tv/${id}/${s}/${e}` },
  { name: 'VidLove', getMovieUrl: (id) => `https://player.vidlove.cc/embed/movie/${id}`, getTvUrl: (id, s, e) => `https://player.vidlove.cc/embed/tv/${id}/${s}/${e}` },
  { name: 'PrimeSrc', getMovieUrl: (id, imdbId) => `https://primesrc.me/embed/movie?${imdbId ? `imdb=${encodeURIComponent(imdbId)}` : `tmdb=${id}`}`, getTvUrl: (id, s, e, imdbId) => `https://primesrc.me/embed/tv?${imdbId ? `imdb=${encodeURIComponent(imdbId)}&` : `tmdb=${id}&`}season=${s}&episode=${e}` },
  { name: 'VidApi', getMovieUrl: (id) => `https://vidapi.xyz/embed/movie/${id}`, getTvUrl: (id, s, e) => `https://vidapi.xyz/embed/tv/${id}&s=${s}&e=${e}` },
  { name: '2Embed', getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`, getTvUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
  { name: 'SuperEmbed', getMovieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`, getTvUrl: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
  { name: 'VidLink', getMovieUrl: (id) => `https://vidlink.pro/movie/${id}`, getTvUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}` },



];

const WatchPage = ({ itemId, itemType, onBack, onItemClick, genres, isInWatchlist, onWatchlistToggle }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServer] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [lightsOut, setLightsOut] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const [actorMovies, setActorMovies] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);

  useEffect(() => {
    if (!itemId) return;
    setLoading(true);
    setDetails(null);
    setActiveServer(0);
    setSelectedSeason(1);
    setSelectedEpisode(1);
    setLightsOut(false);
    setTheaterMode(false);
    setPlayerKey(0);
    setActorMovies(null);
    setSelectedActor(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchDetails(itemId, itemType).then(data => {
      setDetails(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [itemId, itemType]);



  const handleActorClick = async (actor) => {
    setSelectedActor(actor);
    const movies = await fetchActorMovies(actor.id);
    setActorMovies(movies);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 mb-4">Failed to load details.</p>
          <button onClick={onBack} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

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

  const playerUrl = itemType === 'movie'
    ? SERVERS[activeServer].getMovieUrl(details.id, details.imdb_id)
    : SERVERS[activeServer].getTvUrl(details.id, selectedSeason, selectedEpisode, details.external_ids?.imdb_id || details.imdb_id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={`min-h-screen bg-[#030712] ${lightsOut ? 'bg-black' : ''}`}
    >
      {/* Lights out overlay */}
      <AnimatePresence>
        {lightsOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setLightsOut(false)}
          />
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 ${lightsOut ? 'bg-black/95' : 'bg-[#030712]/90'}`}
      >
        <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg md:rounded-xl text-sm md:text-base font-medium transition-all border border-white/5 shrink-0"
            >
              <ArrowLeft size={18} /> <span className="hidden sm:inline">Back</span>
            </button>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base sm:text-lg truncate">{title}</h1>
              <div className="flex items-center gap-3 text-xs text-white/50">
                {year && <span>{year}</span>}
                {runtime && <span>{runtime}</span>}
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star size={10} fill="currentColor" /> {details.vote_average?.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onWatchlistToggle?.(details)}
              className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl font-medium text-xs md:text-sm transition-all border ${isInWatchlist
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white/5 text-white/70 border-white/5 hover:bg-white/10'
                }`}
            >
              {isInWatchlist ? <Check size={16} /> : <Heart size={16} />}
              <span className="hidden sm:inline">{isInWatchlist ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`max-w-[1800px] mx-auto relative ${lightsOut ? 'z-50' : ''}`}>
        {/* Player Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${theaterMode ? 'px-0' : 'px-3 sm:px-4 md:px-8 pt-4 sm:pt-6'}`}
        >
          {/* Player Controls Bar */}
          <div className={`flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 ${theaterMode ? 'px-3 sm:px-4 md:px-8' : ''}`}>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-white font-bold text-sm md:text-base flex items-center gap-2">
                <Play size={18} className="text-blue-500" fill="currentColor" />
                Now Playing
                {itemType === 'tv' && (
                  <span className="text-white/40 text-sm font-normal">— S{selectedSeason} E{selectedEpisode}</span>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              {itemType === 'tv' && (
                <>
                  <button onClick={handlePrevEpisode} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all" title="Previous Episode">
                    <SkipBack size={16} />
                  </button>
                  <button onClick={handleNextEpisode} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all" title="Next Episode">
                    <SkipForward size={16} />
                  </button>
                  <div className="w-px h-5 bg-white/10" />
                </>
              )}
              <button onClick={() => setLightsOut(!lightsOut)} className={`p-2 rounded-lg transition-all ${lightsOut ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-white/10 text-white/70 hover:text-white'}`} title="Lights Out">
                <Lightbulb size={16} />
              </button>
              <button onClick={() => setTheaterMode(!theaterMode)} className={`p-2 rounded-lg transition-all ${theaterMode ? 'bg-blue-500/20 text-blue-500' : 'hover:bg-white/10 text-white/70 hover:text-white'}`} title="Theater Mode">
                {theaterMode ? <Minimize size={16} /> : <Maximize size={16} />}
              </button>
              <button onClick={() => setPlayerKey(prev => prev + 1)} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all" title="Reload Player">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Video Player */}
          <div className={`rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-black transition-all duration-500 ${theaterMode ? (itemType === 'movie' ? 'aspect-[21/9]' : 'aspect-video') : 'aspect-video'} ${theaterMode ? 'rounded-none' : ''}`}>
            <iframe
              key={`${activeServer}-${playerKey}`}
              src={playerUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen"
            />
          </div>

          {/* Server Selector */}
          <div className={`mt-3 sm:mt-4 ${theaterMode ? 'px-3 sm:px-4 md:px-8' : ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Choose Server</span>
                <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">{SERVERS.length} available</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/50">Playing on <span className="text-blue-300 font-semibold">{SERVERS[activeServer].name}</span></span>
                <a
                  href={playerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
                >
                  Open in new tab <ExternalLink size={13} />
                </a>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {SERVERS.map((server, idx) => (
                <button
                  key={server.name}
                  type="button"
                  aria-pressed={activeServer === idx}
                  onClick={() => {
                    setActiveServer(idx);
                    setPlayerKey(key => key + 1);
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeServer === idx
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-300/50'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                >
                  {server.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Below Player Content */}
        {!lightsOut && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="px-3 sm:px-4 md:px-8 py-6 sm:py-8 space-y-7 sm:space-y-8"
          >
            {/* TV Season/Episode Selector */}
            <div className="flex flex-wrap gap-4">
              {/* Season/Episode for TV */}
              {itemType === 'tv' && details.seasons && (
                <div className="flex w-full sm:w-auto gap-2 sm:gap-3 flex-wrap">
                  <select
                    value={selectedSeason}
                    onChange={(e) => { setSelectedSeason(Number(e.target.value)); setSelectedEpisode(1); }}
                    className="min-h-11 flex-1 sm:flex-none min-w-0 bg-white/5 border border-white/10 text-white px-3 sm:px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                    style={{ colorScheme: 'dark' }}
                  >
                    {details.seasons.filter(s => s.season_number > 0).map(s => (
                      <option key={s.season_number} value={s.season_number} style={{ backgroundColor: '#111827', color: '#fff' }}>Season {s.season_number}</option>
                    ))}
                  </select>
                  <select
                    value={selectedEpisode}
                    onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                    className="min-h-11 flex-1 sm:flex-none min-w-0 bg-white/5 border border-white/10 text-white px-3 sm:px-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
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


            </div>

            {/* Movie Info Section */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Info */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 break-words">{title}</h2>
                  {details.tagline && (
                    <p className="text-blue-400/70 text-sm md:text-base italic mb-4">"{details.tagline}"</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                    <div className="flex items-center gap-1.5 bg-yellow-500/15 text-yellow-500 px-3 py-1.5 rounded-full font-bold">
                      <Star size={14} fill="currentColor" /> {details.vote_average?.toFixed(1)}
                    </div>
                    {year && (
                      <div className="flex items-center gap-1.5 text-white/60">
                        <Calendar size={14} /> {year}
                      </div>
                    )}
                    {runtime && (
                      <div className="flex items-center gap-1.5 text-white/60">
                        <Clock size={14} /> {runtime}
                      </div>
                    )}
                    {details.genres?.map(g => (
                      <span key={g.id} className="px-3 py-1 bg-white/5 rounded-full text-white/70 text-xs font-medium border border-white/10">
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Overview</h3>
                  <p className="text-white/60 leading-relaxed">{details.overview || 'No overview available.'}</p>
                </div>

                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/10"
                  >
                    <Play size={16} /> Watch Trailer
                  </a>
                )}
              </div>

              {/* Right: Poster */}
              {details.poster_path && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="w-full lg:w-72 shrink-0"
                >
                  <img
                    src={IMG_URL_500 + details.poster_path}
                    alt={title}
                    className="w-full rounded-2xl shadow-2xl border border-white/10"
                  />
                </motion.div>
              )}
            </div>

            {/* Cast */}
            {cast.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Cast</h3>
                {actorMovies && selectedActor ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <button
                      onClick={() => { setSelectedActor(null); setActorMovies(null); }}
                      className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
                    >
                      <ChevronLeft size={18} /> Back to Cast
                    </button>
                    <h4 className="text-xl font-bold text-white mb-1">{selectedActor.name}</h4>
                    <p className="text-white/40 mb-6 text-sm">Known for {actorMovies.length} movies</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {actorMovies.map(movie => (
                        <MovieCard
                          key={movie.id}
                          item={movie}
                          type="movie"
                          isListView={false}
                          genres={genres}
                          onClick={() => onItemClick(movie.id, 'movie')}
                          size="sm"
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex overflow-x-auto gap-4 scrollbar-hide pb-4">
                    {cast.map((actor, idx) => (
                      <motion.button
                        key={actor.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                        onClick={() => handleActorClick(actor)}
                        className="shrink-0 w-24 text-center group cursor-pointer"
                      >
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-2 border-2 border-transparent group-hover:border-blue-500 transition-all">
                          <img
                            src={actor.profile_path ? IMG_URL_500 + actor.profile_path : 'https://via.placeholder.com/200x200?text=?'}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <p className="text-white text-xs font-medium truncate group-hover:text-blue-400 transition-colors">{actor.name}</p>
                        <p className="text-white/40 text-[10px] truncate">{actor.character}</p>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Trailer Embed */}
            {trailer && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Trailer</h3>
                <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 max-w-3xl">
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

            {/* Similar / Recommendations */}
            {similar.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">More Like This</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {similar.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                    >
                      <MovieCard
                        item={item}
                        type={itemType}
                        isListView={false}
                        genres={genres}
                        onClick={() => onItemClick(item.id, itemType)}
                        size="sm"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default WatchPage;

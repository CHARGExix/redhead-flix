import { Star, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { IMG_URL_500 } from '../api/tmdb';
import { useSettings } from '../context/SettingsContext';

const Sidebar = ({ genres, trending, type, onItemClick, onGenreClick, onYearClick }) => {
  const years = Array.from({ length: 21 }, (_, i) => 2030 - i);
  const { settings } = useSettings();

  return (
    <div className="space-y-10">
      {/* Ad Slot */}
      {settings?.enable_sidebar_ads === 1 && settings?.sidebar_ads_code && (
        <div
          className="bg-[#0a1628]/60 rounded-3xl p-6 border border-blue-500/5 backdrop-blur-sm flex justify-center overflow-hidden"
          dangerouslySetInnerHTML={{ __html: settings.sidebar_ads_code }}
        />
      )}

      {/* Trending Now */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#0a1628]/60 rounded-3xl p-6 border border-blue-500/5 backdrop-blur-sm"
      >
        <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
          Trending Now
          <span className="flex items-center gap-1.5 text-xs text-blue-400 font-normal uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Live
          </span>
        </h3>
        <div className="space-y-4">
          {trending.slice(0, 10).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onItemClick(item.id, item.media_type || type)}
              className="flex gap-4 group cursor-pointer"
            >
              <div className="relative w-16 h-20 shrink-0 overflow-hidden rounded-xl">
                <img
                  src={item.poster_path ? IMG_URL_500 + item.poster_path : 'https://via.placeholder.com/150'}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] font-bold px-1 rounded">
                  {idx + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                  {item.title || item.name}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-white/40">
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star size={10} fill="currentColor" /> {item.vote_average?.toFixed(1)}
                  </span>
                  <span>{item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <button className="w-full mt-6 py-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-bold transition-all border border-blue-500/10">
          VIEW ALL TRENDING
        </button>
      </motion.div>

      {/* Genres */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-[#0a1628]/60 rounded-3xl p-6 border border-blue-500/5 backdrop-blur-sm"
      >
        <h3 className="text-lg font-bold text-white mb-6">Genres</h3>
        <div className="flex flex-wrap gap-2">
          {genres.slice(0, 19).map(genre => (
            <button
              key={genre.id}
              onClick={() => onGenreClick(genre.id)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white text-white/60 text-xs font-medium transition-all border border-white/5 hover:border-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              {genre.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Release Year */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#0a1628]/60 rounded-3xl p-6 border border-blue-500/5 backdrop-blur-sm"
      >
        <h3 className="text-lg font-bold text-white mb-6">Release Year</h3>
        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
          {years.map(year => (
            <button
              key={year}
              onClick={() => onYearClick(year)}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-blue-600/15 text-white/60 text-xs font-medium transition-all border border-white/5 group hover:border-blue-500/20"
            >
              {year}
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;

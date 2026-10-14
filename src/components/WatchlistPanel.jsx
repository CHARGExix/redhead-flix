import { X, Bookmark, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '../hooks/useClickOutside';
import { IMG_URL_500 } from '../api/tmdb';

const WatchlistPanel = ({ isOpen, setIsOpen, watchlist, onRemove, onItemClick }) => {
  const panelRef = useRef(null);
  useClickOutside(panelRef, () => { if (isOpen) setIsOpen(false); });

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-dvh w-full max-w-sm bg-[#060d1b] border-l border-blue-500/10 z-[101] transition-transform duration-300 sm:duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Bookmark size={20} className="text-blue-400" /> Watchlist
            <span className="text-sm font-normal text-white/30">({watchlist.length})</span>
          </h3>
          <button aria-label="Close watchlist" className="min-w-11 min-h-11 flex items-center justify-center text-white/60 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))] overscroll-contain">
          {watchlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-20 h-20 bg-blue-600/5 rounded-full flex items-center justify-center mb-6 border border-blue-500/10">
                <Bookmark size={32} className="text-blue-500/20" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Your Watchlist is Empty</h4>
              <p className="text-white/30 text-sm">Add movies and TV shows to your watchlist to keep track of what you want to watch.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {watchlist.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-3 bg-white/3 rounded-xl overflow-hidden border border-white/5 hover:bg-blue-600/10 hover:border-blue-500/10 transition-all group cursor-pointer"
                  onClick={() => {
                    onItemClick(item.id, item.media_type || 'movie');
                    setIsOpen(false);
                  }}
                >
                  <img
                    src={item.poster_path ? IMG_URL_500 + item.poster_path : 'https://via.placeholder.com/100x150?text=?'}
                    alt={item.title || item.name}
                    className="w-16 h-24 object-cover shrink-0"
                  />
                  <div className="flex-1 py-2 pr-2 min-w-0 flex flex-col justify-center">
                    <h4 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">{item.title || item.name}</h4>
                    <p className="text-[10px] text-white/30 mt-1">
                      {item.vote_average?.toFixed(1)} ★ · {item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                    className="p-2 text-white/20 hover:text-red-500 transition-colors self-center mr-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WatchlistPanel;

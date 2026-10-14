import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

const FilterPanel = ({ genres, filters, setFilters, onApply, isOpen, setIsOpen }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [sections, setSections] = useState({ genres: true, year: true, rating: true });
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) setLocalFilters(filters);
  }, [isOpen, filters]);

  useClickOutside(panelRef, () => { if (isOpen) setIsOpen(false); });

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const applyFilters = () => {
    if (onApply) onApply(localFilters);
    else setFilters(localFilters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const empty = { genres: [], yearFrom: null, yearTo: null, ratingFrom: null, ratingTo: null };
    setLocalFilters(empty);
    if (onApply) onApply(empty);
    else setFilters(empty);
    setIsOpen(false);
  };

  const toggleGenre = (id) => {
    setLocalFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(id)
        ? prev.genres.filter(g => g !== id)
        : [...prev.genres, id],
    }));
  };

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
            <SlidersHorizontal size={20} className="text-blue-400" /> Filters
          </h3>
          <button aria-label="Close filters" className="min-w-11 min-h-11 flex items-center justify-center text-white/60 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain">
          {/* Genres */}
          <div>
            <button onClick={() => toggleSection('genres')} className="flex items-center justify-between w-full text-white font-semibold mb-4">
              Genres {sections.genres ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {sections.genres && (
              <div className="flex flex-wrap gap-2">
                {genres.map(genre => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      localFilters.genres.includes(genre.id)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-blue-600/10 hover:border-blue-500/20 hover:text-white'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Range */}
          <div>
            <button onClick={() => toggleSection('year')} className="flex items-center justify-between w-full text-white font-semibold mb-4">
              Release Year {sections.year ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {sections.year && (
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="From"
                  value={localFilters.yearFrom || ''}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, yearFrom: e.target.value === '' ? null : Number(e.target.value) }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 placeholder-white/20 transition-all"
                />
                <input
                  type="number"
                  placeholder="To"
                  value={localFilters.yearTo || ''}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, yearTo: e.target.value === '' ? null : Number(e.target.value) }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 placeholder-white/20 transition-all"
                />
              </div>
            )}
          </div>

          {/* Rating Range */}
          <div>
            <button onClick={() => toggleSection('rating')} className="flex items-center justify-between w-full text-white font-semibold mb-4">
              Rating {sections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {sections.rating && (
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="10"
                  step="0.5"
                  value={localFilters.ratingFrom || ''}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, ratingFrom: e.target.value === '' ? null : Number(e.target.value) }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 placeholder-white/20 transition-all"
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="10"
                  step="0.5"
                  value={localFilters.ratingTo || ''}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, ratingTo: e.target.value === '' ? null : Number(e.target.value) }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 placeholder-white/20 transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/5 space-y-3">
          <button onClick={applyFilters} className="w-full min-h-12 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
            Apply Filters
          </button>
          <button onClick={resetFilters} className="w-full min-h-12 py-3.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl font-medium transition-all border border-white/5">
            Reset All
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;

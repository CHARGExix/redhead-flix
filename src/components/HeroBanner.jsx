import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight, Star, Calendar } from 'lucide-react';
import { IMG_URL_500, IMG_URL_ORIGINAL } from '../api/tmdb';

const HeroBanner = ({ items, type, onPlayClick, onInfoClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (items.length === 0 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length, isPaused]);

  if (items.length === 0) {
    return <div className="w-full h-[60vh] lg:h-[80vh] bg-[#0a1628] animate-shimmer rounded-3xl mb-12" />;
  }

  const item = items[currentIndex];
  const title = type === 'movie' ? item.title : item.name;
  const year = type === 'movie'
    ? item.release_date?.substring(0, 4)
    : item.first_air_date?.substring(0, 4);

  const bgImage = window.innerWidth <= 768
    ? (item.poster_path ? IMG_URL_500 + item.poster_path : '')
    : (item.backdrop_path ? IMG_URL_ORIGINAL + item.backdrop_path : (item.poster_path ? IMG_URL_500 + item.poster_path : ''));

  const goNext = () => setCurrentIndex(prev => (prev + 1) % items.length);
  const goPrev = () => setCurrentIndex(prev => (prev - 1 + items.length) % items.length);

  return (
    <div
      className="relative w-full h-[56svh] sm:h-[60vh] lg:h-[80vh] min-h-[410px] max-h-[680px] md:min-h-[500px] lg:max-h-none mb-7 sm:mb-10 md:mb-12 rounded-2xl md:rounded-3xl overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }} />
          {/* Blue-tinted gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/60 to-transparent lg:bg-gradient-to-r lg:from-[#030712] lg:via-[#030712]/70 lg:to-transparent" />
          {/* Subtle blue glow at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-950/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end lg:justify-center p-4 pb-12 sm:p-6 sm:pb-16 lg:p-16 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentIndex}`}
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-2 sm:mb-4 leading-tight drop-shadow-2xl line-clamp-2">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-white/80 mb-4 md:mb-6 text-xs md:text-sm lg:text-base font-medium">
              <div className="flex items-center gap-2 bg-yellow-500/15 text-yellow-500 px-3 py-1 rounded-full backdrop-blur-sm">
                <Star size={16} fill="currentColor" /> {item.vote_average?.toFixed(1) || 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} /> {year || 'N/A'}
              </div>
            </div>

            <p className="text-white/70 text-sm sm:text-base lg:text-xl line-clamp-3 lg:line-clamp-4 mb-4 sm:mb-7 max-w-2xl drop-shadow-md leading-relaxed">
              {item.overview}
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPlayClick(item.id, type)}
                className="min-h-12 flex items-center gap-2 px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-blue-600 text-white hover:bg-blue-500 rounded-full font-bold transition-all shadow-xl shadow-blue-600/20 text-sm md:text-lg"
              >
                <Play size={24} fill="currentColor" /> Play Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onInfoClick(item.id, type)}
                className="min-h-12 flex items-center gap-2 px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all backdrop-blur-md border border-white/10 text-sm md:text-lg"
              >
                <Info size={24} /> More Info
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-8 right-8 lg:flex items-center gap-4 hidden z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={goPrev}
          className="p-3 rounded-full bg-white/5 hover:bg-blue-600 text-white backdrop-blur-md transition-all border border-white/10 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        >
          <ChevronLeft size={24} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={goNext}
          className="p-3 rounded-full bg-white/5 hover:bg-blue-600 text-white backdrop-blur-md transition-all border border-white/10 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        >
          <ChevronRight size={24} />
        </motion.button>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-500 rounded-full ${currentIndex === idx ? 'w-8 h-2 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;

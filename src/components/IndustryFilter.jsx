import { LANGUAGES } from '../api/tmdb';
import { motion } from 'framer-motion';

const IndustryFilter = ({ currentIndustry, setIndustry }) => {
  return (
    <div className="w-full overflow-x-auto overscroll-x-contain scrollbar-hide py-3 sm:py-4 mb-5 sm:mb-6 snap-x snap-proximity">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex gap-2 sm:gap-3 min-w-max px-0"
      >
        {Object.entries(LANGUAGES).map(([key, lang], idx) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIndustry(key)}
            aria-pressed={currentIndustry === key}
            className={`min-h-11 px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-300 snap-start ${
              currentIndustry === key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-white/5 text-white/60 hover:bg-blue-600/10 hover:text-white border border-white/10 hover:border-blue-500/20'
            }`}
          >
            {lang.name}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default IndustryFilter;

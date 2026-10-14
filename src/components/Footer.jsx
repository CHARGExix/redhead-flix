import { Youtube, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#020817] border-t border-blue-500/5 mt-20 relative overflow-hidden">
      {/* Subtle blue glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="/" className="text-2xl font-black text-white tracking-tighter flex items-center gap-2 mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">RedHead</span>
              <span className="text-white"> FLIX</span>
            </a>
            <p className="text-white/30 text-sm leading-relaxed">
              Stream unlimited movies and TV shows on your favorite devices. Discover new content every day.
            </p>
            <div className="flex gap-4 mt-6">
              <button className="p-2 bg-white/5 hover:bg-blue-600/20 text-white/30 hover:text-blue-400 rounded-full transition-all border border-white/5 hover:border-blue-500/20">
                <Twitter size={18} />
              </button>
              <button className="p-2 bg-white/5 hover:bg-blue-600/20 text-white/30 hover:text-blue-400 rounded-full transition-all border border-white/5 hover:border-blue-500/20">
                <Instagram size={18} />
              </button>
              <button className="p-2 bg-white/5 hover:bg-blue-600/20 text-white/30 hover:text-blue-400 rounded-full transition-all border border-white/5 hover:border-blue-500/20">
                <Youtube size={18} />
              </button>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Browse</h4>
            <ul className="space-y-3 text-white/30 text-sm">
              <li><button className="hover:text-blue-400 transition-colors">Movies</button></li>
              <li><button className="hover:text-blue-400 transition-colors">TV Shows</button></li>
              <li><button className="hover:text-blue-400 transition-colors">Trending</button></li>
              <li><button className="hover:text-blue-400 transition-colors">Top Rated</button></li>
              <li><button className="hover:text-blue-400 transition-colors">New Releases</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Genres</h4>
            <ul className="space-y-3 text-white/30 text-sm">
              <li><button className="hover:text-blue-400 transition-colors">Action</button></li>
              <li><button className="hover:text-blue-400 transition-colors">Comedy</button></li>
              <li><button className="hover:text-blue-400 transition-colors">Drama</button></li>
              <li><button className="hover:text-blue-400 transition-colors">Horror</button></li>
              <li><button className="hover:text-blue-400 transition-colors">Sci-Fi</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3 text-white/30 text-sm">
              <li><button className="hover:text-blue-400 transition-colors">Help Center</button></li>
              <li><button className="hover:text-blue-400 transition-colors">Terms of Service</button></li>
              <li><button className="hover:text-blue-400 transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-blue-400 transition-colors">Contact Us</button></li>
              <li><button className="hover:text-blue-400 transition-colors">FAQ</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-sm">
            © {new Date().getFullYear()} RedHead FLIX. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-white/20 text-sm">
            powered by 2+2=5
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

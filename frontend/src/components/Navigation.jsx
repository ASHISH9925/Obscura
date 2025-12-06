import { Shield } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl group-hover:bg-cyan-500/30 transition-all duration-300" />
              <Shield className="w-8 h-8 text-cyan-400 relative transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-2xl font-audiowide bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              OBSCURA
            </span>
          </Link>

          <div className="flex gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/encrypt"
              className={({ isActive }) =>
                `px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              Encrypt
            </NavLink>
            <NavLink
              to="/decrypt"
              className={({ isActive }) =>
                `px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              Decrypt
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

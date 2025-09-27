import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Calendar, Award } from 'lucide-react';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Speaker Persona</h1>
                <p className="text-xs text-gray-500">Vibeathon 2025</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Home
              </Link>
              <Link to="/feedback" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Feedback
              </Link>
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn-secondary text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register as Speaker
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Speaker Persona</h3>
                  <p className="text-gray-400 text-sm">Vibeathon 2025</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Comprehensive event management system designed to streamline speaker engagement 
                and event coordination for modern conferences and events.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>1000+ Speakers</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>100+ Sessions</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Award className="h-4 w-4" />
                  <span>Multiple Tracks</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Speaker Registration</Link></li>
                <li><Link to="/feedback" className="hover:text-white transition-colors">Event Feedback</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><span className="hover:text-white transition-colors cursor-pointer">Help Center</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Contact Support</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Speaker Guidelines</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Event Resources</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Vibeathon. Built with ❤️ for the hackathon community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
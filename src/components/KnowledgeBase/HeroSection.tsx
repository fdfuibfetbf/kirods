import React from 'react';
import { BookOpen, Shield, Server, Zap, Globe, Search, ArrowRight, Star, Users, Clock } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 md:p-10 text-white mb-8 shadow-xl">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-16 h-16 border border-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-12 h-12 border border-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-32 w-10 h-10 border border-white/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border border-white/15 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-transparent to-primary-600/20"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center">
          {/* Logo with Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-all duration-500 animate-pulse-green"></div>
              <div className="relative bg-gradient-primary p-4 rounded-xl shadow-xl group-hover:scale-105 transition-all duration-500">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          {/* Main Heading with Gradient Text */}
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Kirods Hosting
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-primary-400 bg-clip-text text-transparent">
              Knowledge Base
            </span>
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your comprehensive resource for web hosting solutions, cPanel management, WordPress optimization, 
            troubleshooting guides, and expert hosting support.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <button className="group bg-gradient-primary text-white px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2 text-sm">
              <Search className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Search Knowledge Base</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            
            <a 
              href="https://kirods.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2 text-sm border border-white/20"
            >
              <Globe className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Visit Kirods.com</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-primary-300 transition-colors duration-300">500+</div>
                <div className="text-xs text-gray-300 font-medium flex items-center justify-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span>Helpful Guides</span>
                </div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-primary-300 transition-colors duration-300">24/7</div>
                <div className="text-xs text-gray-300 font-medium flex items-center justify-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Expert Support</span>
                </div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-primary-300 transition-colors duration-300">99.9%</div>
                <div className="text-xs text-gray-300 font-medium flex items-center justify-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>Uptime SLA</span>
                </div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                <div className="text-2xl font-bold text-white mb-1 group-hover:text-primary-300 transition-colors duration-300">10K+</div>
                <div className="text-xs text-gray-300 font-medium flex items-center justify-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Happy Customers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
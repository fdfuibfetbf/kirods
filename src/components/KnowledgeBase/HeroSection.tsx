import React from 'react';
import { BookOpen, Shield, Server, Zap, Globe, Search, ArrowRight, Star, Users, Clock } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-16 text-white mb-12 shadow-2xl">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 border-2 border-white/25 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-white/15 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 border-2 border-white/20 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/4 right-1/3 w-14 h-14 border-2 border-white/25 rounded-full animate-pulse" style={{ animationDelay: '2.5s' }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-transparent to-primary-600/20"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center">
          {/* Logo with Enhanced Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-500 animate-pulse-green"></div>
              <div className="relative bg-gradient-primary p-6 rounded-3xl shadow-2xl group-hover:scale-105 transition-all duration-500">
                <Shield className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* Main Heading with Gradient Text */}
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Kirods Hosting
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-primary-400 bg-clip-text text-transparent">
              Knowledge Base
            </span>
          </h1>

          {/* Enhanced Description */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Your comprehensive resource for web hosting solutions, cPanel management, WordPress optimization, 
            troubleshooting guides, and expert hosting support. Get instant answers to all your hosting questions.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="group bg-gradient-primary text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-green transition-all duration-300 flex items-center justify-center space-x-3 text-lg">
              <Search className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Search Knowledge Base</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            
            <a 
              href="https://kirods.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-3 text-lg border border-white/20"
            >
              <Globe className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Visit Kirods.com</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors duration-300">500+</div>
                <div className="text-sm text-gray-300 font-medium flex items-center justify-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Helpful Guides</span>
                </div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors duration-300">24/7</div>
                <div className="text-sm text-gray-300 font-medium flex items-center justify-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Expert Support</span>
                </div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors duration-300">99.9%</div>
                <div className="text-sm text-gray-300 font-medium flex items-center justify-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>Uptime SLA</span>
                </div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group-hover:scale-105">
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors duration-300">10K+</div>
                <div className="text-sm text-gray-300 font-medium flex items-center justify-center space-x-1">
                  <Users className="h-4 w-4" />
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
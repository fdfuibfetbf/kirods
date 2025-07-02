import React from 'react';
import { BookOpen, Shield, Server, Zap, Globe, Search } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-hero rounded-3xl p-8 md:p-12 text-white mb-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 border border-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 border border-white/20 rounded-full"></div>
        <div className="absolute top-1/4 right-1/3 w-14 h-14 border border-white/20 rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative bg-gradient-primary p-4 rounded-2xl">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-secondary bg-clip-text text-transparent">
            Kirods Hosting
          </span>
          <br />
          Knowledge Base
        </h1>

        <p className="text-xl md:text-2xl text-secondary-300 mb-8 max-w-4xl mx-auto leading-relaxed">
          Your complete resource for web hosting solutions, cPanel management, WordPress optimization, troubleshooting guides, and expert hosting support
        </p>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">500+</div>
            <div className="text-sm text-secondary-300">Helpful Guides</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">24/7</div>
            <div className="text-sm text-secondary-300">Expert Support</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">99.9%</div>
            <div className="text-sm text-secondary-300">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">10K+</div>
            <div className="text-sm text-secondary-300">Happy Customers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
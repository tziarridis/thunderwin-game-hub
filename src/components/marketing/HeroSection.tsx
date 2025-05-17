
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative">
      {/* Background gradient or image */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-purple-900/80 z-0"></div>
      
      {/* Optional background pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-20 z-0"></div>
      
      <div className="container mx-auto px-4 py-24 md:py-32 lg:py-40 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Experience the Next Generation of Online Casino
          </h1>
          
          <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Join thousands of players enjoying hundreds of exciting games, massive jackpots, and instant withdrawals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600">
              <Link to="/register">Sign Up Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
              <Link to="/casino/main">Explore Games</Link>
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { number: "500+", label: "Games" },
              { number: "$5M+", label: "Monthly Payouts" },
              { number: "24/7", label: "Support" },
              { number: "100%", label: "Secure" },
            ].map((stat, index) => (
              <div key={index} className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

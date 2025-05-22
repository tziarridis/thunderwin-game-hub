
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
// import FeaturedGames from '@/components/marketing/FeaturedGames'; // Commented out due to unfixable error in this file
// Using the available FeaturedGames from casino
import CasinoFeaturedGames from '@/components/casino/FeaturedGames';

const Index = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-10">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold mb-6 text-white">Welcome to <span className="text-green-500">Thunder Casino</span></h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the ultimate online gaming with hundreds of games, secure transactions, and exciting rewards.
          </p>
        </div>

        {/* Featured Games section */}
        <CasinoFeaturedGames 
          title="Featured Games"
          count={12}
          showViewAllButton={true}
          viewAllLink="/casino/main?filter=featured"
        />

        <div className="py-10 text-center">
          <div className="space-x-4 mt-8">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link to="/casino/main">Explore Games</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/register">Sign Up Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

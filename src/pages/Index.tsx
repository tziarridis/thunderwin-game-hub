
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import CasinoFeaturedGames from '@/components/casino/FeaturedGames'; // Using the available FeaturedGames from casino

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Consider adding a dedicated HeroSection component */}
      <section className="py-20 text-center bg-gradient-to-br from-casino-secondary via-casino-thunder-dark to-black">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
            Welcome to <span className="text-casino-thunder-green">Thunder Casino</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Experience the ultimate online gaming thrill with hundreds of top-tier games, secure transactions, and electrifying rewards.
          </p>
          <div className="space-x-0 sm:space-x-4 space-y-4 sm:space-y-0">
            <Button asChild size="lg" className="bg-casino-thunder-green hover:bg-casino-thunder-green/90 text-white w-full sm:w-auto">
              <Link to="/casino/main">Explore Games</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-white border-casino-thunder-green hover:bg-casino-thunder-green/10 hover:text-casino-thunder-green w-full sm:w-auto">
              <Link to="/register">Sign Up Now</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-10">
        {/* Featured Games section */}
        <CasinoFeaturedGames 
          title="Featured Games"
          count={12} // Number of games to show
          showViewAllButton={true} // Show the "View All" button
          viewAllLink="/casino/main?filter=featured" // Link for the "View All" button
        />

        {/* Call to Action / Other sections can go here */}
        {/* Example: How it Works Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Why Choose Us?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-card p-6 rounded-lg shadow-xl hover:shadow-casino-thunder-green/20 transition-shadow">
              <h3 className="text-xl font-semibold mb-2 text-casino-thunder-green">Vast Game Selection</h3>
              <p className="text-muted-foreground">Hundreds of slots, table games, and live casino options.</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-xl hover:shadow-casino-thunder-green/20 transition-shadow">
              <h3 className="text-xl font-semibold mb-2 text-casino-thunder-green">Secure & Fair</h3>
              <p className="text-muted-foreground">State-of-the-art security and provably fair gaming.</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-xl hover:shadow-casino-thunder-green/20 transition-shadow">
              <h3 className="text-xl font-semibold mb-2 text-casino-thunder-green">Exciting Bonuses</h3>
              <p className="text-muted-foreground">Generous welcome offers and regular promotions.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;


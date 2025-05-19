
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FeaturedGames from '@/components/marketing/FeaturedGames';

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to Casino Hub</h1>
        <p className="text-xl text-muted-foreground mb-8">Your destination for the best online casino games</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/casino">Browse Casino</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/casino/slots">Play Slots</Link>
          </Button>
        </div>
      </div>

      <FeaturedGames title="Featured Games" tag="featured" count={6} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-xl font-semibold mb-3">New Games</h3>
          <p className="text-muted-foreground mb-4">Discover our latest additions to the game library.</p>
          <Button asChild variant="secondary" className="w-full">
            <Link to="/casino/new-games">Explore New Games</Link>
          </Button>
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-xl font-semibold mb-3">Game Providers</h3>
          <p className="text-muted-foreground mb-4">Browse games from your favorite providers.</p>
          <Button asChild variant="secondary" className="w-full">
            <Link to="/casino/providers">View Providers</Link>
          </Button>
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-xl font-semibold mb-3">Promotions</h3>
          <p className="text-muted-foreground mb-4">Check out our latest bonuses and special offers.</p>
          <Button asChild variant="secondary" className="w-full">
            <Link to="/promotions">View Promotions</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;

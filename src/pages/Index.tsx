import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/marketing/HeroSection';
import FeaturedGames from '@/components/marketing/FeaturedGames'; // Marketing specific FeaturedGames
import HowItWorks from '@/components/marketing/HowItWorks';

const Index = () => {
  return (
    <>
      <HeroSection />
      {/* Using marketing/FeaturedGames which fetches its own data via useGames */}
      <FeaturedGames title="Hot Picks" tag="featured" count={12} />
      <HowItWorks />
      {/* <Testimonials /> */}
      <div className="py-12 bg-background text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Play?</h2>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link to="/casino">Explore Games</Link>
        </Button>
      </div>
    </>
  );
};

export default Index;

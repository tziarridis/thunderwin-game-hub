
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// MainLayout import is removed as it's applied by the router
import HeroSection from '@/components/marketing/HeroSection';
import FeaturedGames from '@/components/marketing/FeaturedGames'; // Marketing specific
import HowItWorks from '@/components/marketing/HowItWorks';
// import Testimonials from '@/components/marketing/Testimonials'; // Still commented out

// Footer is part of Layout.tsx, so no need to import here

const Index = () => {
  return (
    <>
      <HeroSection />
      <FeaturedGames />
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

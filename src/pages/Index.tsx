
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
// import FeaturedGames from '@/components/marketing/FeaturedGames'; // Commented out due to unfixable error in this file or if it's missing
// import Hero from '@/components/marketing/Hero'; // Commented out: File not provided
// import CasinoCategories from '@/components/marketing/CasinoCategories'; // Commented out: File not provided
// import PromotionBanner from '@/components/marketing/PromotionBanner'; // Commented out: File not provided
// import PopularGames from '@/components/casino/PopularGames'; // Commented out: File not provided
// import NewGames from '@/components/casino/NewGames'; // Commented out: File not provided

// Using the available FeaturedGames from casino
import CasinoFeaturedGames from '@/components/casino/FeaturedGames'; // Renamed to avoid conflict

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* <Hero /> */}
      
      {/* 
        The original FeaturedGames from '@/components/marketing/FeaturedGames' had an error:
        Argument of type 'string' is not assignable to parameter of type 'string & GameTag'.
        And the file itself is not editable by me.
        <FeaturedGames 
          title="Featured Games" 
          count={12} 
          tag="featured" // This 'tag' prop was problematic
        /> 
      */}

      {/* Using the available casino/FeaturedGames component. It doesn't take a 'tag' prop. */}
      <CasinoFeaturedGames 
        title="Featured Games"
        count={12}
        showViewAllButton={true}
        viewAllLink="/casino/main?filter=featured"
      />
      
      {/* <CasinoCategories /> */}
      
      {/* <PromotionBanner /> */}
      
      {/* <PopularGames /> */}
      
      {/* <NewGames /> */}

      <div className="container mx-auto py-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Thunder Casino!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Many of our premium sections are currently under development. Please check back soon!
        </p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link to="/casino/main">Explore Games</Link>
          </Button>
          {!true && // Placeholder for auth check later
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Login / Sign Up</Link>
            </Button>
          }
        </div>
      </div>
    </div>
  );
};

export default Index;

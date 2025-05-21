
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import FeaturedGames from '@/components/marketing/FeaturedGames';
import Hero from '@/components/marketing/Hero';
import CasinoCategories from '@/components/marketing/CasinoCategories';
import PromotionBanner from '@/components/marketing/PromotionBanner';
import PopularGames from '@/components/casino/PopularGames';
import NewGames from '@/components/casino/NewGames';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      
      <FeaturedGames 
        title="Featured Games" 
        count={12} 
        tag="featured" 
      />
      
      <CasinoCategories />
      
      <PromotionBanner />
      
      <PopularGames />
      
      <NewGames />
    </div>
  );
};

export default Index;

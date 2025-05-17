
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/Layout'; // Corrected path, assuming Layout.tsx is MainLayout
import HeroSection from '@/components/marketing/HeroSection'; // Assuming this exists or will be created
import FeaturedGames from '@/components/marketing/FeaturedGames'; // Assuming this exists or will be created
import HowItWorks from '@/components/marketing/HowItWorks'; // Assuming this exists or will be created
// import Testimonials from '@/components/marketing/Testimonials'; // Commented out
import Footer from '@/components/layout/Footer'; // Assuming this exists

const Index = () => {
  return (
    <MainLayout> 
      <>
        {/* These components need to exist at the specified paths */}
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
        {/* Footer might be part of MainLayout, or standalone */}
        {/* <Footer /> */} 
      </>
    </MainLayout>
  );
};

export default Index;

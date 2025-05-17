
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout'; // Assuming MainLayout is correctly defined
import HeroSection from '@/components/marketing/HeroSection';
import FeaturedGames from '@/components/marketing/FeaturedGames';
import HowItWorks from '@/components/marketing/HowItWorks';
import Testimonials from '@/components/marketing/Testimonials';
import Footer from '@/components/layout/Footer';

const Index = () => {
  return (
    // If MainLayout is a functional component expecting children, this should be fine.
    // The error TS2559 usually means the props passed don't match what the component expects.
    // If MainLayout is a class component, it needs to be 'React.Component<{}>' or similar that includes 'children'.
    // For a functional component: const MainLayout = ({ children }: { children: React.ReactNode }) => { ... }
    <MainLayout> 
      <>
        <HeroSection />
        <FeaturedGames />
        <HowItWorks />
        {/* <Testimonials /> */}
        {/* Removed Testimonials as it might not be implemented yet or causing issues */}
        <div className="py-12 bg-background text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Play?</h2>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/casino">Explore Games</Link>
          </Button>
        </div>
      </>
    </MainLayout>
  );
};

export default Index;

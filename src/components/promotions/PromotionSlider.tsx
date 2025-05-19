
import React from 'react';
import { Promotion } from '@/types'; // Using the new Promotion type
import PromotionCard from './PromotionCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay"; // Ensure this is installed

interface PromotionSliderProps {
  promotions: Promotion[];
  className?: string;
  autoplayDelay?: number;
}

const PromotionSlider: React.FC<PromotionSliderProps> = ({ promotions, className, autoplayDelay = 5000 }) => {
  if (!promotions || promotions.length === 0) {
    return (
      <div className={`py-8 text-center ${className}`}>
        <p className="text-muted-foreground">No promotions available at the moment.</p>
      </div>
    );
  }

  return (
    <div className={`py-8 ${className}`}>
      <Carousel
        opts={{
          align: "start",
          loop: promotions.length > 1,
        }}
        plugins={promotions.length > 1 ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: true })] : []}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {promotions.map((promo, index) => (
            <CarouselItem key={promo.id || index} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <div className="p-1 h-full">
                <PromotionCard promotion={promo} className="h-full flex flex-col" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {promotions.length > 1 && (
            <>
                <CarouselPrevious className="absolute left-[-10px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                <CarouselNext className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
            </>
        )}
      </Carousel>
    </div>
  );
};

export default PromotionSlider;


import React from 'react';
import { Promotion } from '@/types'; // Import the Promotion type
import PromotionCard from './PromotionCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface PromotionSliderProps {
  promotions: Promotion[];
  title?: string;
}

const PromotionSlider: React.FC<PromotionSliderProps> = ({ promotions, title = "Latest Promotions" }) => {
  if (!promotions || promotions.length === 0) {
    return null; // Or a message indicating no promotions
  }

  return (
    <section className="py-8 md:py-12 bg-muted/30">
      <div className="container mx-auto">
        {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
        <Carousel
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: true,
            }),
          ]}
          opts={{
            align: "start",
            loop: promotions.length > 1,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {promotions.map((promo, index) => (
              <CarouselItem key={promo.id || index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                    <PromotionCard promotion={promo} className="h-full"/>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {promotions.length > 1 && ( // Show controls only if multiple items
            <>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
};

export default PromotionSlider;

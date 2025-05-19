
import React from 'react';
import { Promotion } from '@/types'; // Corrected import
import PromotionCard from './PromotionCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";

interface PromotionSliderProps {
  promotions: Promotion[];
  title?: string;
  itemsToShow?: number; // For large screens
  itemsToScroll?: number;
}

const PromotionSlider: React.FC<PromotionSliderProps> = ({ 
  promotions, 
  title, 
  itemsToShow = 3, 
  itemsToScroll = 1 
}) => {
  if (!promotions || promotions.length === 0) {
    return null; // Or a message like "No active promotions"
  }

  return (
    <div className="py-8">
      {title && <h2 className="text-3xl font-bold mb-6 text-center text-white">{title}</h2>}
      <Carousel
        opts={{
          align: "start",
          loop: promotions.length > itemsToShow, // Loop only if there are enough items
          slidesToScroll: itemsToScroll,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {promotions.map((promo, index) => (
            <CarouselItem 
              key={promo.id || index} 
              // Adjust basis for different screen sizes for responsiveness
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5" 
            >
              <PromotionCard promotion={promo} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {promotions.length > 1 && ( // Show controls only if more than one item
          <>
            <CarouselPrevious className="absolute left-[-15px] top-1/2 -translate-y-1/2 hidden sm:flex disabled:opacity-30" />
            <CarouselNext className="absolute right-[-15px] top-1/2 -translate-y-1/2 hidden sm:flex disabled:opacity-30" />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default PromotionSlider;


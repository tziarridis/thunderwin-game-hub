import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react'; // Swiper
import { Autoplay, Pagination, Navigation } from 'swiper/modules'; // Swiper modules
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Promotion } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PromotionSliderProps {
  promotions: Promotion[];
}

const PromotionSlider: React.FC<PromotionSliderProps> = ({ promotions }) => {
  if (!promotions || promotions.length === 0) {
    return (
      <Card className="bg-muted flex items-center justify-center h-64">
        <CardContent>
          <p className="text-muted-foreground">No promotions available right now.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted">
      <CardContent className="p-0">
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper rounded-lg" // Added rounded-lg for consistency
        >
          {promotions.map((promotion) => (
            <SwiperSlide key={promotion.id}>
              <div className="relative h-64 md:h-80 lg:h-96"> {/* Responsive height */}
                {promotion.imageUrl ? (
                  <img
                    src={promotion.imageUrl}
                    alt={promotion.title}
                    className="w-full h-full object-cover" // Ensure image covers the slide
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                     {/* Placeholder if no image */}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40"></div> {/* Gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                  <h3 className="text-lg md:text-xl font-semibold mb-1">{promotion.title}</h3>
                  <p className="text-sm md:text-base line-clamp-2 mb-2">{promotion.description}</p>
                  <Button size="sm" className="mt-2 bg-casino-thunder-gold hover:bg-casino-thunder-gold/90 text-black">Learn More</Button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </CardContent>
    </Card>
  );
};

export default PromotionSlider;

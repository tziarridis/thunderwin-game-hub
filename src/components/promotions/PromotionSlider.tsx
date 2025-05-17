import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
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
          className="mySwiper"
        >
          {promotions.map((promotion) => (
            <SwiperSlide key={promotion.id}>
              <div className="relative">
                {promotion.imageUrl && (
                  <img
                    src={promotion.imageUrl}
                    alt={promotion.title}
                    className="w-full h-64 object-cover rounded-md"
                  />
                )}
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="text-lg font-semibold">{promotion.title}</h3>
                  <p className="text-sm">{promotion.description}</p>
                  <Button className="mt-2">Learn More</Button>
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

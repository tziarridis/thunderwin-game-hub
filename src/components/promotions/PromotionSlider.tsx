
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PromotionCard from "./PromotionCard";

const PromotionSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const promotions = [
    {
      id: 1,
      title: "Welcome Bonus",
      description: "Get a 100% match up to $1,000 + 50 free spins on your first deposit.",
      image: "https://images.unsplash.com/photo-1596731490442-1533cf2a1f18?auto=format&fit=crop&q=80&w=800",
      endDate: "Ongoing"
    },
    {
      id: 2,
      title: "Thunder Thursday",
      description: "Every Thursday, get 50 free spins when you deposit $50 or more.",
      image: "https://images.unsplash.com/photo-1587302273406-7104978770d2?auto=format&fit=crop&q=80&w=800",
      endDate: "Every Thursday"
    },
    {
      id: 3,
      title: "Weekend Reload",
      description: "Reload your account during weekends and get a 75% bonus up to $500.",
      image: "https://images.unsplash.com/photo-1593183630166-2b4c86293796?auto=format&fit=crop&q=80&w=800",
      endDate: "Every Weekend"
    }
  ];
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? promotions.length - 1 : prev - 1));
  };
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === promotions.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative overflow-hidden py-8">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {promotions.map((promo) => (
          <div key={promo.id} className="w-full flex-shrink-0 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-casino-thunder-gray to-black/40 rounded-xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2">
                    <img 
                      src={promo.image} 
                      alt={promo.title}
                      className="w-full h-60 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{promo.title}</h2>
                    <p className="text-white/80 mb-6">{promo.description}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                        Claim Now
                      </Button>
                      <Button variant="outline">
                        Terms & Conditions
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Arrows */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      
      {/* Indicators */}
      <div className="flex justify-center mt-4 gap-2">
        {promotions.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              currentSlide === index ? "bg-casino-thunder-green" : "bg-white/30"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default PromotionSlider;

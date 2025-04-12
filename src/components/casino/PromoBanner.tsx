
import React from "react";
import { Button } from "@/components/ui/button";
import { Gift, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface PromoBannerProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

const PromoBanner = ({
  title,
  description,
  buttonText,
  onButtonClick
}: PromoBannerProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isAuthenticated) {
      // Redirect to register page if user is not authenticated
      navigate('/register');
      return;
    }
    
    // Call the original onClick handler if user is authenticated
    onButtonClick();
  };

  return (
    <div className="thunder-card relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-transparent z-10"></div>
      
      <div className="relative z-20 flex flex-col md:flex-row items-center p-6 md:p-8">
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="h-6 w-6 text-casino-thunder-green" />
            <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
          </div>
          <p className="text-white/80 mb-6 md:mb-0 max-w-xl">{description}</p>
        </div>
        
        <div className="flex-shrink-0">
          <Button
            className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black font-semibold px-6"
            onClick={handleClick}
          >
            {!isAuthenticated ? (
              <>
                <UserPlus className="h-5 w-5 mr-2" />
                Join Now
              </>
            ) : (
              buttonText
            )}
          </Button>
        </div>
      </div>
      
      <div className="absolute -bottom-8 -right-8 w-32 h-32 md:w-48 md:h-48 opacity-20 z-0">
        <div className="w-full h-full border-4 border-casino-thunder-green rounded-full"></div>
      </div>
    </div>
  );
};

export default PromoBanner;

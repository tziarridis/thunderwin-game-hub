
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash, Power, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Promotion } from "@/types";

interface PromotionCardProps {
  title?: string;
  description?: string;
  image?: string;
  endDate?: string;
  className?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
  isAdmin?: boolean;
  promotion?: Promotion;
}

const PromotionCard = ({ 
  title, 
  description, 
  image, 
  endDate,
  className,
  onClick,
  onEdit,
  onDelete,
  onToggleActive,
  isAdmin = false,
  promotion
}: PromotionCardProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If a promotion object is provided, use its properties
  // Otherwise use the individual props
  const displayTitle = promotion?.title || title || '';
  const displayDescription = promotion?.description || description || '';
  const displayImage = promotion?.image || image || '';
  const displayEndDate = promotion?.endDate || endDate;

  const handleActionClick = () => {
    if (!isAuthenticated) {
      // Redirect to register page if user is not authenticated
      navigate('/register');
      return;
    }
    
    // Call the original onClick handler if user is authenticated
    if (onClick) {
      onClick();
    } else {
      // Default to navigating to promotions page if no onClick provided
      navigate('/bonuses');
    }
  };

  const handleViewDetails = () => {
    if (onClick) {
      onClick();
    } else {
      // Default to navigating to promotions page if no onClick provided
      navigate('/promotions');
    }
  };

  return (
    <div className={cn("thunder-card overflow-hidden", className)}>
      <div className="h-48 overflow-hidden">
        <img 
          src={displayImage} 
          alt={displayTitle}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2">{displayTitle}</h3>
        
        {displayEndDate && (
          <div className="flex items-center text-white/60 text-sm mb-3">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Ends: {displayEndDate}</span>
          </div>
        )}
        
        <p className="text-white/70 text-sm mb-4">{displayDescription}</p>
        
        <div className="flex justify-between items-center">
          {isAdmin ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="text-white hover:text-casino-thunder-green"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleActive}
                >
                  <Power className="h-4 w-4 mr-2" />
                  Toggle
                </Button>
                
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={onDelete}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button 
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                size="sm"
                onClick={handleActionClick}
              >
                {!isAuthenticated ? (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Now
                  </>
                ) : (
                  <>Claim Now</>
                )}
              </Button>
              
              <Button 
                variant="link" 
                className="text-white/70 hover:text-casino-thunder-green"
                size="sm"
                onClick={handleViewDetails}
              >
                View Details
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionCard;

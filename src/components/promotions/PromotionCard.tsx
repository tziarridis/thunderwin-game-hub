
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash } from "lucide-react";

interface PromotionCardProps {
  title: string;
  description: string;
  image: string;
  endDate?: string;
  className?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
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
  isAdmin = false
}: PromotionCardProps) => {
  return (
    <div className={cn("thunder-card overflow-hidden", className)}>
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        
        {endDate && (
          <div className="flex items-center text-white/60 text-sm mb-3">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Ends: {endDate}</span>
          </div>
        )}
        
        <p className="text-white/70 text-sm mb-4">{description}</p>
        
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
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={onDelete}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button 
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                size="sm"
                onClick={onClick}
              >
                Claim Now
              </Button>
              
              <Button 
                variant="link" 
                className="text-white/70 hover:text-casino-thunder-green"
                size="sm"
                onClick={onClick}
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

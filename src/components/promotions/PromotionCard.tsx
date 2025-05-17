
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash2, ToggleLeft, ToggleRight, Award } from 'lucide-react'; // Added Award icon
import { format } from 'date-fns';
import { Promotion } from '@/types';

interface PromotionCardProps {
  promotion: Promotion;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void; // isActive passed to handler
  isAdmin?: boolean;
  onClaim?: (promotionId: string) => void; // Added for user claim
}

const PromotionCard: React.FC<PromotionCardProps> = ({ 
  promotion, 
  onEdit, 
  onDelete, 
  onToggleActive, 
  isAdmin,
  onClaim
}) => {
  const startDateFormatted = promotion.startDate ? format(new Date(promotion.startDate), 'MMM dd, yyyy') : 'N/A';
  const endDateFormatted = promotion.endDate ? format(new Date(promotion.endDate), 'MMM dd, yyyy') : 'N/A';

  // Determine status text and color based on isActive and potentially dates
  let statusText = promotion.isActive ? 'Active' : 'Inactive';
  let statusColor = promotion.isActive ? 'text-green-500' : 'text-red-500';
  const now = new Date();
  if (promotion.endDate && new Date(promotion.endDate) < now && promotion.isActive) {
    statusText = 'Expired';
    statusColor = 'text-yellow-500';
  } else if (promotion.startDate && new Date(promotion.startDate) > now && promotion.isActive) {
    statusText = 'Upcoming';
    statusColor = 'text-blue-500';
  }


  return (
    <Card className="bg-card text-card-foreground shadow-lg hover:shadow-casino-neon-green/20 transition-shadow duration-300 flex flex-col justify-between border border-border/20 rounded-lg overflow-hidden">
      <div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-casino-gold">{promotion.title}</CardTitle>
          {promotion.description && <CardDescription className="text-sm text-muted-foreground mt-1 line-clamp-2">{promotion.description}</CardDescription>}
        </CardHeader>
        <CardContent className="pt-2 pb-4 space-y-2">
          {promotion.imageUrl && (
            <img
              src={promotion.imageUrl}
              alt={promotion.title}
              className="w-full h-40 object-cover rounded-md mb-3 border border-border/10"
            />
          )}
          <p className="text-xs text-muted-foreground flex items-center">
            <Award className="mr-2 h-3.5 w-3.5 text-casino-neon-green" />
            Type: <span className="font-medium ml-1 text-foreground">{promotion.promotionType}</span>
          </p>
          {promotion.bonusPercentage && (
            <p className="text-xs text-muted-foreground">
              Bonus: <span className="font-medium ml-1 text-foreground">{promotion.bonusPercentage}%</span>
            </p>
          )}
          {promotion.maxBonusAmount && (
            <p className="text-xs text-muted-foreground">
              Max Bonus: <span className="font-medium ml-1 text-foreground">${promotion.maxBonusAmount}</span>
            </p>
          )}
          {promotion.wageringRequirement && (
            <p className="text-xs text-muted-foreground">
              Wagering: <span className="font-medium ml-1 text-foreground">{promotion.wageringRequirement}x</span>
            </p>
          )}
          <div className="flex items-center text-xs text-muted-foreground pt-1">
            <Calendar className="mr-2 h-3.5 w-3.5 text-casino-neon-green" />
            <span>Valid: {startDateFormatted} - {endDateFormatted}</span>
          </div>
           <p className={`text-xs mt-1 font-medium ${statusColor}`}>
            Status: {statusText}
          </p>
        </CardContent>
      </div>
      <CardFooter className="flex justify-between items-center bg-muted/30 p-3 border-t border-border/20">
        {!isAdmin && (
          <Button 
            size="sm" 
            className="bg-casino-neon-green text-casino-black hover:bg-casino-neon-green/90 w-full"
            onClick={() => onClaim && promotion.id && onClaim(promotion.id)}
            disabled={!promotion.isActive || statusText !== 'Active'} // Disable if not active or not currently valid
          >
            Claim Now
          </Button>
        )}
        {isAdmin && (
          <div className="flex space-x-2 w-full">
            {onEdit && promotion.id && (
              <Button variant="outline" size="xs" onClick={() => onEdit(promotion.id)}>
                <Edit className="mr-1 h-3.5 w-3.5" /> Edit
              </Button>
            )}
            {onToggleActive && promotion.id && (
              <Button 
                variant="outline" 
                size="xs" 
                onClick={() => onToggleActive(promotion.id, !promotion.isActive)}
                className={promotion.isActive ? "hover:bg-red-500/10 hover:text-red-500" : "hover:bg-green-500/10 hover:text-green-500"}
              >
                {promotion.isActive ? <ToggleRight className="mr-1 h-3.5 w-3.5 text-green-500" /> : <ToggleLeft className="mr-1 h-3.5 w-3.5 text-red-500" />}
                {promotion.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            )}
            {onDelete && promotion.id && (
              <Button variant="destructive" size="xs" onClick={() => onDelete(promotion.id)}>
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PromotionCard;

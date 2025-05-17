
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'; // Added icons
import { format } from 'date-fns';
import { Promotion } from '@/types';

interface PromotionCardProps {
  promotion: Promotion;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string) => void;
  isAdmin?: boolean;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, onEdit, onDelete, onToggleActive, isAdmin }) => {
  const startDateFormatted = promotion.startDate ? format(new Date(promotion.startDate), 'MMM dd, yyyy') : 'N/A';
  const endDateFormatted = promotion.endDate ? format(new Date(promotion.endDate), 'MMM dd, yyyy') : 'N/A';

  return (
    <Card className="bg-card text-card-foreground shadow-md flex flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle>{promotion.title}</CardTitle>
          <CardDescription>{promotion.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {promotion.imageUrl && (
            <img
              src={promotion.imageUrl}
              alt={promotion.title}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
          )}
          <p className="text-sm text-muted-foreground">
            Type: {promotion.promotionType}
          </p>
          {promotion.bonusPercentage && (
            <p className="text-sm text-muted-foreground">
              Bonus: {promotion.bonusPercentage}%
            </p>
          )}
          {promotion.maxBonusAmount && (
            <p className="text-sm text-muted-foreground">
              Max Bonus: ${promotion.maxBonusAmount}
            </p>
          )}
          {promotion.wageringRequirement && (
            <p className="text-sm text-muted-foreground">
              Wagering Requirement: {promotion.wageringRequirement}x
            </p>
          )}
          <div className="flex items-center mt-2">
            <Calendar className="mr-2 h-4 w-4" />
            <p className="text-sm text-muted-foreground">
              Valid: {startDateFormatted} - {endDateFormatted}
            </p>
          </div>
           <p className={`text-sm mt-1 ${promotion.isActive ? 'text-green-500' : 'text-red-500'}`}>
            Status: {promotion.status} ({promotion.isActive ? 'Active' : 'Inactive'})
          </p>
        </CardContent>
      </div>
      <CardFooter className="flex justify-between items-center">
        {!isAdmin && <Button>Claim Now</Button>}
        {isAdmin && (
          <div className="flex space-x-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(promotion.id)}>
                <Edit className="mr-1 h-4 w-4" /> Edit
              </Button>
            )}
            {onToggleActive && (
              <Button variant="outline" size="sm" onClick={() => onToggleActive(promotion.id)}>
                {promotion.isActive ? <ToggleRight className="mr-1 h-4 w-4 text-green-500" /> : <ToggleLeft className="mr-1 h-4 w-4 text-red-500" />}
                {promotion.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={() => onDelete(promotion.id)}>
                <Trash2 className="mr-1 h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PromotionCard;


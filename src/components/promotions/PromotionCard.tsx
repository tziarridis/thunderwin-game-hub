import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Promotion } from '@/types';

interface PromotionCardProps {
  promotion: Promotion;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion }) => {
  const startDateFormatted = promotion.startDate ? format(new Date(promotion.startDate), 'MMM dd, yyyy') : 'N/A';
  const endDateFormatted = promotion.endDate ? format(new Date(promotion.endDate), 'MMM dd, yyyy') : 'N/A';

  return (
    <Card className="bg-card text-card-foreground shadow-md">
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
          Type: {promotion.type}
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
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button>Claim Now</Button>
      </CardFooter>
    </Card>
  );
};

export default PromotionCard;

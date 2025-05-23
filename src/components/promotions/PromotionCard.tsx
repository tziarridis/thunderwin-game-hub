
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Promotion } from '@/types';

interface PromotionCardProps {
  promotion: Promotion;
  onClaim?: () => void;
  onDetails?: (promotion: Promotion) => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  onClaim,
  onDetails
}) => {
  const isExpired = new Date(promotion.valid_until) < new Date();
  const isUpcoming = new Date(promotion.valid_from) > new Date();

  return (
    <Card className="overflow-hidden">
      {promotion.image_url && (
        <div className="h-48 bg-gray-200">
          <img 
            src={promotion.image_url} 
            alt={promotion.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{promotion.title}</CardTitle>
          <Badge variant={isExpired ? "destructive" : isUpcoming ? "secondary" : "default"}>
            {isExpired ? "Expired" : isUpcoming ? "Upcoming" : "Active"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{promotion.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Valid Until:</span>
            <span>{new Date(promotion.valid_until).toLocaleDateString()}</span>
          </div>
          {promotion.code && (
            <div className="flex justify-between">
              <span>Code:</span>
              <Badge variant="outline">{promotion.code}</Badge>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          {onClaim && !isExpired && !isUpcoming && (
            <Button onClick={onClaim} className="flex-1">
              {promotion.cta_text}
            </Button>
          )}
          {onDetails && (
            <Button variant="outline" onClick={() => onDetails(promotion)}>
              Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromotionCard;

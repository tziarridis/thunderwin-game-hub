
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {promotion.title}
          <Badge variant="default">{promotion.type}</Badge>
        </CardTitle>
        <CardDescription>{promotion.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-2 mb-4">
          {promotion.code && (
            <p className="text-sm font-mono bg-muted p-2 rounded">
              Code: {promotion.code}
            </p>
          )}
          {promotion.bonus_percentage && (
            <p className="text-sm">Bonus: {promotion.bonus_percentage}%</p>
          )}
          {promotion.free_spins_count && (
            <p className="text-sm">Free Spins: {promotion.free_spins_count}</p>
          )}
          {promotion.min_deposit && (
            <p className="text-sm">Min Deposit: ${promotion.min_deposit}</p>
          )}
        </div>
        <div className="flex gap-2">
          {onClaim && (
            <Button onClick={onClaim} className="flex-1">
              {promotion.cta_text || 'Claim'}
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

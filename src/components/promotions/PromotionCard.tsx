
import React from 'react';
import { Promotion } from '@/types'; // Corrected import
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Info } from 'lucide-react';

interface PromotionCardProps {
  promotion: Promotion;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (promotion.link) {
      // If it's an external link, open in new tab or navigate within app if it's an internal path
      if (promotion.link.startsWith('http')) {
        window.open(promotion.link, '_blank');
      } else {
        navigate(promotion.link);
      }
    } else {
      // Fallback or navigate to a generic promotion details page
      navigate(`/promotions/${promotion.id}`);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
      {promotion.imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden">
            <img 
                src={promotion.imageUrl} 
                alt={promotion.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {promotion.type && (
                <Badge variant="secondary" className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-xs">
                    {promotion.type.toUpperCase()}
                </Badge>
            )}
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg leading-tight">{promotion.title}</CardTitle>
        {promotion.description && <CardDescription className="text-xs line-clamp-2 mt-1">{promotion.description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow space-y-2 py-2">
        {(promotion.startDate || promotion.endDate) && (
          <div className="text-xs text-muted-foreground flex items-center">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            {promotion.startDate ? new Date(promotion.startDate).toLocaleDateString() : 'Ongoing'}
            {promotion.endDate && ` - ${new Date(promotion.endDate).toLocaleDateString()}`}
          </div>
        )}
        {promotion.minDeposit && (
            <p className="text-xs text-muted-foreground">Min. Deposit: ${promotion.minDeposit}</p>
        )}
         {promotion.wageringRequirement && (
            <p className="text-xs text-muted-foreground">Wagering: {promotion.wageringRequirement}x</p>
        )}
      </CardContent>
      <CardFooter className="pt-3">
        <Button onClick={handleViewDetails} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
          <Info className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PromotionCard;


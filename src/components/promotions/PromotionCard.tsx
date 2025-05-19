
import React from 'react';
import { Promotion } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromotionCardProps {
  promotion: Promotion;
  className?: string;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, className }) => {
  const getStatusBadgeVariant = (status?: 'active' | 'expired' | 'upcoming') => {
    switch (status) {
      case 'active': return 'default'; // Greenish or primary
      case 'upcoming': return 'secondary'; // Bluish or yellowish
      case 'expired': return 'outline'; // Greyish
      default: return 'outline';
    }
  };

  // Example: Consider a promotion "new" if it's active and started recently (e.g., last 7 days)
  // This logic would require start_date to be a Date object or parsed.
  // For now, we'll just use the status from the promotion object.
  const isActive = promotion.status === 'active';

  return (
    <Card className={cn("flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300", className)}>
      {promotion.imageUrl && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={promotion.imageUrl} 
            alt={promotion.title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold leading-tight">{promotion.title}</CardTitle>
          {promotion.status && (
            <Badge variant={getStatusBadgeVariant(promotion.status)} className="ml-2 shrink-0">
              {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{promotion.description}</p>
      </CardContent>
      <CardFooter className="pt-2">
        {promotion.link && isActive && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full group"
            onClick={() => window.open(promotion.link, '_blank')}
          >
            Learn More 
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
        {!isActive && promotion.status === 'expired' && (
            <p className="text-sm text-destructive/80 w-full text-center">This promotion has expired.</p>
        )}
         {!isActive && promotion.status === 'upcoming' && (
            <p className="text-sm text-blue-500/80 w-full text-center">Coming soon!</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default PromotionCard;

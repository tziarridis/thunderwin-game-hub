
import React from 'react';
import { Promotion } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Info, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface PromotionCardProps {
  promotion: Promotion;
  onViewDetails?: (promotion: Promotion) => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, onViewDetails }) => {
  const navigate = useNavigate();

  const handleCardAction = () => {
    if (onViewDetails) {
      onViewDetails(promotion);
    } else if (promotion.terms_and_conditions_url) {
      if (promotion.terms_and_conditions_url.startsWith('http')) {
        window.open(promotion.terms_and_conditions_url, '_blank');
      } else {
        navigate(promotion.terms_and_conditions_url);
      }
    } else {
      // Default to a promotion detail page
      navigate(`/promotions/${promotion.id}`);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-primary/20 transition-shadow duration-300 bg-card border-border group">
      {promotion.image_url && (
        <div className="relative aspect-[16/9] overflow-hidden">
            <img 
                src={promotion.image_url} 
                alt={promotion.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
            />
            {promotion.type && (
                <Badge variant="secondary" className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-xs px-2 py-1">
                    {promotion.type.replace(/_/g, ' ').toUpperCase()}
                </Badge>
            )}
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{promotion.title}</CardTitle>
        {promotion.description && <CardDescription className="text-xs line-clamp-2 mt-1 text-muted-foreground">{promotion.description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow space-y-2 py-2 text-sm">
        {(promotion.start_date || promotion.end_date) && (
          <div className="text-xs text-muted-foreground flex items-center">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span>
              {promotion.start_date && format(new Date(promotion.start_date), 'PP')}
              {promotion.end_date && promotion.end_date !== promotion.start_date ? ` - ${format(new Date(promotion.end_date), 'PP')}` : ''}
            </span>
          </div>
        )}
        {promotion.details?.min_deposit && (
            <p className="text-xs text-muted-foreground">Min. Deposit: {promotion.details?.min_deposit}</p>
        )}
        {promotion.details?.wagering_requirement && (
            <p className="text-xs text-muted-foreground">Wagering: {promotion.details?.wagering_requirement}x</p>
        )}
      </CardContent>
      <CardFooter className="pt-3">
        <Button onClick={handleCardAction} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
          {promotion.terms_and_conditions_url && promotion.terms_and_conditions_url.startsWith('http') ? <ExternalLink className="mr-2 h-4 w-4" /> : <Info className="mr-2 h-4 w-4" />}
          {promotion.target_audience ? 'View Details' : 'Learn More'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PromotionCard;

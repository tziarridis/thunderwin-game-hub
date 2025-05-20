
import React from 'react';
import { Promotion } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Info, ExternalLink } from 'lucide-react'; // Added ExternalLink

interface PromotionCardProps {
  promotion: Promotion;
  onViewDetails?: (promotion: Promotion) => void; // Optional callback for modal
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, onViewDetails }) => {
  const navigate = useNavigate();

  const handleCardAction = () => {
    if (onViewDetails) {
      onViewDetails(promotion);
    } else if (promotion.link) {
      if (promotion.link.startsWith('http')) {
        window.open(promotion.link, '_blank');
      } else {
        navigate(promotion.link);
      }
    } else {
      // Default to a promotion detail page if no link and no modal callback
      navigate(`/promotions/${promotion.id}`);
    }
  };

  const formatDate = (dateInput: string | Date | undefined | null) => {
    if (!dateInput) return 'Ongoing';
    try {
      return new Date(dateInput).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return String(dateInput); // Fallback if date is invalid
    }
  };


  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-primary/20 transition-shadow duration-300 bg-card border-border group">
      {promotion.imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden">
            <img 
                src={promotion.imageUrl} 
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
        {(promotion.validFrom || promotion.validUntil) && (
          <div className="text-xs text-muted-foreground flex items-center">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span>
              {formatDate(promotion.validFrom)}
              {promotion.validUntil && promotion.validUntil !== promotion.validFrom ? ` - ${formatDate(promotion.validUntil)}` : ''}
            </span>
          </div>
        )}
        {promotion.minDeposit && (
            <p className="text-xs text-muted-foreground">Min. Deposit: {promotion.currency || '$'}{promotion.minDeposit}</p>
        )}
         {promotion.wageringRequirement && (
            <p className="text-xs text-muted-foreground">Wagering: {promotion.wageringRequirement}x</p>
        )}
        {promotion.freeSpinsCount && (
             <p className="text-xs text-muted-foreground">Free Spins: {promotion.freeSpinsCount}</p>
        )}
        {promotion.bonusPercentage && (
             <p className="text-xs text-muted-foreground">Bonus: {promotion.bonusPercentage}% {promotion.maxBonusAmount ? `up to ${promotion.currency || '$'}${promotion.maxBonusAmount}` : ''}</p>
        )}
         {promotion.value && promotion.type === 'cashback' && (
             <p className="text-xs text-muted-foreground">Cashback: {promotion.value}%</p>
        )}
         {promotion.value && promotion.type === 'tournament_prize' && (
             <p className="text-xs text-muted-foreground">Prize Pool: {promotion.currency || '$'}{promotion.value}</p>
        )}
      </CardContent>
      <CardFooter className="pt-3">
        <Button onClick={handleCardAction} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
          {promotion.link && promotion.link.startsWith('http') ? <ExternalLink className="mr-2 h-4 w-4" /> : <Info className="mr-2 h-4 w-4" />}
          {promotion.ctaText || (onViewDetails ? 'View Details' : (promotion.link ? 'Learn More' : 'Details'))}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PromotionCard;


import React from 'react';
import { Promotion } from '@/types/promotion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Info, Percent, Gift, DollarSign, Tag } from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';

interface PromotionCardProps {
  promotion: Promotion;
  onClaim?: (promotion: Promotion) => void; // Optional: if there's a claim action
  onDetails?: (promotion: Promotion) => void; // Optional: for a details modal/page
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, onClaim, onDetails }) => {
  const {
    title,
    description,
    type,
    image_url,
    valid_from, // Use valid_from
    valid_until, // Use valid_until
    value,
    bonus_percentage,
    free_spins_count,
    min_deposit,
    max_bonus_amount,
    wagering_requirement,
    code,
    cta_text,
    terms_and_conditions_url,
  } = promotion;

  const Icon = 
    type === 'deposit_bonus' ? Percent :
    type === 'free_spins' ? Gift :
    type === 'cashback_offer' ? DollarSign : Info;

  const startDate = new Date(valid_from);
  const endDate = new Date(valid_until);
  
  const isExpired = isPast(endDate);
  const isUpcoming = isFuture(startDate);
  const isActiveNow = !isExpired && !isUpcoming;

  let statusBadge;
  if (isExpired) {
    statusBadge = <Badge variant="destructive" className="absolute top-2 right-2">Expired</Badge>;
  } else if (isUpcoming) {
    statusBadge = <Badge variant="outline" className="bg-blue-500 text-white absolute top-2 right-2">Upcoming</Badge>;
  } else if (isActiveNow) {
     statusBadge = <Badge variant="secondary" className="bg-green-500 text-white absolute top-2 right-2">Active</Badge>;
  }


  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-card">
      {image_url && (
        <div className="relative h-40 w-full">
          <img src={image_url} alt={title} className="object-cover w-full h-full" />
          {statusBadge}
        </div>
      )}
      <CardHeader className="pb-2 pt-4 px-4">
        {!image_url && statusBadge && <div className="relative h-0">{statusBadge}</div>}
        <CardTitle className="text-lg font-semibold line-clamp-2 flex items-center">
          <Icon className="mr-2 h-5 w-5 text-primary shrink-0" />
          {title}
        </CardTitle>
        {code && <Badge variant="outline" className="mt-1 w-fit"><Tag className="h-3 w-3 mr-1"/>Code: {code}</Badge>}
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground px-4 pb-3 flex-grow space-y-2">
        <p className="line-clamp-3">{description}</p>
        <div className="text-xs space-y-1 pt-1">
          <div className="flex items-center">
            <CalendarDays className="mr-1.5 h-3 w-3 text-primary" />
            <span>
              {isUpcoming ? `Starts: ${format(startDate, 'MMM dd, yyyy')}` : `Valid until: ${format(endDate, 'MMM dd, yyyy')}`}
            </span>
          </div>
          {value !== undefined && <p>Value: {value}{type === 'cashback_offer' ? '%' : ''}</p>}
          {bonus_percentage !== undefined && <p>Bonus: {bonus_percentage}% {max_bonus_amount ? `(up to $${max_bonus_amount})` : ''}</p>}
          {free_spins_count !== undefined && <p>Free Spins: {free_spins_count}</p>}
          {min_deposit !== undefined && <p>Min. Deposit: ${min_deposit}</p>}
          {wagering_requirement !== undefined && <p>Wagering: {wagering_requirement}x</p>}
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 bg-muted/30 flex flex-col sm:flex-row items-center gap-2">
        {onClaim && !isExpired && !isUpcoming && (
          <Button 
            onClick={() => onClaim(promotion)} 
            className="w-full sm:w-auto flex-grow"
            size="sm"
          >
            {cta_text || 'Claim Bonus'}
          </Button>
        )}
        {onDetails && (
          <Button 
            variant="outline" 
            onClick={() => onDetails(promotion)} 
            className="w-full sm:w-auto"
            size="sm"
          >
            Details
          </Button>
        )}
         {terms_and_conditions_url && (
          <a href={terms_and_conditions_url} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline text-muted-foreground text-center sm:text-left pt-1 sm:pt-0">
            Terms & Conditions
          </a>
        )}
      </CardFooter>
    </Card>
  );
};

export default PromotionCard;



import React from 'react';
import { Promotion, PromotionStatus, PromotionType } from '@/types/promotion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Tag, DollarSign, Percent, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface AdminPromotionCardProps {
  promotion: Promotion;
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotionId: string) => void;
  onView?: (promotion: Promotion) => void; // Optional view action
}

const statusColors: Record<PromotionStatus, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  expired: 'bg-red-500',
  upcoming: 'bg-blue-500',
  draft: 'bg-yellow-500 text-black',
};

const typeLabels: Record<PromotionType, string> = {
  deposit_bonus: 'Deposit Bonus',
  free_spins: 'Free Spins',
  cashback: 'Cashback',
  tournament: 'Tournament',
  other: 'Other',
};

const AdminPromotionCard: React.FC<AdminPromotionCardProps> = ({ promotion, onEdit, onDelete, onView }) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{promotion.title}</CardTitle>
          <Badge className={`${statusColors[promotion.status]} text-white hover:${statusColors[promotion.status]}`}>{promotion.status.toUpperCase()}</Badge>
        </div>
        <CardDescription className="flex items-center">
          <Tag className="h-4 w-4 mr-1 text-muted-foreground" /> {typeLabels[promotion.type]}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {promotion.image_url && (
          <img src={promotion.image_url} alt={promotion.title} className="rounded-md mb-3 max-h-40 w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'}/>
        )}
        <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{promotion.short_description || promotion.description}</p>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2" />
            <span>{format(new Date(promotion.start_date), 'PP')} - {format(new Date(promotion.end_date), 'PP')}</span>
          </div>
          {promotion.details?.min_deposit && (
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" /> Minimum Deposit: {promotion.details.min_deposit} {/* Assuming currency is implicit or global */}
            </div>
          )}
          {promotion.details?.wagering_requirement && (
            <div className="flex items-center">
              <Percent className="h-4 w-4 mr-2" /> Wagering: {promotion.details.wagering_requirement}x
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {onView && (
          <Button variant="outline" size="sm" onClick={() => onView(promotion)}>
            <Eye className="h-4 w-4 mr-1 sm:mr-0 md:mr-1" /> <span className="hidden md:inline">View</span>
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onEdit(promotion)}>
          <Edit className="h-4 w-4 mr-1 sm:mr-0 md:mr-1" /> <span className="hidden md:inline">Edit</span>
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(promotion.id)}>
          <Trash2 className="h-4 w-4 mr-1 sm:mr-0 md:mr-1" /> <span className="hidden md:inline">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminPromotionCard;

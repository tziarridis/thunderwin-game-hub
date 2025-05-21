
import React from 'react';
import { Promotion, PromotionStatus } from '@/types'; // PromotionStatus might be needed if not using isActive
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Edit2, Trash2, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminPromotionCardProps {
  promotion: Promotion;
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentStatus: PromotionStatus) => void; // Pass current status
}

const AdminPromotionCard: React.FC<AdminPromotionCardProps> = ({ promotion, onEdit, onDelete, onToggleActive }) => {
  const isActive = promotion.status === 'active'; // Determine active status from 'status'
  const cardStatusClass = isActive ? 'border-green-500' : 'border-red-500';
  const statusText = isActive ? 'Active' : (promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1));


  return (
    <Card className={cn("h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow", cardStatusClass)}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg leading-tight">{promotion.title}</CardTitle>
            <Badge variant={isActive ? 'default' : 'destructive'} className={isActive ? 'bg-green-500' : ''}>
                {statusText}
            </Badge>
        </div>
        <CardDescription className="text-xs capitalize">{promotion.type.replace(/_/g, ' ')} - {promotion.category.replace(/_/g, ' ')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {promotion.imageUrl && (
          <img 
            src={promotion.imageUrl} 
            alt={promotion.title} 
            className="w-full h-32 object-cover rounded-md mb-3" 
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{promotion.description}</p>
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center">
            <CalendarDays className="mr-2 h-3 w-3" /> 
            Valid: {new Date(promotion.validFrom).toLocaleDateString()} - {promotion.validUntil ? new Date(promotion.validUntil).toLocaleDateString() : 'Ongoing'}
          </p>
          {promotion.minDeposit && <p>Min. Deposit: {promotion.currency || '$'}{promotion.minDeposit}</p>}
          {promotion.wageringRequirement && <p>Wagering: {promotion.wageringRequirement}x</p>}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t">
        <Button variant="outline" size="sm" onClick={() => onEdit(promotion)} className="w-full sm:w-auto">
          <Edit2 className="mr-2 h-4 w-4" /> Edit
        </Button>
        <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="ghost" size="sm" onClick={() => onToggleActive(promotion.id, promotion.status)} className="flex-1">
            {isActive ? <ToggleRight className="mr-2 h-4 w-4 text-green-500" /> : <ToggleLeft className="mr-2 h-4 w-4 text-red-500" />}
            {isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="destructive" size="icon" onClick={() => onDelete(promotion.id)} title="Delete Promotion">
            <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AdminPromotionCard;

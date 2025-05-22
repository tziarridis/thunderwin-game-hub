
import React from 'react';
import { Promotion, PromotionType, PromotionStatus } from '@/types/promotion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit3, Trash2, Power, Info, Percent, Gift, DollarSign, CalendarDays, Tag, Users, CircleHelp } from 'lucide-react';
import { format } from 'date-fns';

interface AdminPromotionCardProps {
  promotion: Promotion;
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotionId: string) => void;
  onToggleActive?: (promotionId: string, isActive: boolean) => void; // Optional
}

const promotionTypeIcons: Record<PromotionType, React.ElementType> = {
  deposit_bonus: Percent,
  free_spins: Gift,
  cashback_offer: DollarSign, // Corrected from 'cashback'
  tournament: Users, // Assuming 'tournament' maps to Users icon
  special_event: Info, // Assuming 'special_event' maps to Info icon
  welcome_offer: Gift, // Assuming 'welcome_offer' maps to Gift icon
  reload_bonus: Percent, // Assuming 'reload_bonus' maps to Percent icon
};

const promotionTypeColors: Record<PromotionType, string> = {
  deposit_bonus: 'bg-blue-500',
  free_spins: 'bg-green-500',
  cashback_offer: 'bg-yellow-500 text-black', // Corrected key
  tournament: 'bg-purple-500',
  special_event: 'bg-indigo-500',
  welcome_offer: 'bg-teal-500',
  reload_bonus: 'bg-sky-500',
};

const promotionStatusColors: Record<PromotionStatus, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  upcoming: 'bg-blue-500',
  expired: 'bg-red-500',
  draft: 'bg-yellow-400 text-black',
};

const AdminPromotionCard: React.FC<AdminPromotionCardProps> = ({ promotion, onEdit, onDelete, onToggleActive }) => {
  const TypeIcon = promotionTypeIcons[promotion.type] || CircleHelp;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">{promotion.title}</CardTitle>
          {onToggleActive && (
             <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleActive(promotion.id, !promotion.is_active)}
                className={`ml-2 ${promotion.is_active ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'}`}
                title={promotion.is_active ? "Deactivate Promotion" : "Activate Promotion"}
              >
                <Power className="h-5 w-5" />
              </Button>
          )}
        </div>
        <CardDescription className="text-xs text-muted-foreground">ID: {promotion.id}</CardDescription>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className={`${promotionTypeColors[promotion.type]} text-white`}>
            <TypeIcon className="mr-1 h-3 w-3" />
            {promotion.type.replace(/_/g, ' ')}
          </Badge>
          <Badge variant="outline" className={`${promotionStatusColors[promotion.status]} text-white border-none`}>
            {promotion.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 text-sm text-muted-foreground space-y-2 flex-grow">
        <p className="line-clamp-3">{promotion.description}</p> {/* Used description instead of short_description */}
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center">
            <CalendarDays className="h-3 w-3 mr-1.5 text-primary" />
            <span>Valid: {format(new Date(promotion.valid_from), 'MMM dd, yyyy')} - {format(new Date(promotion.valid_until), 'MMM dd, yyyy')}</span> {/* Used valid_from and valid_until */}
          </div>
          {promotion.code && (
            <div className="flex items-center">
              <Tag className="h-3 w-3 mr-1.5 text-primary" /> Code: <Badge variant="outline" className="ml-1 px-1.5 py-0.5">{promotion.code}</Badge>
            </div>
          )}
          {promotion.value !== undefined && (
            <div>Value: {promotion.value}{promotion.type === 'cashback_offer' || promotion.type === 'deposit_bonus' ? '%' : ''}</div>
          )}
          {promotion.bonus_percentage !== undefined && (
            <div>Bonus: {promotion.bonus_percentage}%</div>
          )}
          {promotion.free_spins_count !== undefined && (
            <div>Spins: {promotion.free_spins_count}</div>
          )}
          {promotion.min_deposit !== undefined && (
            <div>Min. Deposit: ${promotion.min_deposit}</div>
          )}
           {promotion.max_bonus_amount !== undefined && (
            <div>Max Bonus: ${promotion.max_bonus_amount}</div>
          )}
          {promotion.wagering_requirement !== undefined && (
            <div>Wagering: {promotion.wagering_requirement}x</div>
          )}
          {promotion.target_audience && (
             <div className="flex items-center col-span-2">
                <Users className="h-3 w-3 mr-1.5 text-primary" />
                Audience: {promotion.target_audience.replace(/_/g, ' ')}
            </div>
          )}
        </div>

      </CardContent>
      <CardFooter className="p-4 bg-muted/50 flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(promotion)}>
          <Edit3 className="mr-1 h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(promotion.id)}>
          <Trash2 className="mr-1 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminPromotionCard;


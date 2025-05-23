
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Promotion, PromotionStatus, PromotionType, PromotionAudience } from '@/types/promotion'; // Ensure PromotionType is imported
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Basic Zod schema (expand as needed)
const promotionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.nativeEnum(PromotionType),
  status: z.nativeEnum(PromotionStatus),
  valid_from: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid start date" }),
  valid_until: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid end date" }),
  is_active: z.boolean().default(true),
  image_url: z.string().url().optional().or(z.literal('')),
  value: z.number().optional(),
  bonus_percentage: z.number().optional(),
  free_spins_count: z.number().optional(),
  min_deposit: z.number().optional(),
  max_bonus_amount: z.number().optional(),
  wagering_requirement: z.number().optional(),
  code: z.string().optional(),
  cta_text: z.string().optional(),
  terms_and_conditions_url: z.string().url().optional().or(z.literal('')),
  target_audience: z.nativeEnum(PromotionAudience).optional(),
  category: z.string().optional(),
});

export type PromotionFormValues = z.infer<typeof promotionSchema>;

export interface PromotionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: PromotionFormValues) => void;
  initialData?: Promotion | Partial<Promotion> | null;
  isLoading?: boolean;
}

const PromotionForm: React.FC<PromotionFormProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const { control, handleSubmit, register, formState: { errors }, reset } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: initialData ? {
        ...initialData,
        valid_from: initialData.valid_from ? new Date(initialData.valid_from).toISOString().split('T')[0] : '',
        valid_until: initialData.valid_until ? new Date(initialData.valid_until).toISOString().split('T')[0] : '',
        type: initialData.type || PromotionType.DEPOSIT_BONUS, // Default if not set
        status: initialData.status || PromotionStatus.DRAFT, // Default if not set
    } : {
        title: '',
        description: '',
        type: PromotionType.DEPOSIT_BONUS,
        status: PromotionStatus.DRAFT,
        is_active: true,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 7 days from now
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        valid_from: initialData.valid_from ? new Date(initialData.valid_from).toISOString().split('T')[0] : '',
        valid_until: initialData.valid_until ? new Date(initialData.valid_until).toISOString().split('T')[0] : '',
        type: initialData.type || PromotionType.DEPOSIT_BONUS,
        status: initialData.status || PromotionStatus.DRAFT,
      });
    } else {
        reset({
            title: '',
            description: '',
            type: PromotionType.DEPOSIT_BONUS,
            status: PromotionStatus.DRAFT,
            is_active: true,
            valid_from: new Date().toISOString().split('T')[0],
            valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: PromotionFormValues) => {
    onSubmit(data);
  };
  
  // Helper to get enum values for select options
  const getEnumOptions = (enumObj: any) => Object.values(enumObj).map(value => ({ label: String(value).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value: String(value) }));


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getEnumOptions(PromotionType).map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
               <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {getEnumOptions(PromotionStatus).map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valid_from">Valid From</Label>
              <Input id="valid_from" type="date" {...register('valid_from')} />
              {errors.valid_from && <p className="text-red-500 text-xs mt-1">{errors.valid_from.message}</p>}
            </div>
            <div>
              <Label htmlFor="valid_until">Valid Until</Label>
              <Input id="valid_until" type="date" {...register('valid_until')} />
              {errors.valid_until && <p className="text-red-500 text-xs mt-1">{errors.valid_until.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input id="image_url" {...register('image_url')} placeholder="https://example.com/image.png"/>
            {errors.image_url && <p className="text-red-500 text-xs mt-1">{errors.image_url.message}</p>}
          </div>

          {/* Add more fields as needed based on Promotion type (value, bonus_percentage, etc.) */}
          {/* For example:
          <div>
            <Label htmlFor="value">Value (e.g., cashback %)</Label>
            <Input id="value" type="number" {...register('value', { valueAsNumber: true })} />
            {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>}
          </div>
          */}
          
          <div className="flex items-center space-x-2">
            <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                    <input type="checkbox" id="is_active" checked={field.value} onChange={field.onChange} className="h-4 w-4"/>
                )}
            />
            <Label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Is Active
            </Label>
          </div>


          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (initialData?.id ? 'Save Changes' : 'Create Promotion')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionForm;

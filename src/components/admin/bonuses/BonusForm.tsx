import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bonus, BonusStatus, BonusType } from '@/types'; // Import from @/types (index)
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define Zod schema for Bonus validation
const bonusSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.nativeEnum(BonusType), 
  status: z.nativeEnum(BonusStatus),
  amount: z.union([z.number().positive("Amount must be positive"), z.string()]).optional(), // Allow number or string for percentage
  currency: z.string().length(3, "Currency code must be 3 characters").optional(),
  wagering_requirement: z.number().int().min(0).optional(),
  description: z.string().optional(),
  terms: z.string().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
  max_bonus_amount: z.number().optional(),
  min_deposit: z.number().optional(),
  // Add other fields from Bonus type as needed
});

export type BonusFormValues = z.infer<typeof bonusSchema>;

export interface BonusFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: BonusFormValues) => void;
  initialData?: Bonus | Partial<Bonus> | null; // Use Bonus from @/types
  isLoading?: boolean;
}

const BonusForm: React.FC<BonusFormProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const { control, handleSubmit, register, formState: { errors }, reset } = useForm<BonusFormValues>({
    resolver: zodResolver(bonusSchema),
    defaultValues: initialData ? 
      {
        ...initialData,
        amount: initialData.amount ? (typeof initialData.amount === 'number' ? initialData.amount : parseFloat(initialData.amount)) : undefined, // ensure number for field if possible
      } : 
      {
        name: '',
        type: BonusType.DEPOSIT_MATCH, // Default type
        status: BonusStatus.ACTIVE, // Default status
        amount: undefined,
        currency: 'USD',
        wagering_requirement: 0,
      }
  });

  React.useEffect(() => {
    if (isOpen) { // Reset form when dialog opens
      if (initialData) {
        reset({
        ...initialData,
        // Ensure numeric fields are numbers or undefined
        amount: initialData.amount ? (typeof initialData.amount === 'string' && initialData.amount.includes('%') ? initialData.amount : Number(initialData.amount)) : undefined,
        wagering_requirement: initialData.wagering_requirement ? Number(initialData.wagering_requirement) : undefined,
        max_bonus_amount: initialData.max_bonus_amount ? Number(initialData.max_bonus_amount) : undefined,
        min_deposit: initialData.min_deposit ? Number(initialData.min_deposit) : undefined,
        });
      } else {
        reset({
          name: '',
          type: BonusType.DEPOSIT_MATCH,
          status: BonusStatus.ACTIVE,
          amount: undefined,
          currency: 'USD',
          wagering_requirement: 0,
          description: '',
          terms: '',
          valid_from: undefined,
          valid_until: undefined,
          max_bonus_amount: undefined,
          min_deposit: undefined,
        });
      }
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = (data: BonusFormValues) => {
    const submissionData = { ...data };
    // Convert amount to number if it's not a percentage string
    if (typeof submissionData.amount === 'string' && !submissionData.amount.includes('%')) {
      submissionData.amount = parseFloat(submissionData.amount);
    }
    onSubmit(submissionData);
  };
  
  const getEnumOptions = (enumObj: Record<string, string>) => Object.values(enumObj).map(value => ({ label: String(value).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value: String(value) }));


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? 'Edit Bonus' : 'Create New Bonus'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Bonus Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Bonus Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={String(field.value)} defaultValue={String(field.value || BonusType.DEPOSIT_MATCH)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                       {getEnumOptions(BonusType).map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
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
                  <Select onValueChange={field.onChange} value={String(field.value)} defaultValue={String(field.value || BonusStatus.ACTIVE)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {getEnumOptions(BonusStatus).map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Amount (value or % e.g. 50 or 25%)</Label>
            <Input id="amount" {...register('amount', { 
                setValueAs: (value) => {
                    if (typeof value === 'string' && value.includes('%')) return value;
                    return value === '' || value === null || value === undefined ? undefined : parseFloat(value);
                }
            })} />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="currency">Currency (e.g. USD)</Label>
            <Input id="currency" {...register('currency')} />
            {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency.message}</p>}
          </div>

          <div>
            <Label htmlFor="wagering_requirement">Wagering Requirement (e.g. 35 for 35x)</Label>
            <Input id="wagering_requirement" type="number" {...register('wagering_requirement', { valueAsNumber: true })} />
            {errors.wagering_requirement && <p className="text-red-500 text-xs mt-1">{errors.wagering_requirement.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" {...register('description')} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="terms">Terms & Conditions (optional)</Label>
            <Textarea id="terms" {...register('terms')} />
            {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (initialData?.id ? 'Save Changes' : 'Create Bonus')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BonusForm;

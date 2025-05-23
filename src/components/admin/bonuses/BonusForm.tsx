
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bonus, BonusStatus, BonusType } from '@/types/bonus'; // Make sure these types exist and are correctly defined
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define Zod schema for Bonus validation
const bonusSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.nativeEnum(BonusType), // Assumes BonusType is an enum
  status: z.nativeEnum(BonusStatus), // Assumes BonusStatus is an enum
  amount: z.number().positive("Amount must be positive").optional(), // Or string if it can be percentage
  currency: z.string().length(3, "Currency code must be 3 characters").optional(),
  wagering_requirement: z.number().int().min(0).optional(),
  description: z.string().optional(),
  terms: z.string().optional(),
  // Add other fields from Bonus type as needed
});

export type BonusFormValues = z.infer<typeof bonusSchema>;

export interface BonusFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: BonusFormValues) => void;
  initialData?: Bonus | Partial<Bonus> | null;
  isLoading?: boolean;
}

const BonusForm: React.FC<BonusFormProps> = ({ isOpen, onClose, onSubmit, initialData, isLoading }) => {
  const { control, handleSubmit, register, formState: { errors }, reset } = useForm<BonusFormValues>({
    resolver: zodResolver(bonusSchema),
    defaultValues: initialData || {
        name: '',
        type: BonusType.DEPOSIT_MATCH, // Default type
        status: BonusStatus.ACTIVE, // Default status
    }
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        name: '',
        type: BonusType.DEPOSIT_MATCH,
        status: BonusStatus.ACTIVE,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: BonusFormValues) => {
    onSubmit(data);
  };
  
  const getEnumOptions = (enumObj: any) => Object.values(enumObj).map(value => ({ label: String(value).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value: String(value) }));


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
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
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
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
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
            <Label htmlFor="amount">Amount (value or %)</Label>
            <Input id="amount" type="number" {...register('amount', { valueAsNumber: true })} />
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


import React from 'react';
import { useForm } from 'react-hook-form';
import { Bonus, BonusType, BonusStatus } from '@/types/bonus';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BonusFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: Bonus | Partial<Bonus>) => void;
  initialData?: Bonus | Partial<Bonus> | null;
  isLoading?: boolean;
}

const BonusForm: React.FC<BonusFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false
}) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || BonusType.DEPOSIT_MATCH,
      amount: initialData?.amount || 0,
      currency: initialData?.currency || 'USD',
      status: initialData?.status || BonusStatus.ACTIVE,
      terms: initialData?.terms || ''
    }
  });

  const onFormSubmit = (data: any) => {
    onSubmit({
      ...initialData,
      ...data
    });
  };

  const bonusTypeOptions = [
    { value: BonusType.WELCOME, label: 'Welcome Bonus' },
    { value: BonusType.DEPOSIT_MATCH, label: 'Deposit Match' },
    { value: BonusType.FREE_SPINS, label: 'Free Spins' },
    { value: BonusType.CASHBACK, label: 'Cashback' },
    { value: BonusType.RELOAD, label: 'Reload Bonus' },
    { value: BonusType.VIP, label: 'VIP Bonus' },
    { value: BonusType.NO_DEPOSIT, label: 'No Deposit' }
  ];

  const bonusStatusOptions = [
    { value: BonusStatus.ACTIVE, label: 'Active' },
    { value: BonusStatus.INACTIVE, label: 'Inactive' },
    { value: BonusStatus.EXPIRED, label: 'Expired' },
    { value: BonusStatus.CLAIMED, label: 'Claimed' },
    { value: BonusStatus.PENDING, label: 'Pending' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData?.id ? 'Edit Bonus' : 'Create Bonus'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select onValueChange={(value) => setValue('type', value as BonusType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {bonusTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" {...register('amount')} />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" {...register('currency')} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => setValue('status', value as BonusStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {bonusStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="terms">Terms</Label>
            <Input id="terms" {...register('terms')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BonusForm;

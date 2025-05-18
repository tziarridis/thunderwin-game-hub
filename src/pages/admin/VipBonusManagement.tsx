import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DialogClose } from '@radix-ui/react-dialog'; // Import DialogClose from radix
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BonusTemplate, BonusType } from '@/types';
import bonusService from '@/services/bonusService'; // Assuming default export
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const VipBonusManagement = () => {
  const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>([]);
  const [selectedBonusTemplate, setSelectedBonusTemplate] = useState<BonusTemplate | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<BonusType>('deposit_match');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [percentage, setPercentage] = useState<number | undefined>(undefined);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);
  const [freeSpinsCount, setFreeSpinsCount] = useState<number | undefined>(undefined);
  const [wageringRequirement, setWageringRequirement] = useState(0);
  const [gameRestrictions, setGameRestrictions] = useState('');
  const [durationDays, setDurationDays] = useState<number | undefined>(undefined);
  const [minDeposit, setMinDeposit] = useState<number | undefined>(undefined);
  const [promoCode, setPromoCode] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBonusTemplates = async () => {
      setLoading(true);
      try {
        const templates = await bonusService.getAllBonusTemplates();
        if (templates && templates.data) {
          setBonusTemplates(templates.data);
        } else {
          toast.error('Failed to load bonus templates');
        }
      } catch (error: any) {
        console.error('Error fetching bonus templates:', error);
        toast.error(error.message || 'Failed to load bonus templates');
      } finally {
        setLoading(false);
      }
    };

    fetchBonusTemplates();
  }, []);

  const handleEditBonusTemplate = (template: BonusTemplate) => {
    setSelectedBonusTemplate(template);
    setName(template.name);
    setDescription(template.description || '');
    setType(template.type);
    setAmount(template.amount);
    setPercentage(template.percentage);
    setMaxAmount(template.maxAmount);
    setFreeSpinsCount(template.freeSpinsCount);
    setWageringRequirement(template.wageringRequirement);
    setGameRestrictions(Array.isArray(template.gameRestrictions) ? template.gameRestrictions.join(',') : (template.gameRestrictions || ''));
    setDurationDays(template.durationDays);
    setMinDeposit(template.minDeposit);
    setPromoCode(template.promoCode || '');
    setIsActive(template.isActive);
  };

  const handleSaveBonusTemplate = async () => {
    setLoading(true);
    try {
      const bonusData = {
        name,
        description,
        type,
        amount,
        percentage,
        maxAmount,
        freeSpinsCount,
        wageringRequirement,
        gameRestrictions: gameRestrictions.split(',').map(s => s.trim()).filter(s => s !== ''),
        durationDays,
        minDeposit,
        promoCode,
        isActive,
      };

      if (selectedBonusTemplate) {
        // Update existing template
        const updatedTemplate = await bonusService.updateBonusTemplate(selectedBonusTemplate.id, bonusData);
        if (updatedTemplate && updatedTemplate.data) {
          setBonusTemplates(bonusTemplates.map(t => t.id === selectedBonusTemplate.id ? updatedTemplate.data : t));
          toast.success('Bonus template updated successfully!');
        } else {
          toast.error('Failed to update bonus template');
        }
      } else {
        // Create new template
        const newTemplate = await bonusService.createBonusTemplate(bonusData);
        if (newTemplate && newTemplate.data) {
          setBonusTemplates([...bonusTemplates, newTemplate.data]);
          toast.success('Bonus template created successfully!');
        } else {
          toast.error('Failed to create bonus template');
        }
      }
    } catch (error: any) {
      console.error('Error saving bonus template:', error);
      toast.error(error.message || 'Failed to save bonus template');
    } finally {
      setLoading(false);
      handleCloseDialog();
    }
  };

  const handleDeleteBonusTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bonus template?')) {
      setLoading(true);
      try {
        const result = await bonusService.deleteBonusTemplate(id);
        if (result && result.success) {
          setBonusTemplates(bonusTemplates.filter(t => t.id !== id));
          toast.success('Bonus template deleted successfully!');
        } else {
          toast.error('Failed to delete bonus template');
        }
      } catch (error: any) {
        console.error('Error deleting bonus template:', error);
        toast.error(error.message || 'Failed to delete bonus template');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseDialog = () => {
    setSelectedBonusTemplate(null);
    setName('');
    setDescription('');
    setType('deposit_match');
    setAmount(undefined);
    setPercentage(undefined);
    setMaxAmount(undefined);
    setFreeSpinsCount(undefined);
    setWageringRequirement(0);
    setGameRestrictions('');
    setDurationDays(undefined);
    setMinDeposit(undefined);
    setPromoCode('');
    setIsActive(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">VIP Bonus Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Bonus Template</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedBonusTemplate ? 'Edit Bonus Template' : 'Create Bonus Template'}</DialogTitle>
              <DialogDescription>
                {selectedBonusTemplate ? 'Update the details of the selected bonus template.' : 'Create a new bonus template for VIP levels.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select value={type} onValueChange={(value) => setType(value as BonusType)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit_match">Deposit Match</SelectItem>
                    <SelectItem value="no_deposit">No Deposit</SelectItem>
                    <SelectItem value="free_spins">Free Spins</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="reload">Reload</SelectItem>
                    <SelectItem value="loyalty_points">Loyalty Points</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount !== undefined ? amount.toString() : ''}
                  onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="col-span-3"
                  placeholder="Leave empty if not applicable"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="percentage" className="text-right">
                  Percentage
                </Label>
                <Input
                  id="percentage"
                  type="number"
                  value={percentage !== undefined ? percentage.toString() : ''}
                  onChange={(e) => setPercentage(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="col-span-3"
                  placeholder="Leave empty if not applicable"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxAmount" className="text-right">
                  Max Amount
                </Label>
                <Input
                  id="maxAmount"
                  type="number"
                  value={maxAmount !== undefined ? maxAmount.toString() : ''}
                  onChange={(e) => setMaxAmount(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="col-span-3"
                  placeholder="Leave empty if not applicable"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="freeSpinsCount" className="text-right">
                  Free Spins Count
                </Label>
                <Input
                  id="freeSpinsCount"
                  type="number"
                  value={freeSpinsCount !== undefined ? freeSpinsCount.toString() : ''}
                  onChange={(e) => setFreeSpinsCount(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="col-span-3"
                  placeholder="Leave empty if not applicable"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wageringRequirement" className="text-right">
                  Wagering Requirement
                </Label>
                <Input
                  id="wageringRequirement"
                  type="number"
                  value={wageringRequirement.toString()}
                  onChange={(e) => setWageringRequirement(e.target.value ? parseInt(e.target.value) : 0)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gameRestrictions" className="text-right">
                  Game Restrictions
                </Label>
                <Input
                  id="gameRestrictions"
                  value={gameRestrictions}
                  onChange={(e) => setGameRestrictions(e.target.value)}
                  className="col-span-3"
                  placeholder="Comma-separated list of game IDs"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="durationDays" className="text-right">
                  Duration (Days)
                </Label>
                <Input
                  id="durationDays"
                  type="number"
                  value={durationDays !== undefined ? durationDays.toString() : ''}
                  onChange={(e) => setDurationDays(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="col-span-3"
                  placeholder="Leave empty if no duration"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minDeposit" className="text-right">
                  Min Deposit
                </Label>
                <Input
                  id="minDeposit"
                  type="number"
                  value={minDeposit !== undefined ? minDeposit.toString() : ''}
                  onChange={(e) => setMinDeposit(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="col-span-3"
                  placeholder="Leave empty if no minimum deposit"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="promoCode" className="text-right">
                  Promo Code
                </Label>
                <Input
                  id="promoCode"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="col-span-3"
                  placeholder="Leave empty if no promo code"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Is Active
                </Label>
                <Input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={() => setIsActive(!isActive)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" onClick={handleSaveBonusTemplate} disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : (selectedBonusTemplate ? 'Update Template' : 'Create Template')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bonus Templates</CardTitle>
          <CardDescription>Manage your VIP bonus templates here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wagering
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700">
                {bonusTemplates.map((template) => (
                  <tr key={template.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {template.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {template.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {template.amount || template.percentage ? `${template.amount || template.percentage}${template.percentage ? '%' : ''}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {template.wageringRequirement}x
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {template.isActive ? 'Active' : 'Inactive'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditBonusTemplate(template)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteBonusTemplate(template.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VipBonusManagement;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BonusTemplate, BonusType, BonusServiceType } from '@/types'; // Import BonusServiceType
import bonusServiceInstance from '@/services/bonusService'; // Assuming default export for the instance
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Cast the imported service to the defined type
const bonusService = bonusServiceInstance as BonusServiceType;

const VipBonusManagement = () => {
  const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>([]);
  const [selectedBonusTemplate, setSelectedBonusTemplate] = useState<BonusTemplate | null>(null);
  // ... keep existing state declarations for form fields (name, description, type, etc.)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<BonusType>('deposit_match');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [percentage, setPercentage] = useState<number | undefined>(undefined);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);
  const [freeSpinsCount, setFreeSpinsCount] = useState<number | undefined>(undefined);
  const [wageringRequirement, setWageringRequirement] = useState(0);
  const [gameRestrictions, setGameRestrictions] = useState(''); // Stays as string for input
  const [durationDays, setDurationDays] = useState<number | undefined>(undefined);
  const [minDeposit, setMinDeposit] = useState<number | undefined>(undefined);
  const [promoCode, setPromoCode] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchBonusTemplates = async () => {
      setLoading(true);
      try {
        // Ensure bonusService and its methods are defined in BonusServiceType and implemented
        if (bonusService.getAllBonusTemplates) {
            const response = await bonusService.getAllBonusTemplates();
            if (response && response.data) {
              setBonusTemplates(response.data);
            } else {
              toast.error(response?.error || 'Failed to load bonus templates');
            }
        } else {
            toast.error('Bonus service function getAllBonusTemplates not found.');
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
      const bonusData: Partial<BonusTemplate> = { // Use Partial for updates
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

      if (selectedBonusTemplate && selectedBonusTemplate.id) {
        if (bonusService.updateBonusTemplate) {
            const response = await bonusService.updateBonusTemplate(selectedBonusTemplate.id, bonusData);
            if (response && response.data) {
              setBonusTemplates(bonusTemplates.map(t => t.id === selectedBonusTemplate.id ? response.data! : t));
              toast.success('Bonus template updated successfully!');
            } else {
              toast.error(response?.error ||'Failed to update bonus template');
            }
        } else {
            toast.error('Bonus service function updateBonusTemplate not found.');
        }
      } else {
        if (bonusService.createBonusTemplate) {
            const response = await bonusService.createBonusTemplate(bonusData);
            if (response && response.data) {
              setBonusTemplates([...bonusTemplates, response.data]);
              toast.success('Bonus template created successfully!');
            } else {
              toast.error(response?.error || 'Failed to create bonus template');
            }
        } else {
            toast.error('Bonus service function createBonusTemplate not found.');
        }
      }
    } catch (error: any) {
      console.error('Error saving bonus template:', error);
      toast.error(error.message || 'Failed to save bonus template');
    } finally {
      setLoading(false);
      handleCloseDialog(); // Call this to ensure dialog closes and form resets
    }
  };

  const handleDeleteBonusTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bonus template?')) {
      setLoading(true);
      try {
        if (bonusService.deleteBonusTemplate) {
            const response = await bonusService.deleteBonusTemplate(id);
            // Assuming response structure is { success: boolean, error?: string }
            if (response && response.data?.success) { 
              setBonusTemplates(bonusTemplates.filter(t => t.id !== id));
              toast.success('Bonus template deleted successfully!');
            } else {
              toast.error(response?.error || 'Failed to delete bonus template');
            }
        } else {
            toast.error('Bonus service function deleteBonusTemplate not found.');
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
// ... keep existing JSX for the component, ensure Dialog closes on submit/cancel using onOpenChange or DialogClose
// For Dialog, make sure the onOpenChange prop is set on Dialog to call handleCloseDialog when isOpen becomes false.
// Example: <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if (!isOpen) handleCloseDialog(); setIsFormOpen(isOpen); }}>
// Or ensure DialogFooter's Cancel button is wrapped in DialogClose and submit calls handleCloseDialog.

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">VIP Bonus Management</h1>
        <Dialog onOpenChange={(isOpen) => { if (!isOpen) handleCloseDialog(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedBonusTemplate(null)}>Create Bonus Template</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedBonusTemplate ? 'Edit Bonus Template' : 'Create Bonus Template'}</DialogTitle>
              <DialogDescription>
                {selectedBonusTemplate ? 'Update the details of the selected bonus template.' : 'Create a new bonus template for VIP levels.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name-bonus" className="text-right">Name</Label>
                <Input id="name-bonus" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
              </div>
              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description-bonus" className="text-right">Description</Label>
                <Input id="description-bonus" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
              </div>
               {/* Type Select */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type-bonus" className="text-right">Type</Label>
                <Select value={type} onValueChange={(value) => setType(value as BonusType)}>
                  <SelectTrigger className="col-span-3" id="type-bonus">
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
              {/* Amount */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount-bonus" className="text-right">Amount</Label>
                <Input id="amount-bonus" type="number" value={amount ?? ''} onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : undefined)} className="col-span-3" placeholder="e.g., 100 for $100"/>
              </div>
              {/* Percentage */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="percentage-bonus" className="text-right">Percentage (%)</Label>
                <Input id="percentage-bonus" type="number" value={percentage ?? ''} onChange={(e) => setPercentage(e.target.value ? parseFloat(e.target.value) : undefined)} className="col-span-3" placeholder="e.g., 50 for 50%"/>
              </div>
              {/* Max Amount */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxAmount-bonus" className="text-right">Max Amount</Label>
                <Input id="maxAmount-bonus" type="number" value={maxAmount ?? ''} onChange={(e) => setMaxAmount(e.target.value ? parseFloat(e.target.value) : undefined)} className="col-span-3" placeholder="Max bonus value if percentage"/>
              </div>
              {/* Free Spins Count */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="freeSpinsCount-bonus" className="text-right">Free Spins</Label>
                <Input id="freeSpinsCount-bonus" type="number" value={freeSpinsCount ?? ''} onChange={(e) => setFreeSpinsCount(e.target.value ? parseInt(e.target.value) : undefined)} className="col-span-3" placeholder="Number of free spins"/>
              </div>
              {/* Wagering Requirement */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wageringRequirement-bonus" className="text-right">Wagering (x)</Label>
                <Input id="wageringRequirement-bonus" type="number" value={wageringRequirement} onChange={(e) => setWageringRequirement(e.target.value ? parseInt(e.target.value) : 0)} className="col-span-3" required />
              </div>
              {/* Game Restrictions */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gameRestrictions-bonus" className="text-right">Game IDs</Label>
                <Input id="gameRestrictions-bonus" value={gameRestrictions} onChange={(e) => setGameRestrictions(e.target.value)} className="col-span-3" placeholder="Comma-separated game IDs"/>
              </div>
              {/* Duration Days */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="durationDays-bonus" className="text-right">Duration (Days)</Label>
                <Input id="durationDays-bonus" type="number" value={durationDays ?? ''} onChange={(e) => setDurationDays(e.target.value ? parseInt(e.target.value) : undefined)} className="col-span-3" placeholder="Bonus validity in days"/>
              </div>
              {/* Min Deposit */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minDeposit-bonus" className="text-right">Min Deposit</Label>
                <Input id="minDeposit-bonus" type="number" value={minDeposit ?? ''} onChange={(e) => setMinDeposit(e.target.value ? parseFloat(e.target.value) : undefined)} className="col-span-3" placeholder="Minimum deposit to qualify"/>
              </div>
              {/* Promo Code */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="promoCode-bonus" className="text-right">Promo Code</Label>
                <Input id="promoCode-bonus" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="col-span-3" placeholder="Optional promo code"/>
              </div>
              {/* Is Active Checkbox */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive-bonus" className="text-right">Active</Label>
                <Checkbox id="isActive-bonus" checked={isActive} onCheckedChange={(checked) => setIsActive(Boolean(checked))} className="col-span-3 justify-self-start" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
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
           {loading && bonusTemplates.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bonusTemplates.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No bonus templates found. Create one to get started!</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Wagering</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-gray-200 dark:divide-gray-700">
                {bonusTemplates.map((template) => (
                  <tr key={template.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{template.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{template.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {template.amount ? `${template.amount}` : template.percentage ? `${template.percentage}%` : template.freeSpinsCount ? `${template.freeSpinsCount} FS` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{template.wageringRequirement}x</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${template.isActive ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'}`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Dialog onOpenChange={(isOpen) => { if (!isOpen) handleCloseDialog(); }}>
                        <DialogTrigger asChild>
                           <Button variant="ghost" size="sm" onClick={() => handleEditBonusTemplate(template)}>Edit</Button>
                        </DialogTrigger>
                        {/* DialogContent for editing is the same as for creating, just pre-filled */}
                        {/* It's managed by the main Dialog at the top of the page now for simplicity */}
                      </Dialog>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteBonusTemplate(template.id)} disabled={loading}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VipBonusManagement;

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react'; // Removed Save, X, ChevronDown, ChevronUp as they are not used
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'; // Ensured DialogClose is imported
import { Label } from "@/components/ui/label"; // Added Label import
import { BonusTemplate, BonusTemplateFormData, VipLevel, BonusType } from '@/types'; // Assuming these types are correctly defined
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
// import { bonusTemplateService, vipLevelService } from '@/services/adminService'; // Assuming a service

// Mock service functions (replace with actual service calls)
const mockBonusTemplateService = {
  getBonusTemplates: async (): Promise<BonusTemplate[]> => {
    return [
      { id: '1', name: 'Welcome Bonus', description: '100% up to $200', type: 'deposit_match' as BonusType, percentage: 100, maxAmount: 200, wageringRequirement: 30, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', name: 'VIP Free Spins', description: '50 Free Spins for Gold+', type: 'free_spins' as BonusType, freeSpinsCount: 50, targetVipLevelId: '3', wageringRequirement: 20, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, // Changed targetVipLevel to targetVipLevelId
    ];
  },
  createBonusTemplate: async (data: BonusTemplateFormData): Promise<BonusTemplate> => {
    console.log("Creating bonus template:", data);
    const newTemplate: BonusTemplate = {
      id: String(Date.now()),
      ...data,
      gameRestrictions: data.gameRestrictions ? data.gameRestrictions.split(',').map(s => s.trim()) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      targetVipLevelId: data.targetVipLevelId, // Ensure this is handled
    };
    return newTemplate;
  },
  updateBonusTemplate: async (id: string, data: BonusTemplateFormData): Promise<BonusTemplate> => {
    console.log("Updating bonus template:", id, data);
    const updatedTemplate: BonusTemplate = {
      id,
      ...data,
      gameRestrictions: data.gameRestrictions ? data.gameRestrictions.split(',').map(s => s.trim()) : undefined,
      createdAt: new Date().toISOString(), // Should retain original createdAt ideally
      updatedAt: new Date().toISOString(),
      targetVipLevelId: data.targetVipLevelId, // Ensure this is handled
    };
    return updatedTemplate;
  },
  deleteBonusTemplate: async (id: string): Promise<void> => {
    console.log("Deleting bonus template:", id);
    return;
  }
};

const mockVipLevelService = {
  getVipLevels: async (): Promise<VipLevel[]> => {
    return [
      { id: '1', level: 1, name: 'Bronze', pointsRequired: 0, benefits: ['Basic support'], cashbackPercentage: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: '2', level: 2, name: 'Silver', pointsRequired: 1000, benefits: ['Priority support'], cashbackPercentage: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: '3', level: 3, name: 'Gold', pointsRequired: 5000, benefits: ['Dedicated manager', 'Exclusive bonuses'], cashbackPercentage: 5, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ];
  },
  createVipLevel: async (data: Omit<VipLevel, 'id' | 'createdAt' | 'updatedAt'>): Promise<VipLevel> => { // Adjusted type
    const newLevel: VipLevel = { 
        id: String(Date.now()), 
        ...data, 
        isActive: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
    };
    return newLevel;
  },
  updateVipLevel: async (id: string, data: Partial<Omit<VipLevel, 'id' | 'createdAt' | 'updatedAt'>>): Promise<VipLevel> => { // Adjusted type
    const existingLevel = await mockVipLevelService.getVipLevels().then(levels => levels.find(l => l.id === id));
    if (!existingLevel) throw new Error("Level not found");
    const updatedLevel = { ...existingLevel, ...data, updatedAt: new Date() } as VipLevel;
    return updatedLevel;
  },
   deleteVipLevel: async (id: string): Promise<void> => {
    console.log("Deleting VIP level:", id);
    return Promise.resolve();
  },
};


const initialFormData: BonusTemplateFormData = {
  name: '',
  description: '',
  type: 'deposit_match' as BonusType,
  amount: undefined,
  percentage: undefined,
  maxAmount: undefined,
  freeSpinsCount: undefined,
  wageringRequirement: 0,
  gameRestrictions: '',
  durationDays: undefined,
  minDeposit: undefined,
  promoCode: undefined,
  targetVipLevelId: undefined, // Changed from targetVipLevel
  isActive: true,
};


const VipBonusManagement: React.FC = () => {
  const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>([]);
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BonusTemplate | null>(null);
  const [formData, setFormData] = useState<BonusTemplateFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');

  const bonusTypes: BonusType[] = ['deposit_match', 'no_deposit', 'free_spins', 'cashback', 'reload', 'loyalty_points'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [templates, levels] = await Promise.all([
          mockBonusTemplateService.getBonusTemplates(),
          mockVipLevelService.getVipLevels(),
        ]);
        setBonusTemplates(templates);
        setVipLevels(levels);
      } catch (error) {
        toast.error('Failed to load data.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || undefined : value,
    }));
  };

  const handleCheckboxChange = (name: keyof BonusTemplateFormData, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSelectChange = (name: keyof BonusTemplateFormData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this bonus template?")) return;
    try {
      await mockBonusTemplateService.deleteBonusTemplate(id);
      setBonusTemplates(prev => prev.filter(template => template.id !== id));
      toast.success('Bonus template deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete bonus template.');
      console.error(error);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingTemplate) {
        const updatedTemplate = await mockBonusTemplateService.updateBonusTemplate(editingTemplate.id, formData);
        setBonusTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
        toast.success('Bonus template updated successfully!');
      } else {
        const newTemplate = await mockBonusTemplateService.createBonusTemplate(formData);
        setBonusTemplates(prev => [...prev, newTemplate]);
        toast.success('Bonus template created successfully!');
      }
      setIsFormOpen(false);
      setEditingTemplate(null);
      setFormData(initialFormData);
    } catch (error) {
      toast.error('Failed to save bonus template.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (template: BonusTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      type: template.type,
      amount: template.amount,
      percentage: template.percentage,
      maxAmount: template.maxAmount,
      freeSpinsCount: template.freeSpinsCount,
      wageringRequirement: template.wageringRequirement || 0,
      gameRestrictions: Array.isArray(template.gameRestrictions) ? template.gameRestrictions.join(', ') : '',
      durationDays: template.durationDays,
      minDeposit: template.minDeposit,
      promoCode: template.promoCode,
      targetVipLevelId: template.targetVipLevelId, // Changed
      isActive: template.isActive !== undefined ? template.isActive : true,
    });
    setIsFormOpen(true);
  };

  const openNewForm = () => {
    setEditingTemplate(null);
    setFormData(initialFormData);
    setIsFormOpen(true);
  };

  const filteredTemplates = bonusTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateLevel = async (newLevelData: Omit<VipLevel, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const createdLevel = await mockVipLevelService.createVipLevel(newLevelData);
      setVipLevels(prev => [...prev, createdLevel]);
      toast.success("VIP Level created successfully!");
    } catch (error) {
      toast.error("Failed to create VIP Level.");
      console.error(error);
    }
  };

  const handleUpdateLevel = async (updatedLevelData: VipLevel) => {
     if (!updatedLevelData.id) return;
    try {
      const updatedLevel = await mockVipLevelService.updateVipLevel(updatedLevelData.id, updatedLevelData);
      setVipLevels(prev => prev.map(level => level.id === updatedLevel.id ? updatedLevel : level));
      toast.success("VIP Level updated successfully!");
    } catch (error) {
      toast.error("Failed to update VIP Level.");
      console.error(error);
    }
  };
  
  const handleDeleteVipLevel = async (levelId: string) => {
    if (!window.confirm("Are you sure you want to delete this VIP level? This might affect existing bonus targeting.")) return;
    try {
      await mockVipLevelService.deleteVipLevel(levelId);
      setVipLevels(prev => prev.filter(level => level.id !== levelId));
      toast.success('VIP Level deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete VIP level.');
      console.error(error);
    }
  };


  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">VIP & Bonus Management</h1>

      {/* Bonus Templates Section */}
      <section className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-xl md:text-2xl font-semibold">Bonus Templates</h2>
          <Button onClick={openNewForm} className="flex items-center">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Template
          </Button>
        </div>
        <div className="mb-4">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-card"
          />
        </div>
        <div className="rounded-md border overflow-x-auto bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={4} className="text-center">Loading templates...</TableCell></TableRow>}
              {!isLoading && filteredTemplates.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center">No templates found.</TableCell></TableRow>
              )}
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.type.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${template.isActive ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(template)} className="mr-2 hover:text-blue-500">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)} className="hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
      
      {/* VIP Levels Section */}
      <section>
        <h2 className="text-xl md:text-2xl font-semibold mb-4">VIP Levels</h2>
         <div className="bg-card p-4 rounded-md border">
          {vipLevels.length > 0 ? (
            <ul className="space-y-2">
              {vipLevels.map(level => (
                <li key={level.id} className="flex justify-between items-center p-2 border-b last:border-b-0">
                  <span>Level {level.level}: {level.name} (Requires {level.pointsRequired} points)</span>
                  {/* Placeholder for Edit/Delete for VIP levels */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No VIP levels configured yet.</p>
          )}
           <div className="mt-4">
             <Button variant="outline" onClick={() => toast.info("VIP Level creation UI not fully implemented here yet.")}>
                Add New VIP Level (Placeholder)
             </Button>
           </div>
        </div>
      </section>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
        setIsFormOpen(isOpen);
        if (!isOpen) {
          setEditingTemplate(null);
          setFormData(initialFormData);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] bg-card">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit' : 'Create'} Bonus Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 py-4 max-h-[70vh] overflow-y-auto px-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} />
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value as BonusType)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {bonusTypes.map(type => (
                    <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'deposit_match' && (
              <>
                <div>
                  <Label htmlFor="percentage">Percentage (%)</Label>
                  <Input id="percentage" name="percentage" type="number" value={formData.percentage || ''} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="maxAmount">Max Bonus Amount</Label>
                  <Input id="maxAmount" name="maxAmount" type="number" value={formData.maxAmount || ''} onChange={handleInputChange} />
                </div>
              </>
            )}

            {formData.type === 'free_spins' && (
              <div>
                <Label htmlFor="freeSpinsCount">Free Spins Count</Label>
                <Input id="freeSpinsCount" name="freeSpinsCount" type="number" value={formData.freeSpinsCount || ''} onChange={handleInputChange} />
              </div>
            )}
             {(formData.type === 'cashback' || formData.type === 'reload') && ( // Simplified condition
              <div>
                <Label htmlFor="percentage">Percentage (%)</Label>
                <Input id="percentage" name="percentage" type="number" value={formData.percentage || ''} onChange={handleInputChange} />
              </div>
            )}

            {formData.type !== 'free_spins' && formData.type !== 'loyalty_points' && formData.type !== 'no_deposit' && (
                 <div>
                  <Label htmlFor="minDeposit">Min Deposit</Label>
                  <Input id="minDeposit" name="minDeposit" type="number" value={formData.minDeposit || ''} onChange={handleInputChange} />
                </div>
            )}
            
            <div>
              <Label htmlFor="wageringRequirement">Wagering Requirement (x)</Label>
              <Input id="wageringRequirement" name="wageringRequirement" type="number" value={formData.wageringRequirement || 0} onChange={handleInputChange} required />
            </div>

            <div>
              <Label htmlFor="durationDays">Duration (Days)</Label>
              <Input id="durationDays" name="durationDays" type="number" value={formData.durationDays || ''} onChange={handleInputChange} />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="gameRestrictions">Game Restrictions (comma-separated slugs)</Label>
              <Input id="gameRestrictions" name="gameRestrictions" value={formData.gameRestrictions || ''} onChange={handleInputChange} placeholder="e.g. slot-game-1,another-slot" />
            </div>

            <div>
              <Label htmlFor="promoCode">Promo Code (Optional)</Label>
              <Input id="promoCode" name="promoCode" value={formData.promoCode || ''} onChange={handleInputChange} />
            </div>
            
            <div>
              <Label htmlFor="targetVipLevelId">Target VIP Level (Optional)</Label>
              <Select value={formData.targetVipLevelId || ''} onValueChange={(value) => handleSelectChange('targetVipLevelId', value || undefined)}>
                <SelectTrigger><SelectValue placeholder="Select VIP Level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {vipLevels.map(level => (
                    <SelectItem key={level.id} value={level.id}>{level.name} (Level {level.level})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex items-center space-x-2 mt-2">
              <Checkbox id="isActive" name="isActive" checked={formData.isActive} onCheckedChange={(checked) => handleCheckboxChange('isActive', !!checked)} />
              <Label htmlFor="isActive" className="font-normal">Active</Label>
            </div>

            <DialogFooter className="md:col-span-2 mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (editingTemplate ? 'Save Changes' : 'Create Template')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VipBonusManagement;

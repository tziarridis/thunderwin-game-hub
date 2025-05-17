import React, { useState, useEffect } from "react";
import {
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Switch,
} from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, Edit, Trash, Award, Users, Gift } from "lucide-react";
import { BonusTemplate, BonusTemplateFormData, VipLevel, BonusType } from "@/types";
import { getVipLevels, vipLevelsApi } from "@/services/apiService";
import VipLevelManager from "@/components/admin/VipLevelManager";
import { useToast } from "@/components/ui/use-toast";

const VipBonusManagement = () => {
  const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>([]);
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBonusTemplate, setSelectedBonusTemplate] = useState<BonusTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("bonus-templates");
  const { toast } = useToast();

  // Initial form data state according to BonusTemplateFormData
  const initialFormData: BonusTemplateFormData = {
    name: "",
    description: "",
    type: "deposit", // Default to a valid BonusType
    amount: 0,
    percentage: 0,
    maxAmount: 0,
    wageringRequirement: 0,
    durationDays: 0,
    gameRestrictions: "", // Comma-separated string
    minDeposit: 0,
    promoCode: "",
    targetVipLevel: 0, // Or undefined if optional initially
    isActive: true,
    freeSpinsCount: 0,
  };

  const [formData, setFormData] = useState<BonusTemplateFormData>(initialFormData);

  useEffect(() => {
    // Mock bonus templates conforming to the updated BonusTemplate structure
    const mockBonusTemplates: BonusTemplate[] = [
      {
        id: "1",
        name: "VIP Welcome Bonus",
        description: "Exclusive welcome bonus for VIP members",
        type: "deposit", // Valid BonusType
        amount: 200, // Fixed amount or part of percentage calculation
        percentage: 100,
        maxAmount: 500,
        wageringRequirement: 30,
        durationDays: 30,
        targetVipLevel: 5,
        isActive: true,
        gameRestrictions: ["slots"], // Array of strings
        promoCode: "VIPWELCOME",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "VIP Reload Bonus",
        description: "Weekly reload bonus for VIP members",
        type: "reload", // Valid BonusType
        amount: 50,
        percentage: 50,
        maxAmount: 200,
        wageringRequirement: 25,
        durationDays: 7,
        targetVipLevel: 3,
        isActive: true,
        gameRestrictions: ["all"], // Array of strings
        promoCode: "VIPRELOAD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    setBonusTemplates(mockBonusTemplates);

    const fetchVipLevels = async () => {
      try {
        const levels = await getVipLevels();
        setVipLevels(levels);
      } catch (error) {
        console.error("Error fetching VIP levels:", error);
        toast({
          title: "Error",
          description: "Failed to fetch VIP levels. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchVipLevels();
  }, [toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numericFields = ['amount', 'percentage', 'maxAmount', 'wageringRequirement', 'durationDays', 'minDeposit', 'targetVipLevel', 'freeSpinsCount'];
    setFormData((prevData) => ({
      ...prevData,
      [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === "type") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value as BonusType, // Cast to BonusType
      }));
    } else if (name === "targetVipLevel") {
        setFormData((prevData) => ({
          ...prevData,
          [name]: parseInt(value, 10) || 0,
        }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };
  
  const handleVipLevelUpdate = async (updatedLevel: VipLevel) => {
    try {
      await vipLevelsApi.updateVipLevel(String(updatedLevel.id), updatedLevel);
      setVipLevels(prevLevels => 
        prevLevels.map(level => 
          level.id === updatedLevel.id ? updatedLevel : level
        )
      );
      toast({
        title: "Success",
        description: `VIP level "${updatedLevel.name}" has been updated.`,
      });
    } catch (error) {
      console.error("Error updating VIP level:", error);
      toast({
        title: "Error",
        description: "Failed to update VIP level. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVipLevelCreate = async (newLevel: Omit<VipLevel, "id">) => {
    try {
      const createdLevel = await vipLevelsApi.createVipLevel(newLevel);
      setVipLevels(prevLevels => [...prevLevels, createdLevel]);
      toast({
        title: "Success",
        description: `VIP level "${newLevel.name}" has been created.`,
      });
    } catch (error) {
      console.error("Error creating VIP level:", error);
      toast({
        title: "Error",
        description: "Failed to create VIP level. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validations (can be more sophisticated with a library like Zod)
    if (!formData.name || !formData.description) {
      toast({ title: "Validation Error", description: "Name and description are required.", variant: "destructive"});
      return;
    }
    if ((formData.type === 'deposit' || formData.type === 'reload' || formData.type === 'deposit_match') && (formData.amount === undefined || formData.amount <= 0) && (formData.percentage === undefined || formData.percentage <= 0) ) {
        toast({ title: "Validation Error", description: "For deposit/reload bonuses, amount or percentage must be greater than zero.", variant: "destructive"});
        return;
    }
    if (formData.type === 'free_spins' && (formData.freeSpinsCount === undefined || formData.freeSpinsCount <=0)) {
        toast({ title: "Validation Error", description: "For free spins, count must be greater than zero.", variant: "destructive"});
        return;
    }
    // Add more validations as needed

    const newBonusTemplate: Omit<BonusTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'targetUserGroup'> = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      amount: formData.amount,
      percentage: formData.percentage,
      maxAmount: formData.maxAmount,
      freeSpinsCount: formData.freeSpinsCount,
      wageringRequirement: formData.wageringRequirement,
      gameRestrictions: formData.gameRestrictions.split(',').map(s => s.trim()).filter(s => s),
      durationDays: formData.durationDays,
      minDeposit: formData.minDeposit,
      promoCode: formData.promoCode,
      targetVipLevel: formData.targetVipLevel,
      isActive: formData.isActive,
    };

    if (isEditMode && selectedBonusTemplate) {
      const updatedTemplate: BonusTemplate = {
        ...selectedBonusTemplate,
        ...newBonusTemplate,
        updatedAt: new Date().toISOString(),
      };
      setBonusTemplates(bonusTemplates.map((template) =>
        template.id === selectedBonusTemplate.id ? updatedTemplate : template
      ));
      toast({
        title: "Success",
        description: `Bonus template "${formData.name}" has been updated.`,
      });
    } else {
      const completeNewTemplate: BonusTemplate = {
        id: Date.now().toString(), // Simple ID generation for mock
        ...newBonusTemplate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setBonusTemplates([...bonusTemplates, completeNewTemplate]);
      toast({
        title: "Success",
        description: `Bonus template "${formData.name}" has been created.`,
      });
    }

    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedBonusTemplate(null);
    setFormData(initialFormData); // Reset form
  };

  const handleEdit = (bonusTemplate: BonusTemplate) => {
    setSelectedBonusTemplate(bonusTemplate);
    setIsEditMode(true);
    setIsDialogOpen(true);
    // Map BonusTemplate to BonusTemplateFormData for editing
    setFormData({
      name: bonusTemplate.name,
      description: bonusTemplate.description,
      type: bonusTemplate.type,
      amount: bonusTemplate.amount || 0,
      percentage: bonusTemplate.percentage || 0,
      maxAmount: bonusTemplate.maxAmount || 0,
      freeSpinsCount: bonusTemplate.freeSpinsCount || 0,
      wageringRequirement: bonusTemplate.wageringRequirement,
      gameRestrictions: bonusTemplate.gameRestrictions?.join(', ') || "",
      durationDays: bonusTemplate.durationDays || 0,
      minDeposit: bonusTemplate.minDeposit || 0,
      promoCode: bonusTemplate.promoCode || "",
      targetVipLevel: bonusTemplate.targetVipLevel || 0,
      isActive: bonusTemplate.isActive === undefined ? true : bonusTemplate.isActive,
    });
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setIsEditMode(false);
    setSelectedBonusTemplate(null);
    setFormData(initialFormData); // Reset to initial state
  };


  return (
    
    <div className="container mx-auto py-10">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="bonus-templates" className="flex items-center">
              <Gift className="h-4 w-4 mr-2" />
              Bonus Templates
            </TabsTrigger>
            <TabsTrigger value="vip-levels" className="flex items-center">
              <Award className="h-4 w-4 mr-2" />
              VIP Levels
            </TabsTrigger>
          </TabsList>
          
          {activeTab === "bonus-templates" ? (
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bonus Template
            </Button>
          ) : null}
        </div>

        <TabsContent value="bonus-templates">
          <Card className="shadow-md rounded-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">
                VIP Bonus Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>
                  A list of your VIP bonus templates.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount/Percentage</TableHead> {/* Combined for brevity */}
                    <TableHead>Wagering</TableHead>
                    <TableHead>Duration (Days)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonusTemplates.map((bonusTemplate) => (
                    <TableRow key={bonusTemplate.id}>
                      <TableCell className="font-medium">{bonusTemplate.name}</TableCell>
                      <TableCell>{bonusTemplate.type}</TableCell>
                      <TableCell>
                        {bonusTemplate.type === 'free_spins' ? `${bonusTemplate.freeSpinsCount || 0} spins` : 
                         bonusTemplate.amount ? `$${bonusTemplate.amount}` : 
                         bonusTemplate.percentage ? `${bonusTemplate.percentage}%` : 'N/A'}
                        {bonusTemplate.maxAmount ? ` (Max $${bonusTemplate.maxAmount})` : ''}
                      </TableCell>
                      <TableCell>{bonusTemplate.wageringRequirement}x</TableCell>
                      <TableCell>{bonusTemplate.durationDays || 'N/A'}</TableCell>
                      <TableCell>
                        {bonusTemplate.isActive ? "Active" : "Inactive"}
                      </TableCell>
                       <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(bonusTemplate)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(bonusTemplate.id)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="vip-levels">
          <VipLevelManager 
            levels={vipLevels} 
            onUpdate={handleVipLevelUpdate}
            onCreate={handleVipLevelCreate}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Bonus Template" : "Add Bonus Template"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Edit the details of the selected bonus template."
                : "Create a new bonus template for VIP members."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" value={formData.description} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="type">Bonus Type</Label>
              <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a bonus type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="reload">Reload</SelectItem>
                  <SelectItem value="cashback">Cashback</SelectItem>
                  <SelectItem value="free_spins">Free Spins</SelectItem>
                  <SelectItem value="deposit_match">Deposit Match</SelectItem>
                  <SelectItem value="no_deposit">No Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'free_spins' ? (
              <div>
                <Label htmlFor="freeSpinsCount">Free Spins Count</Label>
                <Input type="number" id="freeSpinsCount" name="freeSpinsCount" value={formData.freeSpinsCount || ''} onChange={handleInputChange} />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="amount">Amount (fixed)</Label>
                  <Input type="number" id="amount" name="amount" value={formData.amount || ''} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="percentage">Percentage</Label>
                  <Input type="number" id="percentage" name="percentage" value={formData.percentage || ''} onChange={handleInputChange} />
                </div>
              </>
            )}
             <div>
                <Label htmlFor="maxAmount">Maximum Bonus Amount</Label>
                <Input type="number" id="maxAmount" name="maxAmount" value={formData.maxAmount || ''} onChange={handleInputChange}/>
            </div>
            <div>
              <Label htmlFor="wageringRequirement">Wagering Requirement (x)</Label>
              <Input type="number" id="wageringRequirement" name="wageringRequirement" value={formData.wageringRequirement} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="durationDays">Duration (Days)</Label>
              <Input type="number" id="durationDays" name="durationDays" value={formData.durationDays || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="minDeposit">Minimum Deposit</Label>
              <Input type="number" id="minDeposit" name="minDeposit" value={formData.minDeposit || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="targetVipLevel">VIP Level Required</Label>
              <Select name="targetVipLevel" value={String(formData.targetVipLevel || 0)} onValueChange={(value) => handleSelectChange("targetVipLevel", value)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a VIP level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  {vipLevels.map((level) => (
                    <SelectItem key={level.id} value={String(level.level)}>
                      {level.name} (Level {level.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gameRestrictions">Allowed Games (comma-separated slugs or IDs)</Label>
              <Input id="gameRestrictions" name="gameRestrictions" value={formData.gameRestrictions} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="promoCode">Bonus Code</Label>
              <Input id="promoCode" name="promoCode" value={formData.promoCode || ''} onChange={handleInputChange} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isActive" name="isActive" checked={formData.isActive} onCheckedChange={(checked) => handleSwitchChange("isActive", checked)} />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                {isEditMode ? "Update Bonus Template" : "Create Bonus Template"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VipBonusManagement;

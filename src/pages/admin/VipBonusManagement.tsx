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
import { BonusTemplate, BonusTemplateFormData, VipLevel } from "@/types";
import { getVipLevels, updateVipLevel, createVipLevel } from "@/services/apiService";
import VipLevelManager from "@/components/admin/VipLevelManager";
import { useToast } from "@/components/ui/use-toast";

const VipBonusManagement = () => {
  const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>([]);
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBonusTemplate, setSelectedBonusTemplate] =
    useState<BonusTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("bonus-templates");
  const { toast } = useToast();
  const [formData, setFormData] = useState<BonusTemplateFormData>({
    name: "",
    description: "",
    type: "",
    value: 0,
    wageringRequirement: 0,
    durationDays: 0,
    forVipLevels: [],
    isActive: true,
    bonusType: "deposit",
    amount: 0,
    wagering: 0,
    expiryDays: 0,
    percentage: 0,
    minDeposit: 0,
    maxBonus: 0,
    vipLevelRequired: 0,
    allowedGames: "",
    code: "",
  });

  useEffect(() => {
    // Mock bonus templates for demonstration
    const mockBonusTemplates: BonusTemplate[] = [
      {
        id: "1",
        name: "VIP Welcome Bonus",
        description: "Exclusive welcome bonus for VIP members",
        type: "deposit",
        value: 200,
        wageringRequirement: 30,
        durationDays: 30,
        forVipLevels: [5],
        isActive: true,
        bonusType: "deposit",
        amount: 200,
        wagering: 30,
        expiryDays: 30,
        percentage: 100,
        minDeposit: 50,
        maxBonus: 500,
        vipLevelRequired: 5,
        allowedGames: "slots",
        code: "VIPWELCOME",
      },
      {
        id: "2",
        name: "VIP Reload Bonus",
        description: "Weekly reload bonus for VIP members",
        type: "reload",
        value: 50,
        wageringRequirement: 25,
        durationDays: 7,
        forVipLevels: [3],
        isActive: true,
        bonusType: "reload",
        amount: 50,
        wagering: 25,
        expiryDays: 7,
        percentage: 50,
        minDeposit: 20,
        maxBonus: 200,
        vipLevelRequired: 3,
        allowedGames: "all",
        code: "VIPRELOAD",
      },
    ];

    setBonusTemplates(mockBonusTemplates);

    // Fetch VIP levels from API
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

  // Fix: Separate handlers for different input types to avoid TypeScript errors
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAllowedGamesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const allowedGames = e.target.value.split(",").map((game) => game.trim());
    setFormData((prevData) => ({
      ...prevData,
      allowedGames: e.target.value,
    }));
  };

  const handleVipLevelUpdate = async (updatedLevel: VipLevel) => {
    try {
      await updateVipLevel(updatedLevel);
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
      const createdLevel = await createVipLevel(newLevel);
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

    // Validate form data
    if (!formData.name || !formData.description) {
      alert("Name and description are required.");
      return;
    }

    if (formData.amount <= 0 && formData.percentage <= 0) {
      alert("Amount or percentage must be greater than zero.");
      return;
    }

    if (formData.wagering < 0) {
      alert("Wagering requirement cannot be negative.");
      return;
    }

    if (formData.expiryDays <= 0) {
      alert("Expiry days must be greater than zero.");
      return;
    }

    if (formData.minDeposit < 0) {
      alert("Minimum deposit cannot be negative.");
      return;
    }

    if (formData.maxBonus < 0) {
      alert("Maximum bonus cannot be negative.");
      return;
    }

    if (!formData.vipLevelRequired) {
      alert("VIP level is required.");
      return;
    }

    if (!formData.allowedGames) {
      alert("Allowed games are required.");
      return;
    }

    // Create or update bonus template
    const bonusTemplate: BonusTemplate = {
      id: isEditMode && selectedBonusTemplate ? selectedBonusTemplate.id : Date.now().toString(),
      name: formData.name,
      description: formData.description,
      type: formData.type || formData.bonusType || "deposit",
      value: formData.value || formData.amount || 0,
      wageringRequirement: formData.wageringRequirement || formData.wagering || 0,
      durationDays: formData.durationDays || formData.expiryDays || 0,
      forVipLevels: formData.forVipLevels || [Number(formData.vipLevelRequired) || 0],
      isActive: formData.isActive,
      bonusType: formData.bonusType,
      amount: formData.amount,
      wagering: formData.wagering,
      expiryDays: formData.expiryDays,
      percentage: formData.percentage,
      minDeposit: formData.minDeposit,
      maxBonus: formData.maxBonus,
      vipLevelRequired: formData.vipLevelRequired,
      allowedGames: formData.allowedGames,
      code: formData.code
    };

    // Create or update bonus template
    if (isEditMode && selectedBonusTemplate) {
      // Update existing bonus template
      const updatedBonusTemplates = bonusTemplates.map((template) =>
        template.id === selectedBonusTemplate.id
          ? bonusTemplate
          : template
      );
      setBonusTemplates(updatedBonusTemplates);
      toast({
        title: "Success",
        description: `Bonus template "${formData.name}" has been updated.`,
      });
    } else {
      // Create new bonus template
      setBonusTemplates([...bonusTemplates, bonusTemplate]);
      toast({
        title: "Success",
        description: `Bonus template "${formData.name}" has been created.`,
      });
    }

    // Reset form and close dialog
    setFormData({
      name: "",
      description: "",
      type: "",
      value: 0,
      wageringRequirement: 0,
      durationDays: 0,
      forVipLevels: [],
      isActive: true,
      bonusType: "deposit",
      amount: 0,
      wagering: 0,
      expiryDays: 0,
      percentage: 0,
      minDeposit: 0,
      maxBonus: 0,
      vipLevelRequired: 0,
      allowedGames: "",
      code: "",
    });
    setIsDialogOpen(false);
    setIsEditMode(false);
    setSelectedBonusTemplate(null);
  };

  const handleEdit = (bonusTemplate: BonusTemplate) => {
    setSelectedBonusTemplate(bonusTemplate);
    setIsEditMode(true);
    setIsDialogOpen(true);
    setFormData({
      name: bonusTemplate.name,
      description: bonusTemplate.description,
      type: bonusTemplate.type || "",
      value: bonusTemplate.value,
      wageringRequirement: bonusTemplate.wageringRequirement,
      durationDays: bonusTemplate.durationDays,
      forVipLevels: bonusTemplate.forVipLevels,
      isActive: bonusTemplate.isActive,
      bonusType: bonusTemplate.bonusType || "deposit",
      amount: bonusTemplate.amount || 0,
      wagering: bonusTemplate.wagering || 0,
      expiryDays: bonusTemplate.expiryDays || 0,
      percentage: bonusTemplate.percentage || 0,
      minDeposit: bonusTemplate.minDeposit || 0,
      maxBonus: bonusTemplate.maxBonus || 0,
      vipLevelRequired: bonusTemplate.vipLevelRequired || 0,
      allowedGames: bonusTemplate.allowedGames || "",
      code: bonusTemplate.code || "",
    });
  };

  const handleDelete = (bonusTemplateId: string) => {
    const updatedBonusTemplates = bonusTemplates.filter(
      (template) => template.id !== bonusTemplateId
    );
    setBonusTemplates(updatedBonusTemplates);
    toast({
      title: "Bonus Template Deleted",
      description: "The bonus template has been successfully deleted.",
    });
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setIsEditMode(false);
    setSelectedBonusTemplate(null);
    setFormData({
      name: "",
      description: "",
      type: "",
      value: 0,
      wageringRequirement: 0,
      durationDays: 0,
      forVipLevels: [],
      isActive: true,
      bonusType: "deposit",
      amount: 0,
      wagering: 0,
      expiryDays: 0,
      percentage: 0,
      minDeposit: 0,
      maxBonus: 0,
      vipLevelRequired: 0,
      allowedGames: "",
      code: "",
    });
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
                    <TableHead>Description</TableHead>
                    <TableHead>Bonus Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Wagering</TableHead>
                    <TableHead>Expiry Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonusTemplates.map((bonusTemplate) => (
                    <TableRow key={bonusTemplate.id}>
                      <TableCell className="font-medium">{bonusTemplate.name}</TableCell>
                      <TableCell>{bonusTemplate.description}</TableCell>
                      <TableCell>{bonusTemplate.bonusType}</TableCell>
                      <TableCell>{bonusTemplate.amount}</TableCell>
                      <TableCell>{bonusTemplate.wagering}</TableCell>
                      <TableCell>{bonusTemplate.expiryDays}</TableCell>
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
            vipLevels={vipLevels} 
            onUpdateVipLevel={handleVipLevelUpdate}
            onCreateVipLevel={handleVipLevelCreate}
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
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="bonusType">Bonus Type</Label>
              <Select
                value={formData.bonusType}
                onValueChange={(value) => handleSelectChange("bonusType", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a bonus type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="reload">Reload</SelectItem>
                  <SelectItem value="cashback">Cashback</SelectItem>
                  <SelectItem value="free_spins">Free Spins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="percentage">Percentage</Label>
              <Input
                type="number"
                id="percentage"
                name="percentage"
                value={formData.percentage}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="wagering">Wagering Requirement</Label>
              <Input
                type="number"
                id="wagering"
                name="wagering"
                value={formData.wagering}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="expiryDays">Expiry Days</Label>
              <Input
                type="number"
                id="expiryDays"
                name="expiryDays"
                value={formData.expiryDays}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="minDeposit">Minimum Deposit</Label>
              <Input
                type="number"
                id="minDeposit"
                name="minDeposit"
                value={formData.minDeposit}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="maxBonus">Maximum Bonus</Label>
              <Input
                type="number"
                id="maxBonus"
                name="maxBonus"
                value={formData.maxBonus}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="vipLevelRequired">VIP Level Required</Label>
              <Select
                value={String(formData.vipLevelRequired)}
                onValueChange={(value) =>
                  handleSelectChange("vipLevelRequired", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a VIP level" />
                </SelectTrigger>
                <SelectContent>
                  {vipLevels.map((level) => (
                    <SelectItem key={String(level.id)} value={String(level.id)}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="allowedGames">Allowed Games (comma-separated)</Label>
              <Input
                type="text"
                id="allowedGames"
                name="allowedGames"
                value={formData.allowedGames}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Bonus Code</Label>
              <Input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prevData) => ({ ...prevData, isActive: checked }))
                }
              />
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

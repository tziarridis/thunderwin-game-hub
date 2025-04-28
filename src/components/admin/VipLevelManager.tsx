import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Edit, Trash, Award, Star, Trophy, Gift } from "lucide-react";
import { VipLevel } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface VipLevelManagerProps {
  vipLevels: VipLevel[];
  onUpdateVipLevel: (vipLevel: VipLevel) => Promise<void>;
  onCreateVipLevel: (vipLevel: Omit<VipLevel, "id">) => Promise<void>;
}

const VipLevelManager: React.FC<VipLevelManagerProps> = ({
  vipLevels,
  onUpdateVipLevel,
  onCreateVipLevel,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedVipLevel, setSelectedVipLevel] = useState<VipLevel | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Omit<VipLevel, "id">>({
    name: "",
    requirements: "",
    benefits: [],
    cashbackRate: 0,
    withdrawalLimit: 0,
    personalManager: false,
    customGifts: false,
    specialPromotions: false,
    level: 0,
    pointsRequired: 0,
    color: "#000000",
    bonuses: {
      depositMatch: 0,
      freeSpins: 0,
      birthdayBonus: 0
    }
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? parseFloat(value) : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleBenefitsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const benefitsArray = e.target.value.split('\n').filter(benefit => benefit.trim() !== '');
    setFormData((prev) => ({
      ...prev,
      benefits: benefitsArray,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setIsEditMode(false);
    setSelectedVipLevel(null);
    setFormData({
      name: "",
      requirements: "",
      benefits: [],
      cashbackRate: 0,
      withdrawalLimit: 0,
      personalManager: false,
      customGifts: false,
      specialPromotions: false,
      level: vipLevels.length + 1,
      pointsRequired: 0,
      color: "#000000",
      bonuses: {
        depositMatch: 0,
        freeSpins: 0,
        birthdayBonus: 0
      }
    });
  };

  const handleEdit = (vipLevel: VipLevel) => {
    setSelectedVipLevel(vipLevel);
    setIsEditMode(true);
    setIsDialogOpen(true);
    
    setFormData({
      name: vipLevel.name,
      requirements: vipLevel.requirements || "",
      benefits: vipLevel.benefits || [],
      cashbackRate: vipLevel.cashbackRate,
      withdrawalLimit: vipLevel.withdrawalLimit,
      personalManager: vipLevel.personalManager || false,
      customGifts: vipLevel.customGifts || false,
      specialPromotions: vipLevel.specialPromotions || false,
      level: vipLevel.level || 0,
      pointsRequired: vipLevel.pointsRequired || 0,
      color: vipLevel.color || "#000000",
      bonuses: vipLevel.bonuses || {
        depositMatch: 0,
        freeSpins: 0,
        birthdayBonus: 0
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode && selectedVipLevel) {
        await onUpdateVipLevel({
          ...formData,
          id: selectedVipLevel.id,
        });
      } else {
        await onCreateVipLevel(formData);
      }
      
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error("Error saving VIP level:", error);
      toast({
        title: "Error",
        description: "Failed to save VIP level. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getBenefitsList = (vipLevel: VipLevel): string => {
    if (!vipLevel.benefits || vipLevel.benefits.length === 0) {
      return "None";
    }
    
    if (typeof vipLevel.benefits === 'string') {
      return vipLevel.benefits;
    }
    
    return vipLevel.benefits.join(", ");
  };

  const getVipLevelColor = (vipLevel: VipLevel): string => {
    return vipLevel.color || "#6B7280";
  };

  return (
    <>
      <Card className="shadow-md rounded-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            VIP Levels Management
          </CardTitle>
          <Button onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add VIP Level
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              A list of all VIP levels in the casino system.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Points Required</TableHead>
                <TableHead>Cashback Rate</TableHead>
                <TableHead>Withdrawal Limit</TableHead>
                <TableHead>Benefits</TableHead>
                <TableHead>Special Features</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vipLevels.map((vipLevel) => (
                <TableRow key={vipLevel.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: getVipLevelColor(vipLevel) }}
                      ></div>
                      {vipLevel.level || 0}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{vipLevel.name}</TableCell>
                  <TableCell>{vipLevel.pointsRequired || vipLevel.requiredPoints || 0}</TableCell>
                  <TableCell>{(vipLevel.cashbackRate * 100).toFixed(1)}%</TableCell>
                  <TableCell>${vipLevel.withdrawalLimit.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={getBenefitsList(vipLevel)}>
                      {getBenefitsList(vipLevel)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {vipLevel.personalManager && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Personal Manager</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {vipLevel.customGifts && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Gift className="h-4 w-4 text-purple-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Custom Gifts</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {vipLevel.specialPromotions && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Star className="h-4 w-4 text-blue-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Special Promotions</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(vipLevel)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit VIP Level" : "Create New VIP Level"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the VIP level details and benefits"
                : "Create a new VIP level with custom benefits"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">VIP Level Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="level">Level Number</Label>
                <Input
                  id="level"
                  name="level"
                  type="number"
                  value={formData.level || 0}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pointsRequired">Points Required</Label>
                <Input
                  id="pointsRequired"
                  name="pointsRequired"
                  type="number"
                  value={formData.pointsRequired || 0}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="color">Level Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color || "#000000"}
                    onChange={handleFormChange}
                    className="w-16"
                  />
                  <Input
                    type="text"
                    value={formData.color || "#000000"}
                    onChange={handleFormChange}
                    name="color"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cashbackRate">Cashback Rate (%)</Label>
                <Input
                  id="cashbackRate"
                  name="cashbackRate"
                  type="number"
                  step="0.1"
                  max="100"
                  value={formData.cashbackRate * 100}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      cashbackRate: parseFloat(e.target.value) / 100
                    }));
                  }}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="withdrawalLimit">Withdrawal Limit ($)</Label>
                <Input
                  id="withdrawalLimit"
                  name="withdrawalLimit"
                  type="number"
                  step="1000"
                  value={formData.withdrawalLimit}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Input
                id="requirements"
                name="requirements"
                value={formData.requirements || ""}
                onChange={handleFormChange}
              />
            </div>
            
            <div>
              <Label htmlFor="benefits">Benefits (one per line)</Label>
              <textarea
                id="benefits"
                className="w-full min-h-24 p-2 border rounded-md"
                value={Array.isArray(formData.benefits) ? formData.benefits.join('\n') : formData.benefits}
                onChange={handleBenefitsChange}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="personalManager"
                  checked={formData.personalManager || false}
                  onCheckedChange={(checked) => handleSwitchChange("personalManager", checked)}
                />
                <Label htmlFor="personalManager">Personal Manager</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="customGifts"
                  checked={formData.customGifts || false}
                  onCheckedChange={(checked) => handleSwitchChange("customGifts", checked)}
                />
                <Label htmlFor="customGifts">Custom Gifts</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="specialPromotions"
                  checked={formData.specialPromotions || false}
                  onCheckedChange={(checked) => handleSwitchChange("specialPromotions", checked)}
                />
                <Label htmlFor="specialPromotions">Special Promotions</Label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit">
                {isEditMode ? "Update VIP Level" : "Create VIP Level"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VipLevelManager;

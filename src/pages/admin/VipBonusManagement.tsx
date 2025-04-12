import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PlusCircle, Loader2, Star, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VipLevel, BonusTemplate, BonusType } from "@/types";

const VipBonusManagement = () => {
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>([]);
  const [isVipDialogOpen, setIsVipDialogOpen] = useState(false);
  const [isBonusDialogOpen, setIsBonusDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVipId, setEditingVipId] = useState<string | null>(null);
  const [editingBonusId, setEditingBonusId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    requiredPoints: "",
    cashbackPercent: "",
    withdrawalLimit: "",
    depositBonusPercent: "",
    color: "",
    icon: "",
    description: "",
    type: "deposit" as BonusType,
    amount: "",
    percentage: "",
    minDeposit: "",
    maxBonus: "",
    wagering: "",
    expiryDays: "",
    vipLevelRequired: "",
    code: "",
    allowedGames: ""
  });
  
  useEffect(() => {
    // Load VIP levels from localStorage
    const storedVipLevels = localStorage.getItem('vipLevels');
    if (storedVipLevels) {
      setVipLevels(JSON.parse(storedVipLevels));
    } else {
      // Initialize with default VIP levels if none exist
      const defaultVipLevels: VipLevel[] = [
        {
          id: 1,
          name: "Bronze",
          level: 1,
          pointsRequired: 0,
          cashbackRate: 0.05,
          withdrawalLimit: 5000,
          personalManager: false,
          customGifts: false,
          specialPromotions: false,
          requirements: "Reach 0 points to unlock",
          benefits: ["5% Cashback", "Standard Support"],
          color: "#CD7F32",
          icon: "🥉",
          cashbackPercent: 5,
          depositBonus: 10,
          depositBonusPercent: 10,
          requiredPoints: 0
        },
        {
          id: 2,
          name: "Silver",
          level: 2,
          pointsRequired: 1000,
          cashbackRate: 0.10,
          withdrawalLimit: 10000,
          personalManager: false,
          customGifts: false,
          specialPromotions: true,
          requirements: "Reach 1000 points to unlock",
          benefits: ["10% Cashback", "Priority Support", "Special Promotions"],
          color: "#C0C0C0",
          icon: "🥈",
          cashbackPercent: 10,
          depositBonus: 20,
          depositBonusPercent: 20,
          requiredPoints: 1000
        },
        {
          id: 3,
          name: "Gold",
          level: 3,
          pointsRequired: 5000,
          cashbackRate: 0.15,
          withdrawalLimit: 20000,
          personalManager: true,
          customGifts: false,
          specialPromotions: true,
          requirements: "Reach 5000 points to unlock",
          benefits: ["15% Cashback", "Dedicated Support", "Exclusive Gifts"],
          color: "#FFD700",
          icon: "🥇",
          cashbackPercent: 15,
          depositBonus: 30,
          depositBonusPercent: 30,
          requiredPoints: 5000
        }
      ];
      setVipLevels(defaultVipLevels);
      localStorage.setItem('vipLevels', JSON.stringify(defaultVipLevels));
    }
    
    // Load bonus templates from localStorage
    const storedBonusTemplates = localStorage.getItem('bonusTemplates');
    if (storedBonusTemplates) {
      setBonusTemplates(JSON.parse(storedBonusTemplates));
    }
  }, []);
  
  useEffect(() => {
    // Save VIP levels to localStorage whenever they change
    if (vipLevels.length > 0) {
      localStorage.setItem('vipLevels', JSON.stringify(vipLevels));
    }
    
    // Save bonus templates to localStorage whenever they change
    if (bonusTemplates.length > 0) {
      localStorage.setItem('bonusTemplates', JSON.stringify(bonusTemplates));
    }
  }, [vipLevels, bonusTemplates]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmitVip = (id?: string) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const vipLevel: VipLevel = {
        id: Number(id || Date.now()),
        name: formData.name,
        level: Number(formData.level),
        pointsRequired: Number(formData.requiredPoints),
        cashbackRate: Number(formData.cashbackPercent),
        withdrawalLimit: Number(formData.withdrawalLimit),
        depositBonus: Number(formData.depositBonusPercent),
        color: formData.color,
        icon: formData.icon,
		requirements: `Requires ${formData.requiredPoints} points to unlock`, // Add required field
        benefits: [`${formData.cashbackPercent}% Cashback`, `${formData.depositBonusPercent}% Deposit Bonus`], // Add required field
        personalManager: Number(formData.level) >= 5, // Add required field
        customGifts: Number(formData.level) >= 7, // Add required field
        specialPromotions: Number(formData.level) >= 3 // Add required field
      };
      
      if (editingVipId) {
        // Update existing VIP level
        setVipLevels(prev => 
          prev.map(vip => 
            vip.id === Number(editingVipId) ? vipLevel : vip
          )
        );
        toast.success("VIP level updated successfully");
      } else {
        // Add new VIP level
        setVipLevels(prev => [...prev, vipLevel]);
        toast.success("VIP level added successfully");
      }
      
      setFormData({
        name: "",
        level: "",
        requiredPoints: "",
        cashbackPercent: "",
        withdrawalLimit: "",
        depositBonusPercent: "",
        color: "",
        icon: "",
        description: "",
        type: "deposit" as BonusType,
        amount: "",
        percentage: "",
        minDeposit: "",
        maxBonus: "",
        wagering: "",
        expiryDays: "",
        vipLevelRequired: "",
        code: "",
        allowedGames: ""
      });
      setEditingVipId(null);
      setIsSubmitting(false);
      setIsVipDialogOpen(false);
    }, 500);
  };
  
  const handleSubmitBonus = (id?: string) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const bonusTemplate: BonusTemplate = {
        id: id || `${Date.now()}`,
        name: formData.name,
        description: formData.description,
        bonusType: formData.type, // Make sure to include this
		type: formData.type, // For compatibility
        amount: Number(formData.amount),
        percentage: Number(formData.percentage),
        minDeposit: Number(formData.minDeposit),
        maxBonus: Number(formData.maxBonus),
        wagering: Number(formData.wagering),
        expiryDays: Number(formData.expiryDays),
        vipLevelRequired: Number(formData.vipLevelRequired),
        isActive: true,
        code: formData.code,
        allowedGames: formData.allowedGames.split(',').map(game => game.trim()), // Make sure this is string[]
		createdAt: new Date().toISOString()
      };
      
      if (editingBonusId) {
        // Update existing bonus template
        setBonusTemplates(prev => 
          prev.map(bonus => 
            bonus.id === editingBonusId ? bonusTemplate : bonus
          )
        );
        toast.success("Bonus template updated successfully");
      } else {
        // Add new bonus template
        setBonusTemplates(prev => [...prev, bonusTemplate]);
        toast.success("Bonus template added successfully");
      }
      
      setFormData({
        name: "",
        level: "",
        requiredPoints: "",
        cashbackPercent: "",
        withdrawalLimit: "",
        depositBonusPercent: "",
        color: "",
        icon: "",
        description: "",
        type: "deposit" as BonusType,
        amount: "",
        percentage: "",
        minDeposit: "",
        maxBonus: "",
        wagering: "",
        expiryDays: "",
        vipLevelRequired: "",
        code: "",
        allowedGames: ""
      });
      setEditingBonusId(null);
      setIsSubmitting(false);
      setIsBonusDialogOpen(false);
    }, 500);
  };
  
  const handleEditVip = (vip: VipLevel) => {
    setFormData({
      name: vip.name,
      level: vip.level?.toString() || "",
      requiredPoints: vip.pointsRequired?.toString() || "",
      cashbackPercent: vip.cashbackRate?.toString() || "",
      withdrawalLimit: vip.withdrawalLimit?.toString() || "",
      depositBonusPercent: vip.depositBonus?.toString() || "",
      color: vip.color || "",
      icon: vip.icon || "",
      description: "",
      type: "deposit" as BonusType,
      amount: "",
      percentage: "",
      minDeposit: "",
      maxBonus: "",
      wagering: "",
      expiryDays: "",
      vipLevelRequired: "",
      code: "",
      allowedGames: ""
    });
    setEditingVipId(vip.id.toString());
    setIsVipDialogOpen(true);
  };
  
  const handleEditBonus = (bonus: BonusTemplate) => {
    setFormData({
      name: bonus.name,
      description: bonus.description,
      type: bonus.bonusType,
      amount: bonus.amount.toString(),
      percentage: bonus.percentage?.toString() || "",
      minDeposit: bonus.minDeposit?.toString() || "",
      maxBonus: bonus.maxBonus?.toString() || "",
      wagering: bonus.wagering.toString(),
      expiryDays: bonus.expiryDays.toString(),
      vipLevelRequired: bonus.vipLevelRequired?.toString() || "",
      code: bonus.code || "",
      allowedGames: bonus.allowedGames?.join(',') || "",
      level: "",
      requiredPoints: "",
      cashbackPercent: "",
      withdrawalLimit: "",
      depositBonusPercent: "",
      color: "",
      icon: ""
    });
    setEditingBonusId(bonus.id);
    setIsBonusDialogOpen(true);
  };
  
  const handleDeleteVip = (id: number) => {
    if (confirm("Are you sure you want to delete this VIP level?")) {
      setVipLevels(prev => prev.filter(vip => vip.id !== id));
      toast.success("VIP level deleted successfully");
    }
  };
  
  const handleDeleteBonus = (id: string) => {
    if (confirm("Are you sure you want to delete this bonus template?")) {
      setBonusTemplates(prev => prev.filter(bonus => bonus.id !== id));
      toast.success("Bonus template deleted successfully");
    }
  };
  
  const isVipLevelEligible = (userVipLevel: number, requiredLevel: number) => 
  userVipLevel >= requiredLevel;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">VIP Levels</h1>
          <p className="text-gray-500">Manage VIP levels and their benefits</p>
        </div>
        
        <Dialog open={isVipDialogOpen} onOpenChange={setIsVipDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setFormData({
                name: "",
                level: "",
                requiredPoints: "",
                cashbackPercent: "",
                withdrawalLimit: "",
                depositBonusPercent: "",
                color: "",
                icon: "",
                description: "",
                type: "deposit" as BonusType,
                amount: "",
                percentage: "",
                minDeposit: "",
                maxBonus: "",
                wagering: "",
                expiryDays: "",
                vipLevelRequired: "",
                code: "",
                allowedGames: ""
              });
              setEditingVipId(null);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add VIP Level
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVipId ? "Edit VIP Level" : "Add New VIP Level"}</DialogTitle>
              <DialogDescription>
                Fill in the details to {editingVipId ? "update the" : "create a new"} VIP level.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Gold"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="level">Level (1-10)</Label>
                  <Input
                    id="level"
                    name="level"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.level}
                    onChange={handleInputChange}
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="requiredPoints">Required Points</Label>
                  <Input
                    id="requiredPoints"
                    name="requiredPoints"
                    type="number"
                    min="0"
                    value={formData.requiredPoints}
                    onChange={handleInputChange}
                    placeholder="e.g. 5000"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="cashbackPercent">Cashback (%)</Label>
                  <Input
                    id="cashbackPercent"
                    name="cashbackPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.cashbackPercent}
                    onChange={handleInputChange}
                    placeholder="e.g. 15"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="withdrawalLimit">Withdrawal Limit</Label>
                  <Input
                    id="withdrawalLimit"
                    name="withdrawalLimit"
                    type="number"
                    min="0"
                    value={formData.withdrawalLimit}
                    onChange={handleInputChange}
                    placeholder="e.g. 20000"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="depositBonusPercent">Deposit Bonus (%)</Label>
                  <Input
                    id="depositBonusPercent"
                    name="depositBonusPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.depositBonusPercent}
                    onChange={handleInputChange}
                    placeholder="e.g. 30"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="e.g. 🥇"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={() => handleSubmitVip(editingVipId)} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingVipId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingVipId ? "Update VIP Level" : "Create VIP Level"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vipLevels.map(vip => (
          <Card key={vip.id} className="bg-muted">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">{vip.icon}</span>
                {vip.name} (Level {vip.level})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Requires: {vip.pointsRequired} points</p>
              <p>Cashback: {vip.cashbackRate}%</p>
              <p>Withdrawal Limit: ${vip.withdrawalLimit}</p>
              <p>Deposit Bonus: {vip.depositBonus}%</p>
            </CardContent>
            <div className="flex justify-end space-x-2 p-4">
              <Button variant="outline" size="sm" onClick={() => handleEditVip(vip)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteVip(vip.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-12 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bonus Templates</h1>
          <p className="text-gray-500">Manage bonus templates for promotions</p>
        </div>
        
        <Dialog open={isBonusDialogOpen} onOpenChange={setIsBonusDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setFormData({
                name: "",
                level: "",
                requiredPoints: "",
                cashbackPercent: "",
                withdrawalLimit: "",
                depositBonusPercent: "",
                color: "",
                icon: "",
                description: "",
                type: "deposit" as BonusType,
                amount: "",
                percentage: "",
                minDeposit: "",
                maxBonus: "",
                wagering: "",
                expiryDays: "",
                vipLevelRequired: "",
                code: "",
                allowedGames: ""
              });
              setEditingBonusId(null);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Bonus Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBonusId ? "Edit Bonus Template" : "Add New Bonus Template"}</DialogTitle>
              <DialogDescription>
                Fill in the details to {editingBonusId ? "update the" : "create a new"} bonus template.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Welcome Bonus"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the bonus"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="type">Bonus Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="free_spins">Free Spins</SelectItem>
                      <SelectItem value="cashback">Cashback</SelectItem>
                      <SelectItem value="no_deposit">No Deposit</SelectItem>
                      <SelectItem value="reload">Reload</SelectItem>
                      <SelectItem value="loyalty">Loyalty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="e.g. 100"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="percentage">Percentage (%)</Label>
                  <Input
                    id="percentage"
                    name="percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.percentage}
                    onChange={handleInputChange}
                    placeholder="e.g. 100"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="minDeposit">Min Deposit</Label>
                  <Input
                    id="minDeposit"
                    name="minDeposit"
                    type="number"
                    min="0"
                    value={formData.minDeposit}
                    onChange={handleInputChange}
                    placeholder="e.g. 20"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="maxBonus">Max Bonus</Label>
                  <Input
                    id="maxBonus"
                    name="maxBonus"
                    type="number"
                    min="0"
                    value={formData.maxBonus}
                    onChange={handleInputChange}
                    placeholder="e.g. 200"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="wagering">Wagering</Label>
                  <Input
                    id="wagering"
                    name="wagering"
                    type="number"
                    min="0"
                    value={formData.wagering}
                    onChange={handleInputChange}
                    placeholder="e.g. 35"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="expiryDays">Expiry Days</Label>
                  <Input
                    id="expiryDays"
                    name="expiryDays"
                    type="number"
                    min="1"
                    value={formData.expiryDays}
                    onChange={handleInputChange}
                    placeholder="e.g. 30"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="vipLevelRequired">VIP Level Required</Label>
                  <Input
                    id="vipLevelRequired"
                    name="vipLevelRequired"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.vipLevelRequired}
                    onChange={handleInputChange}
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="code">Bonus Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g. WELCOME100"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="allowedGames">Allowed Games (comma separated)</Label>
                <Input
                  id="allowedGames"
                  name="allowedGames"
                  value={formData.allowedGames}
                  onChange={handleInputChange}
                  placeholder="e.g. slots, table games"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={() => handleSubmitBonus(editingBonusId)} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingBonusId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingBonusId ? "Update Bonus Template" : "Create Bonus Template"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bonusTemplates.map(bonus => (
          <Card key={bonus.id} className="bg-muted">
            <CardHeader>
              <CardTitle>{bonus.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{bonus.description}</p>
              <p>Type: {bonus.bonusType}</p>
              <p>Amount: {bonus.amount}</p>
              <p>Wagering: {bonus.wagering}</p>
              {bonus.vipLevelRequired && (
                <p>VIP Level Required: {bonus.vipLevelRequired}</p>
              )}
              {isVipLevelEligible(5, Number(bonus.vipLevelRequired)) ? (
                <p className="text-green-500">Eligible for VIP Level 5</p>
              ) : (
                <p className="text-red-500">Not eligible for VIP Level 5</p>
              )}
            </CardContent>
            <div className="flex justify-end space-x-2 p-4">
              <Button variant="outline" size="sm" onClick={() => handleEditBonus(bonus)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteBonus(bonus.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VipBonusManagement;

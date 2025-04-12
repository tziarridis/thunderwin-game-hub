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
import { PlusCircle, Loader2, BarChart, Users, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VipLevel, BonusTemplate, BonusType } from "@/types";

const VipBonusManagement = () => {
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>([]);

  const [isVipDialogOpen, setIsVipDialogOpen] = useState(false);
  const [isBonusDialogOpen, setIsBonusDialogOpen] = useState(false);

  const [vipForm, setVipForm] = useState({
    name: "",
    level: "",
    pointsRequired: "",
    cashbackRate: "",
    depositBonus: "",
    withdrawalLimit: "",
    birthdayBonus: "",
    weeklyBonus: "",
    dedicated: "false",
    fastWithdrawals: "false",
    color: "",
    icon: ""
  });

  const [bonusForm, setBonusForm] = useState({
    name: "",
    description: "",
    type: "deposit",
    amount: "",
    percentage: "",
    minDeposit: "",
    maxBonus: "",
    wagering: "",
    expiryDays: "",
    vipLevelRequired: "",
    allowedGames: "",
    code: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [editingVipId, setEditingVipId] = useState<string | null>(null);
  const [editingBonusId, setEditingBonusId] = useState<string | null>(null);

  useEffect(() => {
    const storedVipLevels = localStorage.getItem('vipLevels');
    if (storedVipLevels) {
      setVipLevels(JSON.parse(storedVipLevels));
    } else {
      const defaultVipLevels = [
        {
          id: "level-1",
          name: "Bronze",
          level: 1,
          requiredPoints: 0,
          pointsRequired: 0,
          cashbackPercent: 5,
          cashbackRate: 5,
          depositBonusPercent: 10,
          depositBonus: 10,
          withdrawalLimit: 5000,
          birthdayBonus: 50,
          weeklyBonus: 10,
          dedicated: false,
          fastWithdrawals: false,
          exclusivePromos: false,
          specialEvents: false,
          customizedOffers: false,
          benefits: ["Standard Support"],
          color: "#CD7F32",
          icon: "bronze"
        },
        {
          id: "level-2",
          name: "Silver",
          level: 2,
          requiredPoints: 1000,
          pointsRequired: 1000,
          cashbackPercent: 7.5,
          cashbackRate: 7.5,
          depositBonusPercent: 15,
          depositBonus: 15,
          withdrawalLimit: 7500,
          birthdayBonus: 75,
          weeklyBonus: 15,
          dedicated: false,
          fastWithdrawals: false,
          exclusivePromos: false,
          specialEvents: false,
          customizedOffers: false,
          benefits: ["Priority Support"],
          color: "#C0C0C0",
          icon: "silver"
        }
      ];
      setVipLevels(defaultVipLevels);
      localStorage.setItem('vipLevels', JSON.stringify(defaultVipLevels));
    }

    const storedBonusTemplates = localStorage.getItem('bonusTemplates');
    if (storedBonusTemplates) {
      setBonusTemplates(JSON.parse(storedBonusTemplates));
    } else {
      const defaultBonusTemplates = [
        {
          id: "bonus-1",
          name: "Welcome Bonus",
          description: "Get 100% bonus on your first deposit",
          type: "deposit" as BonusType,
          amount: 100,
          percentage: 100,
          minDeposit: 20,
          maxBonus: 200,
          wagering: 35,
          expiryDays: 7,
          vipLevelRequired: 1,
          allowedGames: "All Slots",
          active: true,
          isActive: true,
          code: "WELCOME100",
          createdAt: new Date().toISOString()
        },
        {
          id: "bonus-2",
          name: "Weekly Cashback",
          description: "Get 10% cashback on your weekly losses",
          type: "cashback" as BonusType,
          amount: 10,
          percentage: 10,
          minDeposit: 0,
          maxBonus: 100,
          wagering: 10,
          expiryDays: 7,
          vipLevelRequired: 2,
          allowedGames: "All Games",
          active: true,
          isActive: true,
          code: "WEEKLYCASH",
          createdAt: new Date().toISOString()
        }
      ];
      setBonusTemplates(defaultBonusTemplates);
      localStorage.setItem('bonusTemplates', JSON.stringify(defaultBonusTemplates));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vipLevels', JSON.stringify(vipLevels));
  }, [vipLevels]);

  useEffect(() => {
    localStorage.setItem('bonusTemplates', JSON.stringify(bonusTemplates));
  }, [bonusTemplates]);

  const handleVipInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVipForm({ ...vipForm, [name]: value });
  };

  const handleBonusInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBonusForm({ ...bonusForm, [name]: value });
  };

  const handleVipSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      const { name, level, pointsRequired, cashbackRate, depositBonus, withdrawalLimit, birthdayBonus, weeklyBonus, dedicated, fastWithdrawals, color, icon } = vipForm;

      if (editingVipId) {
        // Update existing VIP level
        setVipLevels(prev =>
          prev.map(vip =>
            vip.id === editingVipId
              ? { ...vip, name, level: parseInt(level), requiredPoints: parseInt(pointsRequired), pointsRequired: parseInt(pointsRequired), cashbackPercent: parseFloat(cashbackRate), cashbackRate: parseFloat(cashbackRate), depositBonusPercent: parseFloat(depositBonus), depositBonus: parseFloat(depositBonus), withdrawalLimit: parseFloat(withdrawalLimit), birthdayBonus: parseFloat(birthdayBonus), weeklyBonus: parseFloat(weeklyBonus), dedicated: dedicated === "true", fastWithdrawals: fastWithdrawals === "true", color, icon }
              : vip
          )
        );
        toast.success("VIP Level updated successfully");
      } else {
        // Create new VIP level
        const newVipLevel = {
          id: `level-${Date.now()}`,
          name: name,
          level: parseInt(level),
          requiredPoints: parseInt(pointsRequired),
          pointsRequired: parseInt(pointsRequired),
          cashbackPercent: parseFloat(cashbackRate),
          cashbackRate: parseFloat(cashbackRate),
          depositBonusPercent: parseFloat(depositBonus),
          depositBonus: parseFloat(depositBonus),
          withdrawalLimit: parseFloat(withdrawalLimit),
          birthdayBonus: parseFloat(birthdayBonus),
          weeklyBonus: parseFloat(weeklyBonus),
          dedicated: dedicated === "true",
          fastWithdrawals: fastWithdrawals === "true",
          exclusivePromos: true,
          specialEvents: true,
          customizedOffers: true,
          benefits: ["Priority Support", "Exclusive Promotions", "Higher Limits"],
          color: color,
          icon: icon || "crown"
        };
        setVipLevels(prev => [...prev, newVipLevel]);
        toast.success("VIP Level created successfully");
      }

      setVipForm({
        name: "",
        level: "",
        pointsRequired: "",
        cashbackRate: "",
        depositBonus: "",
        withdrawalLimit: "",
        birthdayBonus: "",
        weeklyBonus: "",
        dedicated: "false",
        fastWithdrawals: "false",
        color: "",
        icon: ""
      });
      setEditingVipId(null);
      setIsVipDialogOpen(false);
      setIsLoading(false);
    }, 500);
  };

  const handleBonusSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      const { name, description, type, amount, percentage, minDeposit, maxBonus, wagering, expiryDays, vipLevelRequired, allowedGames, code } = bonusForm;

      if (editingBonusId) {
        // Update existing bonus template
        setBonusTemplates(prev =>
          prev.map(bonus =>
            bonus.id === editingBonusId
              ? { ...bonus, name, description, type: type as BonusType, amount: parseFloat(amount), percentage: parseFloat(percentage), minDeposit: parseFloat(minDeposit), maxBonus: parseFloat(maxBonus), wagering: parseFloat(wagering), expiryDays: parseInt(expiryDays), vipLevelRequired: parseInt(vipLevelRequired), allowedGames, code }
              : bonus
          )
        );
        toast.success("Bonus Template updated successfully");
      } else {
        // Create new bonus template
        const newTemplate = {
          id: `bonus-${Date.now()}`,
          name: name,
          description: description,
          type: type as BonusType, // Ensure it's cast to BonusType
          amount: parseFloat(amount),
          percentage: parseFloat(percentage),
          minDeposit: parseFloat(minDeposit),
          maxBonus: parseFloat(maxBonus),
          wagering: parseFloat(wagering),
          expiryDays: parseInt(expiryDays),
          vipLevelRequired: parseInt(vipLevelRequired),
          allowedGames: allowedGames,
          active: true,
          isActive: true,
          code: code,
          createdAt: new Date().toISOString()
        };
        setBonusTemplates(prev => [...prev, newTemplate]);
        toast.success("Bonus Template created successfully");
      }

      setBonusForm({
        name: "",
        description: "",
        type: "deposit",
        amount: "",
        percentage: "",
        minDeposit: "",
        maxBonus: "",
        wagering: "",
        expiryDays: "",
        vipLevelRequired: "",
        allowedGames: "",
        code: ""
      });
      setEditingBonusId(null);
      setIsBonusDialogOpen(false);
      setIsLoading(false);
    }, 500);
  };

  const handleEditVip = (vip: VipLevel) => {
    setVipForm({
      name: vip.name,
      level: vip.level.toString(),
      pointsRequired: vip.pointsRequired.toString(),
      cashbackRate: vip.cashbackRate.toString(),
      depositBonus: vip.depositBonus.toString(),
      withdrawalLimit: vip.withdrawalLimit.toString(),
      birthdayBonus: vip.birthdayBonus.toString(),
      weeklyBonus: vip.weeklyBonus.toString(),
      dedicated: vip.dedicated.toString(),
      fastWithdrawals: vip.fastWithdrawals.toString(),
      color: vip.color,
      icon: vip.icon
    });
    setEditingVipId(vip.id);
    setIsVipDialogOpen(true);
  };

  const handleEditBonus = (bonus: BonusTemplate) => {
    setBonusForm({
      name: bonus.name,
      description: bonus.description,
      type: bonus.type,
      amount: bonus.amount.toString(),
      percentage: bonus.percentage.toString(),
      minDeposit: bonus.minDeposit.toString(),
      maxBonus: bonus.maxBonus.toString(),
      wagering: bonus.wagering.toString(),
      expiryDays: bonus.expiryDays.toString(),
      vipLevelRequired: bonus.vipLevelRequired.toString(),
      allowedGames: bonus.allowedGames,
      code: bonus.code
    });
    setEditingBonusId(bonus.id);
    setIsBonusDialogOpen(true);
  };

  const handleDeleteVip = (id: string) => {
    if (confirm("Are you sure you want to delete this VIP Level?")) {
      setVipLevels(prev => prev.filter(vip => vip.id !== id));
      toast.success("VIP Level deleted successfully");
    }
  };

  const handleDeleteBonus = (id: string) => {
    if (confirm("Are you sure you want to delete this Bonus Template?")) {
      setBonusTemplates(prev => prev.filter(bonus => bonus.id !== id));
      toast.success("Bonus Template deleted successfully");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">VIP Level & Bonus Management</h1>
        <p className="text-gray-500">Manage VIP levels and bonus templates for your casino</p>
      </div>

      {/* VIP Levels Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">VIP Levels</h2>
          <Dialog open={isVipDialogOpen} onOpenChange={setIsVipDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add VIP Level
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingVipId ? "Edit VIP Level" : "Add New VIP Level"}</DialogTitle>
                <DialogDescription>
                  {editingVipId ? "Update" : "Create"} a VIP level for your users.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={vipForm.name} onChange={handleVipInputChange} placeholder="e.g. Gold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Input id="level" name="level" type="number" value={vipForm.level} onChange={handleVipInputChange} placeholder="e.g. 3" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pointsRequired">Points Required</Label>
                    <Input id="pointsRequired" name="pointsRequired" type="number" value={vipForm.pointsRequired} onChange={handleVipInputChange} placeholder="e.g. 5000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cashbackRate">Cashback Rate (%)</Label>
                    <Input id="cashbackRate" name="cashbackRate" type="number" value={vipForm.cashbackRate} onChange={handleVipInputChange} placeholder="e.g. 10" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="depositBonus">Deposit Bonus (%)</Label>
                    <Input id="depositBonus" name="depositBonus" type="number" value={vipForm.depositBonus} onChange={handleVipInputChange} placeholder="e.g. 50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="withdrawalLimit">Withdrawal Limit</Label>
                    <Input id="withdrawalLimit" name="withdrawalLimit" type="number" value={vipForm.withdrawalLimit} onChange={handleVipInputChange} placeholder="e.g. 10000" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthdayBonus">Birthday Bonus</Label>
                    <Input id="birthdayBonus" name="birthdayBonus" type="number" value={vipForm.birthdayBonus} onChange={handleVipInputChange} placeholder="e.g. 100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weeklyBonus">Weekly Bonus</Label>
                    <Input id="weeklyBonus" name="weeklyBonus" type="number" value={vipForm.weeklyBonus} onChange={handleVipInputChange} placeholder="e.g. 50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" name="color" type="color" value={vipForm.color} onChange={handleVipInputChange} placeholder="e.g. #FFD700" />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <Input id="icon" name="icon" type="text" value={vipForm.icon} onChange={handleVipInputChange} placeholder="e.g. star" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dedicated">Dedicated Support</Label>
                    <Select value={vipForm.dedicated} onValueChange={(value) => setVipForm({ ...vipForm, dedicated: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fastWithdrawals">Fast Withdrawals</Label>
                    <Select value={vipForm.fastWithdrawals} onValueChange={(value) => setVipForm({ ...vipForm, fastWithdrawals: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleVipSubmit} disabled={isLoading}>
                  {isLoading ? (
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Points Required</TableHead>
              <TableHead>Cashback Rate</TableHead>
              <TableHead>Deposit Bonus</TableHead>
              <TableHead>Withdrawal Limit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vipLevels.map((vip) => (
              <TableRow key={vip.id}>
                <TableCell>{vip.name}</TableCell>
                <TableCell>{vip.level}</TableCell>
                <TableCell>{vip.pointsRequired}</TableCell>
                <TableCell>{vip.cashbackRate}%</TableCell>
                <TableCell>{vip.depositBonus}%</TableCell>
                <TableCell>{vip.withdrawalLimit}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEditVip(vip)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteVip(vip.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* Bonus Templates Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bonus Templates</h2>
          <Dialog open={isBonusDialogOpen} onOpenChange={setIsBonusDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Bonus Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBonusId ? "Edit Bonus Template" : "Add New Bonus Template"}</DialogTitle>
                <DialogDescription>
                  {editingBonusId ? "Update" : "Create"} a bonus template for your users.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={bonusForm.name} onChange={handleBonusInputChange} placeholder="e.g. Welcome Bonus" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={bonusForm.description} onChange={handleBonusInputChange} placeholder="e.g. Get 100% bonus on your first deposit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={bonusForm.type} onValueChange={(value) => setBonusForm({ ...bonusForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="free_spin">Free Spin</SelectItem>
                      <SelectItem value="cashback">Cashback</SelectItem>
                      <SelectItem value="loyalty">Loyalty</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="freespin">FreeSpin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" name="amount" type="number" value={bonusForm.amount} onChange={handleBonusInputChange} placeholder="e.g. 100" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Percentage</Label>
                    <Input id="percentage" name="percentage" type="number" value={bonusForm.percentage} onChange={handleBonusInputChange} placeholder="e.g. 100" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minDeposit">Min Deposit</Label>
                    <Input id="minDeposit" name="minDeposit" type="number" value={bonusForm.minDeposit} onChange={handleBonusInputChange} placeholder="e.g. 20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxBonus">Max Bonus</Label>
                    <Input id="maxBonus" name="maxBonus" type="number" value={bonusForm.maxBonus} onChange={handleBonusInputChange} placeholder="e.g. 200" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wagering">Wagering</Label>
                    <Input id="wagering" name="wagering" type="number" value={bonusForm.wagering} onChange={handleBonusInputChange} placeholder="e.g. 35" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDays">Expiry Days</Label>
                    <Input id="expiryDays" name="expiryDays" type="number" value={bonusForm.expiryDays} onChange={handleBonusInputChange} placeholder="e.g. 7" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vipLevelRequired">VIP Level Required</Label>
                  <Input id="vipLevelRequired" name="vipLevelRequired" type="number" value={bonusForm.vipLevelRequired} onChange={handleBonusInputChange} placeholder="e.g. 1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedGames">Allowed Games</Label>
                  <Input id="allowedGames" name="allowedGames" value={bonusForm.allowedGames} onChange={handleBonusInputChange} placeholder="e.g. All Slots" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="code">Bonus Code</Label>
                  <Input id="code" name="code" value={bonusForm.code} onChange={handleBonusInputChange} placeholder="e.g. WELCOME100" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleBonusSubmit} disabled={isLoading}>
                  {isLoading ? (
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Wagering</TableHead>
              <TableHead>VIP Level Required</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bonusTemplates.map((bonus) => (
              <TableRow key={bonus.id}>
                <TableCell>{bonus.name}</TableCell>
                <TableCell>{bonus.type}</TableCell>
                <TableCell>{bonus.amount}</TableCell>
                <TableCell>{bonus.wagering}</TableCell>
                <TableCell>{bonus.vipLevelRequired}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEditBonus(bonus)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteBonus(bonus.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
};

export default VipBonusManagement;

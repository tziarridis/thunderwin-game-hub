
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash, Users, Zap, Gift, BadgeDollarSign, Award, Star, Percent, UserIcon } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { User, VipLevel, BonusTemplate } from "@/types";

const VipBonusManagement = () => {
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [editingVipLevel, setEditingVipLevel] = useState<VipLevel | null>(null);
  const [isVipDialogOpen, setIsVipDialogOpen] = useState(false);
  
  const [editingBonus, setEditingBonus] = useState<BonusTemplate | null>(null);
  const [isBonusDialogOpen, setIsBonusDialogOpen] = useState(false);
  
  const [editingUserVip, setEditingUserVip] = useState<User | null>(null);
  const [isUserVipDialogOpen, setIsUserVipDialogOpen] = useState(false);
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Load VIP levels from localStorage
    const storedVipLevels = JSON.parse(localStorage.getItem("vipLevels") || "[]");
    
    // If no VIP levels exist, initialize with default levels
    if (storedVipLevels.length === 0) {
      const defaultVipLevels: VipLevel[] = [
        {
          id: 0,
          name: "Bronze",
          requiredPoints: 0,
          cashbackPercent: 1,
          depositBonusPercent: 5,
          withdrawalLimit: 1000,
          benefits: ["Weekly Cashback", "Basic Support"],
          description: "Starting level for all players",
          color: "#CD7F32"
        },
        {
          id: 1,
          name: "Silver",
          requiredPoints: 1000,
          cashbackPercent: 3,
          depositBonusPercent: 10,
          withdrawalLimit: 3000,
          benefits: ["Higher Cashback", "Faster Withdrawals", "Birthday Bonus"],
          description: "Enjoy improved rewards and benefits",
          color: "#C0C0C0"
        },
        {
          id: 2,
          name: "Gold",
          requiredPoints: 5000,
          cashbackPercent: 5,
          depositBonusPercent: 15,
          withdrawalLimit: 5000,
          benefits: ["Priority Support", "Exclusive Promotions", "Higher Betting Limits"],
          description: "Premium level with substantial benefits",
          color: "#FFD700"
        },
        {
          id: 3,
          name: "Platinum",
          requiredPoints: 15000,
          cashbackPercent: 7,
          depositBonusPercent: 20,
          withdrawalLimit: 10000,
          benefits: ["VIP Account Manager", "Special Event Invites", "Luxury Gifts"],
          description: "Elite benefits for dedicated players",
          color: "#E5E4E2"
        },
        {
          id: 4,
          name: "Diamond",
          requiredPoints: 50000,
          cashbackPercent: 10,
          depositBonusPercent: 25,
          withdrawalLimit: 25000,
          benefits: ["Personalized Offers", "VIP Tournaments", "Travel Packages", "24/7 VIP Support"],
          description: "The ultimate VIP experience",
          color: "#B9F2FF"
        }
      ];
      
      setVipLevels(defaultVipLevels);
      localStorage.setItem("vipLevels", JSON.stringify(defaultVipLevels));
    } else {
      setVipLevels(storedVipLevels);
    }
    
    // Load bonus templates from localStorage
    const storedBonusTemplates = JSON.parse(localStorage.getItem("bonusTemplates") || "[]");
    
    // If no bonus templates exist, initialize with default templates
    if (storedBonusTemplates.length === 0) {
      const defaultBonusTemplates: BonusTemplate[] = [
        {
          id: "bonus-1",
          title: "Welcome Bonus",
          description: "100% bonus on your first deposit",
          amount: 100,
          wagerMultiplier: 25,
          duration: 14,
          minDeposit: 20,
          isActive: true,
          requiredVipLevel: 0,
          type: "deposit"
        },
        {
          id: "bonus-2",
          title: "Weekly Reload",
          description: "50% bonus on deposits every Friday",
          amount: 50,
          wagerMultiplier: 20,
          duration: 7,
          minDeposit: 50,
          isActive: true,
          requiredVipLevel: 1,
          type: "deposit"
        },
        {
          id: "bonus-3",
          title: "Free Spins Package",
          description: "50 free spins on selected slots",
          amount: 25,
          wagerMultiplier: 15,
          duration: 3,
          minDeposit: 0,
          isActive: true,
          requiredVipLevel: 2,
          type: "free_spin"
        },
        {
          id: "bonus-4",
          title: "VIP Cashback",
          description: "Get 10% cashback on losses",
          amount: 100,
          wagerMultiplier: 5,
          duration: 30,
          minDeposit: 0,
          isActive: true,
          requiredVipLevel: 3,
          type: "cashback"
        },
        {
          id: "bonus-5",
          title: "Diamond VIP Bonus",
          description: "Exclusive bonus for Diamond VIP members",
          amount: 200,
          wagerMultiplier: 15,
          duration: 14,
          minDeposit: 100,
          isActive: true,
          requiredVipLevel: 4,
          type: "vip",
          bonusCode: "DIAMOND"
        }
      ];
      
      setBonusTemplates(defaultBonusTemplates);
      localStorage.setItem("bonusTemplates", JSON.stringify(defaultBonusTemplates));
    } else {
      setBonusTemplates(storedBonusTemplates);
    }
    
    // Load users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(storedUsers);
    setFilteredUsers(storedUsers);
  }, []);
  
  useEffect(() => {
    // Filter users based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        (user.name && user.name.toLowerCase().includes(query)) || 
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.username && user.username.toLowerCase().includes(query))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchQuery]);
  
  // VIP Level Management
  const openVipDialog = (vipLevel: VipLevel | null = null) => {
    setEditingVipLevel(vipLevel ? { ...vipLevel } : {
      id: vipLevels.length,
      name: "",
      requiredPoints: 0,
      cashbackPercent: 0,
      depositBonusPercent: 0,
      withdrawalLimit: 1000,
      benefits: [],
      description: "",
      color: "#FFFFFF"
    } as VipLevel);
    setIsVipDialogOpen(true);
  };
  
  const handleVipLevelChange = (field: keyof VipLevel, value: any) => {
    if (editingVipLevel) {
      setEditingVipLevel({
        ...editingVipLevel,
        [field]: value
      });
    }
  };
  
  const handleVipBenefitsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editingVipLevel) {
      // Split the text by new lines into array items
      const benefits = e.target.value.split('\n').filter(benefit => benefit.trim() !== '');
      setEditingVipLevel({
        ...editingVipLevel,
        benefits
      });
    }
  };
  
  const saveVipLevel = () => {
    if (!editingVipLevel || !editingVipLevel.name) {
      toast({
        title: "Validation Error",
        description: "Please provide a name for the VIP level",
        variant: "destructive"
      });
      return;
    }
    
    // Update existing or add new VIP level
    const updatedVipLevels = editingVipLevel.id < vipLevels.length 
      ? vipLevels.map(level => level.id === editingVipLevel.id ? editingVipLevel : level)
      : [...vipLevels, editingVipLevel];
    
    // Sort VIP levels by requiredPoints
    updatedVipLevels.sort((a, b) => a.requiredPoints - b.requiredPoints);
    
    // Update IDs to ensure they are sequential
    const sortedVipLevels = updatedVipLevels.map((level, index) => ({
      ...level,
      id: index
    }));
    
    setVipLevels(sortedVipLevels);
    localStorage.setItem("vipLevels", JSON.stringify(sortedVipLevels));
    
    setIsVipDialogOpen(false);
    toast({
      title: "Success",
      description: `VIP level "${editingVipLevel.name}" has been saved`
    });
  };
  
  const deleteVipLevel = (id: number) => {
    // Check if this VIP level is in use
    const usersWithLevel = users.filter(user => user.vipLevel === id);
    
    if (usersWithLevel.length > 0) {
      toast({
        title: "Cannot Delete VIP Level",
        description: `This level is assigned to ${usersWithLevel.length} users. Please reassign them first.`,
        variant: "destructive"
      });
      return;
    }
    
    // Check if bonuses are using this level
    const bonusesWithLevel = bonusTemplates.filter(bonus => bonus.requiredVipLevel === id);
    
    if (bonusesWithLevel.length > 0) {
      toast({
        title: "Cannot Delete VIP Level",
        description: `This level is used by ${bonusesWithLevel.length} bonus templates. Please update them first.`,
        variant: "destructive"
      });
      return;
    }
    
    const updatedVipLevels = vipLevels.filter(level => level.id !== id);
    
    // Update IDs to ensure they are sequential
    const sortedVipLevels = updatedVipLevels.map((level, index) => ({
      ...level,
      id: index
    }));
    
    setVipLevels(sortedVipLevels);
    localStorage.setItem("vipLevels", JSON.stringify(sortedVipLevels));
    
    toast({
      title: "Success",
      description: "VIP level has been deleted"
    });
  };
  
  // Bonus Template Management
  const openBonusDialog = (bonus: BonusTemplate | null = null) => {
    setEditingBonus(bonus ? { ...bonus } : {
      id: `bonus-${Date.now()}`,
      title: "",
      description: "",
      amount: 0,
      wagerMultiplier: 20,
      duration: 7,
      minDeposit: 0,
      isActive: true,
      requiredVipLevel: 0,
      type: "deposit"
    });
    setIsBonusDialogOpen(true);
  };
  
  const handleBonusChange = (field: keyof BonusTemplate, value: any) => {
    if (editingBonus) {
      setEditingBonus({
        ...editingBonus,
        [field]: value
      });
    }
  };
  
  const saveBonus = () => {
    if (!editingBonus || !editingBonus.title) {
      toast({
        title: "Validation Error",
        description: "Please provide a title for the bonus",
        variant: "destructive"
      });
      return;
    }
    
    // Update existing or add new bonus template
    const updatedBonuses = editingBonus.id 
      ? bonusTemplates.map(bonus => bonus.id === editingBonus.id ? editingBonus : bonus)
      : [...bonusTemplates, editingBonus];
    
    setBonusTemplates(updatedBonuses);
    localStorage.setItem("bonusTemplates", JSON.stringify(updatedBonuses));
    
    setIsBonusDialogOpen(false);
    toast({
      title: "Success",
      description: `Bonus "${editingBonus.title}" has been saved`
    });
  };
  
  const deleteBonus = (id: string) => {
    const updatedBonuses = bonusTemplates.filter(bonus => bonus.id !== id);
    setBonusTemplates(updatedBonuses);
    localStorage.setItem("bonusTemplates", JSON.stringify(updatedBonuses));
    
    toast({
      title: "Success",
      description: "Bonus template has been deleted"
    });
  };
  
  // User VIP Management
  const openUserVipDialog = (user: User) => {
    setEditingUserVip({ ...user });
    setIsUserVipDialogOpen(true);
  };
  
  const saveUserVip = () => {
    if (!editingUserVip) return;
    
    // Update user's VIP level
    const updatedUsers = users.map(user => 
      user.id === editingUserVip.id ? { ...user, vipLevel: editingUserVip.vipLevel } : user
    );
    
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    // Update user in auth storage if applicable
    const authUser = JSON.parse(localStorage.getItem("thunderwin_user") || "null");
    if (authUser && authUser.id === editingUserVip.id) {
      authUser.vipLevel = editingUserVip.vipLevel;
      localStorage.setItem("thunderwin_user", JSON.stringify(authUser));
    }
    
    // Update mockUsers for auth system
    const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    const mockUserIndex = mockUsers.findIndex((u: any) => u.id === editingUserVip.id);
    if (mockUserIndex !== -1) {
      mockUsers[mockUserIndex].vipLevel = editingUserVip.vipLevel;
      localStorage.setItem("mockUsers", JSON.stringify(mockUsers));
    }
    
    setIsUserVipDialogOpen(false);
    toast({
      title: "Success",
      description: `${editingUserVip.name || editingUserVip.username}'s VIP level has been updated`
    });
  };
  
  const getBonusTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <Percent className="h-5 w-5" />;
      case "free_spin":
        return <Zap className="h-5 w-5" />;
      case "cashback":
        return <BadgeDollarSign className="h-5 w-5" />;
      case "loyalty":
        return <Award className="h-5 w-5" />;
      case "vip":
        return <Gift className="h-5 w-5" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">VIP & Bonus Management</h1>
            <p className="text-white/60">
              Manage VIP levels, bonus templates, and user VIP status
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="vip-levels">
          <TabsList className="grid grid-cols-3 w-full md:w-auto mb-6">
            <TabsTrigger value="vip-levels" className="flex items-center">
              <Star className="h-4 w-4 mr-2" /> VIP Levels
            </TabsTrigger>
            <TabsTrigger value="bonus-templates" className="flex items-center">
              <Gift className="h-4 w-4 mr-2" /> Bonus Templates
            </TabsTrigger>
            <TabsTrigger value="user-vip" className="flex items-center">
              <Users className="h-4 w-4 mr-2" /> User VIP Status
            </TabsTrigger>
          </TabsList>
          
          {/* VIP Levels Tab */}
          <TabsContent value="vip-levels">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold">VIP Levels</h2>
              <Button 
                onClick={() => openVipDialog()}
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
              >
                <Plus className="h-4 w-4 mr-2" /> Add VIP Level
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vipLevels.map((level) => (
                <Card key={level.id} className="bg-casino-thunder-dark border-white/10 overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: level.color }}></div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{level.name}</CardTitle>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openVipDialog(level)}
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {level.id > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteVipLevel(level.id)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardDescription>{level.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/60">Required Points</span>
                      <span>{level.requiredPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Cashback</span>
                      <span>{level.cashbackPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Deposit Bonus</span>
                      <span>{level.depositBonusPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Withdrawal Limit</span>
                      <span>${level.withdrawalLimit.toLocaleString()}</span>
                    </div>
                    
                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">Benefits</h4>
                      <ul className="space-y-1">
                        {level.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-white/70 flex items-start">
                            <span className="text-casino-thunder-green mr-2">•</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Bonus Templates Tab */}
          <TabsContent value="bonus-templates">
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-semibold">Bonus Templates</h2>
              <Button 
                onClick={() => openBonusDialog()}
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Bonus Template
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bonusTemplates.map((bonus) => (
                <Card key={bonus.id} className="bg-casino-thunder-dark border-white/10 overflow-hidden">
                  <div className={`h-1 ${
                    bonus.type === 'deposit' ? 'bg-yellow-500' : 
                    bonus.type === 'free_spin' ? 'bg-green-500' : 
                    bonus.type === 'cashback' ? 'bg-blue-500' : 
                    bonus.type === 'loyalty' ? 'bg-purple-500' : 'bg-casino-thunder-green'
                  }`}></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center">
                        {getBonusTypeIcon(bonus.type)}
                        <span className="ml-2">{bonus.title}</span>
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openBonusDialog(bonus)}
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteBonus(bonus.id)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{bonus.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60">Amount</span>
                        <span>${bonus.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Wager Multiplier</span>
                        <span>{bonus.wagerMultiplier}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Duration</span>
                        <span>{bonus.duration} days</span>
                      </div>
                      {bonus.minDeposit > 0 && (
                        <div className="flex justify-between">
                          <span className="text-white/60">Min. Deposit</span>
                          <span>${bonus.minDeposit}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-white/60">Required VIP Level</span>
                        <span>
                          {vipLevels.find(level => level.id === bonus.requiredVipLevel)?.name || bonus.requiredVipLevel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Status</span>
                        <span className={bonus.isActive ? "text-green-500" : "text-red-500"}>
                          {bonus.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {bonus.bonusCode && (
                        <div className="flex justify-between">
                          <span className="text-white/60">Bonus Code</span>
                          <span className="font-mono">{bonus.bonusCode}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* User VIP Status Tab */}
          <TabsContent value="user-vip">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold">User VIP Status</h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
                <Input
                  placeholder="Search users..."
                  className="pl-10 bg-casino-thunder-gray/50 border-white/10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Card className="bg-casino-thunder-dark border-white/10">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                          Current VIP Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                {user.avatarUrl ? (
                                  <img 
                                    src={user.avatarUrl} 
                                    alt={user.name || user.username} 
                                    className="h-10 w-10 rounded-full"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                                    }}
                                  />
                                ) : (
                                  <UserIcon className="h-5 w-5 text-white/60" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium">
                                  {user.name || user.username}
                                  {user.isVerified && (
                                    <span className="ml-2 text-blue-400">✓</span>
                                  )}
                                </div>
                                <div className="text-sm text-white/60">
                                  Joined: {new Date(user.joined).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {typeof user.vipLevel === "number" ? (
                                <>
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: vipLevels.find(level => level.id === user.vipLevel)?.color || '#FFF' }}
                                  ></div>
                                  <span>
                                    {vipLevels.find(level => level.id === user.vipLevel)?.name || `Level ${user.vipLevel}`}
                                  </span>
                                </>
                              ) : (
                                <span className="text-white/60">Not Set</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            ${user.balance?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openUserVipDialog(user)}
                              className="border-casino-thunder-green text-casino-thunder-green hover:bg-casino-thunder-green/10"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Edit VIP
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* VIP Level Edit Dialog */}
        <Dialog open={isVipDialogOpen} onOpenChange={setIsVipDialogOpen}>
          <DialogContent className="bg-casino-thunder-dark border-white/10 max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingVipLevel && editingVipLevel.id < vipLevels.length ? 'Edit VIP Level' : 'Add VIP Level'}
              </DialogTitle>
              <DialogDescription>
                Configure the VIP level details and benefits
              </DialogDescription>
            </DialogHeader>
            
            {editingVipLevel && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Level Name</Label>
                    <Input
                      id="name"
                      value={editingVipLevel.name}
                      onChange={(e) => handleVipLevelChange('name', e.target.value)}
                      className="border-white/10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editingVipLevel.description}
                      onChange={(e) => handleVipLevelChange('description', e.target.value)}
                      className="border-white/10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color">Level Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color"
                        type="color"
                        value={editingVipLevel.color}
                        onChange={(e) => handleVipLevelChange('color', e.target.value)}
                        className="w-16 h-10 border-white/10"
                      />
                      <Input
                        value={editingVipLevel.color}
                        onChange={(e) => handleVipLevelChange('color', e.target.value)}
                        className="border-white/10 flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="requiredPoints">Required Points</Label>
                    <Input
                      id="requiredPoints"
                      type="number"
                      min="0"
                      value={editingVipLevel.requiredPoints}
                      onChange={(e) => handleVipLevelChange('requiredPoints', parseInt(e.target.value) || 0)}
                      className="border-white/10"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cashback Percentage ({editingVipLevel.cashbackPercent}%)</Label>
                    <Slider
                      value={[editingVipLevel.cashbackPercent]}
                      min={0}
                      max={20}
                      step={0.5}
                      onValueChange={(values) => handleVipLevelChange('cashbackPercent', values[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Deposit Bonus Percentage ({editingVipLevel.depositBonusPercent}%)</Label>
                    <Slider
                      value={[editingVipLevel.depositBonusPercent]}
                      min={0}
                      max={50}
                      step={1}
                      onValueChange={(values) => handleVipLevelChange('depositBonusPercent', values[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="withdrawalLimit">Withdrawal Limit ($)</Label>
                    <Input
                      id="withdrawalLimit"
                      type="number"
                      min="1000"
                      step="1000"
                      value={editingVipLevel.withdrawalLimit}
                      onChange={(e) => handleVipLevelChange('withdrawalLimit', parseInt(e.target.value) || 0)}
                      className="border-white/10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits (one per line)</Label>
                    <Textarea
                      id="benefits"
                      value={editingVipLevel.benefits.join('\n')}
                      onChange={handleVipBenefitsChange}
                      className="border-white/10 min-h-[100px]"
                      placeholder="Enter one benefit per line"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsVipDialogOpen(false)}
                className="border-white/20"
              >
                Cancel
              </Button>
              <Button 
                onClick={saveVipLevel}
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
              >
                Save VIP Level
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Bonus Template Edit Dialog */}
        <Dialog open={isBonusDialogOpen} onOpenChange={setIsBonusDialogOpen}>
          <DialogContent className="bg-casino-thunder-dark border-white/10 max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBonus && bonusTemplates.find(b => b.id === editingBonus.id) ? 'Edit Bonus Template' : 'Add Bonus Template'}
              </DialogTitle>
              <DialogDescription>
                Configure the bonus template details
              </DialogDescription>
            </DialogHeader>
            
            {editingBonus && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Bonus Title</Label>
                    <Input
                      id="title"
                      value={editingBonus.title}
                      onChange={(e) => handleBonusChange('title', e.target.value)}
                      className="border-white/10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bonusType">Bonus Type</Label>
                    <Select
                      value={editingBonus.type}
                      onValueChange={(value) => handleBonusChange('type', value)}
                    >
                      <SelectTrigger className="border-white/10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deposit">Deposit Bonus</SelectItem>
                        <SelectItem value="free_spin">Free Spins</SelectItem>
                        <SelectItem value="cashback">Cashback</SelectItem>
                        <SelectItem value="loyalty">Loyalty Bonus</SelectItem>
                        <SelectItem value="vip">VIP Bonus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingBonus.description}
                    onChange={(e) => handleBonusChange('description', e.target.value)}
                    className="border-white/10"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      value={editingBonus.amount}
                      onChange={(e) => handleBonusChange('amount', parseFloat(e.target.value) || 0)}
                      className="border-white/10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="wagerMultiplier">Wager Multiplier (x)</Label>
                    <Input
                      id="wagerMultiplier"
                      type="number"
                      min="1"
                      value={editingBonus.wagerMultiplier}
                      onChange={(e) => handleBonusChange('wagerMultiplier', parseInt(e.target.value) || 1)}
                      className="border-white/10"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={editingBonus.duration}
                      onChange={(e) => handleBonusChange('duration', parseInt(e.target.value) || 1)}
                      className="border-white/10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minDeposit">Minimum Deposit ($)</Label>
                    <Input
                      id="minDeposit"
                      type="number"
                      min="0"
                      value={editingBonus.minDeposit}
                      onChange={(e) => handleBonusChange('minDeposit', parseFloat(e.target.value) || 0)}
                      className="border-white/10"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requiredVipLevel">Required VIP Level</Label>
                    <Select
                      value={String(editingBonus.requiredVipLevel)}
                      onValueChange={(value) => handleBonusChange('requiredVipLevel', parseInt(value))}
                    >
                      <SelectTrigger className="border-white/10">
                        <SelectValue placeholder="Select VIP level" />
                      </SelectTrigger>
                      <SelectContent>
                        {vipLevels.map((level) => (
                          <SelectItem key={level.id} value={String(level.id)}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bonusCode">Bonus Code (optional)</Label>
                    <Input
                      id="bonusCode"
                      value={editingBonus.bonusCode || ''}
                      onChange={(e) => handleBonusChange('bonusCode', e.target.value)}
                      className="border-white/10"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="isActive"
                    checked={editingBonus.isActive}
                    onCheckedChange={(checked) => handleBonusChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
            )}
            
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsBonusDialogOpen(false)}
                className="border-white/20"
              >
                Cancel
              </Button>
              <Button 
                onClick={saveBonus}
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
              >
                Save Bonus Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* User VIP Edit Dialog */}
        <Dialog open={isUserVipDialogOpen} onOpenChange={setIsUserVipDialogOpen}>
          <DialogContent className="bg-casino-thunder-dark border-white/10">
            <DialogHeader>
              <DialogTitle>
                Update VIP Level
              </DialogTitle>
              <DialogDescription>
                Change the VIP level for {editingUserVip?.name || editingUserVip?.username}
              </DialogDescription>
            </DialogHeader>
            
            {editingUserVip && (
              <div className="space-y-4">
                <Label htmlFor="userVipLevel">Select VIP Level</Label>
                <Select
                  value={String(editingUserVip.vipLevel || 0)}
                  onValueChange={(value) => {
                    setEditingUserVip({
                      ...editingUserVip,
                      vipLevel: parseInt(value)
                    });
                  }}
                >
                  <SelectTrigger className="border-white/10">
                    <SelectValue placeholder="Select VIP level" />
                  </SelectTrigger>
                  <SelectContent>
                    {vipLevels.map((level) => (
                      <SelectItem key={level.id} value={String(level.id)}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {editingUserVip.vipLevel !== undefined && (
                  <div className="mt-4 p-4 bg-white/5 rounded-md">
                    <h4 className="font-medium mb-2">Level Benefits</h4>
                    <ul className="space-y-1">
                      {vipLevels.find(level => level.id === editingUserVip.vipLevel)?.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-white/70 flex items-start">
                          <span className="text-casino-thunder-green mr-2">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsUserVipDialogOpen(false)}
                className="border-white/20"
              >
                Cancel
              </Button>
              <Button 
                onClick={saveUserVip}
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
              >
                Update VIP Level
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default VipBonusManagement;

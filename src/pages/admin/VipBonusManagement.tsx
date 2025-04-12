
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, Award, Gift, Calendar, Percent, Users, Search, Filter, UserIcon, Clock, Check, X } from "lucide-react";
import { Bonus, BonusTemplate, VipLevel } from "@/types";

const VipBonusManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("vip-levels");
  const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>([]);
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVipLevel, setFilterVipLevel] = useState("all");
  const [isAddVipDialogOpen, setIsAddVipDialogOpen] = useState(false);
  const [isAddBonusDialogOpen, setIsAddBonusDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form data states
  const [vipFormData, setVipFormData] = useState({
    name: "",
    level: 1,
    pointsRequired: 1000,
    depositBonus: 100,
    withdrawalLimit: 10000,
    cashbackRate: 5,
    birthdayBonus: 50,
    weeklyBonus: 100,
    dedicated: false,
    fastWithdrawals: true,
    exclusivePromos: true,
    specialEvents: false,
    customizedOffers: false,
    icon: "bronze"
  });
  
  const [bonusFormData, setBonusFormData] = useState({
    name: "",
    description: "",
    type: "deposit",
    amount: 100,
    percentage: 100,
    minDeposit: 20,
    maxBonus: 200,
    wagering: 35,
    expiryDays: 7,
    vipLevelRequired: 0,
    allowedGames: "all",
    active: true,
    code: ""
  });
  
  useEffect(() => {
    // Load data from localStorage
    const storedBonusTemplates = JSON.parse(localStorage.getItem("bonusTemplates") || "[]");
    const storedVipLevels = JSON.parse(localStorage.getItem("vipLevels") || "[]");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    setBonusTemplates(storedBonusTemplates);
    
    // If no VIP levels stored, initialize with defaults
    if (storedVipLevels.length === 0) {
      const defaultVipLevels = [
        {
          id: "vip1",
          name: "Bronze",
          level: 1,
          pointsRequired: 0,
          depositBonus: 50,
          withdrawalLimit: 5000,
          cashbackRate: 3,
          birthdayBonus: 25,
          weeklyBonus: 0,
          dedicated: false,
          fastWithdrawals: false,
          exclusivePromos: false,
          specialEvents: false,
          customizedOffers: false,
          icon: "bronze"
        },
        {
          id: "vip2",
          name: "Silver",
          level: 2,
          pointsRequired: 2500,
          depositBonus: 100,
          withdrawalLimit: 10000,
          cashbackRate: 5,
          birthdayBonus: 50,
          weeklyBonus: 25,
          dedicated: false,
          fastWithdrawals: true,
          exclusivePromos: true,
          specialEvents: false,
          customizedOffers: false,
          icon: "silver"
        },
        {
          id: "vip3",
          name: "Gold",
          level: 3,
          pointsRequired: 10000,
          depositBonus: 150,
          withdrawalLimit: 20000,
          cashbackRate: 7,
          birthdayBonus: 100,
          weeklyBonus: 50,
          dedicated: true,
          fastWithdrawals: true,
          exclusivePromos: true,
          specialEvents: true,
          customizedOffers: false,
          icon: "gold"
        },
        {
          id: "vip4",
          name: "Platinum",
          level: 4,
          pointsRequired: 25000,
          depositBonus: 200,
          withdrawalLimit: 50000,
          cashbackRate: 10,
          birthdayBonus: 200,
          weeklyBonus: 100,
          dedicated: true,
          fastWithdrawals: true,
          exclusivePromos: true,
          specialEvents: true,
          customizedOffers: true,
          icon: "platinum"
        }
      ];
      
      setVipLevels(defaultVipLevels);
      localStorage.setItem("vipLevels", JSON.stringify(defaultVipLevels));
    } else {
      setVipLevels(storedVipLevels);
    }
    
    // Filter active users
    setActiveUsers(users.filter((user: any) => user.status === "Active" && user.vipLevel > 0));
  }, []);
  
  const filteredUsers = activeUsers.filter(user => {
    // Filter by search query
    const matchesQuery = searchQuery === "" || 
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       user.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by VIP level
    const matchesVipLevel = filterVipLevel === "all" || user.vipLevel === parseInt(filterVipLevel);
    
    return matchesQuery && matchesVipLevel;
  });
  
  const handleAddVipLevel = () => {
    if (!vipFormData.name) {
      toast({
        title: "Validation Error",
        description: "VIP level name is required",
        variant: "destructive"
      });
      return;
    }
    
    const newVipLevel: VipLevel = {
      id: `vip${Date.now()}`,
      ...vipFormData
    };
    
    const updatedVipLevels = [...vipLevels, newVipLevel];
    setVipLevels(updatedVipLevels);
    localStorage.setItem("vipLevels", JSON.stringify(updatedVipLevels));
    
    setIsAddVipDialogOpen(false);
    setVipFormData({
      name: "",
      level: 1,
      pointsRequired: 1000,
      depositBonus: 100,
      withdrawalLimit: 10000,
      cashbackRate: 5,
      birthdayBonus: 50,
      weeklyBonus: 100,
      dedicated: false,
      fastWithdrawals: true,
      exclusivePromos: true,
      specialEvents: false,
      customizedOffers: false,
      icon: "bronze"
    });
    
    toast({
      title: "VIP Level Added",
      description: `Successfully added ${newVipLevel.name} level`
    });
  };
  
  const handleAddBonusTemplate = () => {
    if (!bonusFormData.name) {
      toast({
        title: "Validation Error",
        description: "Bonus name is required",
        variant: "destructive"
      });
      return;
    }
    
    const newBonus: BonusTemplate = {
      id: `bonus${Date.now()}`,
      ...bonusFormData,
      createdAt: new Date().toISOString()
    };
    
    const updatedBonusTemplates = [...bonusTemplates, newBonus];
    setBonusTemplates(updatedBonusTemplates);
    localStorage.setItem("bonusTemplates", JSON.stringify(updatedBonusTemplates));
    
    setIsAddBonusDialogOpen(false);
    setBonusFormData({
      name: "",
      description: "",
      type: "deposit",
      amount: 100,
      percentage: 100,
      minDeposit: 20,
      maxBonus: 200,
      wagering: 35,
      expiryDays: 7,
      vipLevelRequired: 0,
      allowedGames: "all",
      active: true,
      code: ""
    });
    
    toast({
      title: "Bonus Template Added",
      description: `Successfully added ${newBonus.name} bonus`
    });
  };
  
  const handleEditItem = (item: any, type: 'vip' | 'bonus') => {
    setSelectedItem({...item, type});
    
    if (type === 'vip') {
      setVipFormData({
        name: item.name,
        level: item.level,
        pointsRequired: item.pointsRequired,
        depositBonus: item.depositBonus,
        withdrawalLimit: item.withdrawalLimit,
        cashbackRate: item.cashbackRate,
        birthdayBonus: item.birthdayBonus,
        weeklyBonus: item.weeklyBonus,
        dedicated: item.dedicated,
        fastWithdrawals: item.fastWithdrawals,
        exclusivePromos: item.exclusivePromos,
        specialEvents: item.specialEvents,
        customizedOffers: item.customizedOffers,
        icon: item.icon
      });
    } else {
      setBonusFormData({
        name: item.name,
        description: item.description,
        type: item.type,
        amount: item.amount,
        percentage: item.percentage,
        minDeposit: item.minDeposit,
        maxBonus: item.maxBonus,
        wagering: item.wagering,
        expiryDays: item.expiryDays,
        vipLevelRequired: item.vipLevelRequired,
        allowedGames: item.allowedGames,
        active: item.active,
        code: item.code || ""
      });
    }
    
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateItem = () => {
    if (!selectedItem) return;
    
    if (selectedItem.type === 'vip') {
      const updatedVipLevels = vipLevels.map(level => 
        level.id === selectedItem.id ? { ...level, ...vipFormData } : level
      );
      
      setVipLevels(updatedVipLevels);
      localStorage.setItem("vipLevels", JSON.stringify(updatedVipLevels));
      
      toast({
        title: "VIP Level Updated",
        description: `Successfully updated ${vipFormData.name} level`
      });
    } else {
      const updatedBonusTemplates = bonusTemplates.map(bonus => 
        bonus.id === selectedItem.id ? { ...bonus, ...bonusFormData } : bonus
      );
      
      setBonusTemplates(updatedBonusTemplates);
      localStorage.setItem("bonusTemplates", JSON.stringify(updatedBonusTemplates));
      
      toast({
        title: "Bonus Template Updated",
        description: `Successfully updated ${bonusFormData.name} bonus`
      });
    }
    
    setIsEditDialogOpen(false);
    setSelectedItem(null);
  };
  
  const handleDeleteItem = (id: string, type: 'vip' | 'bonus') => {
    if (type === 'vip') {
      const updatedVipLevels = vipLevels.filter(level => level.id !== id);
      setVipLevels(updatedVipLevels);
      localStorage.setItem("vipLevels", JSON.stringify(updatedVipLevels));
      
      toast({
        title: "VIP Level Deleted",
        description: "Successfully removed VIP level"
      });
    } else {
      const updatedBonusTemplates = bonusTemplates.filter(bonus => bonus.id !== id);
      setBonusTemplates(updatedBonusTemplates);
      localStorage.setItem("bonusTemplates", JSON.stringify(updatedBonusTemplates));
      
      toast({
        title: "Bonus Template Deleted",
        description: "Successfully removed bonus template"
      });
    }
  };
  
  const getVipLevelName = (level: number) => {
    const vipLevel = vipLevels.find(vl => vl.level === level);
    return vipLevel ? vipLevel.name : `Level ${level}`;
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">VIP & Bonus Management</h1>
          <p className="text-white/60">
            Configure VIP levels, bonuses, and manage player rewards
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="vip-levels" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-auto mb-6">
          <TabsTrigger value="vip-levels" className="flex items-center">
            <Award className="h-4 w-4 mr-2" /> VIP Levels
          </TabsTrigger>
          <TabsTrigger value="bonus-templates" className="flex items-center">
            <Gift className="h-4 w-4 mr-2" /> Bonus Templates
          </TabsTrigger>
          <TabsTrigger value="vip-users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" /> VIP Users
          </TabsTrigger>
        </TabsList>
        
        {/* VIP Levels Tab */}
        <TabsContent value="vip-levels">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">VIP Levels</h2>
            <Button 
              onClick={() => setIsAddVipDialogOpen(true)}
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add VIP Level
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vipLevels.sort((a, b) => a.level - b.level).map((level) => (
              <Card key={level.id} className="bg-casino-thunder-dark border-white/10">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{level.name}</CardTitle>
                      <CardDescription>Level {level.level}</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-casino-thunder-gray/30">
                      {level.pointsRequired.toLocaleString()} points
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                  <div className="grid grid-cols-2 gap-y-2">
                    <div className="text-white/60">Deposit Bonus:</div>
                    <div className="text-right">{level.depositBonus}%</div>
                    
                    <div className="text-white/60">Withdrawal Limit:</div>
                    <div className="text-right">${level.withdrawalLimit.toLocaleString()}</div>
                    
                    <div className="text-white/60">Cashback Rate:</div>
                    <div className="text-right">{level.cashbackRate}%</div>
                    
                    <div className="text-white/60">Birthday Bonus:</div>
                    <div className="text-right">${level.birthdayBonus}</div>
                    
                    {level.weeklyBonus > 0 && (
                      <>
                        <div className="text-white/60">Weekly Bonus:</div>
                        <div className="text-right">${level.weeklyBonus}</div>
                      </>
                    )}
                  </div>
                  
                  <div className="border-t border-white/10 pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/60">Dedicated Host:</span>
                      <span>{level.dedicated ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Fast Withdrawals:</span>
                      <span>{level.fastWithdrawals ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Exclusive Promos:</span>
                      <span>{level.exclusivePromos ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Special Events:</span>
                      <span>{level.specialEvents ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Customized Offers:</span>
                      <span>{level.customizedOffers ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditItem(level, 'vip')}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDeleteItem(level.id, 'vip')}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Bonus Templates Tab */}
        <TabsContent value="bonus-templates">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bonus Templates</h2>
            <Button 
              onClick={() => setIsAddBonusDialogOpen(true)}
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Bonus Template
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bonusTemplates.map((bonus) => (
              <Card key={bonus.id} className="bg-casino-thunder-dark border-white/10">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{bonus.name}</CardTitle>
                      <CardDescription>
                        {bonus.type === "deposit" ? "Deposit Bonus" : 
                         bonus.type === "freespin" ? "Free Spins" : 
                         bonus.type === "cashback" ? "Cashback" : "Bonus"}
                      </CardDescription>
                    </div>
                    <Badge variant={bonus.active ? "default" : "outline"} className={bonus.active ? "bg-green-800" : "bg-white/10"}>
                      {bonus.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  {bonus.description && (
                    <p className="text-white/80">{bonus.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-y-2">
                    {bonus.code && (
                      <>
                        <div className="text-white/60">Bonus Code:</div>
                        <div className="text-right font-mono">{bonus.code}</div>
                      </>
                    )}
                    
                    {bonus.type === "deposit" && (
                      <>
                        <div className="text-white/60">Bonus Percentage:</div>
                        <div className="text-right">{bonus.percentage}%</div>
                        
                        <div className="text-white/60">Min Deposit:</div>
                        <div className="text-right">${bonus.minDeposit}</div>
                        
                        <div className="text-white/60">Max Bonus:</div>
                        <div className="text-right">${bonus.maxBonus}</div>
                      </>
                    )}
                    
                    {bonus.type === "freespin" && (
                      <>
                        <div className="text-white/60">Free Spins:</div>
                        <div className="text-right">{bonus.amount}</div>
                      </>
                    )}
                    
                    {bonus.type === "cashback" && (
                      <>
                        <div className="text-white/60">Cashback Rate:</div>
                        <div className="text-right">{bonus.percentage}%</div>
                        
                        <div className="text-white/60">Max Cashback:</div>
                        <div className="text-right">${bonus.maxBonus}</div>
                      </>
                    )}
                    
                    <div className="text-white/60">Wagering:</div>
                    <div className="text-right">{bonus.wagering}x</div>
                    
                    <div className="text-white/60">Expires:</div>
                    <div className="text-right">{bonus.expiryDays} days</div>
                    
                    <div className="text-white/60">VIP Required:</div>
                    <div className="text-right">
                      {bonus.vipLevelRequired === 0 ? "None" : getVipLevelName(bonus.vipLevelRequired)}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditItem(bonus, 'bonus')}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDeleteItem(bonus.id, 'bonus')}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {bonusTemplates.length === 0 && (
              <Card className="bg-casino-thunder-dark border-white/10 col-span-full">
                <CardContent className="py-8 text-center text-white/60">
                  <Gift className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No bonus templates defined yet</p>
                  <Button 
                    onClick={() => setIsAddBonusDialogOpen(true)}
                    variant="outline" 
                    className="mt-4"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Create Your First Bonus Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* VIP Users Tab */}
        <TabsContent value="vip-users">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">VIP Users</h2>
            
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={16} />
                <Input
                  placeholder="Search users..."
                  className="pl-9 bg-casino-thunder-gray/50 border-white/10 w-full md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={filterVipLevel} onValueChange={setFilterVipLevel}>
                <SelectTrigger className="w-44 bg-casino-thunder-gray/50 border-white/10">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 opacity-70" />
                    <SelectValue placeholder="All VIP Levels" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All VIP Levels</SelectItem>
                  {vipLevels.sort((a, b) => a.level - b.level).map((level) => (
                    <SelectItem key={level.id} value={level.level.toString()}>{level.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                        VIP Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Join Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-white/60" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium">{user.name}</div>
                                <div className="text-sm text-white/60">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-casino-thunder-gray/30">
                              {getVipLevelName(user.vipLevel)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            ${user.balance.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1.5 text-white/50" />
                              {user.joined}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="outline" size="sm" className="border-white/20">
                              View Profile
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-white/60">
                          <div className="flex flex-col items-center">
                            <Users className="h-8 w-8 mb-2 opacity-50" />
                            <span>No VIP users found</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add VIP Level Dialog */}
      <Dialog open={isAddVipDialogOpen} onOpenChange={setIsAddVipDialogOpen}>
        <DialogContent className="bg-casino-thunder-dark border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle>Add New VIP Level</DialogTitle>
            <DialogDescription>
              Create a new VIP level with custom benefits and requirements
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Level Name</Label>
                <Input
                  id="name"
                  value={vipFormData.name}
                  onChange={(e) => setVipFormData({...vipFormData, name: e.target.value})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="level">Level Number</Label>
                <Input
                  id="level"
                  type="number"
                  value={vipFormData.level}
                  onChange={(e) => setVipFormData({...vipFormData, level: Number(e.target.value)})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pointsRequired">Points Required</Label>
              <Input
                id="pointsRequired"
                type="number"
                value={vipFormData.pointsRequired}
                onChange={(e) => setVipFormData({...vipFormData, pointsRequired: Number(e.target.value)})}
                className="bg-casino-thunder-gray/50 border-white/10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depositBonus">Deposit Bonus (%)</Label>
                <Input
                  id="depositBonus"
                  type="number"
                  value={vipFormData.depositBonus}
                  onChange={(e) => setVipFormData({...vipFormData, depositBonus: Number(e.target.value)})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cashbackRate">Cashback Rate (%)</Label>
                <Input
                  id="cashbackRate"
                  type="number"
                  value={vipFormData.cashbackRate}
                  onChange={(e) => setVipFormData({...vipFormData, cashbackRate: Number(e.target.value)})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawalLimit">Withdrawal Limit ($)</Label>
                <Input
                  id="withdrawalLimit"
                  type="number"
                  value={vipFormData.withdrawalLimit}
                  onChange={(e) => setVipFormData({...vipFormData, withdrawalLimit: Number(e.target.value)})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthdayBonus">Birthday Bonus ($)</Label>
                <Input
                  id="birthdayBonus"
                  type="number"
                  value={vipFormData.birthdayBonus}
                  onChange={(e) => setVipFormData({...vipFormData, birthdayBonus: Number(e.target.value)})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weeklyBonus">Weekly Bonus ($)</Label>
              <Input
                id="weeklyBonus"
                type="number"
                value={vipFormData.weeklyBonus}
                onChange={(e) => setVipFormData({...vipFormData, weeklyBonus: Number(e.target.value)})}
                className="bg-casino-thunder-gray/50 border-white/10"
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-medium">Additional Perks</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="dedicated" className="cursor-pointer flex items-center">
                  Dedicated Account Manager
                </Label>
                <Switch
                  id="dedicated"
                  checked={vipFormData.dedicated}
                  onCheckedChange={(checked) => setVipFormData({...vipFormData, dedicated: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="fastWithdrawals" className="cursor-pointer flex items-center">
                  Fast Withdrawals
                </Label>
                <Switch
                  id="fastWithdrawals"
                  checked={vipFormData.fastWithdrawals}
                  onCheckedChange={(checked) => setVipFormData({...vipFormData, fastWithdrawals: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="exclusivePromos" className="cursor-pointer flex items-center">
                  Exclusive Promotions
                </Label>
                <Switch
                  id="exclusivePromos"
                  checked={vipFormData.exclusivePromos}
                  onCheckedChange={(checked) => setVipFormData({...vipFormData, exclusivePromos: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="specialEvents" className="cursor-pointer flex items-center">
                  Special Event Invitations
                </Label>
                <Switch
                  id="specialEvents"
                  checked={vipFormData.specialEvents}
                  onCheckedChange={(checked) => setVipFormData({...vipFormData, specialEvents: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="customizedOffers" className="cursor-pointer flex items-center">
                  Customized Offers
                </Label>
                <Switch
                  id="customizedOffers"
                  checked={vipFormData.customizedOffers}
                  onCheckedChange={(checked) => setVipFormData({...vipFormData, customizedOffers: checked})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddVipDialogOpen(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddVipLevel}
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            >
              Add VIP Level
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Bonus Template Dialog */}
      <Dialog open={isAddBonusDialogOpen} onOpenChange={setIsAddBonusDialogOpen}>
        <DialogContent className="bg-casino-thunder-dark border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Bonus Template</DialogTitle>
            <DialogDescription>
              Create a new bonus template that can be offered to players
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bonusName">Bonus Name</Label>
              <Input
                id="bonusName"
                value={bonusFormData.name}
                onChange={(e) => setBonusFormData({...bonusFormData, name: e.target.value})}
                className="bg-casino-thunder-gray/50 border-white/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bonusDescription">Description</Label>
              <Input
                id="bonusDescription"
                value={bonusFormData.description}
                onChange={(e) => setBonusFormData({...bonusFormData, description: e.target.value})}
                className="bg-casino-thunder-gray/50 border-white/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bonusType">Bonus Type</Label>
              <Select 
                value={bonusFormData.type} 
                onValueChange={(value) => setBonusFormData({...bonusFormData, type: value})}
              >
                <SelectTrigger id="bonusType" className="bg-casino-thunder-gray/50 border-white/10">
                  <SelectValue placeholder="Select bonus type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit Bonus</SelectItem>
                  <SelectItem value="freespin">Free Spins</SelectItem>
                  <SelectItem value="cashback">Cashback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {bonusFormData.type === "deposit" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="percentage">Bonus Percentage (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    value={bonusFormData.percentage}
                    onChange={(e) => setBonusFormData({...bonusFormData, percentage: Number(e.target.value)})}
                    className="bg-casino-thunder-gray/50 border-white/10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minDeposit">Min Deposit ($)</Label>
                  <Input
                    id="minDeposit"
                    type="number"
                    value={bonusFormData.minDeposit}
                    onChange={(e) => setBonusFormData({...bonusFormData, minDeposit: Number(e.target.value)})}
                    className="bg-casino-thunder-gray/50 border-white/10"
                  />
                </div>
              </div>
            )}
            
            {bonusFormData.type === "freespin" && (
              <div className="space-y-2">
                <Label htmlFor="amount">Number of Free Spins</Label>
                <Input
                  id="amount"
                  type="number"
                  value={bonusFormData.amount}
                  onChange={(e) => setBonusFormData({...bonusFormData, amount: Number(e.target.value)})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
            )}
            
            {bonusFormData.type === "cashback" && (
              <div className="space-y-2">
                <Label htmlFor="cashbackPercentage">Cashback Percentage (%)</Label>
                <Input
                  id="cashbackPercentage"
                  type="number"
                  value={bonusFormData.percentage}
                  onChange={(e) => setBonusFormData({...bonusFormData, percentage: Number(e.target.value)})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxBonus">Max Bonus Amount ($)</Label>
                <Input
                  id="maxBonus"
                  type="number"
                  value={bonusFormData.maxBonus}
                  onChange={(e) => setBonusFormData({...bonusFormData, maxBonus: Number(e.target.value)})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wagering">Wagering Requirement (x)</Label>
                <Input
                  id="wagering"
                  type="number"
                  value={bonusFormData.wagering}
                  onChange={(e) => setBonusFormData({...bonusFormData, wagering: Number(e.target.value)})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDays">Expiry (Days)</Label>
                <Input
                  id="expiryDays"
                  type="number"
                  value={bonusFormData.expiryDays}
                  onChange={(e) => setBonusFormData({...bonusFormData, expiryDays: Number(e.target.value)})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vipLevelRequired">Required VIP Level</Label>
                <Select 
                  value={bonusFormData.vipLevelRequired.toString()} 
                  onValueChange={(value) => setBonusFormData({...bonusFormData, vipLevelRequired: Number(value)})}
                >
                  <SelectTrigger id="vipLevelRequired" className="bg-casino-thunder-gray/50 border-white/10">
                    <SelectValue placeholder="Select required VIP level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None (All Users)</SelectItem>
                    {vipLevels.map((level) => (
                      <SelectItem key={level.id} value={level.level.toString()}>{level.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">Bonus Code (Optional)</Label>
              <Input
                id="code"
                value={bonusFormData.code}
                onChange={(e) => setBonusFormData({...bonusFormData, code: e.target.value})}
                className="bg-casino-thunder-gray/50 border-white/10"
              />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="active" className="cursor-pointer flex items-center">
                Active Status
              </Label>
              <Switch
                id="active"
                checked={bonusFormData.active}
                onCheckedChange={(checked) => setBonusFormData({...bonusFormData, active: checked})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddBonusDialogOpen(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddBonusTemplate}
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            >
              Add Bonus Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog (for both VIP and Bonus) */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-casino-thunder-dark border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.type === 'vip' ? 'Edit VIP Level' : 'Edit Bonus Template'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.type === 'vip' 
                ? 'Update the VIP level configuration' 
                : 'Update the bonus template configuration'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem?.type === 'vip' ? (
            <div className="space-y-4 py-4">
              {/* VIP edit form - same as add form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Level Name</Label>
                  <Input
                    id="edit-name"
                    value={vipFormData.name}
                    onChange={(e) => setVipFormData({...vipFormData, name: e.target.value})}
                    className="bg-casino-thunder-gray/50 border-white/10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Level Number</Label>
                  <Input
                    id="edit-level"
                    type="number"
                    value={vipFormData.level}
                    onChange={(e) => setVipFormData({...vipFormData, level: Number(e.target.value)})}
                    className="bg-casino-thunder-gray/50 border-white/10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-pointsRequired">Points Required</Label>
                <Input
                  id="edit-pointsRequired"
                  type="number"
                  value={vipFormData.pointsRequired}
                  onChange={(e) => setVipFormData({...vipFormData, pointsRequired: Number(e.target.value)})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-depositBonus">Deposit Bonus (%)</Label>
                  <Input
                    id="edit-depositBonus"
                    type="number"
                    value={vipFormData.depositBonus}
                    onChange={(e) => setVipFormData({...vipFormData, depositBonus: Number(e.target.value)})}
                    className="bg-casino-thunder-gray/50 border-white/10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-cashbackRate">Cashback Rate (%)</Label>
                  <Input
                    id="edit-cashbackRate"
                    type="number"
                    value={vipFormData.cashbackRate}
                    onChange={(e) => setVipFormData({...vipFormData, cashbackRate: Number(e.target.value)})}
                    className="bg-casino-thunder-gray/50 border-white/10"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-withdrawalLimit">Withdrawal Limit ($)</Label>
                  <Input
                    id="edit-withdrawalLimit"
                    type="number"
                    value={vipFormData.withdrawalLimit}
                    onChange={(e) => setVipFormData({...vipFormData, withdrawalLimit: Number(e.target.value)})}
                    className="bg-casino-thunder-gray/50 border-white/10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-birthdayBonus">Birthday Bonus ($)</Label>
                  <Input
                    id="edit-birthdayBonus"
                    type="number"
                    value={vipFormData.birthdayBonus}
                    onChange={(e) => setVipFormData({...vipFormData, birthdayBonus: Number(e.target.value)})}
                    className="bg-casino-thunder-gray/50 border-white/10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-weeklyBonus">Weekly Bonus ($)</Label>
                <Input
                  id="edit-weeklyBonus"
                  type="number"
                  value={vipFormData.weeklyBonus}
                  onChange={(e) => setVipFormData({...vipFormData, weeklyBonus: Number(e.target.value)})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
              
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-medium">Additional Perks</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-dedicated" className="cursor-pointer flex items-center">
                    Dedicated Account Manager
                  </Label>
                  <Switch
                    id="edit-dedicated"
                    checked={vipFormData.dedicated}
                    onCheckedChange={(checked) => setVipFormData({...vipFormData, dedicated: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-fastWithdrawals" className="cursor-pointer flex items-center">
                    Fast Withdrawals
                  </Label>
                  <Switch
                    id="edit-fastWithdrawals"
                    checked={vipFormData.fastWithdrawals}
                    onCheckedChange={(checked) => setVipFormData({...vipFormData, fastWithdrawals: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-exclusivePromos" className="cursor-pointer flex items-center">
                    Exclusive Promotions
                  </Label>
                  <Switch
                    id="edit-exclusivePromos"
                    checked={vipFormData.exclusivePromos}
                    onCheckedChange={(checked) => setVipFormData({...vipFormData, exclusivePromos: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-specialEvents" className="cursor-pointer flex items-center">
                    Special Event Invitations
                  </Label>
                  <Switch
                    id="edit-specialEvents"
                    checked={vipFormData.specialEvents}
                    onCheckedChange={(checked) => setVipFormData({...vipFormData, specialEvents: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-customizedOffers" className="cursor-pointer flex items-center">
                    Customized Offers
                  </Label>
                  <Switch
                    id="edit-customizedOffers"
                    checked={vipFormData.customizedOffers}
                    onCheckedChange={(checked) => setVipFormData({...vipFormData, customizedOffers: checked})}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Bonus edit form - same as add form */}
              <div className="space-y-2">
                <Label htmlFor="edit-bonusName">Bonus Name</Label>
                <Input
                  id="edit-bonusName"
                  value={bonusFormData.name}
                  onChange={(e) => setBonusFormData({...bonusFormData, name: e.target.value})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-bonusDescription">Description</Label>
                <Input
                  id="edit-bonusDescription"
                  value={bonusFormData.description}
                  onChange={(e) => setBonusFormData({...bonusFormData, description: e.target.value})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-bonusType">Bonus Type</Label>
                <Select 
                  value={bonusFormData.type} 
                  onValueChange={(value) => setBonusFormData({...bonusFormData, type: value})}
                >
                  <SelectTrigger id="edit-bonusType" className="bg-casino-thunder-gray/50 border-white/10">
                    <SelectValue placeholder="Select bonus type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit Bonus</SelectItem>
                    <SelectItem value="freespin">Free Spins</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {bonusFormData.type === "deposit" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-percentage">Bonus Percentage (%)</Label>
                    <Input
                      id="edit-percentage"
                      type="number"
                      value={bonusFormData.percentage}
                      onChange={(e) => setBonusFormData({...bonusFormData, percentage: Number(e.target.value)})}
                      className="bg-casino-thunder-gray/50 border-white/10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-minDeposit">Min Deposit ($)</Label>
                    <Input
                      id="edit-minDeposit"
                      type="number"
                      value={bonusFormData.minDeposit}
                      onChange={(e) => setBonusFormData({...bonusFormData, minDeposit: Number(e.target.value)})}
                      className="bg-casino-thunder-gray/50 border-white/10"
                    />
                  </div>
                </div>
              )}
              
              {bonusFormData.type === "freespin" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Number of Free Spins</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    value={bonusFormData.amount}
                    onChange={(e) => setBonusFormData({...bonusFormData, amount: Number(e.target.value)})}
                    className="bg-casino-thunder-gray/50 border-white/10"
                  />
                </div>
              )}
              
              {bonusFormData.type === "cashback" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-cashbackPercentage">Cashback Percentage (%)</Label>
                  <Input
                    id="edit-cashbackPercentage"
                    type="number"
                    value={bonusFormData.percentage}
                    onChange={(e) => setBonusFormData({...bonusFormData, percentage: Number(e.target.value)})}
                    className="bg-casino-thunder-gray/50 border-white/10"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-maxBonus">Max Bonus Amount ($)</Label>
                  <Input
                    id="edit-maxBonus"
                    type="number"
                    value={bonusFormData.maxBonus}
                    onChange={(e) => setBonusFormData({...bonusFormData, maxBonus: Number(e.target.value)})}
                    className="bg-casino-thunder-gray/50 border-white/10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-wagering">Wagering Requirement (x)</Label>
                  <Input
                    id="edit-wagering"
                    type="number"
                    value={bonusFormData.wagering}
                    onChange={(e) => setBonusFormData({...bonusFormData, wagering: Number(e.target.value)})}
                    className="bg-casino-thunder-gray/50 border-white/10"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-expiryDays">Expiry (Days)</Label>
                  <Input
                    id="edit-expiryDays"
                    type="number"
                    value={bonusFormData.expiryDays}
                    onChange={(e) => setBonusFormData({...bonusFormData, expiryDays: Number(e.target.value)})}
                    className="bg-casino-thunder-gray/50 border-white/10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-vipLevelRequired">Required VIP Level</Label>
                  <Select 
                    value={bonusFormData.vipLevelRequired.toString()} 
                    onValueChange={(value) => setBonusFormData({...bonusFormData, vipLevelRequired: Number(value)})}
                  >
                    <SelectTrigger id="edit-vipLevelRequired" className="bg-casino-thunder-gray/50 border-white/10">
                      <SelectValue placeholder="Select required VIP level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None (All Users)</SelectItem>
                      {vipLevels.map((level) => (
                        <SelectItem key={level.id} value={level.level.toString()}>{level.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-code">Bonus Code (Optional)</Label>
                <Input
                  id="edit-code"
                  value={bonusFormData.code}
                  onChange={(e) => setBonusFormData({...bonusFormData, code: e.target.value})}
                  className="bg-casino-thunder-gray/50 border-white/10"
                />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="edit-active" className="cursor-pointer flex items-center">
                  Active Status
                </Label>
                <Switch
                  id="edit-active"
                  checked={bonusFormData.active}
                  onCheckedChange={(checked) => setBonusFormData({...bonusFormData, active: checked})}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateItem}
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VipBonusManagement;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Gift, Zap, Clock, Check, BadgeDollarSign, Award, ChevronRight, Info } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Bonus, BonusTemplate, VipLevel } from "@/types";

const BonusHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("active");
  const [bonusTemplates, setBonusTemplates] = useState<BonusTemplate[]>([]);
  const [userBonuses, setUserBonuses] = useState<Bonus[]>([]);
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [showBonusInfo, setShowBonusInfo] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Load bonus templates
    const storedBonusTemplates = JSON.parse(localStorage.getItem("bonusTemplates") || "[]");
    setBonusTemplates(storedBonusTemplates);
    
    // Load VIP levels
    const storedVipLevels = JSON.parse(localStorage.getItem("vipLevels") || "[]");
    setVipLevels(storedVipLevels);
    
    // Load user bonuses
    const storedUserBonuses = JSON.parse(localStorage.getItem("userBonuses") || "[]");
    const userSpecificBonuses = storedUserBonuses.filter((bonus: Bonus) => bonus.userId === user.id);
    setUserBonuses(userSpecificBonuses);
  }, [user, navigate]);
  
  const claimBonus = (template: BonusTemplate) => {
    if (!user) return;
    
    // Check if user already has this bonus
    const existingBonus = userBonuses.find(bonus => 
      bonus.title === template.title && bonus.status === "active"
    );
    
    if (existingBonus) {
      toast({
        title: "Bonus Already Active",
        description: "You already have this bonus active",
        variant: "destructive"
      });
      return;
    }
    
    // Check VIP level requirement
    if (user.vipLevel === undefined || user.vipLevel < template.requiredVipLevel) {
      toast({
        title: "VIP Level Required",
        description: `This bonus requires VIP level ${vipLevels.find(level => level.id === template.requiredVipLevel)?.name || template.requiredVipLevel}`,
        variant: "destructive"
      });
      return;
    }
    
    // Create new bonus
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + template.duration);
    
    const newBonus: Bonus = {
      id: `bonus-${Date.now()}`,
      userId: user.id,
      title: template.title,
      description: template.description,
      amount: template.amount,
      wagerRequired: template.amount * template.wagerMultiplier,
      wagerCompleted: 0,
      expiresAt: expirationDate.toISOString(),
      status: "active",
      type: template.type,
      bonusCode: template.bonusCode
    };
    
    // Update local storage
    const allBonuses = JSON.parse(localStorage.getItem("userBonuses") || "[]");
    const updatedBonuses = [...allBonuses, newBonus];
    localStorage.setItem("userBonuses", JSON.stringify(updatedBonuses));
    
    // Update state
    setUserBonuses([...userBonuses, newBonus]);
    
    toast({
      title: "Bonus Claimed!",
      description: `You have successfully claimed the ${template.title}`
    });
  };
  
  const openBonusInfo = (bonus: Bonus) => {
    setSelectedBonus(bonus);
    setShowBonusInfo(true);
  };
  
  const getBonusIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <BadgeDollarSign className="h-5 w-5" />;
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
  
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = Math.max(0, expiration.getTime() - now.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h remaining`;
    } else {
      return `${diffHours}h remaining`;
    }
  };
  
  const getCurrentVipLevel = () => {
    if (user?.vipLevel !== undefined && vipLevels.length > 0) {
      return vipLevels.find(level => level.id === user.vipLevel) || null;
    }
    return null;
  };
  
  const getNextVipLevel = () => {
    if (user?.vipLevel !== undefined && vipLevels.length > 0) {
      const nextLevelId = user.vipLevel + 1;
      return vipLevels.find(level => level.id === nextLevelId) || null;
    }
    return null;
  };
  
  const currentVipLevel = getCurrentVipLevel();
  const nextVipLevel = getNextVipLevel();
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="w-full lg:w-3/4 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Bonus Hub</h1>
              <p className="text-white/60">Manage your active bonuses and claim new rewards</p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/5 mb-6">
                <TabsTrigger value="active">My Bonuses</TabsTrigger>
                <TabsTrigger value="available">Available Bonuses</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                {userBonuses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userBonuses.filter(bonus => bonus.status === "active").map((bonus) => (
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
                              {getBonusIcon(bonus.type)}
                              <span className="ml-2">{bonus.title}</span>
                            </CardTitle>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openBonusInfo(bonus)}
                              className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardDescription>{bonus.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-white/60">Wagering Progress</span>
                              <span>{Math.round((bonus.wagerCompleted / bonus.wagerRequired) * 100)}%</span>
                            </div>
                            <Progress 
                              value={(bonus.wagerCompleted / bonus.wagerRequired) * 100} 
                              className="h-2" 
                            />
                            <div className="flex justify-between text-xs mt-1">
                              <span>${bonus.wagerCompleted.toFixed(2)}</span>
                              <span>${bonus.wagerRequired.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Bonus Amount</span>
                            <span className="font-medium">${bonus.amount.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center text-xs text-white/60">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{getTimeRemaining(bonus.expiresAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/5 rounded-lg">
                    <Gift className="h-12 w-12 mx-auto text-casino-thunder-green opacity-50 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Active Bonuses</h3>
                    <p className="text-white/60 mb-4">You don't have any active bonuses at the moment</p>
                    <Button 
                      onClick={() => setActiveTab("available")}
                      className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                    >
                      Browse Available Bonuses
                    </Button>
                  </div>
                )}
                
                {userBonuses.filter(bonus => bonus.status === "completed" || bonus.status === "expired").length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Bonus History</h3>
                    <div className="bg-white/5 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Bonus</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {userBonuses
                            .filter(bonus => bonus.status === "completed" || bonus.status === "expired")
                            .map((bonus) => (
                              <tr key={bonus.id} className="hover:bg-white/5">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {getBonusIcon(bonus.type)}
                                    <span className="ml-2">{bonus.title}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  ${bonus.amount.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    bonus.status === 'completed' ? 'bg-green-900/30 text-green-400' : 
                                    'bg-red-900/30 text-red-400'
                                  }`}>
                                    {bonus.status === 'completed' ? 'Completed' : 'Expired'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-white/60">
                                  {new Date(bonus.expiresAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="available">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bonusTemplates
                    .filter(template => template.isActive)
                    .map((template) => {
                      const userHasBonus = userBonuses.some(
                        bonus => bonus.title === template.title && bonus.status === "active"
                      );
                      
                      const userHasRequiredVipLevel = 
                        user?.vipLevel !== undefined && user.vipLevel >= template.requiredVipLevel;
                      
                      return (
                        <Card key={template.id} className="bg-casino-thunder-dark border-white/10 overflow-hidden">
                          <div className={`h-1 ${
                            template.type === 'deposit' ? 'bg-yellow-500' : 
                            template.type === 'free_spin' ? 'bg-green-500' : 
                            template.type === 'cashback' ? 'bg-blue-500' : 
                            template.type === 'loyalty' ? 'bg-purple-500' : 'bg-casino-thunder-green'
                          }`}></div>
                          <CardHeader className="pb-2">
                            <CardTitle className="flex items-center">
                              {getBonusIcon(template.type)}
                              <span className="ml-2">{template.title}</span>
                            </CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Bonus Amount</span>
                              <span className="font-medium">${template.amount.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Wagering Requirement</span>
                              <span className="font-medium">{template.wagerMultiplier}x</span>
                            </div>
                            
                            {template.minDeposit > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Minimum Deposit</span>
                                <span>${template.minDeposit.toFixed(2)}</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Duration</span>
                              <span>{template.duration} days</span>
                            </div>
                            
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Required VIP Level</span>
                              <span>{vipLevels.find(level => level.id === template.requiredVipLevel)?.name || template.requiredVipLevel}</span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                              disabled={userHasBonus || !userHasRequiredVipLevel}
                              onClick={() => claimBonus(template)}
                            >
                              {userHasBonus 
                                ? "Already Claimed" 
                                : !userHasRequiredVipLevel 
                                  ? `Requires ${vipLevels.find(level => level.id === template.requiredVipLevel)?.name} VIP` 
                                  : "Claim Bonus"}
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="w-full lg:w-1/4">
            <Card className="bg-casino-thunder-dark border-white/10">
              <CardHeader>
                <CardTitle>My VIP Status</CardTitle>
                <CardDescription>
                  Unlock exclusive rewards as you level up
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentVipLevel ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: currentVipLevel.color + '33', borderColor: currentVipLevel.color, borderWidth: '2px' }}
                      >
                        <Award className="h-6 w-6" style={{ color: currentVipLevel.color }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{currentVipLevel.name}</h3>
                        <p className="text-xs text-white/60">{currentVipLevel.description}</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Current Benefits</h4>
                      <ul className="space-y-1">
                        {currentVipLevel.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-white/70 flex items-start">
                            <Check className="h-4 w-4 mr-1 flex-shrink-0 text-casino-thunder-green" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {nextVipLevel && (
                      <>
                        <Separator className="bg-white/10" />
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Next Level: {nextVipLevel.name}</h4>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress to {nextVipLevel.name}</span>
                              <span>???/{nextVipLevel.requiredPoints} points</span>
                            </div>
                            <Progress value={0} className="h-2" />
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full mt-2 text-white/80 border-white/20"
                            onClick={() => navigate("/vip")}
                          >
                            View VIP Program
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-white/60">VIP information not available</p>
                    <Button 
                      variant="outline" 
                      className="mt-2 text-white/80 border-white/20"
                      onClick={() => navigate("/vip")}
                    >
                      View VIP Program
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Bonus Detail Dialog */}
      <Dialog open={showBonusInfo} onOpenChange={setShowBonusInfo}>
        <DialogContent className="bg-casino-thunder-dark border-white/10">
          <DialogHeader>
            <DialogTitle>Bonus Details</DialogTitle>
            <DialogDescription>
              Detailed information about your bonus
            </DialogDescription>
          </DialogHeader>
          
          {selectedBonus && (
            <div className="space-y-4 py-4">
              <div className="flex items-center mb-4">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    selectedBonus.type === 'deposit' ? 'bg-yellow-500/20' : 
                    selectedBonus.type === 'free_spin' ? 'bg-green-500/20' : 
                    selectedBonus.type === 'cashback' ? 'bg-blue-500/20' : 
                    selectedBonus.type === 'loyalty' ? 'bg-purple-500/20' : 'bg-casino-thunder-green/20'
                  }`}
                >
                  {getBonusIcon(selectedBonus.type)}
                </div>
                <div>
                  <h3 className="font-bold">{selectedBonus.title}</h3>
                  <p className="text-sm text-white/60">{selectedBonus.description}</p>
                </div>
              </div>
              
              <Separator className="bg-white/10" />
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Bonus Amount</span>
                  <span className="font-medium">${selectedBonus.amount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/60">Wagering Requirement</span>
                  <span className="font-medium">${selectedBonus.wagerRequired.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/60">Completed Wagering</span>
                  <span className="font-medium">${selectedBonus.wagerCompleted.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/60">Remaining Wagering</span>
                  <span className="font-medium">${(selectedBonus.wagerRequired - selectedBonus.wagerCompleted).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/60">Expires On</span>
                  <span className="font-medium">{new Date(selectedBonus.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Wagering Progress</span>
                  <span>{Math.round((selectedBonus.wagerCompleted / selectedBonus.wagerRequired) * 100)}%</span>
                </div>
                <Progress 
                  value={(selectedBonus.wagerCompleted / selectedBonus.wagerRequired) * 100} 
                  className="h-2"
                />
              </div>
              
              <Separator className="bg-white/10" />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Bonus Terms</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• Winnings from this bonus will be added to your bonus balance until wagering is complete</li>
                  <li>• You cannot withdraw bonus funds until all wagering requirements are met</li>
                  <li>• This bonus will expire on {new Date(selectedBonus.expiresAt).toLocaleDateString()}</li>
                  <li>• Not all games contribute equally to wagering requirements</li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              onClick={() => setShowBonusInfo(false)}
              className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default BonusHub;

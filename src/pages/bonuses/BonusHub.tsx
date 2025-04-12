
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Gift, Calendar, Clock, Zap, Lock, Info, Award, Percent } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Bonus, BonusTemplate, VipLevel } from "@/types";

const BonusHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("available");
  const [availableBonuses, setAvailableBonuses] = useState<BonusTemplate[]>([]);
  const [activeBonuses, setActiveBonuses] = useState<Bonus[]>([]);
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [historyBonuses, setHistoryBonuses] = useState<Bonus[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<BonusTemplate | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Load bonus templates
    const bonusTemplates = JSON.parse(localStorage.getItem("bonusTemplates") || "[]");
    const vipLevels = JSON.parse(localStorage.getItem("vipLevels") || "[]");
    
    // Filter to only show bonuses available for user's VIP level
    const availableBonusesList = bonusTemplates.filter((b: BonusTemplate) => {
      return b.active && b.vipLevelRequired <= (user.vipLevel || 0);
    });
    
    setAvailableBonuses(availableBonusesList);
    setVipLevels(vipLevels);
    
    // Load user's active bonuses
    const userBonuses = JSON.parse(localStorage.getItem(`user_bonuses_${user.id}`) || "[]");
    
    // Split into active and expired
    const now = new Date();
    const active = userBonuses.filter((b: Bonus) => new Date(b.expiresAt) > now);
    const history = userBonuses.filter((b: Bonus) => new Date(b.expiresAt) <= now);
    
    setActiveBonuses(active);
    setHistoryBonuses(history);
  }, [user, navigate]);
  
  const showBonusDetails = (bonus: BonusTemplate) => {
    setSelectedBonus(bonus);
    setIsDetailsOpen(true);
  };
  
  const claimBonus = (bonus: BonusTemplate) => {
    if (!user) return;
    
    // Create a new active bonus for the user
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + bonus.expiryDays);
    
    const newBonus: Bonus = {
      id: `bonus_${Date.now()}`,
      userId: user.id,
      templateId: bonus.id,
      name: bonus.name,
      description: bonus.description,
      type: bonus.type,
      amount: bonus.amount,
      percentage: bonus.percentage,
      maxBonus: bonus.maxBonus,
      wagering: bonus.wagering,
      progress: 0,
      createdAt: new Date().toISOString(),
      expiresAt: expirationDate.toISOString(),
      isCompleted: false
    };
    
    // Add to user's bonuses
    const userBonuses = JSON.parse(localStorage.getItem(`user_bonuses_${user.id}`) || "[]");
    const updatedBonuses = [...userBonuses, newBonus];
    localStorage.setItem(`user_bonuses_${user.id}`, JSON.stringify(updatedBonuses));
    
    // Update state
    setActiveBonuses([...activeBonuses, newBonus]);
    
    // Show success toast
    toast({
      title: "Bonus Claimed",
      description: `You've successfully claimed the ${bonus.name} bonus!`,
    });
    
    // Close the dialog
    setIsDetailsOpen(false);
    
    // Switch to active tab
    setActiveTab("active");
  };
  
  const getVipLevelName = (level: number) => {
    const vipLevel = vipLevels.find(vl => vl.level === level);
    return vipLevel ? vipLevel.name : `Level ${level}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const calculateRemainingTime = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = Math.abs(expiration.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) {
      return `${diffDays} days`;
    } else {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      return `${diffHours} hours`;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Bonus Hub</h1>
        <p className="text-white/60 mt-2">
          Discover and claim exclusive bonuses and promotions
        </p>
      </div>
      
      <Tabs defaultValue="available" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="available" className="py-3">
            <Gift className="mr-2 h-4 w-4" /> Available
          </TabsTrigger>
          <TabsTrigger value="active" className="py-3">
            <Zap className="mr-2 h-4 w-4" /> Active
          </TabsTrigger>
          <TabsTrigger value="history" className="py-3">
            <Clock className="mr-2 h-4 w-4" /> History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableBonuses.length > 0 ? (
              availableBonuses.map((bonus) => (
                <Card key={bonus.id} className="bg-casino-thunder-dark border-white/10">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{bonus.name}</CardTitle>
                        <CardDescription>
                          {bonus.type === "deposit" ? "Deposit Bonus" : 
                           bonus.type === "freespin" ? "Free Spins" : 
                           bonus.type === "cashback" ? "Cashback" : "Bonus"}
                        </CardDescription>
                      </div>
                      {bonus.vipLevelRequired > 0 && (
                        <Badge variant="outline" className="bg-casino-thunder-gray/30">
                          {getVipLevelName(bonus.vipLevelRequired)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-white/80">{bonus.description || "Exclusive bonus offer"}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {bonus.type === "deposit" && (
                        <>
                          <div className="flex items-center text-white/60">
                            <Percent className="h-4 w-4 mr-2" />
                            <span>{bonus.percentage}% up to ${bonus.maxBonus}</span>
                          </div>
                          <div className="flex items-center text-white/60">
                            <Info className="h-4 w-4 mr-2" />
                            <span>Min. deposit: ${bonus.minDeposit}</span>
                          </div>
                        </>
                      )}
                      
                      {bonus.type === "freespin" && (
                        <div className="flex items-center text-white/60">
                          <Zap className="h-4 w-4 mr-2" />
                          <span>{bonus.amount} Free Spins</span>
                        </div>
                      )}
                      
                      {bonus.type === "cashback" && (
                        <div className="flex items-center text-white/60">
                          <Percent className="h-4 w-4 mr-2" />
                          <span>{bonus.percentage}% Cashback up to ${bonus.maxBonus}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-white/60">
                        <Lock className="h-4 w-4 mr-2" />
                        <span>{bonus.wagering}x wagering</span>
                      </div>
                      
                      <div className="flex items-center text-white/60">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Valid for {bonus.expiryDays} days</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      className="border-white/20"
                      onClick={() => showBonusDetails(bonus)}
                    >
                      Details
                    </Button>
                    <Button 
                      className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={() => claimBonus(bonus)}
                    >
                      Claim Now
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full bg-casino-thunder-dark border border-white/10 rounded-lg p-8 text-center">
                <Gift className="mx-auto h-12 w-12 text-white/30 mb-3" />
                <h3 className="text-xl font-medium mb-2">No Bonuses Available</h3>
                <p className="text-white/60 max-w-md mx-auto">
                  There are no bonuses available for your current VIP level.
                  Upgrade your VIP status to unlock more exclusive bonuses.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-casino-thunder-green text-casino-thunder-green hover:bg-casino-thunder-green hover:text-black"
                  onClick={() => navigate("/vip")}
                >
                  <Award className="mr-2 h-4 w-4" /> View VIP Program
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBonuses.length > 0 ? (
              activeBonuses.map((bonus) => (
                <Card key={bonus.id} className="bg-casino-thunder-dark border-white/10">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{bonus.name}</CardTitle>
                        <CardDescription>
                          {bonus.type === "deposit" ? "Deposit Bonus" : 
                           bonus.type === "freespin" ? "Free Spins" : 
                           bonus.type === "cashback" ? "Cashback" : "Bonus"}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-800">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-white/80">{bonus.description || "Active bonus"}</p>
                    </div>
                    
                    <div className="space-y-4 text-sm">
                      {/* Wagering progress bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/60">Wagering Progress</span>
                          <span className="text-white/80">{Math.min(100, Math.round((bonus.progress / bonus.wagering) * 100))}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2.5">
                          <div 
                            className="bg-casino-thunder-green h-2.5 rounded-full" 
                            style={{ width: `${Math.min(100, Math.round((bonus.progress / bonus.wagering) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {bonus.type === "deposit" && (
                        <div className="flex items-center text-white/60">
                          <Info className="h-4 w-4 mr-2" />
                          <span>Bonus amount: ${bonus.amount}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-white/60">
                        <Lock className="h-4 w-4 mr-2" />
                        <span>Wagering: ${bonus.progress.toFixed(2)}/${bonus.wagering}x</span>
                      </div>
                      
                      <div className="flex items-center text-white/60">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Expires in: {calculateRemainingTime(bonus.expiresAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={() => navigate("/casino")}
                    >
                      Play Now
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full bg-casino-thunder-dark border border-white/10 rounded-lg p-8 text-center">
                <Zap className="mx-auto h-12 w-12 text-white/30 mb-3" />
                <h3 className="text-xl font-medium mb-2">No Active Bonuses</h3>
                <p className="text-white/60 max-w-md mx-auto">
                  You don't have any active bonuses at the moment.
                  Claim a bonus from the available tab to get started.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab("available")}
                >
                  <Gift className="mr-2 h-4 w-4" /> View Available Bonuses
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyBonuses.length > 0 ? (
              historyBonuses.map((bonus) => (
                <Card key={bonus.id} className="bg-casino-thunder-dark border-white/10">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{bonus.name}</CardTitle>
                        <CardDescription>
                          {bonus.type === "deposit" ? "Deposit Bonus" : 
                           bonus.type === "freespin" ? "Free Spins" : 
                           bonus.type === "cashback" ? "Cashback" : "Bonus"}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-white/10">
                        {bonus.isCompleted ? "Completed" : "Expired"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {bonus.type === "deposit" && (
                        <div className="flex items-center text-white/60">
                          <Info className="h-4 w-4 mr-2" />
                          <span>Bonus amount: ${bonus.amount}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-white/60">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Claimed on: {formatDate(bonus.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center text-white/60">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Expired on: {formatDate(bonus.expiresAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full bg-casino-thunder-dark border border-white/10 rounded-lg p-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-white/30 mb-3" />
                <h3 className="text-xl font-medium mb-2">No Bonus History</h3>
                <p className="text-white/60 max-w-md mx-auto">
                  You haven't claimed any bonuses yet or your bonus history is empty.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab("available")}
                >
                  <Gift className="mr-2 h-4 w-4" /> Browse Available Bonuses
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Bonus Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-casino-thunder-dark border-white/10">
          <DialogHeader>
            <DialogTitle>{selectedBonus?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedBonus && (
            <div className="space-y-4">
              <p className="text-white/80">{selectedBonus.description || "Exclusive bonus offer for our valued players."}</p>
              
              <div className="bg-white/5 p-4 rounded-md space-y-3">
                {selectedBonus.type === "deposit" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-white/60">Bonus Percentage:</span>
                      <span>{selectedBonus.percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Minimum Deposit:</span>
                      <span>${selectedBonus.minDeposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Maximum Bonus:</span>
                      <span>${selectedBonus.maxBonus}</span>
                    </div>
                  </>
                )}
                
                {selectedBonus.type === "freespin" && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Free Spins:</span>
                    <span>{selectedBonus.amount}</span>
                  </div>
                )}
                
                {selectedBonus.type === "cashback" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-white/60">Cashback Rate:</span>
                      <span>{selectedBonus.percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Maximum Cashback:</span>
                      <span>${selectedBonus.maxBonus}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between">
                  <span className="text-white/60">Wagering Requirement:</span>
                  <span>{selectedBonus.wagering}x</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/60">Expiry Period:</span>
                  <span>{selectedBonus.expiryDays} days</span>
                </div>
                
                {selectedBonus.vipLevelRequired > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/60">VIP Level Required:</span>
                    <span>{getVipLevelName(selectedBonus.vipLevelRequired)}</span>
                  </div>
                )}
                
                {selectedBonus.code && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Bonus Code:</span>
                    <span className="font-mono">{selectedBonus.code}</span>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-white/60">
                <h4 className="font-medium mb-1">Terms & Conditions:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>The bonus must be wagered {selectedBonus.wagering}x times before withdrawal.</li>
                  <li>The bonus expires after {selectedBonus.expiryDays} days.</li>
                  <li>Not all games contribute equally to wagering requirements.</li>
                  <li>The casino reserves the right to modify or cancel this promotion at any time.</li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
              className="border-white/10"
            >
              Close
            </Button>
            <Button
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
              onClick={() => selectedBonus && claimBonus(selectedBonus)}
            >
              Claim Bonus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BonusHub;

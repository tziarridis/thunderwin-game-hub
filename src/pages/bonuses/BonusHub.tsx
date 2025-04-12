
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Clock, Check, Zap, TrendingUp, Award, Lock, Percent } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Bonus {
  id: string;
  title: string;
  description: string;
  amount: number;
  wagerRequired: number;
  wagerCompleted: number;
  expiresAt: string;
  status: "active" | "completed" | "expired";
  type: "deposit" | "free_spin" | "cashback" | "loyalty" | "vip";
  bonusCode?: string;
}

interface BonusTemplate {
  id: string;
  title: string;
  description: string;
  amount: number;
  wagerMultiplier: number;
  duration: number; // in days
  minDeposit: number;
  isActive: boolean;
  requiredVipLevel: number;
  type: "deposit" | "free_spin" | "cashback" | "loyalty" | "vip";
  bonusCode?: string;
}

const BonusHub = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("available");
  const [userBonuses, setUserBonuses] = useState<Bonus[]>([]);
  const [availableBonuses, setAvailableBonuses] = useState<BonusTemplate[]>([]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // Fetch user's active bonuses from localStorage
    const storedBonuses = JSON.parse(localStorage.getItem("userBonuses") || "[]");
    if (user) {
      const userActiveBonuses = storedBonuses.filter((bonus: Bonus) => 
        bonus.userId === user.id && bonus.status !== "expired"
      );
      setUserBonuses(userActiveBonuses);
    }
    
    // Fetch available bonuses from localStorage
    const availableBonusTemplates = JSON.parse(localStorage.getItem("bonusTemplates") || "[]");
    
    // Filter available bonuses based on user's VIP level
    if (user) {
      const filteredBonuses = availableBonusTemplates.filter((bonus: BonusTemplate) => 
        bonus.isActive && (user.vipLevel || 0) >= bonus.requiredVipLevel
      );
      setAvailableBonuses(filteredBonuses);
    } else {
      setAvailableBonuses([]);
    }
  }, [user, isAuthenticated, navigate]);
  
  const calculateWagerProgress = (completed: number, required: number) => {
    return Math.min((completed / required) * 100, 100);
  };
  
  const formatTimeRemaining = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    
    const diffTime = expiryDate.getTime() - now.getTime();
    
    if (diffTime <= 0) {
      return "Expired";
    }
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h remaining`;
    } else {
      return `${diffHours}h remaining`;
    }
  };
  
  const claimBonus = (bonusTemplate: BonusTemplate) => {
    if (!user) return;
    
    // Create a new bonus instance for the user
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + bonusTemplate.duration);
    
    const newBonus: Bonus = {
      id: `bonus-${Date.now()}`,
      userId: user.id,
      title: bonusTemplate.title,
      description: bonusTemplate.description,
      amount: bonusTemplate.amount,
      wagerRequired: bonusTemplate.amount * bonusTemplate.wagerMultiplier,
      wagerCompleted: 0,
      expiresAt: expiryDate.toISOString(),
      status: "active",
      type: bonusTemplate.type,
      bonusCode: bonusTemplate.bonusCode
    };
    
    // Save to localStorage
    const currentBonuses = JSON.parse(localStorage.getItem("userBonuses") || "[]");
    currentBonuses.push(newBonus);
    localStorage.setItem("userBonuses", JSON.stringify(currentBonuses));
    
    // Update state
    setUserBonuses([...userBonuses, newBonus]);
    setActiveTab("active");
  };
  
  const getBonusTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <Percent className="h-5 w-5" />;
      case "free_spin":
        return <Zap className="h-5 w-5" />;
      case "cashback":
        return <TrendingUp className="h-5 w-5" />;
      case "loyalty":
        return <Award className="h-5 w-5" />;
      case "vip":
        return <Gift className="h-5 w-5" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Bonus Hub</h1>
        <p className="text-white/70 text-center max-w-2xl">
          View your active bonuses, track wagering progress, and discover new promotions
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="active">Active Bonuses</TabsTrigger>
          <TabsTrigger value="available">Available Bonuses</TabsTrigger>
          <TabsTrigger value="history">Bonus History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {userBonuses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userBonuses.map((bonus) => (
                <Card key={bonus.id} className="bg-casino-thunder-dark border-white/10 overflow-hidden">
                  <div className={`h-1 ${
                    bonus.type === 'deposit' ? 'bg-yellow-500' : 
                    bonus.type === 'free_spin' ? 'bg-green-500' : 
                    bonus.type === 'cashback' ? 'bg-blue-500' : 
                    bonus.type === 'loyalty' ? 'bg-purple-500' : 'bg-casino-thunder-green'
                  }`}></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          {getBonusTypeIcon(bonus.type)}
                          <span className="ml-2">{bonus.title}</span>
                        </CardTitle>
                        <CardDescription className="mt-1">{bonus.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">${bonus.amount}</div>
                        <div className="text-xs text-white/60 flex items-center justify-end mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeRemaining(bonus.expiresAt)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Wagering Progress</span>
                          <span>{bonus.wagerCompleted} / {bonus.wagerRequired}</span>
                        </div>
                        <Progress value={calculateWagerProgress(bonus.wagerCompleted, bonus.wagerRequired)} className="h-2" />
                      </div>
                      
                      <div className="text-sm text-white/70">
                        <p>Wager {formatCurrency(bonus.wagerRequired - bonus.wagerCompleted)} more to unlock your bonus.</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate("/casino")}
                    >
                      Play Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-casino-thunder-dark border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Gift className="h-8 w-8 text-white/40" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Active Bonuses</h3>
                <p className="text-white/60 text-center max-w-md mb-6">
                  You don't have any active bonuses right now. Check out the available bonuses to claim one.
                </p>
                <Button 
                  onClick={() => setActiveTab("available")}
                  className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                >
                  View Available Bonuses
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableBonuses.map((bonus) => (
              <Card key={bonus.id} className="bg-casino-thunder-dark border-white/10 overflow-hidden">
                <div className={`h-1 ${
                  bonus.type === 'deposit' ? 'bg-yellow-500' : 
                  bonus.type === 'free_spin' ? 'bg-green-500' : 
                  bonus.type === 'cashback' ? 'bg-blue-500' : 
                  bonus.type === 'loyalty' ? 'bg-purple-500' : 'bg-casino-thunder-green'
                }`}></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    {getBonusTypeIcon(bonus.type)}
                    <span className="ml-2">{bonus.title}</span>
                  </CardTitle>
                  <CardDescription>{bonus.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-white">${bonus.amount}</div>
                    <div className="text-sm text-white/70">
                      <p>• Wager: {bonus.wagerMultiplier}x</p>
                      <p>• Valid for: {bonus.duration} days</p>
                      {bonus.minDeposit > 0 && (
                        <p>• Min. deposit: ${bonus.minDeposit}</p>
                      )}
                      {bonus.requiredVipLevel > 0 && (
                        <p>• Required VIP level: {bonus.requiredVipLevel}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {(user?.vipLevel || 0) >= bonus.requiredVipLevel ? (
                    <Button 
                      className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                      onClick={() => claimBonus(bonus)}
                    >
                      Claim Bonus
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      disabled
                    >
                      <Lock className="h-4 w-4 mr-2" /> VIP Level {bonus.requiredVipLevel} Required
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
            
            {user && user.vipLevel && user.vipLevel > 0 && (
              <Card className="bg-gradient-to-br from-casino-thunder-gray to-casino-thunder-dark border-white/10">
                <CardHeader>
                  <CardTitle>VIP Exclusive Bonuses</CardTitle>
                  <CardDescription>Unlock premium bonuses with your VIP status</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-casino-thunder-green" />
                  </div>
                  <p className="text-center text-white/70 mb-4">
                    Special bonuses tailored to your VIP level are available.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-casino-thunder-green text-casino-thunder-green hover:bg-casino-thunder-green hover:text-black"
                    onClick={() => navigate("/vip")}
                  >
                    View VIP Bonuses
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card className="bg-casino-thunder-dark border-white/10">
            <CardHeader>
              <CardTitle>Bonus History</CardTitle>
              <CardDescription>
                View your past bonuses and their outcome
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/5">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Bonus
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-casino-thunder-dark divide-y divide-white/10">
                    {userBonuses.filter(b => b.status === "completed" || b.status === "expired").map((bonus) => (
                      <tr key={bonus.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getBonusTypeIcon(bonus.type)}
                            <span className="ml-2">{bonus.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ${bonus.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white/70">
                          {new Date(bonus.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bonus.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {bonus.status === 'completed' ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Completed
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Expired
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {(userBonuses.filter(b => b.status === "completed" || b.status === "expired").length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-white/60">
                          No bonus history found
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
    </div>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export default BonusHub;


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CheckCircle, Gift, XCircle, Sparkles, BadgeDollarSign, Zap, Calendar, Clock } from "lucide-react";
import { Bonus, BonusType } from "@/types";
import { motion } from "framer-motion";

const BonusHub = () => {
  const { isAuthenticated, user } = useAuth();
  const [userBonuses, setUserBonuses] = useState<Bonus[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Mock bonuses for demonstration
    const mockBonuses: Bonus[] = [
      {
        id: "1",
        name: "Welcome Bonus",
        description: "100% match up to $500 on your first deposit",
        amount: 500,
        type: "deposit",
        requirements: "Minimum deposit of $20 required",
        expiryDays: 30,
        isActive: true,
        status: "active",
        progress: 0,
        wagering: 35,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "2",
        name: "Free Spins",
        description: "50 free spins on Book of Dead",
        amount: 50,
        type: "free_spins",
        requirements: "No deposit required",
        expiryDays: 7,
        isActive: true,
        status: "used",
        progress: 100,
        wagering: 40,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "3",
        name: "Cashback Bonus",
        description: "10% cashback on all losses up to $100",
        amount: 100,
        type: "cashback",
        requirements: "Minimum $50 in losses",
        expiryDays: 14,
        isActive: true,
        status: "expired",
        progress: 50,
        wagering: 10,
        expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "4",
        name: "Daily Reload",
        description: "50% match up to $200 daily",
        amount: 200,
        type: "deposit",
        requirements: "Minimum deposit $30",
        expiryDays: 1,
        isActive: true,
        status: "active",
        progress: 25,
        wagering: 30,
        expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "5",
        name: "Weekend Spins",
        description: "100 free spins on Starburst",
        amount: 100,
        type: "free_spins",
        requirements: "Available on weekends only",
        expiryDays: 3,
        isActive: true,
        status: "active",
        progress: 10,
        wagering: 35,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    setUserBonuses(mockBonuses);
  }, []);

  const claimBonus = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to claim bonuses");
      return;
    }
    
    const newBonus: Bonus = {
      id: `${Date.now()}`,
      userId: user?.id || "",
      name: "Deposit Bonus",
      description: "100% match up to $200",
      type: "deposit",
      amount: 200,
      requirements: "Minimum deposit $20",
      expiryDays: 30,
      isActive: true,
      status: "active",
      progress: 0,
      wagering: 35,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      templateId: "template1",
      isCompleted: false
    };
    
    setUserBonuses([...userBonuses, newBonus]);
    toast.success("Bonus claimed successfully!");
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case "active":
        return "Active";
      case "used":
      case "completed":
        return "Completed";
      case "expired":
        return "Expired";
      default:
        return "Unknown";
    }
  };

  const getBonusByType = (type: string) => {
    if (type === "all") return userBonuses;
    if (type === "active") return userBonuses.filter(bonus => bonus.status === "active");
    if (type === "completed") return userBonuses.filter(bonus => bonus.status === "used" || bonus.status === "completed");
    if (type === "expired") return userBonuses.filter(bonus => bonus.status === "expired");
    return userBonuses;
  };

  const getBonusIcon = (type: string | undefined) => {
    switch(type) {
      case "deposit":
        return <BadgeDollarSign className="text-casino-thunder-green h-8 w-8" />;
      case "free_spins":
        return <Zap className="text-casino-gold h-8 w-8" />;
      case "cashback":
        return <Sparkles className="text-blue-400 h-8 w-8" />;
      default:
        return <Gift className="text-casino-thunder-green h-8 w-8" />;
    }
  };

  return (
    <div className="bg-gradient-to-b from-casino-thunder-darker to-black min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-12"
        >
          <div className="relative inline-block mb-8">
            <Gift className="text-casino-thunder-green w-12 h-12 mb-2 mx-auto animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              <span className="text-casino-thunder-green thunder-glow">Bonus</span> Hub
            </h1>
            <div className="absolute -z-10 w-64 h-64 bg-casino-thunder-green/10 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <p className="text-white/80 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Explore available bonuses, track your progress, and unlock exciting rewards
            tailored to enhance your gaming experience.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black text-lg py-6 px-8 rounded-xl shadow-lg shadow-casino-thunder-green/20"
              onClick={claimBonus}
            >
              <Gift className="mr-2 h-5 w-5" />
              Claim New Bonus
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Tabs Section */}
        <Tabs defaultValue="all" className="w-full max-w-4xl mx-auto mb-8" onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6 bg-casino-thunder-gray/50 backdrop-blur-md">
            <TabsTrigger value="all" className="flex-1">All Bonuses</TabsTrigger>
            <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
            <TabsTrigger value="expired" className="flex-1">Expired</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <BonusGrid bonuses={getBonusByType("all")} />
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            <BonusGrid bonuses={getBonusByType("active")} />
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            <BonusGrid bonuses={getBonusByType("completed")} />
          </TabsContent>
          
          <TabsContent value="expired" className="space-y-4">
            <BonusGrid bonuses={getBonusByType("expired")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Separate component for the bonus cards grid
const BonusGrid = ({ bonuses }: { bonuses: Bonus[] }) => {
  if (bonuses.length === 0) {
    return (
      <div className="text-center py-16 glass-card">
        <Gift className="mx-auto h-12 w-12 text-casino-thunder-green/50 mb-4" />
        <h3 className="text-2xl font-semibold text-white mb-2">No Bonuses Available</h3>
        <p className="text-white/60">There are no bonuses in this category at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bonuses.map((bonus, index) => (
        <BonusCard key={bonus.id} bonus={bonus} index={index} />
      ))}
    </div>
  );
};

// Separate component for each bonus card
const BonusCard = ({ bonus, index }: { bonus: Bonus; index: number }) => {
  const { isAuthenticated } = useAuth();
  
  const getStatusClass = (status: string | undefined) => {
    switch(status) {
      case "active":
        return "text-casino-thunder-green";
      case "used":
      case "completed":
        return "text-green-500";
      case "expired":
        return "text-red-500";
      default:
        return "text-white/80";
    }
  };
  
  const getBonusIcon = (type: string | undefined) => {
    switch(type) {
      case "deposit":
        return <BadgeDollarSign className="text-casino-thunder-green h-8 w-8" />;
      case "free_spins":
        return <Zap className="text-casino-gold h-8 w-8" />;
      case "cashback":
        return <Sparkles className="text-blue-400 h-8 w-8" />;
      default:
        return <Gift className="text-casino-thunder-green h-8 w-8" />;
    }
  };
  
  const handleClaim = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to claim bonuses");
      return;
    }
    toast.success(`${bonus.name} claimed successfully!`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className="glass-card overflow-hidden border-0 hover:neo-glow transition-all duration-300">
        <CardHeader className="relative pb-2">
          <div className="absolute top-4 right-6">
            {getBonusIcon(bonus.type)}
          </div>
          <CardTitle className="text-xl font-semibold text-white">{bonus.name}</CardTitle>
          <div className="flex items-center space-x-2 mt-1">
            <Clock className="h-4 w-4 text-white/60" />
            <span className="text-sm text-white/60">
              Expires: {new Date(bonus.expiresAt || "").toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <p className="text-white/80">{bonus.description}</p>
          
          <div className="bg-white/5 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Progress:</span>
              <span className={`text-sm ${getStatusClass(bonus.status)}`}>{bonus.progress}%</span>
            </div>
            <Progress value={bonus.progress} className="h-2 bg-white/10" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Wagering:</span>
              <span className="text-sm text-casino-thunder-green">{bonus.wagering}x</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Status:</span>
              <span className={`text-sm font-medium ${getStatusClass(bonus.status)}`}>
                {bonus.status === "active" && "Active"}
                {bonus.status === "used" && "Completed"}
                {bonus.status === "expired" && "Expired"}
              </span>
            </div>
          </div>
          
          {bonus.status === "active" && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button 
                onClick={handleClaim}
                className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black rounded-lg py-5"
              >
                Claim Now
              </Button>
            </motion.div>
          )}
          
          {bonus.status === "used" && (
            <div className="text-center bg-green-500/10 py-3 rounded-lg text-green-500">
              <CheckCircle className="inline-block mr-2 h-5 w-5" />
              Bonus Completed!
            </div>
          )}
          
          {bonus.status === "expired" && (
            <div className="text-center bg-red-500/10 py-3 rounded-lg text-red-500">
              <XCircle className="inline-block mr-2 h-5 w-5" />
              Bonus Expired
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BonusHub;

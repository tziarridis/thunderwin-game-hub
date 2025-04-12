import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CheckCircle, Gift, XCircle } from "lucide-react";
import { Bonus, BonusType } from "@/types";

const BonusHub = () => {
  const { isAuthenticated, user } = useAuth();
  const [userBonuses, setUserBonuses] = useState<Bonus[]>([]);

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
      requirements: "Minimum deposit $20", // Add required field
      expiryDays: 30, // Add required field
      isActive: true, // Add required field
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">
          <span className="text-casino-thunder-green thunder-glow">Bonus</span> Hub
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Explore available bonuses and track your progress.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userBonuses.map(bonus => (
          <Card key={bonus.id} className="bg-casino-thunder-dark border-white/10">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{bonus.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-white/70">{bonus.description}</p>
              <p className="text-sm text-white/60">
                Requirements: {bonus.requirements}
              </p>
              <p className="text-sm text-white/60">
                Expires: {new Date(bonus.expiresAt || "").toLocaleDateString()}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Progress:</span>
                <span className="text-sm text-casino-thunder-green">{bonus.progress}%</span>
              </div>
              <Progress value={bonus.progress} />
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Wagering:</span>
                <span className="text-sm text-casino-thunder-green">{bonus.wagering}x</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Status:</span>
                <span className="text-sm text-casino-thunder-green">{getStatusText(bonus.status || "")}</span>
              </div>
              
              {bonus.status === "active" && (
                <Button className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                  Claim Now
                </Button>
              )}
              
              {bonus.status === "used" && (
                <div className="text-center text-green-500">
                  <CheckCircle className="inline-block mr-2" />
                  Bonus Completed!
                </div>
              )}
              
              {bonus.status === "expired" && (
                <div className="text-center text-red-500">
                  <XCircle className="inline-block mr-2" />
                  Bonus Expired
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button 
          className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
          onClick={claimBonus}
        >
          <Gift className="mr-2 h-4 w-4" />
          Claim New Bonus
        </Button>
      </div>
    </div>
  );
};

export default BonusHub;

import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ExtendedUserBonus, ExtendedPromotion } from "@/types/extended";
import { BonusType, BonusStatus, PromotionType, PromotionStatus } from "@/types/enums";

const BonusHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState("available");
  
  // Mock bonuses data
  const [availableBonuses, setAvailableBonuses] = useState<ExtendedUserBonus[]>([
    {
      id: "1",
      userId: "user-1",
      bonusId: "bonus-1",
      type: BonusType.WELCOME,
      amount: 100,
      status: BonusStatus.ACTIVE,
      expiryDate: "2023-08-15T00:00:00Z",
      dateIssued: "2023-07-15T14:30:00Z",
      wageringRequirement: 35,
      wageringCompleted: 0
    },
    {
      id: "2",
      userId: "user-1",
      bonusId: "bonus-2",
      type: BonusType.FREE_SPINS,
      amount: 50,
      status: BonusStatus.ACTIVE,
      expiryDate: "2023-08-10T00:00:00Z",
      dateIssued: "2023-07-10T09:45:00Z",
      wageringRequirement: 20,
      wageringCompleted: 0
    }
  ]);
  
  const [activeBonuses, setActiveBonuses] = useState<ExtendedUserBonus[]>([
    {
      id: "3",
      userId: "user-1",
      bonusId: "bonus-3",
      type: BonusType.DEPOSIT,
      amount: 75,
      status: BonusStatus.ACTIVE,
      expiryDate: "2023-08-05T00:00:00Z",
      dateIssued: "2023-07-05T16:15:00Z",
      wageringRequirement: 30,
      wageringCompleted: 45
    }
  ]);
  
  const [usedBonuses, setUsedBonuses] = useState<ExtendedUserBonus[]>([
    {
      id: "4",
      userId: "user-1",
      bonusId: "bonus-4",
      type: BonusType.CASHBACK,
      amount: 25,
      status: BonusStatus.USED,
      expiryDate: "2023-06-30T00:00:00Z",
      dateIssued: "2023-06-20T11:30:00Z",
      wageringRequirement: 10,
      wageringCompleted: 100
    },
    {
      id: "5",
      userId: "user-1",
      bonusId: "bonus-5",
      type: BonusType.FREE_SPINS,
      amount: 20,
      status: BonusStatus.EXPIRED,
      expiryDate: "2023-06-25T00:00:00Z",
      dateIssued: "2023-06-15T14:30:00Z",
      wageringRequirement: 15,
      wageringCompleted: 60
    }
  ]);
  
  const handleClaimBonus = (bonusId: string) => {
    // Find the bonus to claim
    const bonusToMove = availableBonuses.find(b => b.id === bonusId);
    
    if (bonusToMove) {
      // Add to active bonuses
      setActiveBonuses(prev => [...prev, bonusToMove]);
      
      // Remove from available bonuses
      setAvailableBonuses(prev => prev.filter(b => b.id !== bonusId));
    }
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const getBonusTypeColor = (type: BonusType): string => {
    switch (type) {
      case BonusType.WELCOME:
        return "bg-green-500";
      case BonusType.DEPOSIT:
        return "bg-blue-500";
      case BonusType.RELOAD:
        return "bg-purple-500";
      case BonusType.CASHBACK:
        return "bg-amber-500";
      case BonusType.FREE_SPINS:
        return "bg-pink-500";
      case BonusType.VIP:
        return "bg-indigo-500";
      case BonusType.REFERRAL:
        return "bg-teal-500";
      default:
        return "bg-gray-500";
    }
  };

  const getBonusName = (type: BonusType): string => {
    switch (type) {
      case BonusType.WELCOME:
        return "Welcome Bonus";
      case BonusType.DEPOSIT:
        return "Deposit Bonus";
      case BonusType.RELOAD:
        return "Reload Bonus";
      case BonusType.CASHBACK:
        return "Cashback";
      case BonusType.FREE_SPINS:
        return "Free Spins";
      case BonusType.VIP:
        return "VIP Bonus";
      case BonusType.REFERRAL:
        return "Referral Bonus";
      default:
        return "Bonus";
    }
  };

  const getStatusText = (status: BonusStatus): string => {
    switch (status) {
      case BonusStatus.USED:
        return "Completed";
      case BonusStatus.EXPIRED:
        return "Expired";
      case BonusStatus.ACTIVE:
        return "Active";
      case BonusStatus.PENDING:
        return "Pending";
      default:
        return "Unknown";
    }
  };

  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Bonus Hub</h1>
      <p className="text-muted-foreground mb-6">Manage your casino bonuses and promotions</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="used">Used/Expired</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableBonuses.length > 0 ? (
              availableBonuses.map((bonus) => (
                <Card key={bonus.id} className="overflow-hidden">
                  <div className={`h-2 ${getBonusTypeColor(bonus.type)}`}></div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{getBonusName(bonus.type)}</span>
                      <span className="text-lg">${bonus.amount}</span>
                    </CardTitle>
                    <CardDescription>Bonus available for claim</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Wagering:</span>
                        <span>{bonus.wageringRequirement}x</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expires:</span>
                        <span>{formatDate(bonus.expiryDate)}</span>
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => handleClaimBonus(bonus.id)}
                      >
                        Claim Bonus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-8 text-center">
                <p className="text-muted-foreground">No available bonuses at the moment.</p>
                <p className="text-sm mt-2">Check back later for new promotions!</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBonuses.length > 0 ? (
              activeBonuses.map((bonus) => (
                <Card key={bonus.id} className="overflow-hidden">
                  <div className={`h-2 ${getBonusTypeColor(bonus.type)}`}></div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{getBonusName(bonus.type)}</span>
                      <span className="text-lg">${bonus.amount}</span>
                    </CardTitle>
                    <CardDescription>Active bonus in progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress:</span>
                          <span>{bonus.wageringCompleted}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${bonus.wageringCompleted}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Wagering:</span>
                        <span>{bonus.wageringRequirement}x</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expires:</span>
                        <span>{formatDate(bonus.expiryDate)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-8 text-center">
                <p className="text-muted-foreground">No active bonuses.</p>
                <p className="text-sm mt-2">Claim a bonus from the Available tab!</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="used">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usedBonuses.length > 0 ? (
              usedBonuses.map((bonus) => (
                <Card key={bonus.id} className="overflow-hidden opacity-75">
                  <div className={`h-2 ${getBonusTypeColor(bonus.type)}`}></div>
                  <CardHeader>
                    <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-muted">
                      {getStatusText(bonus.status)}
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      <span>{getBonusName(bonus.type)}</span>
                      <span className="text-lg">${bonus.amount}</span>
                    </CardTitle>
                    <CardDescription>Bonus no longer active</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress:</span>
                          <span>{bonus.wageringCompleted}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div 
                            className={`h-full rounded-full ${
                              bonus.status === BonusStatus.USED ? "bg-green-500" : "bg-red-500"
                            }`} 
                            style={{ width: `${bonus.wageringCompleted}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Used on:</span>
                        <span>{formatDate(bonus.expiryDate)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full p-8 text-center">
                <p className="text-muted-foreground">No used or expired bonuses.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BonusHub;

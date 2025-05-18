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
import { Bonus, BonusType } from "@/types"; // Use BonusType (string union)

const BonusHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState("available");
  
  const [availableBonuses, setAvailableBonuses] = useState<Bonus[]>([
    {
      id: "1",
      userId: "user-1", // Field added to Bonus type
      type: "welcome", // Use string literal from BonusType
      amount: 100,
      status: "active", // Field added
      expiryDate: "2025-08-15T00:00:00Z", // Field added
      createdAt: "2025-07-15T14:30:00Z", // Field added
      wageringRequirement: 35,
      progress: 0, // Field added
      description: "Welcome bonus for new users - 100% match up to $100",
      code: "WELCOME100" // Field added
    },
    {
      id: "2",
      userId: "user-1",
      type: "free_spins", 
      amount: 50, 
      status: "active",
      expiryDate: "2025-08-10T00:00:00Z",
      createdAt: "2025-07-10T09:45:00Z",
      wageringRequirement: 20,
      progress: 0,
      description: "50 free spins on Starburst",
      code: "SPIN50"
    }
  ]);
  
  const [activeBonuses, setActiveBonuses] = useState<Bonus[]>([
    {
      id: "3",
      userId: "user-1",
      type: "deposit_match", // Corrected from 'deposit' if 'deposit_match' is the intended type
      amount: 75,
      status: "active",
      expiryDate: "2025-08-05T00:00:00Z",
      createdAt: "2025-07-05T16:15:00Z",
      wageringRequirement: 30,
      progress: 45,
      description: "Weekly reload bonus - 50% match up to $75",
      code: "RELOAD50"
    }
  ]);
  
  const [usedBonuses, setUsedBonuses] = useState<Bonus[]>([
    {
      id: "4",
      userId: "user-1",
      type: "cashback", 
      amount: 25,
      status: "used", // Corrected
      expiryDate: "2024-06-30T00:00:00Z",
      createdAt: "2024-06-20T11:30:00Z",
      wageringRequirement: 10,
      progress: 100,
      description: "10% cashback on losses",
      code: "CASH10"
    },
    {
      id: "5",
      userId: "user-1",
      type: "free_spins", 
      amount: 20,
      status: "expired", // Corrected
      expiryDate: "2024-06-25T00:00:00Z",
      createdAt: "2024-06-15T14:30:00Z",
      wageringRequirement: 15,
      progress: 60,
      description: "20 free spins on Book of Dead",
      code: "BOOK20"
    }
  ]);
  
  const handleClaimBonus = (bonusId: string) => {
    const bonusToMove = availableBonuses.find(b => b.id === bonusId);
    
    if (bonusToMove) {
      // Ensure all required fields are present if creating a new object for setActiveBonuses
      const claimedBonus: Bonus = { 
        ...bonusToMove, 
        status: 'active',
        // Explicitly list all required Bonus fields if spread doesn't cover them or if type is strict
        userId: bonusToMove.userId, // Ensure userId is carried over
        type: bonusToMove.type,
        amount: bonusToMove.amount,
        expiryDate: bonusToMove.expiryDate,
        createdAt: bonusToMove.createdAt,
        description: bonusToMove.description,
       };
      setActiveBonuses(prev => [...prev, claimedBonus]);
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
      case 'welcome': return "bg-green-500"; // Example if 'welcome' is a valid BonusType
      case 'deposit_match': return "bg-blue-500";
      case 'reload': return "bg-purple-500";
      case 'cashback': return "bg-amber-500";
      case 'free_spins': return "bg-pink-500";
      case 'vip': return "bg-indigo-500"; // Example if 'vip' is a valid BonusType
      case 'referral': return "bg-teal-500"; // Example if 'referral' is a valid BonusType
      default: return "bg-gray-500";
    }
  };

  const getBonusName = (bonus: Bonus): string => {
    if (bonus.name) return bonus.name; // Use explicit name if provided
    switch (bonus.type) {
      case 'welcome': return "Welcome Bonus";
      case 'deposit_match': return "Deposit Bonus";
      case 'reload': return "Reload Bonus";
      case 'cashback': return "Cashback";
      case 'free_spins': return "Free Spins";
      case 'vip': return "VIP Bonus";
      case 'referral': return "Referral Bonus";
      default: return bonus.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || "Bonus";
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
                      <span>{getBonusName(bonus)}</span>
                      <span className="text-lg">
                        {bonus.type === "free_spins" ? `${bonus.amount} Spins` : `$${bonus.amount}`}
                      </span>
                    </CardTitle>
                    <CardDescription>{bonus.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Wagering:</span>
                        <span>{bonus.wageringRequirement || 'N/A'}x</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expires:</span>
                        <span>{formatDate(bonus.expiryDate)}</span>
                      </div>
                      {bonus.code && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Code:</span>
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{bonus.code}</span>
                        </div>
                      )}
                      
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => handleClaimBonus(bonus.id)}
                        disabled={bonus.status !== 'active'}
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
                      <span>{getBonusName(bonus)}</span>
                      <span className="text-lg">
                        {bonus.type === "free_spins" ? `${bonus.amount} Spins` : `$${bonus.amount}`}
                      </span>
                    </CardTitle>
                    <CardDescription>{bonus.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress:</span>
                          <span>{bonus.progress || 0}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${bonus.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Wagering:</span>
                        <span>{bonus.wageringRequirement || 'N/A'}x</span>
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
                      {bonus.status === "used" ? "Completed" : "Expired"}
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      <span>{getBonusName(bonus)}</span>
                      <span className="text-lg">
                         {bonus.type === "free_spins" ? `${bonus.amount} Spins` : `$${bonus.amount}`}
                      </span>
                    </CardTitle>
                    <CardDescription>{bonus.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress:</span>
                          <span>{bonus.progress || 0}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div 
                            className={`h-full rounded-full ${
                              bonus.status === "used" ? "bg-green-500" : "bg-red-500"
                            }`} 
                            style={{ width: `${bonus.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {bonus.status === "used" ? "Used on:" : "Expired on:"}
                        </span>
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

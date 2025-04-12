
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Game, Bonus, BonusType, User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const BonusHub: React.FC = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user bonuses
    const fetchBonuses = async () => {
      setLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          const mockBonuses: Bonus[] = [
            {
              id: "bonus-1",
              userId: currentUser?.id || "",
              type: "deposit" as BonusType,
              amount: 100,
              status: "active",
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
              name: "Welcome Bonus",
              description: "100% up to $100 on your first deposit",
              isCompleted: false,
              progress: 45,
              wagering: 35,
              templateId: "welcome-bonus"
            },
            {
              id: "bonus-2",
              userId: currentUser?.id || "",
              type: "free_spin" as BonusType,
              amount: 50,
              status: "active",
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              name: "Free Spins",
              description: "50 free spins on Starburst",
              isCompleted: false,
              progress: 20,
              wagering: 20,
              templateId: "free-spins"
            },
            {
              id: "bonus-3",
              userId: currentUser?.id || "",
              type: "cashback" as BonusType,
              amount: 25,
              status: "completed",
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              name: "Weekly Cashback",
              description: "10% cashback on your losses",
              isCompleted: true,
              progress: 100,
              wagering: 10,
              templateId: "weekly-cashback"
            }
          ];
          setBonuses(mockBonuses);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch bonuses:", error);
        toast({
          title: "Error",
          description: "Failed to load bonuses",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchBonuses();
    } else {
      setLoading(false);
    }
  }, [currentUser, toast]);

  // When creating new Bonus objects, ensure all properties match the Bonus type:
  const claimBonus = () => {
    const bonus = {
      id: `bonus-${Math.random().toString(36).substring(2, 11)}`,
      userId: currentUser?.id || "",
      type: "deposit" as BonusType,
      amount: 50,
      status: "active" as const,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      name: "Welcome Bonus",
      description: "Get started with a special welcome bonus just for you!",
      isCompleted: false,
      progress: 0,
      wagering: 35,
      templateId: "template1"
    };

    setBonuses([...bonuses, bonus]);
    toast({
      title: "Bonus Claimed",
      description: "Your bonus has been added to your account",
      variant: "default"
    });
  };

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <div className="thunder-card p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4">Bonus Hub</h1>
        <p className="text-white/70 mb-6">
          View and manage all your active bonuses and rewards.
        </p>
        
        {!currentUser ? (
          <div className="bg-white/5 p-4 rounded-lg text-center">
            <p className="mb-4">Sign in to view and claim your bonuses</p>
            <button 
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-white px-4 py-2 rounded-md font-medium"
              onClick={() => window.location.href = '/login'}
            >
              Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white/5 p-6 rounded-lg mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold mb-2">Daily Bonus Available!</h2>
                  <p className="text-white/70 mb-4">
                    Claim your daily bonus and boost your gameplay today!
                  </p>
                </div>
                <button 
                  className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-white px-6 py-3 rounded-md font-medium"
                  onClick={claimBonus}
                >
                  Claim Bonus
                </button>
              </div>
            </div>
            
            <h2 className="text-xl font-bold mb-4">Your Active Bonuses</h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-casino-thunder-green"></div>
              </div>
            ) : bonuses.length === 0 ? (
              <div className="bg-white/5 p-8 rounded-lg text-center">
                <p>You don't have any active bonuses right now.</p>
                <button 
                  className="mt-4 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md font-medium"
                  onClick={() => window.location.href = '/promotions'}
                >
                  View Promotions
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {bonuses.map(bonus => (
                  <div 
                    key={bonus.id} 
                    className={`thunder-card p-6 rounded-lg border-l-4 ${
                      bonus.status === 'active' 
                        ? 'border-casino-thunder-green' 
                        : bonus.status === 'completed' 
                          ? 'border-blue-500' 
                          : 'border-red-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{bonus.name}</h3>
                        <p className="text-white/70 text-sm">{bonus.description}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        bonus.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : bonus.status === 'completed' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {bonus.status.charAt(0).toUpperCase() + bonus.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Wagering Progress</span>
                        <span>{bonus.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-casino-thunder-green h-2 rounded-full" 
                          style={{ width: `${bonus.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <p className="text-white/50">Amount</p>
                        <p className="font-semibold">${bonus.amount}</p>
                      </div>
                      <div>
                        <p className="text-white/50">Wagering</p>
                        <p className="font-semibold">{bonus.wagering}x</p>
                      </div>
                      <div>
                        <p className="text-white/50">Type</p>
                        <p className="font-semibold capitalize">{bonus.type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-white/50">Expires</p>
                        <p className="font-semibold">
                          {new Date(bonus.expiresAt) > new Date() 
                            ? `${Math.ceil((new Date(bonus.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days` 
                            : 'Expired'}
                        </p>
                      </div>
                    </div>
                    
                    {bonus.status === 'active' && (
                      <button 
                        className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-md text-sm font-medium"
                        onClick={() => window.location.href = '/casino'}
                      >
                        Play Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BonusHub;

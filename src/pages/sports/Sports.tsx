
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Trophy, Filter, Calendar, Star } from "lucide-react";
import { toast } from "sonner";
import DepositButton from "@/components/user/DepositButton";
import { useAuth } from "@/contexts/AuthContext";

const Sports = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const { isAuthenticated } = useAuth();
  
  const handlePlaceBet = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to place a bet");
      return;
    }
    toast.success("Bet placed successfully!");
  };

  return (
    <div className="bg-casino-thunder-darker min-h-screen pt-8 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Sports Betting</h1>
          
          <DepositButton variant="highlight" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-casino-thunder-dark rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-casino-thunder-green" />
                Sports Categories
              </h3>
              
              <div className="space-y-2">
                {["all", "football", "basketball", "tennis", "baseball", "hockey", "soccer", "boxing", "mma"].map((category) => (
                  <Button 
                    key={category}
                    variant={activeCategory === category ? "default" : "outline"}
                    className={`w-full justify-start ${
                      activeCategory === category 
                        ? "bg-casino-thunder-green text-black" 
                        : "text-white hover:text-casino-thunder-green"
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="bg-casino-thunder-dark rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Filter className="mr-2 h-5 w-5 text-casino-thunder-green" />
                Quick Filters
              </h3>
              
              <div className="space-y-2">
                <Button 
                  variant="outline"
                  className="w-full justify-start text-white hover:text-casino-thunder-green"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Live Now
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start text-white hover:text-casino-thunder-green"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Today's Events
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start text-white hover:text-casino-thunder-green"
                >
                  <Star className="mr-2 h-4 w-4" />
                  Featured Matches
                </Button>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="mb-4 bg-casino-thunder-dark">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="live">Live</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="mt-0">
                <div className="space-y-4">
                  {["Premier League: Arsenal vs Chelsea", "NBA: Lakers vs Warriors", "Tennis: US Open Final"].map((match, index) => (
                    <div key={index} className="bg-casino-thunder-dark rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">{match}</div>
                          <div className="text-white/60 text-sm">Starts in 2h 30m</div>
                        </div>
                        <Button 
                          className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                          onClick={handlePlaceBet}
                        >
                          <Wallet className="mr-2 h-4 w-4" />
                          Place Bet
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handlePlaceBet}
                        >
                          Win: 2.10
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handlePlaceBet}
                        >
                          Draw: 3.40
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handlePlaceBet}
                        >
                          Lose: 3.20
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="live" className="mt-0">
                <div className="bg-casino-thunder-dark rounded-lg p-6 text-center">
                  <div className="text-white/70 mb-4">No live events at the moment</div>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveCategory("upcoming")}
                  >
                    View Upcoming Events
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="popular" className="mt-0">
                <div className="bg-casino-thunder-dark rounded-lg p-6 text-center">
                  <div className="text-white mb-4">Popular events coming soon</div>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveCategory("upcoming")}
                  >
                    View Upcoming Events
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sports;

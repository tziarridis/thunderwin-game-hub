
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import MobileWalletSummary from "@/components/user/MobileWalletSummary";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Settings, History, LogOut, Gift } from "lucide-react";
import { toast } from "sonner";

const MobileProfile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("wallet");
  
  if (!isAuthenticated || !user) {
    return (
      <div className="p-4 text-center">
        <p>Please log in to view your profile</p>
        <Button className="mt-4" onClick={() => window.location.href = "/login"}>
          Login
        </Button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    window.location.href = "/";
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="flex items-center mb-6">
        <div className="relative">
          <Avatar className="w-16 h-16 border-2 border-casino-thunder-green">
            <AvatarImage src={user.avatarUrl || ""} />
            <AvatarFallback className="bg-casino-thunder-green text-black text-lg">
              {user.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <Button 
            size="icon" 
            variant="secondary" 
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-casino-thunder-green text-black"
          >
            <Camera className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="ml-4">
          <h2 className="text-lg font-bold">{user.username}</h2>
          <p className="text-sm text-white/60">{user.email}</p>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wallet" className="space-y-4">
          <MobileWalletSummary />
          
          <Card className="p-4 bg-casino-thunder-dark/50 border border-casino-thunder-gray/20">
            <h3 className="font-medium mb-2">Quick Deposit</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button variant="outline" className="text-center p-2 h-auto">$10</Button>
              <Button variant="outline" className="text-center p-2 h-auto">$25</Button>
              <Button variant="outline" className="text-center p-2 h-auto">$50</Button>
            </div>
            <Button className="w-full bg-casino-thunder-green text-black">
              Deposit Now
            </Button>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card className="bg-casino-thunder-dark/50 border border-casino-thunder-gray/20">
            <div className="p-4">
              <h3 className="font-medium mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((_, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">Game Bet</p>
                      <p className="text-xs text-white/60">May 5, 2025, 2:45 PM</p>
                    </div>
                    <span className="text-red-400">-$25.00</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <History className="mr-2 h-4 w-4" />
                View All Transactions
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="bonuses">
          <Card className="bg-casino-thunder-dark/50 border border-casino-thunder-gray/20">
            <div className="p-4">
              <h3 className="font-medium mb-4">Your Bonuses</h3>
              
              <div className="space-y-4">
                <div className="border border-casino-thunder-green/30 bg-casino-thunder-green/5 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-casino-thunder-green">Welcome Bonus</h4>
                      <p className="text-xs text-white/60">Expires: May 12, 2025</p>
                    </div>
                    <span className="bg-casino-thunder-green text-black text-xs font-bold px-2 py-1 rounded">ACTIVE</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">100% up to $200 + 50 Free Spins</p>
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-casino-thunder-green rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>$70 wagered</span>
                      <span>$200 required</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Gift className="mr-2 h-4 w-4" />
                  Promotions Page
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card className="bg-casino-thunder-dark/50 border border-casino-thunder-gray/20">
            <div className="p-4 space-y-4">
              <h3 className="font-medium mb-2">Account Settings</h3>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Notification Settings
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full mt-6"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileProfile;

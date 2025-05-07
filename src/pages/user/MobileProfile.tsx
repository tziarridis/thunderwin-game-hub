import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { User, Edit, Award, Calendar, CreditCard, LogOut, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { walletService } from "@/services/walletService";
import { Wallet } from "@/types/wallet";
import { toast } from "sonner";

const MobileProfile = () => {
  const { user, logout } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user?.id) {
      fetchWallet();
    }
  }, [user?.id]);
  
  const fetchWallet = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const walletResponse = await walletService.getWalletByUserId(user.id);
      
      if (walletResponse.data) {
        setWallet(walletResponse.data);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="min-h-screen bg-casino-thunder-darker pt-16 pb-20">
      <div className="px-4 py-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center overflow-hidden mb-3">
              {user?.avatar || user?.avatarUrl ? (
                <img 
                  src={user.avatar || user.avatarUrl} 
                  alt={user.username || 'Profile'} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <User className="h-10 w-10 text-white/50" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 bg-casino-thunder-green text-black p-1 rounded-full">
              <Edit className="h-3 w-3" />
            </button>
          </div>
          
          <h2 className="text-lg font-semibold text-white">{user?.username}</h2>
          <p className="text-sm text-white/60">{user?.email}</p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-white/60">Balance</p>
              <p className="text-xl font-bold text-white">
                ${user?.balance?.toFixed(2) || wallet?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
            <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
              Deposit
            </Button>
          </div>
          
          <div className="flex items-center">
            <Award className="h-4 w-4 text-casino-thunder-green mr-1" />
            <span className="text-sm text-white/80">VIP Level: {user?.vipLevel || 0}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Link to="/profile/edit">
            <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-white/70" />
                </div>
                <span className="text-white">Edit Profile</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/50" />
            </div>
          </Link>
          
          <Link to="/transactions">
            <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                  <Calendar className="h-4 w-4 text-white/70" />
                </div>
                <span className="text-white">Transaction History</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/50" />
            </div>
          </Link>
          
          <Link to="/payment-methods">
            <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                  <CreditCard className="h-4 w-4 text-white/70" />
                </div>
                <span className="text-white">Payment Methods</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/50" />
            </div>
          </Link>
          
          <Link to="/vip">
            <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                  <Award className="h-4 w-4 text-white/70" />
                </div>
                <span className="text-white">VIP Program</span>
              </div>
              <ChevronRight className="h-4 w-4 text-white/50" />
            </div>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full bg-white/5 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                <LogOut className="h-4 w-4 text-white/70" />
              </div>
              <span className="text-white">Log Out</span>
            </div>
            <ChevronRight className="h-4 w-4 text-white/50" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileProfile;

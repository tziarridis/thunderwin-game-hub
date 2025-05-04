
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Shield,
  Award,
  Calendar,
  Edit,
  Upload,
  Gift,
  RefreshCw
} from "lucide-react";
import { Wallet as WalletIcon } from "lucide-react"; // Import as WalletIcon to avoid conflict
import DepositButton from "@/components/user/DepositButton";
import WalletBalance from "@/components/user/WalletBalance";
import MetaMaskWallet from "@/components/user/MetaMaskWallet";
import { walletService } from "@/services/walletService";
import { Wallet } from "@/types/wallet";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchWallet();
    }
  }, [isAuthenticated, user?.id]);

  const fetchWallet = async () => {
    if (!user?.id) return;
    
    try {
      const walletData = await walletService.getWalletByUserId(user.id);
      setWallet(walletData);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  const handleUploadAvatar = () => {
    setIsUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Profile Updated",
        description: "Your avatar has been successfully updated.",
      });
    }, 1500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-casino-thunder-darker">
        <div className="container mx-auto px-4">
          <div className="thunder-card p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
            <p className="text-white/70 mb-6">Please sign in to view your profile.</p>
            <Button 
              onClick={() => window.location.href = "/login"}
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-casino-thunder-darker">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Summary */}
          <div className="thunder-card p-6 flex flex-col items-center lg:sticky lg:top-24 self-start">
            <div className="relative mb-4">
              <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-white/50" />
                )}
              </div>
              <button 
                className="absolute bottom-0 right-0 p-1 bg-white/10 rounded-full hover:bg-casino-thunder-green hover:text-black transition-colors"
                onClick={handleUploadAvatar}
              >
                {isUploading ? (
                  <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-current rounded-full"></div>
                ) : (
                  <Upload className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-white">{user?.username}</h2>
            <p className="text-white/70 text-sm mb-6">{user?.email}</p>
            
            <div className="flex items-center mb-4">
              <Award className="text-casino-thunder-green mr-2" />
              <span className="text-sm text-white/80">VIP Level: {user?.vipLevel}</span>
            </div>
            
            <div className="w-full bg-white/5 rounded-md p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Balance:</span>
                <span className="text-white/90 font-medium">
                  {wallet ? 
                    `${wallet.symbol}${wallet.balance.toFixed(2)}` : 
                    `$${user?.balance?.toFixed(2) || '0.00'}`
                  }
                </span>
              </div>
              <DepositButton className="w-full" variant="highlight" />
            </div>
            
            <div className="w-full">
              <Button 
                variant="outline"
                className="w-full mb-2"
                onClick={() => window.location.href = "/transactions"}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Transaction History
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = "/settings"}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Account Details */}
            <div className="thunder-card p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="mr-2 text-casino-thunder-green" />
                Account Information
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Username</label>
                    <div className="bg-white/5 p-3 rounded-md text-white/90">{user?.username}</div>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Email</label>
                    <div className="bg-white/5 p-3 rounded-md text-white/90">{user?.email}</div>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Account ID</label>
                    <div className="bg-white/5 p-3 rounded-md text-white/90">{user?.id}</div>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Verification Status</label>
                    <div className="bg-white/5 p-3 rounded-md flex items-center">
                      {user?.isVerified ? (
                        <span className="text-green-400 flex items-center">
                          <Shield className="h-4 w-4 mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="text-yellow-400 flex items-center">
                          <Shield className="h-4 w-4 mr-1" /> Pending Verification
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* VIP Status */}
            <div className="thunder-card p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Award className="mr-2 text-casino-thunder-green" />
                VIP Status
              </h3>
              
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-white/70">Current Level:</span>
                  <span className="text-white/90 font-medium">Level {user?.vipLevel}</span>
                </div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-1">
                  <div 
                    className="absolute top-0 left-0 h-full bg-casino-thunder-green"
                    style={{ width: `${(user?.vipLevel || 0) * 10}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-white/50">
                  <span>Level {user?.vipLevel}</span>
                  <span>Level {(user?.vipLevel || 0) + 1}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <VipBenefit 
                  title="Cashback"
                  description="Earn up to 15% weekly cashback"
                  available={user?.vipLevel! >= 1}
                />
                <VipBenefit 
                  title="Personal Account Manager"
                  description="Get a dedicated VIP manager"
                  available={user?.vipLevel! >= 3}
                />
                <VipBenefit 
                  title="Exclusive Bonuses"
                  description="Access to VIP-only promotions"
                  available={user?.vipLevel! >= 2}
                />
                <VipBenefit 
                  title="Higher Withdrawal Limits"
                  description="Increased daily and weekly limits"
                  available={user?.vipLevel! >= 2}
                />
                <VipBenefit 
                  title="Birthday Bonus"
                  description="Special gift on your birthday"
                  available={user?.vipLevel! >= 1}
                />
              </div>
            </div>

            <MetaMaskWallet />
            
            {/* Activity */}
            <div className="thunder-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Calendar className="mr-2 text-casino-thunder-green" />
                Recent Activity
              </h3>
              
              <div className="space-y-3">
                <ActivityItem 
                  title="Played Lightning Roulette"
                  description="Won $76.50"
                  date="2 hours ago"
                  type="win"
                />
                <ActivityItem 
                  title="Played Book of Dead"
                  description="Lost $25.00"
                  date="3 hours ago"
                  type="loss"
                />
                <ActivityItem 
                  title="Deposited Funds"
                  description="Added $200.00"
                  date="Yesterday"
                  type="deposit"
                />
                <ActivityItem 
                  title="Played Sweet Bonanza"
                  description="Won $125.75"
                  date="Yesterday"
                  type="win"
                />
                <ActivityItem 
                  title="Claimed Welcome Bonus"
                  description="Received $100.00"
                  date="2 days ago"
                  type="bonus"
                />
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  variant="outline"
                  className="min-w-[200px]"
                  onClick={() => window.location.href = "/transactions"}
                >
                  View All Activity
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VipBenefit = ({ 
  title, 
  description, 
  available 
}: { 
  title: string;
  description: string;
  available: boolean;
}) => (
  <div className={`flex items-start p-3 rounded-md ${available ? 'bg-white/5' : 'bg-white/5 opacity-50'}`}>
    <div className={`flex-shrink-0 p-2 rounded-full ${available ? 'bg-casino-thunder-green/20 text-casino-thunder-green' : 'bg-white/10 text-white/30'}`}>
      <Award className="h-5 w-5" />
    </div>
    <div className="ml-3">
      <h4 className="text-white/90 font-medium">{title}</h4>
      <p className="text-white/60 text-sm">{description}</p>
      {!available && (
        <p className="text-yellow-500 text-xs mt-1">Unlock at higher VIP level</p>
      )}
    </div>
  </div>
);

const ActivityItem = ({ 
  title, 
  description, 
  date,
  type 
}: { 
  title: string;
  description: string;
  date: string;
  type: 'win' | 'loss' | 'deposit' | 'withdrawal' | 'bonus';
}) => {
  const getIconByType = () => {
    switch (type) {
      case 'win':
        return <WalletIcon className="h-5 w-5 text-green-500" />;
      case 'loss':
        return <WalletIcon className="h-5 w-5 text-red-500" />;
      case 'deposit':
        return <WalletIcon className="h-5 w-5 text-blue-500" />;
      case 'withdrawal':
        return <WalletIcon className="h-5 w-5 text-yellow-500" />;
      case 'bonus':
        return <Gift className="h-5 w-5 text-purple-500" />;
      default:
        return <Calendar className="h-5 w-5 text-white/50" />;
    }
  };
  
  const getTextColorByType = () => {
    switch (type) {
      case 'win':
        return 'text-green-500';
      case 'loss':
        return 'text-red-500';
      case 'deposit':
        return 'text-blue-500';
      case 'withdrawal':
        return 'text-yellow-500';
      case 'bonus':
        return 'text-purple-500';
      default:
        return 'text-white/90';
    }
  };

  return (
    <div className="flex items-start p-3 rounded-md bg-white/5">
      <div className="flex-shrink-0 p-2 rounded-full bg-white/10">
        {getIconByType()}
      </div>
      <div className="ml-3 flex-grow">
        <h4 className="text-white/90 font-medium">{title}</h4>
        <p className={`${getTextColorByType()} text-sm font-medium`}>{description}</p>
      </div>
      <div className="text-white/50 text-xs">{date}</div>
    </div>
  );
};

export default Profile;

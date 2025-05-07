
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CircleDollarSign, User, Gift, Calendar } from "lucide-react";
import WalletBalance from "@/components/user/WalletBalance";
import DepositButton from "@/components/user/DepositButton";
import TransactionsList from "@/components/user/TransactionsList";

const Profile = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="bg-casino-thunder-dark border-casino-thunder-gray/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Profile</CardTitle>
          <div>
            <WalletBalance showRefresh={true} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24 border-2 border-casino-thunder-green">
                <AvatarImage src={user.avatar || user.avatarUrl} />
                <AvatarFallback className="bg-casino-thunder-green/20">
                  {user.username?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-medium">{user.username}</h3>
                <p className="text-sm text-white/60">{user.email}</p>
              </div>
              <DepositButton variant="small" />
            </div>
            
            <Separator orientation="vertical" className="hidden md:block" />
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 bg-casino-thunder-darker p-3 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-casino-thunder-green/20 flex items-center justify-center">
                    <CircleDollarSign className="h-5 w-5 text-casino-thunder-green" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Balance</p>
                    <p className="font-medium">${user.balance?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-casino-thunder-darker p-3 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">VIP Level</p>
                    <p className="font-medium">Level {user.vipLevel || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 bg-casino-thunder-darker p-3 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Account Status</p>
                    <p className="font-medium">{user.isVerified ? 'Verified' : 'Unverified'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Recent Transactions</h3>
                <TransactionsList userId={user.id} limit={5} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

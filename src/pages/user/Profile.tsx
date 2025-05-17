import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { walletService, mapDbWalletToWallet } from '@/services/walletService';
import { Wallet } from '@/types'; // Assuming User type comes from AuthContext
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner'; // Ensure toast is imported
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, UserCircle, Edit3, Save, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const UserProfilePage = () => {
  const { user, loading: authLoading, error: authError, updateUserProfile, refreshWalletBalance } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    // Add other fields like username, avatar_url if they exist on user profile
    // username: '',
    // avatar_url: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        // username: user.username || '',
        // avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateUserProfile) {
        toast.error("Profile update functionality is not available.");
        return;
    }
    
    // Create an update object with only changed fields or all fields based on your updateUserProfile needs
    const profileUpdateData = {
      // id: user?.id, // updateUserProfile should get ID from context or session
      first_name: formData.firstName,
      last_name: formData.lastName,
      // email: formData.email, // Usually email update requires verification, handle carefully
      // username: formData.username,
      // avatar_url: formData.avatar_url
    };

    try {
      const { error: updateError } = await updateUserProfile(profileUpdateData);

      if (updateError) {
        toast.error(`Failed to update profile: ${updateError.message}`);
      } else {
        toast.success('Profile updated successfully!');
        setEditMode(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred while updating profile.');
    }
  };

  useEffect(() => {
    const fetchWallet = async () => {
      if (user?.id) {
        setIsLoadingWallet(true);
        setWalletError(null);
        try {
          // Use refreshWalletBalance from AuthContext if it fetches and sets wallet
          // Otherwise, call walletService directly
          if (refreshWalletBalance) {
            const currentWallet = await refreshWalletBalance(); // Assuming it returns Wallet or updates context
            if (currentWallet) setWallet(currentWallet); // If it returns wallet directly
            // If refreshWalletBalance updates context, AuthContext should provide wallet state
          } else {
            // Fallback to direct service call if refreshWalletBalance isn't for fetching
            const walletResponse = await walletService.getWalletByUserId(user.id);
            if (walletResponse.success && walletResponse.data) {
              setWallet(mapDbWalletToWallet(walletResponse.data));
            } else if (walletResponse.error) {
              setWalletError(walletResponse.error);
              // toast.error(`Failed to load wallet: ${walletResponse.error}`);
            } else {
               setWallet(null); 
            }
          }
        } catch (err: any) {
          setWalletError(err.message || "Failed to fetch wallet.");
          // toast.error(err.message || "Failed to fetch wallet.");
        } finally {
          setIsLoadingWallet(false);
        }
      } else if (!authLoading) {
        setIsLoadingWallet(false);
      }
    };

    if (!authLoading) {
        fetchWallet();
    }
  }, [user?.id, authLoading, refreshWalletBalance]);
  
  if (authLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Skeleton className="w-full max-w-lg h-96 rounded-lg" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl text-red-400">Error loading user data.</p>
        <p className="text-muted-foreground">{authError.message || String(authError)}</p>
        <Button onClick={() => navigate('/auth/login')} className="mt-4">Go to Login</Button>
      </div>
    );
  }
  
  if (!user) {
     return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <UserCircle className="mx-auto h-16 w-16 text-gray-500 mb-4" />
        <p className="text-xl mb-4">Please log in to view your profile.</p>
        <Button onClick={() => navigate('/auth/login')}>Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto bg-card border-border/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-white flex items-center">
            <UserCircle className="mr-3 h-8 w-8 text-casino-neon-green" />
            Your Profile
          </CardTitle>
          <CardDescription className="text-gray-400">
            View and manage your personal information and wallet details.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="bg-input border-border/50 focus:ring-casino-neon-green focus:border-casino-neon-green"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="bg-input border-border/50 focus:ring-casino-neon-green focus:border-casino-neon-green"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly 
                  className="bg-input border-border/50 text-gray-500 cursor-not-allowed"
                  title="Email address cannot be changed here."
                />
                 <p className="text-xs text-gray-500 mt-1">Email cannot be changed after registration.</p>
              </div>
              {/* Add other editable fields here, e.g., username, avatar_url */}
              {/* <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleInputChange} />
              </div> */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="bg-casino-neon-green text-casino-black hover:bg-opacity-80">
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-gray-300">
              <p><strong>First Name:</strong> {user.firstName || 'Not set'}</p>
              <p><strong>Last Name:</strong> {user.lastName || 'Not set'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              {/* <p><strong>Username:</strong> {user.username || 'Not set'}</p> */}
              {/* Display avatar if available */}
              {/* {user.avatar_url && <img src={user.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full" />} */}
               <Button onClick={() => setEditMode(true)} className="mt-4 bg-casino-neon-green/20 text-casino-neon-green hover:bg-casino-neon-green/30 border border-casino-neon-green/50">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border/20 pt-6 mt-6">
          <div className="w-full">
            <h3 className="text-xl font-semibold text-white mb-3">Wallet Information</h3>
            {isLoadingWallet ? (
              <Skeleton className="h-10 w-full rounded" />
            ) : walletError ? (
               <p className="text-red-400 flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-red-500" /> Error loading wallet: {walletError}</p>
            ) : wallet ? (
              <div className="p-4 bg-black/20 rounded-md">
                <p className="text-2xl font-bold text-casino-neon-green">
                  {wallet.symbol}{wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                  <span className="text-sm text-gray-400 ml-1">{wallet.currency}</span>
                </p>
                {/* <p className="text-sm text-gray-500">Last updated: {new Date(wallet.updatedAt).toLocaleString()}</p> */}
              </div>
            ) : (
              <p className="text-gray-400">No wallet information available for this user.</p>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Removed TransactionsList as it was causing errors and its definition/props are unclear */}
      {/* If you need transactions here, ensure TransactionsList component exists and props are correct */}
      {/* For example: <TransactionsList userId={user.id} /> */}
    </div>
  );
};

export default UserProfilePage;

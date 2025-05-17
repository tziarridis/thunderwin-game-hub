import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { walletService, mapDbWalletToWallet } from '@/services/walletService';
import { Wallet } from '@/types'; // Assuming User type comes from AuthContext
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, loading: authLoading, error: authError, updateUser } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Own loading state for wallet
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedUser = await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });

      if (updatedUser) {
        toast.success('Profile updated successfully!');
        setEditMode(false);
      } else {
        toast.error('Failed to update profile.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchWallet = async () => {
      if (user?.id) {
        setIsLoading(true);
        setError(null);
        try {
          const walletResponse = await walletService.getWalletByUserId(user.id);
          if (walletResponse.success && walletResponse.data) {
            setWallet(mapDbWalletToWallet(walletResponse.data));
          } else if (walletResponse.error) {
            setError(walletResponse.error);
            toast.error(`Failed to load wallet: ${walletResponse.error}`);
          } else {
             setWallet(null); // No wallet exists
          }
        } catch (err: any) {
          setError(err.message || "Failed to fetch wallet.");
          toast.error(err.message || "Failed to fetch wallet.");
        } finally {
          setIsLoading(false);
        }
      } else if (!authLoading) {
        // If no user and auth is not loading, then no wallet to fetch
        setIsLoading(false);
      }
    };

    if (!authLoading) { // Only fetch if auth context is settled
        fetchWallet();
    }
  }, [user?.id, authLoading]);
  
  if (authLoading || isLoading) return <p>Loading profile...</p>;
  if (authError) return <p>Error loading user: {authError.message || authError}</p>;
  if (error && !wallet) return <p>Error loading wallet: {error}</p>; // Show wallet error if critical
  if (!user) return <p>Please log in to view your profile.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      
      {editMode ? (
        <form onSubmit={handleSubmit} className="max-w-md">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="max-w-md">
          <p>
            <strong>First Name:</strong> {user.firstName}
          </p>
          <p>
            <strong>Last Name:</strong> {user.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
        </div>
      )}
      
      {wallet ? (
        <div>
          <h2 className="text-xl font-semibold mt-6 mb-2">Wallet</h2>
          <p>Balance: {wallet.symbol}{wallet.balance.toLocaleString()} {wallet.currency}</p>
          {/* More wallet details */}
        </div>
      ) : !isLoading && ( // Only show if not loading and no wallet
        <p>No wallet information available.</p>
      )}
       {error && <p className="text-red-500 mt-2">Wallet Error: {error}</p>}
    </div>
  );
};

export default ProfilePage;

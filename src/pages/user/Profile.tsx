
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast'; // Assuming shadcn toast
import { Edit3, Save, User as UserIcon, ShieldCheck, Gift, ListChecks } from 'lucide-react';
import UserStats from '@/components/user/UserStats'; // Import UserStats
import VipProgress from '@/components/user/VipProgress'; // Import VipProgress
import { Skeleton } from '@/components/ui/skeleton';


const ProfilePage = () => {
  const { user, updateUserProfile, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '', // Email might not be editable
        phone: user.phone || '',
        country: user.country || '',
        // Add other fields as necessary
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateUserProfile) {
      toast({ title: "Error", description: "Profile update service not available.", variant: "destructive" });
      return;
    }
    try {
      const { data, error } = await updateUserProfile(formData);
      if (error) throw error;
      toast({ title: "Success", description: "Profile updated successfully." });
      setIsEditing(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update profile.", variant: "destructive" });
    }
  };

  if (authLoading && !user) {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-10 w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg md:col-span-2" />
            </div>
        </div>
    );
  }

  if (!user) {
    return <div className="container mx-auto p-8 text-center">Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="mb-6">
        <CardHeader className="flex flex-col md:flex-row items-center gap-4">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary">
            <AvatarImage src={user.avatar_url || `https://avatar.vercel.sh/${user.username || user.id}.png`} alt={user.username} />
            <AvatarFallback className="text-3xl md:text-4xl">
              {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
              {user.lastName?.charAt(0) || user.username?.charAt(1) || ''}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <CardTitle className="text-2xl md:text-3xl">{user.firstName || ''} {user.lastName || ''}</CardTitle>
            <CardDescription>@{user.username || 'username_not_set'}</CardDescription>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {/* TODO: Add VIP Level Badge here */}
          </div>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="ml-auto mt-4 md:mt-0">
            {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="overview"><UserIcon className="mr-2 h-4 w-4 inline-block"/>Overview</TabsTrigger>
          <TabsTrigger value="kyc"><ShieldCheck className="mr-2 h-4 w-4 inline-block"/>KYC</TabsTrigger>
          <TabsTrigger value="bonuses"><Gift className="mr-2 h-4 w-4 inline-block"/>Bonuses</TabsTrigger>
          <TabsTrigger value="transactions"><ListChecks className="mr-2 h-4 w-4 inline-block"/>Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{isEditing ? 'Edit Your Information' : 'Profile Information'}</CardTitle>
                <CardDescription>{isEditing ? 'Update your personal details.' : 'View your current profile details.'}</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" name="firstName" value={formData.firstName || ''} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" name="lastName" value={formData.lastName || ''} onChange={handleChange} />
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" name="username" value={formData.username || ''} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="email">Email (cannot be changed)</Label>
                        <Input id="email" name="email" value={formData.email || ''} readOnly disabled />
                    </div>
                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" name="country" value={formData.country || ''} onChange={handleChange} />
                    </div>
                    {/* Add more fields as needed */}
                    <Button type="submit" className="w-full md:w-auto">Save Changes</Button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <p><strong>First Name:</strong> {user.firstName || 'N/A'}</p>
                    <p><strong>Last Name:</strong> {user.lastName || 'N/A'}</p>
                    <p><strong>Username:</strong> {user.username || 'N/A'}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                    <p><strong>Country:</strong> {user.country || 'N/A'}</p>
                    <p><strong>Joined:</strong> {user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <UserStats user={user} />
              <VipProgress user={user} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kyc">
          <Card>
            <CardHeader><CardTitle>KYC Verification</CardTitle></CardHeader>
            <CardContent>
              <p>Current KYC Status: <span className={`font-semibold ${user.kycStatus === 'verified' ? 'text-green-500' : 'text-yellow-500'}`}>{user.kycStatus || 'Not Submitted'}</span></p>
              {user.kycStatus !== 'verified' && (
                <Button className="mt-4" onClick={() => {/* TODO: Navigate to KYC page or open KYC modal */} }>
                  {user.kycStatus === 'pending' ? 'Check KYC Status' : 'Start KYC Verification'}
                </Button>
              )}
              {/* TODO: Display KYC submission form or details */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bonuses">
          <Card>
            <CardHeader><CardTitle>My Bonuses</CardTitle></CardHeader>
            <CardContent>
              <p>Bonus information and history will be displayed here.</p>
              {/* TODO: Integrate BonusList component or similar */}
               <Button className="mt-4" onClick={() => {/* TODO: Navigate to BonusHub */} }>
                  View All Bonuses
                </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions">
          <Card>
            <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
            <CardContent>
              <p>Your recent transactions will appear here.</p>
              {/* TODO: Integrate TransactionList component or similar */}
              <Button className="mt-4" onClick={() => {/* TODO: Navigate to Transactions page */} }>
                  View All Transactions
                </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;

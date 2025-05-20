import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user'; // Your custom User type
import { Transaction } from '@/types/transaction';
import { Wallet } from '@/types/wallet'; // Your Wallet type
import { KycSubmission } from '@/types/kyc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Edit3, Mail, UserCircle, CalendarDays, ShieldCheck, DollarSign, ListOrdered, Ban, Unlock, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input'; // For editing
import { Label } from '@/components/ui/label'; // For editing
import { Switch } from '@/components/ui/switch'; // For editing status
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Helper to get initials
const getInitials = (name?: string, email?: string) => {
  if (name) {
    const parts = name.split(' ');
    if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return 'U';
};


const AdminUserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<KycSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User & { wallet_balance?: number, wallet_currency?: string }>>({});


  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        // Fetch user details (from your public.users table)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        if (userError) throw userError;
        setUser(userData as User);
        setEditFormData(userData as User || {});


        // Fetch wallet details
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', userId)
          .single(); // Assuming one wallet per user
        if (walletError && walletError.code !== 'PGRST116') throw walletError; // PGRST116 means no rows found, which is ok
        setWallet(walletData as Wallet || null);
        if(walletData) setEditFormData(prev => ({...prev, wallet_balance: walletData.balance, wallet_currency: walletData.currency}));


        // Fetch recent transactions
        const { data: transactionsData, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
        if (txError) throw txError;
        setTransactions(transactionsData as Transaction[] || []);

        // Fetch KYC submissions
        const { data: kycData, error: kycError } = await supabase
          .from('kyc_submissions') // Assuming this is your KYC table name
          .select('*')
          .eq('user_id', userId)
          .order('submitted_at', { ascending: false });
        if (kycError) throw kycError;
        setKycSubmissions(kycData as KycSubmission[] || []);

      } catch (error: any) {
        toast.error(`Failed to load user profile: ${error.message}`);
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId]);
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      if (type === 'checkbox') {
          setEditFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
      } else if (type === 'number') {
          setEditFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
      }
      else {
          setEditFormData(prev => ({ ...prev, [name]: value }));
      }
  };

  const handleSaveChanges = async () => {
    if (!user || !userId) return;
    setIsLoading(true);

    const userDataToUpdate: Partial<User> = {
        username: editFormData.username,
        email: editFormData.email, // Email updates are tricky, Supabase auth might need separate handling
        // role: editFormData.role, // Role updates should be handled carefully
        is_verified: editFormData.is_verified,
        is_banned: editFormData.is_banned,
        // any other fields from 'users' table
        first_name: editFormData.first_name,
        last_name: editFormData.last_name,
        avatar_url: editFormData.avatar_url,
    };
    // Remove undefined fields to avoid overwriting with null if not changed
    Object.keys(userDataToUpdate).forEach(key => userDataToUpdate[key as keyof User] === undefined && delete userDataToUpdate[key as keyof User]);


    const walletDataToUpdate: Partial<Wallet> = {};
    if(editFormData.wallet_balance !== undefined && editFormData.wallet_balance !== wallet?.balance) {
        walletDataToUpdate.balance = editFormData.wallet_balance;
    }
     if(editFormData.wallet_currency !== undefined && editFormData.wallet_currency !== wallet?.currency) {
        walletDataToUpdate.currency = editFormData.wallet_currency;
    }


    try {
        if (Object.keys(userDataToUpdate).length > 0) {
            const { error: userUpdateError } = await supabase
                .from('users')
                .update(userDataToUpdate)
                .eq('id', userId);
            if (userUpdateError) throw userUpdateError;
        }
        
        if (wallet && Object.keys(walletDataToUpdate).length > 0) {
             const { error: walletUpdateError } = await supabase
                .from('wallets')
                .update(walletDataToUpdate)
                .eq('user_id', userId);
            if (walletUpdateError) throw walletUpdateError;
        }

        toast.success("User profile updated successfully!");
        // Re-fetch data to show updated values
        const { data: updatedUserData } = await supabase.from('users').select('*').eq('id', userId).single();
        setUser(updatedUserData as User);
        if(wallet) {
            const { data: updatedWalletData } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
            setWallet(updatedWalletData as Wallet);
        }
        setIsEditing(false);
    } catch (error: any) {
        toast.error(`Failed to update profile: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl text-muted-foreground">User not found.</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const latestKyc = kycSubmissions.length > 0 ? kycSubmissions[0] : null;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users List
      </Button>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={user.avatar_url || undefined} alt={user.username || user.email || 'User'} />
              <AvatarFallback className="text-3xl bg-muted">
                {getInitials(user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username, user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User'}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="mt-1 flex flex-wrap gap-2">
                {user.role && <Badge variant="secondary">{user.role.toUpperCase()}</Badge>}
                {user.is_verified ? <Badge variant="success"><ShieldCheck className="h-3 w-3 mr-1"/> Verified</Badge> : <Badge variant="outline">Not Verified</Badge>}
                {user.is_banned && <Badge variant="destructive"><Ban className="h-3 w-3 mr-1"/> Banned</Badge>}
                {latestKyc && <Badge variant={latestKyc.status === 'approved' ? 'success' : latestKyc.status === 'rejected' ? 'destructive' : 'outline'}>KYC: {latestKyc.status.toUpperCase()}</Badge>}
              </div>
            </div>
          </div>
           <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center"><UserCircle className="h-4 w-4 mr-2" /> User ID</p>
            <p className="font-medium break-all">{user.id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center"><CalendarDays className="h-4 w-4 mr-2" /> Joined At</p>
            <p className="font-medium">{format(parseISO(user.created_at), 'PPpp')}</p>
          </div>
           <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center"><UserCircle className="h-4 w-4 mr-2" /> Auth User ID (Supabase)</p>
            <p className="font-medium break-all">{user.auth_user_id || 'N/A'}</p>
          </div>
          {wallet && (
            <>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center"><DollarSign className="h-4 w-4 mr-2" /> Wallet Balance</p>
                <p className="font-semibold text-lg text-green-600">{wallet.balance.toFixed(2)} {wallet.currency}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">VIP Level</p>
                <p className="font-medium">{wallet.vip_level ?? 'N/A'}</p>
              </div>
               <div className="space-y-1">
                <p className="text-sm text-muted-foreground">VIP Points</p>
                <p className="font-medium">{wallet.vip_points ?? '0'}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="kyc">KYC History</TabsTrigger>
          {/* Add more tabs as needed, e.g., Game History, Bonuses */}
        </TabsList>
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Last 10 transactions for this user.</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium truncate max-w-[100px]" title={tx.id}>{tx.id}</TableCell>
                        <TableCell>{tx.type}</TableCell>
                        <TableCell>{tx.amount.toFixed(2)} {tx.currency}</TableCell>
                        <TableCell><Badge variant={tx.status === 'completed' || tx.status === 'approved' ? 'success' : tx.status === 'failed' || tx.status === 'rejected' ? 'destructive' : 'secondary'}>{tx.status}</Badge></TableCell>
                        <TableCell>{format(parseISO(tx.created_at as string), 'Pp')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No transactions found for this user.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="kyc">
          <Card>
            <CardHeader>
              <CardTitle>KYC Submissions</CardTitle>
              <CardDescription>History of KYC verification attempts.</CardDescription>
            </CardHeader>
            <CardContent>
              {kycSubmissions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submission ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Reviewed At</TableHead>
                      <TableHead>Reason/Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycSubmissions.map((kyc) => (
                      <TableRow key={kyc.id}>
                        <TableCell className="font-medium truncate max-w-[100px]" title={kyc.id}>{kyc.id}</TableCell>
                        <TableCell><Badge variant={kyc.status === 'approved' ? 'success' : kyc.status === 'rejected' ? 'destructive' : 'secondary'}>{kyc.status.toUpperCase()}</Badge></TableCell>
                        <TableCell>{format(parseISO(kyc.submitted_at as string), 'Pp')}</TableCell>
                        <TableCell>{kyc.reviewed_at ? format(parseISO(kyc.reviewed_at as string), 'Pp') : 'N/A'}</TableCell>
                        <TableCell className="max-w-xs truncate" title={kyc.rejection_reason || kyc.notes || undefined}>{kyc.rejection_reason || kyc.notes || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No KYC submissions found for this user.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Edit User: {user.username || user.email}</DialogTitle>
                <DialogDescription>Modify user details and wallet information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div>
                    <Label htmlFor="edit-username">Username</Label>
                    <Input id="edit-username" name="username" value={editFormData.username || ''} onChange={handleEditFormChange} />
                </div>
                <div>
                    <Label htmlFor="edit-email">Email (Careful: Changing this might affect login)</Label>
                    <Input id="edit-email" name="email" type="email" value={editFormData.email || ''} onChange={handleEditFormChange} />
                </div>
                 <div>
                    <Label htmlFor="edit-first_name">First Name</Label>
                    <Input id="edit-first_name" name="first_name" value={editFormData.first_name || ''} onChange={handleEditFormChange} />
                </div>
                 <div>
                    <Label htmlFor="edit-last_name">Last Name</Label>
                    <Input id="edit-last_name" name="last_name" value={editFormData.last_name || ''} onChange={handleEditFormChange} />
                </div>
                 <div>
                    <Label htmlFor="edit-avatar_url">Avatar URL</Label>
                    <Input id="edit-avatar_url" name="avatar_url" value={editFormData.avatar_url || ''} onChange={handleEditFormChange} />
                </div>
                {/* Wallet Editing (if applicable) */}
                {wallet && (
                    <>
                        <hr/>
                        <h4 className="font-medium text-sm text-muted-foreground">Wallet Details</h4>
                        <div>
                            <Label htmlFor="edit-wallet_balance">Wallet Balance</Label>
                            <Input id="edit-wallet_balance" name="wallet_balance" type="number" step="0.01" value={editFormData.wallet_balance ?? ''} onChange={handleEditFormChange} />
                        </div>
                        <div>
                            <Label htmlFor="edit-wallet_currency">Wallet Currency</Label>
                            <Input id="edit-wallet_currency" name="wallet_currency" value={editFormData.wallet_currency || ''} onChange={handleEditFormChange} />
                        </div>
                    </>
                )}
                <hr/>
                <div className="flex items-center justify-between">
                    <Label htmlFor="edit-is_verified" className="flex flex-col">
                        <span>Email Verified</span>
                        <span className="text-xs text-muted-foreground">Is the user's email verified?</span>
                    </Label>
                    <Switch id="edit-is_verified" name="is_verified" checked={editFormData.is_verified || false} onCheckedChange={(checked) => setEditFormData(prev => ({...prev, is_verified: checked}))} />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="edit-is_banned" className="flex flex-col">
                        <span>User Banned</span>
                         <span className="text-xs text-muted-foreground">Is the user currently banned?</span>
                    </Label>
                    <Switch id="edit-is_banned" name="is_banned" checked={editFormData.is_banned || false} onCheckedChange={(checked) => setEditFormData(prev => ({...prev, is_banned: checked}))} />
                </div>
                {/* Add role editing if needed, but be very careful */}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSaveChanges} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Save Changes
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminUserProfilePage;

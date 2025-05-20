import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user'; // Using your custom User type
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, Eye, Ban, Unlock, UserCheck, UserX, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import ConfirmationDialog from '@/components/admin/shared/ConfirmationDialog'; // Assuming this exists
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 10;

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false); // For add/edit
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof User | 'email' | null>('created_at'); // Allow sorting by email from auth
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const navigate = useNavigate();

  const fetchUsers = useCallback(async (page: number, search: string, sortCol: keyof User | 'email' | null, sortDir: 'asc' | 'desc') => {
    setIsLoading(true);
    try {
      // Fetch from your public.users table
      let query = supabase
        .from('users') // Assuming your custom users table is named 'users'
        .select('*', { count: 'exact' });

      if (search) {
        // Search in username, email, or other relevant fields in your 'users' table
        query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,id.ilike.%${search}%`);
      }
      
      if (sortCol) {
         query = query.order(sortCol as keyof User, { ascending: sortDir === 'asc' }); // Cast needed if sortCol includes 'email' which might not be on User type directly
      } else {
        query = query.order('created_at', { ascending: false }); // Default sort
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      setUsers(data || []);
      setTotalUsers(count || 0);
    } catch (error: any) {
      toast.error(`Failed to fetch users: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, searchTerm, sortColumn, sortDirection);
  }, [fetchUsers, currentPage, searchTerm, sortColumn, sortDirection]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser && !showFormDialog) return; // Should not happen if dialog is for add
    
    const formData = new FormData(event.currentTarget);
    const userData: Partial<User> = {
      username: formData.get('username') as string,
      email: formData.get('email') as string, // Email updates are complex with Supabase Auth, usually handle separately
      role: formData.get('role') as User['role'],
      is_verified: formData.get('is_verified') === 'on',
      is_banned: formData.get('is_banned') === 'on',
      // Add other fields from your 'users' table that are editable
      first_name: formData.get('first_name') as string || undefined,
      last_name: formData.get('last_name') as string || undefined,
      avatar_url: formData.get('avatar_url') as string || undefined,
    };

    setIsLoading(true);
    try {
      if (editingUser) {
        // Update in your 'users' table
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', editingUser.id);
        if (error) throw error;
        toast.success('User updated successfully!');
      } else {
        // Adding a new user directly to 'users' table might bypass Supabase Auth.
        // This is typically handled via Supabase Auth signUp.
        // For admin creation, you might have a different flow or a server-side function.
        // For this example, let's assume direct insert is possible for admin purposes.
        // WARNING: This does NOT create a Supabase Auth user.
        const { data: newUser, error } = await supabase.from('users').insert(userData).select().single();
        if (error) throw error;
        toast.success(`User ${newUser?.username || newUser?.email} created (manual admin add). Auth user not created.`);
      }
      setShowFormDialog(false);
      setEditingUser(null);
      fetchUsers(currentPage, searchTerm, sortColumn, sortDirection); // Refresh list
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setShowConfirmDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsLoading(true);
    try {
      // Deleting from 'users' table. Supabase Auth user deletion is separate & more complex (admin API).
      const { error } = await supabase.from('users').delete().eq('id', userToDelete.id);
      if (error) throw error;
      toast.success('User data deleted successfully! (Auth user may still exist)');
      setShowConfirmDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers(currentPage, searchTerm, sortColumn, sortDirection); // Refresh list
    } catch (error: any) {
      toast.error(`Failed to delete user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleUserBan = async (user: User) => {
    setIsLoading(true);
    try {
      const newBanStatus = !user.is_banned;
      const { error } = await supabase
        .from('users')
        .update({ is_banned: newBanStatus, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
      toast.success(`User ${newBanStatus ? 'banned' : 'unbanned'} successfully.`);
      fetchUsers(currentPage, searchTerm, sortColumn, sortDirection); // Refresh
    } catch (error:any) {
      toast.error(`Failed to ${user.is_banned ? 'unban' : 'ban'} user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSort = (column: keyof User | 'email') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const SortIndicator = ({ column }: { column: keyof User | 'email' }) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />;
    }
    return null;
  };

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto p-4">
      <CMSPageHeader
        title="User Management"
        description="View, manage, and moderate platform users."
        actions={
          <Button onClick={() => { setEditingUser(null); setShowFormDialog(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New User (Admin)
          </Button>
        }
      />

      <div className="mb-4 flex items-center">
        <Input
          placeholder="Search by username, email, ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => fetchUsers(1, searchTerm, sortColumn, sortDirection)} className="ml-2">
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>
      
      {isLoading && users.length === 0 && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}


      {users.length > 0 && (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('username')}>Username <SortIndicator column="username" /></TableHead>
                <TableHead onClick={() => handleSort('email')}>Email <SortIndicator column="email" /></TableHead>
                <TableHead onClick={() => handleSort('role')}>Role <SortIndicator column="role" /></TableHead>
                <TableHead onClick={() => handleSort('is_verified')}>Verified <SortIndicator column="is_verified" /></TableHead>
                <TableHead onClick={() => handleSort('is_banned')}>Banned <SortIndicator column="is_banned" /></TableHead>
                <TableHead onClick={() => handleSort('created_at')}>Joined <SortIndicator column="created_at" /></TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium truncate max-w-[150px]" title={user.username || undefined}>{user.username || 'N/A'}</TableCell>
                  <TableCell className="truncate max-w-[200px]" title={user.email || undefined}>{user.email}</TableCell>
                  <TableCell>{user.role || 'user'}</TableCell>
                  <TableCell>{user.is_verified ? <UserCheck className="h-5 w-5 text-green-500" /> : <UserX className="h-5 w-5 text-red-500" />}</TableCell>
                  <TableCell>{user.is_banned ? <Ban className="h-5 w-5 text-red-500" /> : <Unlock className="h-5 w-5 text-green-500" />}</TableCell>
                  <TableCell>{format(new Date(user.created_at), 'PP')}</TableCell>
                  <TableCell className="space-x-1">
                    <Button variant="ghost" size="icon" title="View Profile" onClick={() => navigate(`/admin/users/${user.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Edit User" onClick={() => { setEditingUser(user); setShowFormDialog(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" title={user.is_banned ? "Unban User" : "Ban User"} onClick={() => toggleUserBan(user)}>
                      {user.is_banned ? <Unlock className="h-4 w-4 text-green-500" /> : <Ban className="h-4 w-4 text-red-500" />}
                    </Button>
                    {/* Delete might be too destructive for users, consider soft delete or deactivation */}
                    {/* <Button variant="ghost" size="icon" title="Delete User" onClick={() => openDeleteDialog(user)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
       {!isLoading && users.length === 0 && (
         <p className="text-center text-muted-foreground py-6">No users found matching your criteria.</p>
       )}


       {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
            <Button 
                onClick={() => setCurrentPage(p => Math.max(1, p-1))} 
                disabled={currentPage === 1 || isLoading}
                variant="outline"
            >
                Previous
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} 
                disabled={currentPage === totalPages || isLoading}
                variant="outline"
            >
                Next
            </Button>
        </div>
      )}

      <Dialog open={showFormDialog} onOpenChange={(isOpen) => { setShowFormDialog(isOpen); if(!isOpen) setEditingUser(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User (Admin Only)'}</DialogTitle>
            <DialogDescription>
                {editingUser ? 'Modify user details.' : 'Manually add a user. This does NOT create a Supabase Auth account.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" defaultValue={editingUser?.username || ''} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={editingUser?.email || ''} required />
            </div>
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" name="first_name" defaultValue={editingUser?.first_name || ''} />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" name="last_name" defaultValue={editingUser?.last_name || ''} />
            </div>
            <div>
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input id="avatar_url" name="avatar_url" defaultValue={editingUser?.avatar_url || ''} />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" defaultValue={editingUser?.role || 'user'} placeholder="e.g., user, admin, moderator" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="is_verified" name="is_verified" defaultChecked={editingUser?.is_verified || false} />
              <Label htmlFor="is_verified" className="font-normal">Email Verified</Label>
            </div>
             <div className="flex items-center space-x-2">
              <Checkbox id="is_banned" name="is_banned" defaultChecked={editingUser?.is_banned || false} />
              <Label htmlFor="is_banned" className="font-normal">Banned</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowFormDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingUser ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={showConfirmDeleteDialog}
        onClose={() => setShowConfirmDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        description={`Are you sure you want to delete user "${userToDelete?.username || userToDelete?.email}"? This action might be irreversible.`}
        confirmButtonText="Delete"
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminUsers;

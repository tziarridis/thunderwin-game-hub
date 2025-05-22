import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as UserType, UserRole } from '@/types/user'; // UserRole imported
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'; // Removed DialogTrigger
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash2, Search, Eye, Ban, Unlock, UserCheck, UserX, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import CMSPageHeader, { CMSPageHeaderProps } from '@/components/admin/cms/CMSPageHeader';
import ConfirmationDialog, { ConfirmationDialogProps } from '@/components/admin/shared/ConfirmationDialog';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns'; // Added parseISO
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For Role Select

const ITEMS_PER_PAGE = 10;

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false); // For add/edit
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof UserType | 'email' | null>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const navigate = useNavigate();


  const fetchUsers = useCallback(async (page: number, search: string, sortCol: keyof UserType | 'email' | null, sortDir: 'asc' | 'desc') => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('users') // Ensure this is your Supabase table name for users
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,id.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }
      
      if (sortCol) {
         query = query.order(sortCol as string, { ascending: sortDir === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false }); 
      }

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      // Map DB fields to UserType if necessary, e.g. DB 'banned' to UserType 'is_banned'
      const mappedData = data?.map(dbUser => ({
        ...dbUser,
        is_banned: dbUser.banned, // Assuming DB has 'banned' field
        // ensure all UserType fields are covered
      })) as UserType[];

      setUsers(mappedData || []);
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
    if (!editingUser && !showFormDialog) return; 
    
    const formData = new FormData(event.currentTarget);
    const userDataFromForm = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as UserRole,
      first_name: formData.get('first_name') as string || null, // Use null for empty optionals
      last_name: formData.get('last_name') as string || null,
      avatar_url: formData.get('avatar_url') as string || null,
      is_verified: formData.get('is_verified') === 'on',
      banned: formData.get('is_banned') === 'on', // Use 'banned' to match DB column
      status: formData.get('is_banned') === 'on' ? 'banned' : (editingUser?.status || 'active'), // Update status based on ban
      phone: formData.get('phone') as string || null,
    };

    // Construct the payload for Supabase, ensure it matches DB schema
    const supabasePayload: any = { ...userDataFromForm };
    // If your DB uses 'is_banned' change here, but above used 'banned' for form.
    // For this example, assuming DB has 'banned', 'is_verified', 'status', 'role', etc.
    
    // Remove fields not directly on the 'users' table or handle them separately
    // e.g., if 'isActive' is derived or not a DB column
    // delete supabasePayload.isActive; 


    setIsLoading(true);
    try {
      if (editingUser) {
        const { error } = await supabase
          .from('users')
          .update({...supabasePayload, updated_at: new Date().toISOString()})
          .eq('id', editingUser.id);
        if (error) throw error;
        toast.success('User updated successfully!');
      } else {
        // This is for creating user in 'users' table, NOT Supabase Auth.
        // Auth user creation should be handled via Supabase Auth methods.
        const { data: newUser, error } = await supabase.from('users').insert({...supabasePayload, created_at: new Date().toISOString()}).select().single();
        if (error) throw error;
        toast.success(`User ${newUser?.username || newUser?.email} created in database. (Auth user NOT created).`);
      }
      setShowFormDialog(false);
      setEditingUser(null);
      fetchUsers(currentPage, searchTerm, sortColumn, sortDirection);
    } catch (error: any) {
      toast.error(`Operation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  const openDeleteDialog = (user: UserType) => {
    setUserToDelete(user);
    setShowConfirmDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsLoading(true);
    try {
      // This deletes from your 'users' table. Auth user deletion is separate.
      const { error } = await supabase.from('users').delete().eq('id', userToDelete.id);
      if (error) throw error;
      toast.success('User data deleted from database successfully! (Auth user may still exist)');
      setShowConfirmDeleteDialog(false);
      setUserToDelete(null);
      fetchUsers(currentPage, searchTerm, sortColumn, sortDirection);
    } catch (error: any) {
      toast.error(`Failed to delete user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleUserBan = async (user: UserType) => {
    setIsLoading(true);
    try {
      const newBanStatus = !user.is_banned; // UserType uses is_banned
      const { error } = await supabase
        .from('users') // DB table
        .update({ banned: newBanStatus, status: newBanStatus ? 'banned' : 'active', updated_at: new Date().toISOString() }) // DB uses 'banned'
        .eq('id', user.id);
      if (error) throw error;
      toast.success(`User ${newBanStatus ? 'banned' : 'unbanned'} successfully.`);
      fetchUsers(currentPage, searchTerm, sortColumn, sortDirection);
    } catch (error:any) {
      toast.error(`Failed to ${user.is_banned ? 'unban' : 'ban'} user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: keyof UserType | 'email') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const SortIndicator = ({ column }: { column: keyof UserType | 'email' }) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />;
    }
    return null;
  };

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
  const userRoles: UserRole[] = ['user', 'admin', 'moderator', 'agent', 'vip_manager']; // Example roles for dropdown

  const cmsHeaderProps: CMSPageHeaderProps = {
    title: "User Management",
    description: "View, manage, and moderate platform users.",
    actions: (
      <Button onClick={() => { setEditingUser(null); setShowFormDialog(true); }}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add New User (DB Only)
      </Button>
    )
  };
  
  const deleteDialogProps: ConfirmationDialogProps = {
    isOpen:showConfirmDeleteDialog,
    onClose:() => setShowConfirmDeleteDialog(false),
    onConfirm:handleDeleteConfirm,
    title:"Delete User",
    description:`Are you sure you want to delete user "${userToDelete?.username || userToDelete?.email}"? This action might be irreversible.`,
    confirmText:"Delete",
    variant: "destructive",
    isLoading:isLoading
  };


  return (
    <div className="container mx-auto p-4">
      <CMSPageHeader {...cmsHeaderProps} />

      <div className="mb-4 flex items-center">
        <Input
          placeholder="Search by username, email, ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        {/* Search button can trigger fetch if needed, or rely on useEffect */}
        {/* <Button onClick={() => fetchUsers(1, searchTerm, sortColumn, sortDirection)} className="ml-2">
          <Search className="mr-2 h-4 w-4" /> Search
        </Button> */}
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
                  <TableCell className="capitalize">{user.role || 'user'}</TableCell>
                  <TableCell>{user.is_verified ? <UserCheck className="h-5 w-5 text-green-500" /> : <UserX className="h-5 w-5 text-red-500" />}</TableCell>
                  <TableCell>{user.is_banned ? <Ban className="h-5 w-5 text-red-500" /> : <Unlock className="h-5 w-5 text-green-500" />}</TableCell>
                  <TableCell>{format(parseISO(user.created_at), 'PP')}</TableCell>
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
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User (DB Only)'}</DialogTitle>
            <DialogDescription>
                {editingUser ? 'Modify user details in the database.' : 'Manually add a user to the database. This does NOT create a Supabase Auth account.'}
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
              <Select name="role" defaultValue={editingUser?.role || 'user'}>
                <SelectTrigger id="role"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {userRoles.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="is_verified" name="is_verified" defaultChecked={editingUser?.is_verified || false} />
              <Label htmlFor="is_verified" className="font-normal">Email Verified (DB flag)</Label>
            </div>
             <div className="flex items-center space-x-2">
              <Checkbox id="is_banned" name="is_banned" defaultChecked={editingUser?.is_banned || false} />
              <Label htmlFor="is_banned" className="font-normal">Banned (DB flag)</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowFormDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingUser ? 'Save Changes' : 'Create User (DB)'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog {...deleteDialogProps} />
    </div>
  );
};

export default AdminUsers;

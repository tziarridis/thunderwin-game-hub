
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Filter, Edit, Trash2, User as UserIcon, ShieldCheck, ShieldAlert, Eye, MoreVertical, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User } from '@/types/user'; // Use your custom User type
import { userService } from '@/services/userService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import UserForm from '@/components/admin/UserForm'; // Assuming UserForm exists and takes User
import { useNavigate } from 'react-router-dom';


const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const usersPerPage = 10;
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await userService.getAllUsers({ search: searchQuery });
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  
  const handleSelectRow = (userId: string) => {
    setSelectedRows(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRows(currentUsers.map(user => user.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action is irreversible.")) {
      try {
        await userService.deleteUser(userId);
        toast.success("User deleted successfully.");
        fetchUsers(); // Refresh
        setSelectedRows(prev => prev.filter(id => id !== userId));
      } catch (error: any) {
        toast.error(`Failed to delete user: ${error.message}`);
      }
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
        toast.info("No users selected for deletion.");
        return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} selected users? This action is irreversible.`)) {
      try {
        // This assumes userService.deleteUser can be called multiple times or you have a bulk delete endpoint
        await Promise.all(selectedRows.map(id => userService.deleteUser(id)));
        toast.success(`${selectedRows.length} users deleted successfully.`);
        fetchUsers(); // Refresh
        setSelectedRows([]);
      } catch (error: any) {
        toast.error(`Failed to delete selected users: ${error.message}`);
      }
    }
  };

  const handleFormSubmit = async (userData: Partial<User>) => { // UserForm submits Partial<User>
    try {
      if (editingUser && editingUser.id) {
        await userService.updateUser(editingUser.id, userData);
        toast.success("User updated successfully.");
      } else {
        // Creating a user via admin panel might be complex (password, etc.)
        // This usually involves inviting or setting a temporary password.
        // For now, assuming userService.createUser handles this.
        // await userService.createUser(userData as User); // Ensure UserForm provides all needed fields for creation
        toast.info("User creation through admin panel needs specific implementation (e.g., invite).");
      }
      setIsFormOpen(false);
      setEditingUser(null);
      fetchUsers(); // Refresh
    } catch (error: any) {
      toast.error(`Failed to save user: ${error.message}`);
    }
  };

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return users.slice(startIndex, startIndex + usersPerPage);
  }, [users, currentPage, usersPerPage]);
  const currentUsers = paginatedUsers; // alias for checkbox logic

  const totalPages = Math.ceil(users.length / usersPerPage);

  const getUserName = (user: User) => {
    return user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || user.id;
  }

  const getKycStatusBadge = (status?: 'verified' | 'pending' | 'rejected' | 'not_submitted') => {
    switch (status) {
      case 'verified': return <Badge variant="success"><ShieldCheck className="mr-1 h-3 w-3"/>Verified</Badge>;
      case 'pending': return <Badge variant="warning"><ShieldAlert className="mr-1 h-3 w-3"/>Pending</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">Not Submitted</Badge>;
    }
  };
  
  const getUserStatusBadge = (status?: 'active' | 'inactive' | 'banned') => {
    switch (status) {
      case 'active': return <Badge variant="success">Active</Badge>;
      case 'inactive': return <Badge variant="secondary">Inactive</Badge>;
      case 'banned': return <Badge variant="destructive">Banned</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };


  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
        {/* Add User button can be re-enabled if UserForm handles creation well */}
        {/* <Button onClick={() => { setEditingUser(null); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button> */}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <Input
          placeholder="Search users by name, email, or ID..."
          value={searchQuery}
          onChange={handleSearch}
          className="max-w-sm"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
        <div className="flex gap-2">
            {/* <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button> */}
            {selectedRows.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}><Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedRows.length})</Button>
            )}
        </div>
      </div>

      {isLoading && users.length === 0 ? (
         <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={currentUsers.length > 0 && selectedRows.length === currentUsers.length ? true : (selectedRows.length > 0 ? "indeterminate" : false)}
                    onCheckedChange={handleSelectAll}
                    disabled={currentUsers.length === 0}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedRows.includes(user.id)}
                      onCheckedChange={() => handleSelectRow(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="avatar" className="h-8 w-8 rounded-full" />
                      ) : (
                        <UserIcon className="h-8 w-8 p-1.5 bg-muted text-muted-foreground rounded-full" />
                      )}
                      <div>
                        <div className="font-medium">{getUserName(user)}</div>
                        <div className="text-xs text-muted-foreground">ID: {user.id.substring(0,8)}...</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant="outline">{user.role || 'User'}</Badge></TableCell>
                  <TableCell>{getKycStatusBadge(user.user_metadata?.kyc_status)}</TableCell>
                  <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}><Eye className="mr-2 h-4 w-4" />View Profile</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(user)}><Edit className="mr-2 h-4 w-4" />Edit User</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow><TableCell colSpan={8} className="text-center h-24">No users found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-end items-center space-x-2 pt-4">
           <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User (Invite)"}</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <UserForm 
                user={editingUser} 
                onSubmit={handleFormSubmit} 
                onCancel={() => { setIsFormOpen(false); setEditingUser(null); }}
            />
          )}
          {/* Add form logic for creating/inviting user might be different */}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminUsers;

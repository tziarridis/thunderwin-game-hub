import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, ColumnFiltersState, getFilteredRowModel } from '@tanstack/react-table';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import UserForm from '@/components/admin/UserForm'; // Assuming this component exists and is correctly typed
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { userService } from '@/services/userService'; // Your user service
import { PlusCircle, Edit, Trash2, RefreshCw, Search, UserCog, Eye } from 'lucide-react';
import ResponsiveContainer from '@/components/ui/responsive-container';
import CMSPageHeader from '@/components/admin/cms/CMSPageHeader';
import { useNavigate } from 'react-router-dom'; // For navigation to user profile page

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await userService.getUsers(); // Assuming getUsers fetches all users
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFormSubmit = async (data: Partial<User>, userId?: string) => { // Data can be partial for updates
    try {
      if (userId) {
        // Ensure data being sent matches what userService.updateUser expects
        // This might involve merging with existing user data if UserForm only sends changed fields
        await userService.updateUser(userId, data); 
        toast.success('User updated successfully!');
      } else {
        // Ensure data for createUser is complete as per User type or what service.createUser expects
        await userService.createUser(data as User); // Cast if confident data is complete User
        toast.success('User created successfully!');
      }
      setIsFormOpen(false);
      setEditingUser(null);
      fetchUsers(); // Refresh list
    } catch (error: any) {
      console.error('Failed to save user:', error);
      toast.error(`Error: ${error.message || 'Failed to save user.'}`);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action might be irreversible.')) {
      try {
        await userService.deleteUser(userId);
        toast.success('User deleted successfully!');
        fetchUsers(); // Refresh list
      } catch (error: any) {
        console.error('Failed to delete user:', error);
        toast.error(`Error: ${error.message || 'Failed to delete user.'}`);
      }
    }
  };
  
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
        accessorKey: "username",
        header: "Username",
        cell: ({ row }) => <span className="font-medium">{row.original.username || row.original.email?.split('@')[0]}</span>,
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            let colorClass = "";
            if (status === 'active') colorClass = "text-green-600 bg-green-100";
            else if (status === 'banned') colorClass = "text-red-600 bg-red-100";
            else if (status === 'pending') colorClass = "text-yellow-600 bg-yellow-100";
            else if (status === 'suspended') colorClass = "text-orange-600 bg-orange-100";
            return <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>{status || 'N/A'}</span>;
        }
    },
    {
        accessorKey: "vip_level",
        header: "VIP Level",
        cell: ({ row }) => row.original.vip_level ?? 0,
    },
    {
        accessorKey: "created_at",
        header: "Joined Date",
        cell: ({ row }) => new Date(row.original.created_at || Date.now()).toLocaleDateString(),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/admin/users/${row.original.id}`)} title="View Profile">
                    <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)} title="Edit User">
                    <UserCog className="h-4 w-4" />
                </Button>
                {/* <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)} title="Delete User (use with caution)">
                    <Trash2 className="h-4 w-4" />
                </Button> */}
            </div>
        ),
    },
  ], [navigate]);


  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <ResponsiveContainer>
      <CMSPageHeader title="User Management" description="Oversee and manage all registered users.">
         <div className="flex gap-2">
            <Button onClick={fetchUsers} variant="outline" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} mr-2`} />
                Refresh Users
            </Button>
            <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
                setIsFormOpen(isOpen);
                if (!isOpen) setEditingUser(null);
            }}>
                <DialogTrigger asChild>
                    <Button onClick={() => { setEditingUser(null); setIsFormOpen(true); }}>
                        <PlusCircle className="h-4 w-4 mr-2" /> Add New User
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? `Update details for ${editingUser.username || editingUser.email}.` : 'Fill in the details for the new user.'}
                        </DialogDescription>
                    </DialogHeader>
                    <UserForm
                        user={editingUser}
                        onSubmit={handleFormSubmit}
                        isEditing={!!editingUser}
                    />
                </DialogContent>
            </Dialog>
        </div>
      </CMSPageHeader>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full max-w-sm">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
            placeholder="Search users (username, email...)"
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full"
            />
        </div>
        {/* Add more specific column filters here if needed, e.g., by role or status */}
      </div>

      {isLoading && <p className="text-center py-4">Loading users...</p>}
      {!isLoading && (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' ▲',
                        desc: ' ▼',
                      }[header.column.getIsSorted() as string] ?? null}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} onClick={() => navigate(`/admin/users/${row.original.id}`)} className="cursor-pointer hover:bg-muted/50">
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </ResponsiveContainer>
  );
};

export default AdminUsers;

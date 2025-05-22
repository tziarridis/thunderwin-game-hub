import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import { useQuery } from '@tanstack/react-query';
import { UserPlus, UserCog, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import { User } from '@/types'; // Ensure User type is comprehensive
import { ColumnDef, SortingState, useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, CellContext } from "@tanstack/react-table";

const UsersPage: React.FC = () => {
  const [filters, setFilters] = useState({ searchTerm: '', role: '', status: '' });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading, error, refetch } = useQuery<{users: User[], totalCount: number}, Error>({
    queryKey: ['adminUsers', filters, pagination, sorting],
    queryFn: async () => {
      // const result = await userService.getAllUsers({ /* params */ });
      // return { users: result.data, totalCount: result.count };
      return { users: [], totalCount: 0 }; // Placeholder
    },
  });
  
  const users = data?.users || [];
  const totalCount = data?.totalCount || 0;
  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  const navigate = useNavigate();

  const columns: ColumnDef<User>[] = [
    { accessorKey: "id", header: "ID", cell: ({row}) => <div className="truncate w-20" title={row.original.id}>{row.original.id}</div> },
    { accessorKey: "username", header: "Username" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role", cell: ({row}) => <Badge variant="secondary">{row.original.role || 'N/A'}</Badge> },
    { accessorKey: "status", header: "Status", cell: ({row}) => <Badge variant={row.original.status === 'active' ? 'default' : 'outline'}>{row.original.status || 'N/A'}</Badge> },
    { accessorKey: "created_at", header: "Joined Date", cell: ({row}) => format(new Date(row.original.created_at), "PP") },
    {
      id: "actions",
      // Corrected cell renderer signature
      cell: ({ row }: CellContext<User, unknown>) => {
        const user = row.original;
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/users/${user.id}`)}>
              <UserCog className="mr-1 h-4 w-4" /> View/Edit
            </Button>
            {/* Add other actions like ban, verify, etc. */}
          </div>
        );
      },
    },
  ];
  
  const table = useReactTable({
    data: users,
    columns,
    pageCount: pageCount,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  // ... keep existing code (JSX structure, filters, table, pagination)
  // ... Add UserForm modal logic if creating/editing users directly on this page is intended.
  
  if (error) return <AdminPageLayout title="User Management"><div className="text-red-500 p-4">Error loading users: {error.message}</div></AdminPageLayout>;

  return (
    <AdminPageLayout title="User Management" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
      headerActions={
        <div className="flex gap-2">
          <Button onClick={() => alert("Add new user form (not implemented).")}> {/* Placeholder for Add User */}
            <UserPlus className="mr-2 h-4 w-4" /> Add New User
          </Button>
          <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh Users
          </Button>
        </div>
      }
    >
      {/* Filters UI */}
      <div className="p-4 bg-card rounded-lg shadow mb-4 flex flex-col sm:flex-row gap-2 items-center">
          <Input 
            placeholder="Search by ID, username, email..." 
            value={filters.searchTerm} 
            onChange={e => setFilters(prev => ({...prev, searchTerm: e.target.value}))}
            className="max-w-sm flex-grow" 
          />
          {/* Add Selects for role and status if User type supports them directly */}
          <Button onClick={() => refetch()} disabled={isLoading}>Filter</Button>
      </div>

      {isLoading && users.length === 0 ? (
          <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
          <DataTable table={table} columns={columns} isLoading={isLoading} />
      )}
      
      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
      </div>
    </AdminPageLayout>
  );
};

export default UsersPage;

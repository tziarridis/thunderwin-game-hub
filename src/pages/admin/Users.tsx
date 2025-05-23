
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import { useQuery } from '@tanstack/react-query';
import { UserPlus, UserCog, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import { User } from '@/types';

const UsersPage: React.FC = () => {
  const [filters, setFilters] = useState({ searchTerm: '', role: '', status: '' });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data, isLoading, error, refetch } = useQuery<{users: User[], totalCount: number}, Error>({
    queryKey: ['adminUsers', filters, pagination],
    queryFn: async () => {
      return { users: [], totalCount: 0 };
    },
  });
  
  const users = data?.users || [];
  const totalCount = data?.totalCount || 0;

  const navigate = useNavigate();

  const columns: DataTableColumn<User>[] = [
    { accessorKey: "id", header: "ID", cell: (row) => <div className="truncate w-20" title={row.id}>{row.id}</div> },
    { accessorKey: "username", header: "Username" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role", cell: (row) => <Badge variant="secondary">{row.role || 'N/A'}</Badge> },
    { accessorKey: "status", header: "Status", cell: (row) => <Badge variant={row.status === 'active' ? 'default' : 'outline'}>{row.status || 'N/A'}</Badge> },
    { accessorKey: "created_at", header: "Joined Date", cell: (row) => format(new Date(row.created_at), "PP") },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (row) => {
        const user = row;
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/users/${user.id}`)}>
              <UserCog className="mr-1 h-4 w-4" /> View/Edit
            </Button>
          </div>
        );
      },
    },
  ];

  if (error) return <AdminPageLayout title="User Management"><div className="text-red-500 p-4">Error loading users: {error.message}</div></AdminPageLayout>;

  return (
    <AdminPageLayout title="User Management" breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
      headerActions={
        <div className="flex gap-2">
          <Button onClick={() => alert("Add new user form (not implemented).")}>
            <UserPlus className="mr-2 h-4 w-4" /> Add New User
          </Button>
          <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh Users
          </Button>
        </div>
      }
    >
      <div className="p-4 bg-card rounded-lg shadow mb-4 flex flex-col sm:flex-row gap-2 items-center">
          <Input 
            placeholder="Search by ID, username, email..." 
            value={filters.searchTerm} 
            onChange={e => setFilters(prev => ({...prev, searchTerm: e.target.value}))}
            className="max-w-sm flex-grow" 
          />
          <Button onClick={() => refetch()} disabled={isLoading}>Filter</Button>
      </div>

      {isLoading && users.length === 0 ? (
          <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
          <DataTable columns={columns} data={users} />
      )}
    </AdminPageLayout>
  );
};

export default UsersPage;

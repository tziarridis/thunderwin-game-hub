import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, Search } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data for demonstration
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'john_doe',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar_url: 'https://github.com/shadcn.png',
        created_at: new Date(2021, 10, 1).toLocaleDateString(),
        lastLogin: new Date(2023, 10, 1).toLocaleDateString(),
        status: 'active',
      },
      {
        id: '2',
        username: 'jane_smith',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        avatar_url: 'https://avatars.githubusercontent.com/u/88843',
        created_at: new Date(2022, 5, 15).toLocaleDateString(),
        lastLogin: new Date(2023, 9, 25).toLocaleDateString(),
        status: 'inactive',
      },
      {
        id: '3',
        username: 'mike_johnson',
        email: 'mike.johnson@example.com',
        firstName: 'Mike',
        lastName: 'Johnson',
        avatar_url: 'https://ui.shadcn.com/avatars/0.png',
        created_at: new Date(2023, 2, 20).toLocaleDateString(),
        lastLogin: new Date(2023, 10, 5).toLocaleDateString(),
        status: 'active',
      },
    ];

    setUsers(mockUsers);
  }, []);

  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleEditUser = (user: User) => {
    toast({
      title: "Edit User",
      description: `Navigating to edit user: ${user.username || user.email}`,
    })
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    setSelectedUserIds((prevSelected) => prevSelected.filter((id) => id !== userId));
    toast({
      title: "Delete User",
      description: "Deleting user...",
    })
  };

  const handleBulkAction = (action: string) => {
    if (selectedUserIds.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select users for bulk action.",
      })
      return;
    }

    toast({
      title: "Bulk Action",
      description: `${action} for selected users...`,
    })
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedUserIds(users.map((user) => user.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const toggleRowSelection = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const filteredAndSortedUsers = users.filter((user) => {
    const searchStr = `${user.username} ${user.email} ${user.firstName} ${user.lastName}`.toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => handleBulkAction('Action')} disabled={selectedUserIds.length === 0}>
          Bulk Action
        </Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full md:w-1/2 lg:w-1/4"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
              </TableHead>
              <TableHead>User Info</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => toggleRowSelection(user.id)}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                        <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username || user.email}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'N/A'}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                    {user.status || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button variant="ghost" size="sm" onClick={() => handleViewUser(user.id)} className="mr-2">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} className="mr-2">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default AdminUsers;

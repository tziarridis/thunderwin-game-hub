import { useState, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  Filter, 
  Edit, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Lock,
  User,
  Users,
  Shield,
  UserCheck,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User as UserType } from "@/types";
import { getUsers, usersApi } from "@/services/apiService";
import UserForm from "@/components/admin/UserForm";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const usersPerPage = 8;
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await usersApi.getUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);
  
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  const handleViewUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleSelectRow = (userId: string) => {
    if (selectedRows.includes(userId)) {
      setSelectedRows(selectedRows.filter(id => id !== userId));
    } else {
      setSelectedRows([...selectedRows, userId]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedRows.length === currentUsers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentUsers.map(user => user.id));
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterUsers(query, statusFilter);
  };
  
  const toggleStatusFilter = (status: string) => {
    const newStatusFilter = statusFilter.includes(status)
      ? statusFilter.filter(s => s !== status)
      : [...statusFilter, status];
      
    setStatusFilter(newStatusFilter);
    filterUsers(searchQuery, newStatusFilter);
  };
  
  const filterUsers = (query: string, statuses: string[]) => {
    let results = users;
    
    // Apply search query
    if (query) {
      results = results.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
      );
    }
    
    // Apply status filters
    if (statuses.length > 0) {
      results = results.filter(user => statuses.includes(user.status));
    }
    
    setFilteredUsers(results);
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  const clearFilters = () => {
    setStatusFilter([]);
    setSearchQuery("");
    setFilteredUsers(users);
  };
  
  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };
  
  const handleAddUser = async (userData: Omit<UserType, 'id'>) => {
    try {
      await usersApi.addUser(userData);
      setIsAddDialogOpen(false);
      // Refresh the user list
      const updatedUsers = await usersApi.getUsers();
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };
  
  const handleUpdateUser = async (userData: UserType) => {
    try {
      await usersApi.updateUser(userData);
      setIsEditDialogOpen(false);
      // Refresh the user list
      const updatedUsers = await usersApi.getUsers();
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };
  
  const formatBalance = (balance: number) => {
    return `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className={`flex items-center ${showFilters ? 'text-casino-thunder-green border-casino-thunder-green' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <UserForm onSubmit={handleAddUser} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="thunder-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Total Users</p>
              <h3 className="text-2xl font-bold">{users.length}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <Users className="h-6 w-6 text-casino-thunder-green" />
            </div>
          </div>
        </div>
        
        <div className="thunder-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Active Users</p>
              <h3 className="text-2xl font-bold">{users.filter(user => user.status === 'Active').length}</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="thunder-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">Admins</p>
              <h3 className="text-2xl font-bold">1</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-full">
              <Shield className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="thunder-card p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filters</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-white/70 hover:text-casino-thunder-green"
            >
              Clear All
            </Button>
          </div>
          
          <div>
            <h4 className="text-white/80 mb-2 text-sm font-medium">User Status</h4>
            <div className="flex flex-wrap gap-2">
              {["Active", "Pending", "Inactive"].map(status => (
                <Button 
                  key={status}
                  variant="outline"
                  size="sm"
                  className={`capitalize ${
                    statusFilter.includes(status) ? "border-casino-thunder-green text-casino-thunder-green" : ""
                  }`}
                  onClick={() => toggleStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="thunder-input w-full pl-10"
            placeholder="Search users by name, email, or ID..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {/* Users Table */}
      <div className="thunder-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-casino-thunder-green" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-casino-thunder-green rounded"
                        checked={selectedRows.length === currentUsers.length && currentUsers.length > 0}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-casino-thunder-green rounded"
                        checked={selectedRows.includes(user.id)}
                        onChange={() => handleSelectRow(user.id)}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-white/60">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{user.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : user.status === 'Pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{formatBalance(user.balance)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white/60">{user.joined}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleViewUser(user.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Lock className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="px-4 py-3 flex items-center justify-between border-t border-white/10">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/60">
                Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastUser, filteredUsers.length)}
                </span>{' '}
                of <span className="font-medium">{filteredUsers.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-l-md"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button 
                      key={pageNum}
                      variant="outline" 
                      className={currentPage === pageNum ? "bg-white/10" : ""}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-r-md"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm 
              onSubmit={handleUpdateUser} 
              initialValues={selectedUser}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;

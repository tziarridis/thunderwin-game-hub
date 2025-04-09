
import { useState } from "react";
import { 
  Search, 
  UserPlus, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  MoreHorizontal,
  Download,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminUsers = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  const handleSelectRow = (userId: string) => {
    if (selectedRows.includes(userId)) {
      setSelectedRows(selectedRows.filter(id => id !== userId));
    } else {
      setSelectedRows([...selectedRows, userId]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedRows.length === users.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(users.map(user => user.id));
    }
  };

  return (
    <div className="py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
      
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
          />
        </div>
      </div>
      
      {/* Users Table */}
      <div className="thunder-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-casino-thunder-green rounded"
                      checked={selectedRows.length === users.length}
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
              {users.map((user) => (
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
                  <td className="px-4 py-4 whitespace-nowrap text-sm">{user.balance}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-white/60">{user.joined}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
        
        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-white/10">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/60">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                <span className="font-medium">97</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button variant="outline" size="icon" className="rounded-l-md">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="bg-white/10">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline" size="icon" className="rounded-r-md">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sample data
const users = [
  {
    id: "USR-1001",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "Active",
    balance: "$2,540.00",
    joined: "Apr 5, 2025"
  },
  {
    id: "USR-1002",
    name: "Alice Smith",
    email: "alice.smith@example.com",
    status: "Active",
    balance: "$1,890.75",
    joined: "Apr 3, 2025"
  },
  {
    id: "USR-1003",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    status: "Inactive",
    balance: "$0.00",
    joined: "Mar 28, 2025"
  },
  {
    id: "USR-1004",
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    status: "Active",
    balance: "$4,215.50",
    joined: "Mar 25, 2025"
  },
  {
    id: "USR-1005",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    status: "Pending",
    balance: "$500.00",
    joined: "Mar 23, 2025"
  },
  {
    id: "USR-1006",
    name: "Sarah Davis",
    email: "sarah.davis@example.com",
    status: "Active",
    balance: "$3,780.25",
    joined: "Mar 20, 2025"
  },
  {
    id: "USR-1007",
    name: "Thomas Miller",
    email: "thomas.miller@example.com",
    status: "Active",
    balance: "$950.60",
    joined: "Mar 18, 2025"
  }
];

export default AdminUsers;

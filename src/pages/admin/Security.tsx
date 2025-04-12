import { useState, useEffect } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Badge, 
  Calendar as CalendarIcon,
  Check,
  Download,
  Filter,
  Key,
  Lock,
  RefreshCw,
  Search,
  Shield,
  UserCog,
  AlertCircle,
  EyeOff,
  EyeIcon,
  ServerCrash,
  Bug,
  Settings,
  Save,
  Users
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface SecurityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'warning' | 'failure';
  details?: string;
}

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'authentication' | 'data' | 'access' | 'monitoring';
  configurable: boolean;
  configOptions?: Record<string, any>;
}

interface AdminAccount {
  username: string;
  email: string;
  password: string;
  role: string;
  lastLogin?: string;
  twoFactorEnabled: boolean;
}

// Generate mock security logs
const generateMockLogs = (): SecurityLog[] => {
  const logs: SecurityLog[] = [];
  
  const users = [
    "admin", 
    "demo_user", 
    "system", 
    "unknown"
  ];
  
  const actions = [
    "Login attempt",
    "Password change",
    "Admin access",
    "Account lockout",
    "Suspicious activity detected",
    "Configuration change",
    "API key generated",
    "Database access",
    "User profile update",
    "File upload",
    "Bulk data export",
    "Security setting changed"
  ];
  
  const ips = [
    "192.168.1.1",
    "10.0.0.5",
    "172.16.254.1",
    "127.0.0.1",
    "45.123.45.67",
    "98.76.54.32"
  ];
  
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 11; SM-G996B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
  ];
  
  const statuses: SecurityLog['status'][] = ['success', 'warning', 'failure'];
  
  for (let i = 0; i < 100; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    
    let details: string | undefined;
    
    if (action === "Login attempt") {
      details = status === 'success' 
        ? `Successful login from ${ips[Math.floor(Math.random() * ips.length)]}`
        : `Failed login attempt: incorrect password (attempt ${Math.floor(Math.random() * 5) + 1})`;
    } else if (action === "Configuration change") {
      details = `Changed security setting: ${
        ["Password complexity", "Two-factor authentication", "Session timeout", "IP whitelisting"][Math.floor(Math.random() * 4)]
      }`;
    }
    
    logs.push({
      id: `LOG-${10000 + i}`,
      timestamp: date.toISOString(),
      user,
      action,
      ipAddress: ips[Math.floor(Math.random() * ips.length)],
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      status,
      details
    });
  }
  
  // Sort by timestamp, newest first
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return logs;
};

// Define security settings
const defaultSecuritySettings: SecuritySetting[] = [
  {
    id: "auth-1",
    name: "Two-Factor Authentication",
    description: "Require two-factor authentication for admin users",
    enabled: true,
    category: "authentication",
    configurable: true,
    configOptions: {
      requiredFor: "admins", // "all", "admins", "none"
      method: "app" // "app", "sms", "email"
    }
  },
  {
    id: "auth-2",
    name: "Password Complexity",
    description: "Enforce strong password requirements",
    enabled: true,
    category: "authentication",
    configurable: true,
    configOptions: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecial: true
    }
  },
  {
    id: "auth-3",
    name: "Account Lockout",
    description: "Lock accounts after multiple failed login attempts",
    enabled: true,
    category: "authentication",
    configurable: true,
    configOptions: {
      maxAttempts: 5,
      lockoutDuration: 30 // minutes
    }
  },
  {
    id: "auth-4",
    name: "Session Timeout",
    description: "Automatically log out inactive users",
    enabled: true,
    category: "authentication",
    configurable: true,
    configOptions: {
      timeoutMinutes: 30
    }
  },
  {
    id: "data-1",
    name: "Data Encryption",
    description: "Encrypt sensitive data in the database",
    enabled: true,
    category: "data",
    configurable: false
  },
  {
    id: "data-2",
    name: "Data Access Logging",
    description: "Log all access to sensitive data",
    enabled: true,
    category: "data",
    configurable: false
  },
  {
    id: "access-1",
    name: "IP Whitelisting",
    description: "Restrict admin access to specific IP addresses",
    enabled: false,
    category: "access",
    configurable: true,
    configOptions: {
      whitelist: ["127.0.0.1"]
    }
  },
  {
    id: "access-2",
    name: "Role-Based Access Control",
    description: "Restrict access based on user roles",
    enabled: true,
    category: "access",
    configurable: false
  },
  {
    id: "monitoring-1",
    name: "Suspicious Activity Detection",
    description: "Detect and alert on suspicious user activity",
    enabled: true,
    category: "monitoring",
    configurable: true,
    configOptions: {
      sensitivity: "medium" // "low", "medium", "high"
    }
  },
  {
    id: "monitoring-2",
    name: "Real-Time Security Alerts",
    description: "Send real-time alerts for security events",
    enabled: true,
    category: "monitoring",
    configurable: true,
    configOptions: {
      methods: ["email", "in-app"], // "email", "in-app", "sms"
      urgency: "high" // "low", "medium", "high"
    }
  }
];

// Default admin accounts
const defaultAdminAccounts: AdminAccount[] = [
  {
    username: "admin",
    email: "admin@thunderwincasino.com",
    password: "admin",
    role: "Super Admin",
    lastLogin: new Date().toISOString(),
    twoFactorEnabled: false
  },
  {
    username: "manager",
    email: "manager@thunderwincasino.com",
    password: "manager123",
    role: "Manager",
    lastLogin: new Date(Date.now() - 86400000 * 3).toISOString(),
    twoFactorEnabled: true
  }
];

const SecurityPage = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SecurityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SecuritySetting[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [newAdminAccount, setNewAdminAccount] = useState<Omit<AdminAccount, 'lastLogin'>>({
    username: "",
    email: "",
    password: "",
    role: "Admin",
    twoFactorEnabled: false
  });
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  useEffect(() => {
    // Load security logs
    const loadData = () => {
      let storedLogs = localStorage.getItem("securityLogs");
      let storedSettings = localStorage.getItem("securitySettings");
      let storedAdminAccounts = localStorage.getItem("adminAccounts");
      
      if (!storedLogs) {
        const mockLogs = generateMockLogs();
        localStorage.setItem("securityLogs", JSON.stringify(mockLogs));
        storedLogs = JSON.stringify(mockLogs);
      }
      
      if (!storedSettings) {
        localStorage.setItem("securitySettings", JSON.stringify(defaultSecuritySettings));
        storedSettings = JSON.stringify(defaultSecuritySettings);
      }
      
      if (!storedAdminAccounts) {
        localStorage.setItem("adminAccounts", JSON.stringify(defaultAdminAccounts));
        storedAdminAccounts = JSON.stringify(defaultAdminAccounts);
      }
      
      setLogs(JSON.parse(storedLogs));
      setFilteredLogs(JSON.parse(storedLogs));
      setSettings(JSON.parse(storedSettings));
      setAdminAccounts(JSON.parse(storedAdminAccounts));
      setIsLoading(false);
    };
    
    // Simulate API delay
    setTimeout(loadData, 800);
  }, []);
  
  useEffect(() => {
    // Apply filters when search query or status filter changes
    const filtered = logs.filter(log => {
      const matchesSearch = 
        searchQuery === "" || 
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || log.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredLogs(filtered);
  }, [logs, searchQuery, statusFilter]);
  
  const refreshLogs = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const newLogs = generateMockLogs();
      localStorage.setItem("securityLogs", JSON.stringify(newLogs));
      setLogs(newLogs);
      setFilteredLogs(newLogs);
      setIsLoading(false);
      
      toast({
        title: "Logs Refreshed",
        description: "Security logs have been refreshed with new data."
      });
    }, 800);
  };
  
  const updateSetting = (id: string, enabled: boolean) => {
    const updatedSettings = settings.map(setting => 
      setting.id === id ? { ...setting, enabled } : setting
    );
    
    localStorage.setItem("securitySettings", JSON.stringify(updatedSettings));
    setSettings(updatedSettings);
    
    // Create a new security log for this change
    const newLog: SecurityLog = {
      id: `LOG-${10000 + logs.length + 1}`,
      timestamp: new Date().toISOString(),
      user: "admin",
      action: "Security setting changed",
      ipAddress: "127.0.0.1",
      userAgent: navigator.userAgent,
      status: "success",
      details: `Changed setting: ${settings.find(s => s.id === id)?.name} to ${enabled ? 'enabled' : 'disabled'}`
    };
    
    const updatedLogs = [newLog, ...logs];
    localStorage.setItem("securityLogs", JSON.stringify(updatedLogs));
    setLogs(updatedLogs);
    setFilteredLogs(updatedLogs);
    
    toast({
      title: "Setting Updated",
      description: `${settings.find(s => s.id === id)?.name} is now ${enabled ? 'enabled' : 'disabled'}.`
    });
  };

  const handleAdminAccountSubmit = () => {
    if (editingAccount) {
      // Update existing account
      const updatedAccounts = adminAccounts.map(account => 
        account.username === editingAccount.username ? {
          ...account,
          email: newAdminAccount.email,
          password: newAdminAccount.password,
          role: newAdminAccount.role,
          twoFactorEnabled: newAdminAccount.twoFactorEnabled
        } : account
      );
      
      setAdminAccounts(updatedAccounts);
      localStorage.setItem("adminAccounts", JSON.stringify(updatedAccounts));
      
      toast({
        title: "Account Updated",
        description: `The account for ${editingAccount.username} has been updated.`
      });
    } else {
      // Create new account
      if (!newAdminAccount.username || !newAdminAccount.email || !newAdminAccount.password) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }
      
      // Check if username already exists
      if (adminAccounts.some(account => account.username === newAdminAccount.username)) {
        toast({
          title: "Error",
          description: "Username already exists.",
          variant: "destructive"
        });
        return;
      }
      
      const newAccount: AdminAccount = {
        ...newAdminAccount,
        lastLogin: undefined
      };
      
      const updatedAccounts = [...adminAccounts, newAccount];
      setAdminAccounts(updatedAccounts);
      localStorage.setItem("adminAccounts", JSON.stringify(updatedAccounts));
      
      toast({
        title: "Account Created",
        description: `New admin account for ${newAdminAccount.username} has been created.`
      });
    }
    
    // Reset form and close dialog
    setNewAdminAccount({
      username: "",
      email: "",
      password: "",
      role: "Admin",
      twoFactorEnabled: false
    });
    setEditingAccount(null);
    setIsAccountDialogOpen(false);
  };

  const handleEditAccount = (account: AdminAccount) => {
    setEditingAccount(account);
    setNewAdminAccount({
      username: account.username,
      email: account.email,
      password: account.password,
      role: account.role,
      twoFactorEnabled: account.twoFactorEnabled
    });
    setIsAccountDialogOpen(true);
  };

  const handleDeleteAccount = (username: string) => {
    // Prevent deleting the last admin account
    if (adminAccounts.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot delete the last admin account.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedAccounts = adminAccounts.filter(account => account.username !== username);
    setAdminAccounts(updatedAccounts);
    localStorage.setItem("adminAccounts", JSON.stringify(updatedAccounts));
    
    toast({
      title: "Account Deleted",
      description: `Admin account for ${username} has been deleted.`
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };
  
  const getStatusBadge = (status: SecurityLog['status']) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">Success</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case "failure":
        return <Badge className="bg-red-500">Failure</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getCategoryIcon = (category: SecuritySetting['category']) => {
    switch (category) {
      case "authentication":
        return <Key className="h-5 w-5 text-blue-400" />;
      case "data":
        return <EyeOff className="h-5 w-5 text-purple-400" />;
      case "access":
        return <Lock className="h-5 w-5 text-green-400" />;
      case "monitoring":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            onClick={refreshLogs}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Logs
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Security Status</p>
                <p className="text-2xl font-semibold">Secure</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Login Attempts</p>
                <p className="text-2xl font-semibold">243</p>
              </div>
              <UserCog className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Failed Logins</p>
                <p className="text-2xl font-semibold">18</p>
              </div>
              <ServerCrash className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Security Threats</p>
                <p className="text-2xl font-semibold">3</p>
              </div>
              <Bug className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="admins">Admin Accounts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs by user, action, IP..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="thunder-card overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-casino-thunder-green"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.slice(0, 100).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.ipAddress}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.details || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {settings.reduce((acc, setting) => {
              if (!acc[setting.category]) {
                acc[setting.category] = [];
              }
              acc[setting.category].push(setting);
              return acc;
            }, {} as Record<string, SecuritySetting[]>)
              // Convert the object to an array of [category, settings] pairs
              .entries
              ? Object.entries(settings.reduce((acc, setting) => {
                  if (!acc[setting.category]) {
                    acc[setting.category] = [];
                  }
                  acc[setting.category].push(setting);
                  return acc;
                }, {} as Record<string, SecuritySetting[]>))
                .map(([category, categorySettings]) => (
                  <Card key={category} className="bg-white/5">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {getCategoryIcon(category as SecuritySetting['category'])}
                        <span className="ml-2 capitalize">{category} Security</span>
                      </CardTitle>
                      <CardDescription>
                        Manage {category} security settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {categorySettings.map((setting) => (
                        <div key={setting.id} className="flex items-start space-x-4 pb-4 border-b border-gray-800">
                          <div className="flex items-center h-5 pt-1">
                            <Checkbox
                              id={setting.id}
                              checked={setting.enabled}
                              onCheckedChange={(checked) => {
                                updateSetting(setting.id, checked === true);
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <label htmlFor={setting.id} className="text-sm font-medium cursor-pointer">
                              {setting.name}
                            </label>
                            <p className="text-sm text-gray-400">
                              {setting.description}
                            </p>
                            {setting.configurable && setting.enabled && (
                              <Button variant="link" size="sm" className="px-0 py-0 h-auto text-xs text-blue-400">
                                Configure
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))
              : null}
          </div>
        </TabsContent>

        <TabsContent value="admins">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Admin Account Management</h2>
            <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingAccount(null);
                  setNewAdminAccount({
                    username: "",
                    email: "",
                    password: "",
                    role: "Admin",
                    twoFactorEnabled: false
                  });
                }}>
                  <Users className="mr-2 h-4 w-4" />
                  Add Admin Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAccount ? "Edit Admin Account" : "Add New Admin Account"}</DialogTitle>
                  <DialogDescription>
                    {editingAccount 
                      ? "Update the details for this admin account." 
                      : "Create a new admin account with the appropriate permissions."}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={newAdminAccount.username} 
                      onChange={(e) => setNewAdminAccount({...newAdminAccount, username: e.target.value})}
                      disabled={!!editingAccount}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={newAdminAccount.email} 
                      onChange={(e) => setNewAdminAccount({...newAdminAccount, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={newAdminAccount.password} 
                      onChange={(e) => setNewAdminAccount({...newAdminAccount, password: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={newAdminAccount.role}
                      onValueChange={(value) => setNewAdminAccount({...newAdminAccount, role: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="twoFactorEnabled"
                      checked={newAdminAccount.twoFactorEnabled}
                      onCheckedChange={(checked) => 
                        setNewAdminAccount({
                          ...newAdminAccount, 
                          twoFactorEnabled: checked === true
                        })
                      }
                    />
                    <Label htmlFor="twoFactorEnabled">Enable Two-Factor Authentication</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdminAccountSubmit}>
                    <Save className="mr-2 h-4 w-4" />
                    {editingAccount ? "Update Account" : "Create Account"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>2FA</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminAccounts.map((account) => (
                    <TableRow key={account.username}>
                      <TableCell className="font-medium">{account.username}</TableCell>
                      <TableCell>{account.email}</TableCell>
                      <TableCell>
                        <Badge className={
                          account.role === "Super Admin" 
                            ? "bg-red-500/10 text-red-500 border-red-500/20" 
                            : account.role === "Admin" 
                              ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                              : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        }>
                          {account.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{account.lastLogin ? formatDate(account.lastLogin) : "Never"}</TableCell>
                      <TableCell>
                        {account.twoFactorEnabled 
                          ? <Check className="h-5 w-5 text-green-500" /> 
                          : <AlertCircle className="h-5 w-5 text-yellow-500" />
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditAccount(account)}
                          className="mr-1"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteAccount(account.username)}
                          disabled={adminAccounts.length <= 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100/10"
                        >
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="bg-card/50 p-4 text-sm text-muted-foreground border-t border-white/10">
              <p>
                Admin accounts have full access to the administration panel. Use with caution.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Reports</CardTitle>
                <CardDescription>
                  Generate and view security reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select defaultValue="login-activity">
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="login-activity">Login Activity</SelectItem>
                      <SelectItem value="security-incidents">Security Incidents</SelectItem>
                      <SelectItem value="user-activity">User Activity</SelectItem>
                      <SelectItem value="admin-actions">Administrative Actions</SelectItem>
                      <SelectItem value="system-access">System Access</SelectItem>
                      <SelectItem value="kyc-verification">KYC Verification Status</SelectItem>
                      <SelectItem value="transaction-security">Transaction Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(new Date(Date.now() - 86400000 * 30), "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(new Date(), "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Report Format</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                      <SelectItem value="html">HTML Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Include Details</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-user" defaultChecked />
                      <Label htmlFor="include-user" className="text-sm">User Information</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-ip" defaultChecked />
                      <Label htmlFor="include-ip" className="text-sm">IP Addresses</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-browser" defaultChecked />
                      <Label htmlFor="include-browser" className="text-sm">Browser Information</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-time" defaultChecked />
                      <Label htmlFor="include-time" className="text-sm">Detailed Timestamps</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-kyc" defaultChecked />
                      <Label htmlFor="include-kyc" className="text-sm">KYC Status</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-auth" defaultChecked />
                      <Label htmlFor="include-auth" className="text-sm">Authentication Method</Label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea placeholder="Add any notes or context for this report..." />
                </div>
                
                <div className="flex space-x-2">
                  <Button className="flex-1 bg-casino-thunder-green text-black hover:bg-casino-thunder-highlight">
                    Generate Report
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>
                  View and download recently generated reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-md">
                      <div>
                        <p className="font-medium text-sm">
                          {[
                            "Monthly Security Summary",
                            "Login Failures Report",
                            "Admin Activity Log",
                            "KYC Verification Report",
                            "User Access Report"
                          ][i]}
                        </p>
                        <p className="text-xs text-gray-400">
                          Generated on {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityPage;

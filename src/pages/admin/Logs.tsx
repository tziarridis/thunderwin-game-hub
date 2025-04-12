
import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Clock, 
  Search, 
  Shield, 
  Info, 
  FileText, 
  UserCheck, 
  Download,
  DollarSign,
  Settings,
  Maximize2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  category: "security" | "user" | "system" | "payment" | "game" | "admin";
  message: string;
  user?: string;
  ipAddress?: string;
  details?: string;
}

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  useEffect(() => {
    // In a real application, this would fetch logs from an API
    const generateMockLogs = () => {
      const categories = ["security", "user", "system", "payment", "game", "admin"];
      const levels = ["info", "warning", "error", "debug"];
      const messages = [
        "User logged in successfully",
        "Failed login attempt",
        "Account created",
        "Password reset requested",
        "Payment processed",
        "Game session started",
        "System backup completed",
        "Security alert: multiple failed login attempts",
        "User updated profile",
        "Admin changed system settings",
        "Game provider integration error",
        "Withdrawal request approved",
        "Database maintenance completed",
        "New game added to platform"
      ];
      
      const mockLogs: LogEntry[] = [];
      
      // Generate logs for the past 7 days
      for (let i = 0; i < 100; i++) {
        const daysAgo = Math.floor(Math.random() * 7);
        const hoursAgo = Math.floor(Math.random() * 24);
        const minutesAgo = Math.floor(Math.random() * 60);
        
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(date.getHours() - hoursAgo);
        date.setMinutes(date.getMinutes() - minutesAgo);
        
        const category = categories[Math.floor(Math.random() * categories.length)] as LogEntry["category"];
        const level = levels[Math.floor(Math.random() * levels.length)] as LogEntry["level"];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        mockLogs.push({
          id: `LOG-${10000 + i}`,
          timestamp: date.toISOString(),
          level,
          category,
          message,
          user: Math.random() > 0.3 ? `user${Math.floor(Math.random() * 100)}` : undefined,
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          details: `Detailed information about this event: ${message}`
        });
      }
      
      // Sort by timestamp, newest first
      return mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };
    
    const mockLogs = generateMockLogs();
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);
  
  useEffect(() => {
    // Apply filters
    let result = [...logs];
    
    // Level filter
    if (levelFilter !== "all") {
      result = result.filter(log => log.level === levelFilter);
    }
    
    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter(log => log.category === categoryFilter);
    }
    
    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const pastDate = new Date();
      
      switch (dateFilter) {
        case "today":
          pastDate.setDate(now.getDate());
          pastDate.setHours(0, 0, 0, 0);
          break;
        case "yesterday":
          pastDate.setDate(now.getDate() - 1);
          pastDate.setHours(0, 0, 0, 0);
          const yesterdayEnd = new Date(pastDate);
          yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);
          result = result.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= pastDate && logDate < yesterdayEnd;
          });
          break;
        case "week":
          pastDate.setDate(now.getDate() - 7);
          break;
        case "month":
          pastDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      if (dateFilter !== "yesterday") {
        result = result.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= pastDate;
        });
      }
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log => 
        log.message.toLowerCase().includes(query) || 
        log.id.toLowerCase().includes(query) || 
        (log.user && log.user.toLowerCase().includes(query)) ||
        (log.ipAddress && log.ipAddress.includes(query))
      );
    }
    
    setFilteredLogs(result);
  }, [logs, levelFilter, categoryFilter, dateFilter, searchQuery]);
  
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "info": return "bg-blue-500/20 text-blue-300";
      case "warning": return "bg-yellow-500/20 text-yellow-300";
      case "error": return "bg-red-500/20 text-red-300";
      case "debug": return "bg-gray-500/20 text-gray-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "security": return <Shield size={16} />;
      case "user": return <UserCheck size={16} />;
      case "system": return <Settings size={16} />;
      case "payment": return <DollarSign size={16} />;
      case "game": return <Maximize2 size={16} />;
      case "admin": return <FileText size={16} />;
      default: return <Info size={16} />;
    }
  };
  
  const exportLogs = () => {
    // Create a CSV string from the filtered logs
    const headers = "ID,Timestamp,Level,Category,Message,User,IP Address\n";
    const rows = filteredLogs.map(log => 
      `"${log.id}","${log.timestamp}","${log.level}","${log.category}","${log.message}","${log.user || ''}","${log.ipAddress || ''}"`
    ).join("\n");
    
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `thunderwin-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const viewLogDetails = (log: LogEntry) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-white/60">System-wide activity and security logs</p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center"
          onClick={exportLogs}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>
      
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search logs..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select
          value={levelFilter}
          onValueChange={setLevelFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={categoryFilter}
          onValueChange={setCategoryFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="game">Game</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={dateFilter}
          onValueChange={setDateFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Log count */}
      <div className="mb-4 text-sm text-white/60">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>
      
      {/* Logs Table */}
      <div className="bg-casino-thunder-dark rounded-lg border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-black/20 border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs uppercase font-medium text-white/60">ID</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-medium text-white/60">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-medium text-white/60">Level</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-medium text-white/60">Category</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-medium text-white/60">Message</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-medium text-white/60">User</th>
                <th className="px-4 py-3 text-left text-xs uppercase font-medium text-white/60">IP Address</th>
                <th className="px-4 py-3 text-right text-xs uppercase font-medium text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr 
                  key={log.id} 
                  className={`border-b border-white/5 hover:bg-white/5 ${index % 2 ? 'bg-black/10' : ''}`}
                >
                  <td className="px-4 py-3 text-sm text-white/80">{log.id}</td>
                  <td className="px-4 py-3 text-sm text-white/80">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1 text-white/40" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getLevelBadgeColor(log.level)}`}>
                      {log.level === "error" && <AlertTriangle size={14} className="mr-1" />}
                      {log.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/80">
                    <div className="flex items-center">
                      {getCategoryIcon(log.category)}
                      <span className="ml-1">{log.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/80">
                    {log.message.length > 50 ? `${log.message.substring(0, 50)}...` : log.message}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/80">{log.user || '-'}</td>
                  <td className="px-4 py-3 text-sm text-white/80">{log.ipAddress}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => viewLogDetails(log)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Log Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-casino-thunder-dark text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center">
              <FileText className="mr-2 text-casino-thunder-green" />
              Log Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this log entry
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/60">ID</p>
                  <p className="font-medium">{selectedLog.id}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Timestamp</p>
                  <p className="font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Level</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getLevelBadgeColor(selectedLog.level)}`}>
                    {selectedLog.level}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-white/60">Category</p>
                  <div className="flex items-center font-medium">
                    {getCategoryIcon(selectedLog.category)}
                    <span className="ml-1">{selectedLog.category}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/60">User</p>
                  <p className="font-medium">{selectedLog.user || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">IP Address</p>
                  <p className="font-medium">{selectedLog.ipAddress}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-white/60">Message</p>
                <p className="font-medium">{selectedLog.message}</p>
              </div>
              
              <div className="bg-black/20 p-4 rounded border border-white/10">
                <p className="text-sm text-white/60">Additional Details</p>
                <p className="whitespace-pre-wrap">{selectedLog.details}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Logs;

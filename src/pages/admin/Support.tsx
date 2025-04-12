
import { useState, useEffect } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  MessageSquare, 
  UserCog, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  MessageSquareText, 
  Send, 
  Plus, 
  RefreshCw,
  CheckCircle, 
  XCircle,
  Settings
} from "lucide-react";
import { SupportTicket, SupportMessage, AutoResponse } from "@/types/support";
import { toast } from "@/components/ui/use-toast";

// Mock data for tickets
const generateMockTickets = (): SupportTicket[] => {
  const mockTickets: SupportTicket[] = [];
  
  const subjects = [
    "Cannot access my account",
    "Deposit not showing in balance",
    "Game froze during play",
    "Withdrawal pending for too long",
    "Bonus not applied",
    "Cannot verify my identity",
    "Password reset not working",
    "Game not loading properly",
    "Question about VIP program",
    "Promotional offer issues"
  ];
  
  const userIds = ["user1", "user2", "user3", "user4", "user5"];
  const userNames = ["John Doe", "Jane Smith", "Alex Johnson", "Maria Garcia", "Sam Wilson"];
  const statuses: SupportTicket['status'][] = ["new", "in-progress", "resolved", "closed"];
  const priorities: SupportTicket['priority'][] = ["low", "medium", "high", "urgent"];
  const categories: SupportTicket['category'][] = ["account", "payment", "game", "technical", "other"];
  
  for (let i = 0; i < 20; i++) {
    const ticketId = `TICKET-${1000 + i}`;
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 14));
    
    const userIndex = Math.floor(Math.random() * userIds.length);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const messages: SupportMessage[] = [];
    const messageCount = Math.floor(Math.random() * 5) + 1;
    
    for (let j = 0; j < messageCount; j++) {
      const isUserMessage = j % 2 === 0;
      const messageDate = new Date(randomDate);
      messageDate.setHours(messageDate.getHours() + j);
      
      messages.push({
        id: `MSG-${ticketId}-${j}`,
        ticketId,
        senderId: isUserMessage ? userIds[userIndex] : "admin1",
        senderName: isUserMessage ? userNames[userIndex] : "Support Agent",
        senderType: isUserMessage ? "user" : "admin",
        message: isUserMessage 
          ? `Hello, I have an issue with ${subjects[Math.floor(Math.random() * subjects.length)].toLowerCase()}. Can you help me?`
          : "Thank you for contacting support. We're looking into your issue and will get back to you as soon as possible.",
        createdAt: messageDate.toISOString(),
        isRead: true
      });
    }
    
    mockTickets.push({
      id: ticketId,
      userId: userIds[userIndex],
      userName: userNames[userIndex],
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      status,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      createdAt: randomDate.toISOString(),
      updatedAt: new Date(randomDate.getTime() + messageCount * 3600000).toISOString(),
      messages,
      assignedTo: status !== "new" ? "admin1" : undefined,
      category: categories[Math.floor(Math.random() * categories.length)]
    });
  }
  
  return mockTickets;
};

// Mock data for auto-responses
const mockAutoResponses: AutoResponse[] = [
  {
    id: "ar1",
    keyword: ["deposit", "payment", "money", "balance"],
    response: "Thank you for contacting support about your deposit. Please provide your transaction ID and we'll look into this right away.",
    category: "payment"
  },
  {
    id: "ar2",
    keyword: ["withdraw", "withdrawal", "cashout", "payout"],
    response: "We've received your withdrawal inquiry. For security purposes, please confirm the last 4 digits of your payment method and we'll check the status.",
    category: "payment"
  },
  {
    id: "ar3",
    keyword: ["game", "slot", "crash", "freeze", "stuck"],
    response: "We're sorry to hear you're experiencing issues with a game. Please provide the game name, time of the incident, and any error messages you received.",
    category: "game"
  },
  {
    id: "ar4",
    keyword: ["bonus", "promotion", "free", "offer", "code"],
    response: "Thank you for your inquiry about bonuses. Please provide the specific promotion you're referring to and we'll check your eligibility.",
    category: "account"
  },
  {
    id: "ar5",
    keyword: ["login", "password", "access", "account", "verify"],
    response: "We understand you're having trouble accessing your account. For security, please verify your email address and we'll assist you further.",
    category: "account"
  }
];

const SupportPage = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [autoResponses, setAutoResponses] = useState<AutoResponse[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [newResponse, setNewResponse] = useState<AutoResponse>({
    id: "",
    keyword: [],
    response: "",
    category: "account"
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [newTicketsCount, setNewTicketsCount] = useState(0);
  
  useEffect(() => {
    // Load tickets from localStorage or generate if none exist
    const loadData = () => {
      const storedTickets = localStorage.getItem("supportTickets");
      
      if (storedTickets) {
        const parsedTickets = JSON.parse(storedTickets);
        setTickets(parsedTickets);
        
        // Count new tickets
        const newCount = parsedTickets.filter((ticket: SupportTicket) => ticket.status === "new").length;
        setNewTicketsCount(newCount);
      } else {
        const mockTickets = generateMockTickets();
        localStorage.setItem("supportTickets", JSON.stringify(mockTickets));
        setTickets(mockTickets);
        
        // Count new tickets
        const newCount = mockTickets.filter(ticket => ticket.status === "new").length;
        setNewTicketsCount(newCount);
      }
      
      // Load auto responses
      const storedResponses = localStorage.getItem("autoResponses");
      
      if (storedResponses) {
        setAutoResponses(JSON.parse(storedResponses));
      } else {
        localStorage.setItem("autoResponses", JSON.stringify(mockAutoResponses));
        setAutoResponses(mockAutoResponses);
      }
      
      setIsLoading(false);
    };
    
    // Simulated API call delay
    setTimeout(loadData, 800);
    
    // Set up polling to check for new tickets
    const ticketInterval = setInterval(() => {
      const storedTickets = localStorage.getItem("supportTickets");
      if (storedTickets) {
        const parsedTickets = JSON.parse(storedTickets);
        setTickets(parsedTickets);
        
        // Update new tickets count
        const newCount = parsedTickets.filter((ticket: SupportTicket) => ticket.status === "new").length;
        if (newCount > newTicketsCount) {
          toast({
            title: "New Support Ticket",
            description: "A new support ticket has been created",
          });
        }
        setNewTicketsCount(newCount);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(ticketInterval);
  }, [newTicketsCount]);
  
  const saveTickets = (updatedTickets: SupportTicket[]) => {
    localStorage.setItem("supportTickets", JSON.stringify(updatedTickets));
    setTickets(updatedTickets);
  };
  
  const saveAutoResponses = (updatedResponses: AutoResponse[]) => {
    localStorage.setItem("autoResponses", JSON.stringify(updatedResponses));
    setAutoResponses(updatedResponses);
  };
  
  const filteredTickets = tickets.filter(ticket => {
    // Apply search filter
    const matchesSearch = 
      searchQuery === "" || 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    
    // Apply priority filter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  const handleOpenTicket = (ticket: SupportTicket) => {
    setActiveTicket(ticket);
    
    // Mark all messages as read
    const updatedTickets = tickets.map(t => {
      if (t.id === ticket.id) {
        return {
          ...t,
          messages: t.messages.map(m => ({
            ...m,
            isRead: true
          }))
        };
      }
      return t;
    });
    
    saveTickets(updatedTickets);
  };
  
  const handleSendMessage = () => {
    if (!activeTicket || !newMessage.trim()) return;
    
    const message: SupportMessage = {
      id: `MSG-${activeTicket.id}-${activeTicket.messages.length + 1}`,
      ticketId: activeTicket.id,
      senderId: "admin1",
      senderName: "Support Agent",
      senderType: "admin",
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
      isRead: true
    };
    
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === activeTicket.id) {
        return {
          ...ticket,
          messages: [...ticket.messages, message],
          status: ticket.status === "new" ? "in-progress" : ticket.status,
          updatedAt: new Date().toISOString(),
          assignedTo: ticket.assignedTo || "admin1"
        };
      }
      return ticket;
    });
    
    saveTickets(updatedTickets);
    setActiveTicket({
      ...activeTicket,
      messages: [...activeTicket.messages, message],
      status: activeTicket.status === "new" ? "in-progress" : activeTicket.status,
      updatedAt: new Date().toISOString(),
      assignedTo: activeTicket.assignedTo || "admin1"
    });
    
    setNewMessage("");
    
    toast({
      title: "Message Sent",
      description: "Your response has been sent to the user."
    });
  };
  
  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status,
          updatedAt: new Date().toISOString()
        };
      }
      return ticket;
    });
    
    saveTickets(updatedTickets);
    
    if (activeTicket && activeTicket.id === ticketId) {
      setActiveTicket({
        ...activeTicket,
        status,
        updatedAt: new Date().toISOString()
      });
    }
    
    toast({
      title: "Ticket Updated",
      description: `Ticket status changed to ${status}.`
    });
  };
  
  const updateTicketPriority = (ticketId: string, priority: SupportTicket['priority']) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          priority,
          updatedAt: new Date().toISOString()
        };
      }
      return ticket;
    });
    
    saveTickets(updatedTickets);
    
    if (activeTicket && activeTicket.id === ticketId) {
      setActiveTicket({
        ...activeTicket,
        priority,
        updatedAt: new Date().toISOString()
      });
    }
    
    toast({
      title: "Ticket Updated",
      description: `Ticket priority changed to ${priority}.`
    });
  };
  
  const addAutoResponse = () => {
    if (!newResponse.response.trim() || newResponse.keyword.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide keywords and a response message.",
        variant: "destructive"
      });
      return;
    }
    
    const newId = `ar${autoResponses.length + 1}`;
    const updatedAutoResponses = [
      ...autoResponses,
      {
        ...newResponse,
        id: newId
      }
    ];
    
    saveAutoResponses(updatedAutoResponses);
    
    setNewResponse({
      id: "",
      keyword: [],
      response: "",
      category: "account"
    });
    
    toast({
      title: "Auto-Response Added",
      description: "New auto-response has been added successfully."
    });
  };
  
  const deleteAutoResponse = (id: string) => {
    const updatedAutoResponses = autoResponses.filter(response => response.id !== id);
    saveAutoResponses(updatedAutoResponses);
    
    toast({
      title: "Auto-Response Deleted",
      description: "The auto-response has been removed."
    });
  };
  
  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    
    setNewResponse({
      ...newResponse,
      keyword: [...newResponse.keyword, newKeyword.trim()]
    });
    
    setNewKeyword("");
  };
  
  const removeKeyword = (keyword: string) => {
    setNewResponse({
      ...newResponse,
      keyword: newResponse.keyword.filter(k => k !== keyword)
    });
  };
  
  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500">New</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      case "closed":
        return <Badge className="bg-gray-500">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="border-green-500 text-green-500">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="border-orange-500 text-orange-500">High</Badge>;
      case "urgent":
        return <Badge variant="outline" className="border-red-500 text-red-500">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  const getCategoryBadge = (category: SupportTicket['category']) => {
    switch (category) {
      case "account":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Account</Badge>;
      case "payment":
        return <Badge variant="outline" className="border-green-500 text-green-500">Payment</Badge>;
      case "game":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Game</Badge>;
      case "technical":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Technical</Badge>;
      case "other":
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Other</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getUnreadCount = () => {
    return tickets.reduce((count, ticket) => {
      const unreadMessages = ticket.messages.filter(m => !m.isRead && m.senderType === "user").length;
      return count + (unreadMessages > 0 ? 1 : 0);
    }, 0);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Support Management</h1>
        
        <Button 
          variant="outline" 
          onClick={() => {
            const mockTickets = generateMockTickets();
            localStorage.setItem("supportTickets", JSON.stringify(mockTickets));
            setTickets(mockTickets);
            toast({
              title: "Data Refreshed",
              description: "Support tickets have been refreshed with new data."
            });
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>
      
      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tickets" className="relative">
            Tickets
            {getUnreadCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getUnreadCount()}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="autoResponses">Auto-Responses</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets by ID, subject or user..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-casino-thunder-green"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 thunder-card overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white">Tickets ({filteredTickets.length})</h2>
                </div>
                
                <div className="overflow-y-auto h-[calc(100vh-350px)]">
                  {filteredTickets.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No tickets found matching your criteria</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-700">
                      {filteredTickets.map((ticket) => {
                        const unreadCount = ticket.messages.filter(m => !m.isRead && m.senderType === "user").length;
                        return (
                          <div
                            key={ticket.id}
                            className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                              activeTicket?.id === ticket.id ? "bg-white/10" : ""
                            }`}
                            onClick={() => handleOpenTicket(ticket)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center">
                                {getStatusBadge(ticket.status)}
                                <span className="ml-2 text-xs text-gray-400">{ticket.id}</span>
                              </div>
                              <div className="flex items-center">
                                {unreadCount > 0 && (
                                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2">
                                    {unreadCount}
                                  </span>
                                )}
                                {getPriorityBadge(ticket.priority)}
                              </div>
                            </div>
                            
                            <h3 className="font-medium text-white truncate">{ticket.subject}</h3>
                            
                            <div className="flex items-center text-xs text-gray-400 mt-2">
                              <UserCog className="h-3 w-3 mr-1" />
                              <span className="truncate">{ticket.userName}</span>
                              <span className="mx-2">•</span>
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatDate(ticket.updatedAt)}</span>
                            </div>
                            
                            <div className="mt-2 flex items-center">
                              {getCategoryBadge(ticket.category)}
                              <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:col-span-2 thunder-card overflow-hidden">
                {activeTicket ? (
                  <>
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                      <div>
                        <h2 className="text-lg font-semibold text-white">{activeTicket.subject}</h2>
                        <div className="flex items-center text-sm text-gray-400">
                          <span>Ticket {activeTicket.id}</span>
                          <span className="mx-2">•</span>
                          <span>{activeTicket.userName}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Select
                          value={activeTicket.priority}
                          onValueChange={(value) => updateTicketPriority(activeTicket.id, value as SupportTicket['priority'])}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={activeTicket.status}
                          onValueChange={(value) => updateTicketStatus(activeTicket.id, value as SupportTicket['status'])}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="overflow-y-auto h-[calc(100vh-500px)] p-4 space-y-4">
                      {activeTicket.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderType === "admin" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.senderType === "admin"
                                ? "bg-casino-thunder-green text-black"
                                : "bg-white/10 text-white"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-sm">
                                {message.senderName}
                              </span>
                              <span className="text-xs opacity-70">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{message.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-4 border-t border-gray-700">
                      <div className="flex items-start space-x-2">
                        <Textarea
                          placeholder="Type your response..."
                          className="flex-1"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button
                          className="bg-casino-thunder-green text-black hover:bg-casino-thunder-highlight"
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      </div>
                      
                      <div className="mt-3">
                        <div className="text-xs text-gray-400 mb-2">Quick Responses:</div>
                        <div className="flex flex-wrap gap-2">
                          {autoResponses.slice(0, 3).map((response) => (
                            <Button
                              key={response.id}
                              variant="outline"
                              size="sm"
                              onClick={() => setNewMessage(response.response)}
                            >
                              {response.response.substring(0, 30)}...
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
                    <MessageSquareText className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No Ticket Selected</h3>
                    <p className="text-gray-400 text-center max-w-md">
                      Select a ticket from the list to view its details and respond to the user.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="autoResponses">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 thunder-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Add Auto-Response</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Category
                  </label>
                  <Select
                    value={newResponse.category}
                    onValueChange={(value) => setNewResponse({
                      ...newResponse,
                      category: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="game">Game</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Keywords (users' messages containing these will trigger the response)
                  </label>
                  <div className="flex mb-2">
                    <Input
                      placeholder="Add keyword"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      className="ml-2"
                      onClick={addKeyword}
                      disabled={!newKeyword.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newResponse.keyword.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="flex items-center"
                      >
                        {keyword}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => removeKeyword(keyword)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Response Message
                  </label>
                  <Textarea
                    placeholder="Enter auto-response message"
                    rows={5}
                    value={newResponse.response}
                    onChange={(e) => setNewResponse({
                      ...newResponse,
                      response: e.target.value
                    })}
                  />
                </div>
                
                <Button
                  className="w-full bg-casino-thunder-green text-black hover:bg-casino-thunder-highlight"
                  onClick={addAutoResponse}
                  disabled={!newResponse.response.trim() || newResponse.keyword.length === 0}
                >
                  Add Auto-Response
                </Button>
              </div>
            </div>
            
            <div className="lg:col-span-2 thunder-card">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">
                  Auto-Responses ({autoResponses.length})
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Keywords</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {autoResponses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell>{getCategoryBadge(response.category as SupportTicket['category'])}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {response.keyword.map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {response.response.substring(0, 100)}
                          {response.response.length > 100 ? "..." : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteAutoResponse(response.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="thunder-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Support Settings</h2>
            <p className="text-gray-400">Configure your support system settings here.</p>
            
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-md font-medium text-white mb-3">Notification Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Email notifications for new tickets</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Automated ticket assignments</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-white mb-3">Working Hours</h3>
                <p className="text-sm text-gray-400 mb-2">
                  Set your support team's working hours. Auto-responses will be used outside these hours.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Start Time
                    </label>
                    <Input type="time" value="09:00" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      End Time
                    </label>
                    <Input type="time" value="17:00" />
                  </div>
                </div>
                <div className="mt-4">
                  <Button className="bg-casino-thunder-green text-black hover:bg-casino-thunder-highlight">
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportPage;

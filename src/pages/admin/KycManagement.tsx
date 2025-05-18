
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Check, 
  X, 
  Eye, 
  Search, 
  Clock, 
} from "lucide-react";
import { KycRequest, KycStatusType } from "@/types"; // Changed KycStatus to KycStatusType

export const KycManagement = () => {
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [filter, setFilter] = useState<string>("all"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("pending"); 
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  useEffect(() => {
    const mockRequests: KycRequest[] = [
      {
        id: "1",
        userId: "user-1",
        user: { username: "John Doe", email: "john@example.com", id: "user-1" },
        documentType: "passport",
        documentNumber: "P12345678",
        submittedAt: "2023-06-15T14:30:00Z",
        status: 'pending',
        documentImage: "https://example.com/documents/passport1.jpg",
        documentUrls: ["https://example.com/documents/passport1.jpg"],
        rejectionReason: ""
      },
      {
        id: "2",
        userId: "user-2",
        user: { username: "Jane Smith", email: "jane@example.com", id: "user-2" },
        documentType: "national_id",
        documentNumber: "ID98765432",
        submittedAt: "2023-06-10T09:45:00Z",
        status: 'verified',
        verificationDate: "2023-06-12T11:20:00Z",
        documentImage: "https://example.com/documents/id1.jpg",
        documentUrls: ["https://example.com/documents/id1.jpg", "https://example.com/documents/id1_back.jpg"],
        rejectionReason: ""
      },
      {
        id: "3",
        userId: "user-3",
        user: { username: "Mike Johnson", email: "mike@example.com", id: "user-3" },
        documentType: "driving_license",
        documentNumber: "DL12345678",
        submittedAt: "2023-06-08T16:15:00Z",
        status: 'rejected',
        documentImage: "https://example.com/documents/license1.jpg",
        documentUrls: ["https://example.com/documents/license1.jpg"],
        rejectionReason: "Document expired. Please submit a valid document."
      }
    ];
    
    setRequests(mockRequests);
  }, []);
  
  const handleApprove = (kycRequest: KycRequest) => {
    const updatedRequests = requests.map((req) => {
      if (req.id === kycRequest.id) {
        return {
          ...req,
          status: 'verified' as KycStatusType,
          verificationDate: new Date().toISOString()
        };
      }
      return req;
    });
    setRequests(updatedRequests);
  };
  
  const handleReject = () => {
    if (!selectedRequest || !rejectionReason) return;
    
    const updatedRequests = requests.map((req) => {
      if (req.id === selectedRequest.id) {
        return {
          ...req,
          status: 'rejected' as KycStatusType,
          rejectionReason: rejectionReason
        };
      }
      return req;
    });
    
    setRequests(updatedRequests);
    setIsDialogOpen(false);
    setRejectionReason("");
    setSelectedRequest(null);
  };
  
  const openRejectDialog = (kycRequest: KycRequest) => {
    setSelectedRequest(kycRequest);
    setIsDialogOpen(true);
  };
  
  const viewDetails = (kycRequest: KycRequest) => {
    alert(`Viewing details for ${kycRequest.user?.username || kycRequest.userId}`);
  };
  
  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filter === "all" || req.status === filter;
    const matchesSearch = 
      searchQuery.trim() === "" || 
      (req.user?.username && req.user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.user?.email && req.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      req.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">KYC Management</h1>
      
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, emails..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value as KycStatusType | "all")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="resubmit_required">Resubmit Required</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as KycStatusType | "all")}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="verified" className="flex items-center">
            <Check className="mr-2 h-4 w-4" />
            Verified
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center">
            <X className="mr-2 h-4 w-4" />
            Rejected
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        {["pending", "verified", "rejected", "all"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>
                  {tabValue === "pending" && "Pending Verifications"}
                  {tabValue === "verified" && "Verified Users"}
                  {tabValue === "rejected" && "Rejected Applications"}
                  {tabValue === "all" && "All KYC Requests"}
                </CardTitle>
                <CardDescription>
                  {tabValue === "pending" && "Users waiting for verification approval"}
                  {tabValue === "verified" && "Users who have passed KYC verification"}
                  {tabValue === "rejected" && "Users whose verification was rejected"}
                  {tabValue === "all" && "All user verification requests"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests
                      .filter((req) => tabValue === "all" || req.status === tabValue) 
                      .map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{request.user?.username || request.userId}</div>
                              <div className="text-muted-foreground text-sm">{request.user?.email || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell>{request.documentType.replace("_", " ")}</TableCell>
                          <TableCell>
                            {new Date(request.submittedAt || Date.now()).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </span>
                            )}
                            {request.status === 'verified' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <Check className="w-3 h-3 mr-1" />
                                Verified
                              </span>
                            )}
                            {request.status === 'rejected' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                <X className="w-3 h-3 mr-1" />
                                Rejected
                              </span>
                            )}
                             {request.status === 'submitted' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Submitted
                              </span>
                            )}
                             {request.status === 'resubmit_required' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                Resubmit Required
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewDetails(request)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {request.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300"
                                    onClick={() => handleApprove(request)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300"
                                    onClick={() => openRejectDialog(request)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter rejection reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KycManagement;

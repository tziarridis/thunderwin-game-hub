
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, Check, X, AlertTriangle, Clock, User as UserIcon, Shield, FileText } from "lucide-react";
import { KycRequest } from "@/types";
import { Separator } from "@/components/ui/separator";

const KycManagement = () => {
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<KycRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Load KYC requests from localStorage
    const storedKycRequests = JSON.parse(localStorage.getItem("kycRequests") || "[]");
    setKycRequests(storedKycRequests);
  }, []);
  
  useEffect(() => {
    // Filter KYC requests based on current tab and search query
    let filtered = [...kycRequests];
    
    // Filter by tab
    if (currentTab !== "all") {
      filtered = filtered.filter(request => 
        currentTab === "pending" 
          ? request.status === "pending" 
          : currentTab === "approved"
            ? request.status === "approved"
            : request.status === "rejected"
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request => 
        (request.userName && request.userName.toLowerCase().includes(query)) ||
        (request.email && request.email.toLowerCase().includes(query))
      );
    }
    
    setFilteredRequests(filtered);
  }, [kycRequests, currentTab, searchQuery]);
  
  const viewRequest = (request: KycRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };
  
  const openRejectDialog = (request: KycRequest) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };
  
  const approveRequest = (request: KycRequest) => {
    // Update request status
    const updatedRequest: KycRequest = {
      ...request,
      status: "approved",
      reviewedBy: "Admin", // In a real app, this would be the logged-in admin's name
      reviewedAt: new Date().toISOString()
    };
    
    // Update kycRequests
    const updatedRequests = kycRequests.map(req => 
      req.id === request.id ? updatedRequest : req
    );
    setKycRequests(updatedRequests);
    localStorage.setItem("kycRequests", JSON.stringify(updatedRequests));
    
    // Update user's KYC status
    updateUserKycStatus(request.userId, "approved");
    
    // Close dialog if open
    setIsViewDialogOpen(false);
    
    // Show success toast
    toast({
      title: "KYC Approved",
      description: `${request.userName}'s KYC verification has been approved`
    });
  };
  
  const rejectRequest = () => {
    if (!selectedRequest) return;
    
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }
    
    // Update request status
    const updatedRequest: KycRequest = {
      ...selectedRequest,
      status: "rejected",
      reviewedBy: "Admin", // In a real app, this would be the logged-in admin's name
      reviewedAt: new Date().toISOString(),
      rejectionReason: rejectionReason
    };
    
    // Update kycRequests
    const updatedRequests = kycRequests.map(req => 
      req.id === selectedRequest.id ? updatedRequest : req
    );
    setKycRequests(updatedRequests);
    localStorage.setItem("kycRequests", JSON.stringify(updatedRequests));
    
    // Update user's KYC status
    updateUserKycStatus(selectedRequest.userId, "rejected", rejectionReason);
    
    // Close dialogs
    setIsRejectDialogOpen(false);
    setIsViewDialogOpen(false);
    
    // Show success toast
    toast({
      title: "KYC Rejected",
      description: `${selectedRequest.userName}'s KYC verification has been rejected`
    });
  };
  
  const updateUserKycStatus = (userId: string, status: string, rejectionReason?: string) => {
    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        kycStatus: status,
        kycVerifiedAt: status === "approved" ? new Date().toISOString() : undefined,
        kycRejectionReason: rejectionReason
      };
      localStorage.setItem("users", JSON.stringify(users));
      
      // Also update mockUsers for auth
      try {
        const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]");
        const mockUserIndex = mockUsers.findIndex((u: any) => u.id === userId);
        if (mockUserIndex !== -1) {
          mockUsers[mockUserIndex] = {
            ...mockUsers[mockUserIndex],
            kycStatus: status,
            kycVerifiedAt: status === "approved" ? new Date().toISOString() : undefined,
            kycRejectionReason: rejectionReason
          };
          localStorage.setItem("mockUsers", JSON.stringify(mockUsers));
        }
      } catch (error) {
        console.error("Failed to update mockUsers:", error);
      }
      
      // Update currently logged-in user if applicable
      const currentUser = JSON.parse(localStorage.getItem("thunderwin_user") || "null");
      if (currentUser && currentUser.id === userId) {
        currentUser.kycStatus = status;
        currentUser.kycVerifiedAt = status === "approved" ? new Date().toISOString() : undefined;
        currentUser.kycRejectionReason = rejectionReason;
        localStorage.setItem("thunderwin_user", JSON.stringify(currentUser));
      }
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-900/30 text-yellow-500 border-yellow-700">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-900/30 text-green-500 border-green-700">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-900/30 text-red-500 border-red-700">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">KYC Management</h1>
          <p className="text-white/60">
            Review and manage customer KYC verification requests
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
          <Input
            placeholder="Search by name or email..."
            className="pl-10 bg-casino-thunder-gray/50 border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="pending" onValueChange={setCurrentTab}>
        <TabsList className="grid grid-cols-4 w-full md:w-auto mb-6">
          <TabsTrigger value="pending" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" /> Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center">
            <Check className="h-4 w-4 mr-2" /> Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center">
            <X className="h-4 w-4 mr-2" /> Rejected
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" /> All
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={currentTab}>
          <Card className="bg-casino-thunder-dark border-white/10">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Submission Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Review Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-white/60" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium">{request.userName}</div>
                                <div className="text-sm text-white/60">{request.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(request.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {request.reviewedAt 
                              ? new Date(request.reviewedAt).toLocaleDateString() 
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => viewRequest(request)}
                                className="border-white/20"
                              >
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Button>
                              
                              {request.status === "pending" && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => approveRequest(request)}
                                    className="border-green-700 text-green-500 hover:bg-green-900/30"
                                  >
                                    <Check className="h-4 w-4 mr-1" /> Approve
                                  </Button>
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openRejectDialog(request)}
                                    className="border-red-700 text-red-500 hover:bg-red-900/30"
                                  >
                                    <X className="h-4 w-4 mr-1" /> Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-white/60">
                          <div className="flex flex-col items-center">
                            <FileText className="h-8 w-8 mb-2 opacity-50" />
                            <span>No KYC requests found</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* View KYC Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-casino-thunder-dark border-white/10 max-w-5xl">
          <DialogHeader>
            <DialogTitle>KYC Request Details</DialogTitle>
            <DialogDescription>
              Review the submitted KYC information and documents
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-white/60" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg">{selectedRequest.userName}</h3>
                    <p className="text-white/60">{selectedRequest.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-white/60">Status:</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
              
              <Separator className="bg-white/10" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-white/60">Full Name</h4>
                      <p>{selectedRequest.data.fullName}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-white/60">Date of Birth</h4>
                      <p>{selectedRequest.data.dateOfBirth}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-white/60">Nationality</h4>
                      <p>{selectedRequest.data.nationality}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-white/60">Phone Number</h4>
                      <p>{selectedRequest.data.phoneNumber}</p>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg pt-2">Address Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <h4 className="text-sm text-white/60">Address</h4>
                      <p>{selectedRequest.data.address}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-white/60">City</h4>
                      <p>{selectedRequest.data.city}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-white/60">Zip/Postal Code</h4>
                      <p>{selectedRequest.data.zipCode}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-white/60">Country</h4>
                      <p>{selectedRequest.data.country}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-white/60">Document Type</h4>
                      <p>{selectedRequest.data.documentType}</p>
                    </div>
                  </div>
                  
                  {selectedRequest.status === "rejected" && selectedRequest.rejectionReason && (
                    <div className="bg-red-900/20 border border-red-900/40 rounded-md p-3 mt-4">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-red-500 font-medium">Rejection Reason</h4>
                          <p className="text-white/80">{selectedRequest.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Uploaded Documents</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm text-white/60 mb-1">ID Document (Front)</h4>
                      <div className="h-40 bg-white/5 border border-white/10 rounded-md flex items-center justify-center">
                        <img 
                          src={selectedRequest.data.documentFront || "/placeholder.svg"} 
                          alt="ID Document Front" 
                          className="max-h-full max-w-full object-contain p-1" 
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-white/60 mb-1">ID Document (Back)</h4>
                      <div className="h-40 bg-white/5 border border-white/10 rounded-md flex items-center justify-center">
                        <img 
                          src={selectedRequest.data.documentBack || "/placeholder.svg"} 
                          alt="ID Document Back" 
                          className="max-h-full max-w-full object-contain p-1"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-white/60 mb-1">Selfie with ID</h4>
                      <div className="h-40 bg-white/5 border border-white/10 rounded-md flex items-center justify-center">
                        <img 
                          src={selectedRequest.data.selfie || "/placeholder.svg"} 
                          alt="Selfie with ID" 
                          className="max-h-full max-w-full object-contain p-1"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className="border-white/10"
            >
              Close
            </Button>
            
            {selectedRequest && selectedRequest.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => openRejectDialog(selectedRequest)}
                  className="border-red-700 text-red-500 hover:bg-red-900/30"
                >
                  <X className="h-4 w-4 mr-2" /> Reject
                </Button>
                
                <Button
                  onClick={() => approveRequest(selectedRequest)}
                  className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                >
                  <Check className="h-4 w-4 mr-2" /> Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject KYC Request Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-casino-thunder-dark border-white/10">
          <DialogHeader>
            <DialogTitle>Reject KYC Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this verification request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <h3 className="font-medium">You are about to reject a KYC request</h3>
                <p className="text-sm text-white/60">The user will be notified and can resubmit with corrections</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full h-32 rounded-md bg-white/5 border border-white/10 p-2 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                placeholder="Please explain why this KYC request is being rejected..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={rejectRequest}
              className="bg-red-700 hover:bg-red-600 text-white"
            >
              <X className="h-4 w-4 mr-2" /> Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KycManagement;


import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Search, Eye, AlertTriangle, Users, Shield } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";

enum KycStatus {
  NOT_SUBMITTED = "not_submitted",
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected"
}

interface KycRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  status: KycStatus;
  submittedAt: string;
  data: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    phoneNumber: string;
    documentType: string;
    documentFront: string;
    documentBack: string;
    selfie: string;
  };
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

const KycManagement = () => {
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<KycRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentTab, setCurrentTab] = useState("pending");
  const { toast } = useToast();
  
  useEffect(() => {
    // Load KYC requests from localStorage
    const storedRequests = JSON.parse(localStorage.getItem("kycRequests") || "[]");
    setKycRequests(storedRequests);
  }, []);
  
  useEffect(() => {
    // Filter requests based on current tab and search query
    let filtered = kycRequests;
    
    // Filter by status
    if (currentTab === "pending") {
      filtered = filtered.filter(req => req.status === KycStatus.PENDING);
    } else if (currentTab === "verified") {
      filtered = filtered.filter(req => req.status === KycStatus.VERIFIED);
    } else if (currentTab === "rejected") {
      filtered = filtered.filter(req => req.status === KycStatus.REJECTED);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req => 
        req.userName.toLowerCase().includes(query) || 
        req.email.toLowerCase().includes(query) ||
        req.userId.toLowerCase().includes(query) ||
        req.data.fullName.toLowerCase().includes(query)
      );
    }
    
    // Sort by most recent first
    filtered = filtered.sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    
    setFilteredRequests(filtered);
  }, [kycRequests, searchQuery, currentTab]);
  
  const approveKyc = (request: KycRequest) => {
    // Update the request status
    const updatedRequests = kycRequests.map(req => 
      req.id === request.id ? {
        ...req,
        status: KycStatus.VERIFIED,
        reviewedBy: "Admin",
        reviewedAt: new Date().toISOString()
      } : req
    );
    
    // Update the user's KYC status
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === request.userId);
    
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        kycStatus: KycStatus.VERIFIED,
        kycVerifiedAt: new Date().toISOString(),
        isVerified: true // Also update the isVerified flag for general account verification
      };
      
      localStorage.setItem("users", JSON.stringify(users));
    }
    
    // Save updated requests to localStorage
    localStorage.setItem("kycRequests", JSON.stringify(updatedRequests));
    setKycRequests(updatedRequests);
    
    // Show success toast
    toast({
      title: "KYC Approved",
      description: `${request.data.fullName}'s identity has been verified.`,
    });
  };
  
  const openRejectDialog = (request: KycRequest) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };
  
  const rejectKyc = () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    
    // Update the request status
    const updatedRequests = kycRequests.map(req => 
      req.id === selectedRequest.id ? {
        ...req,
        status: KycStatus.REJECTED,
        reviewedBy: "Admin",
        reviewedAt: new Date().toISOString(),
        rejectionReason: rejectionReason.trim()
      } : req
    );
    
    // Update the user's KYC status
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: any) => u.id === selectedRequest.userId);
    
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        kycStatus: KycStatus.REJECTED,
        kycRejectionReason: rejectionReason.trim()
      };
      
      localStorage.setItem("users", JSON.stringify(users));
    }
    
    // Save updated requests to localStorage
    localStorage.setItem("kycRequests", JSON.stringify(updatedRequests));
    setKycRequests(updatedRequests);
    
    // Close dialog and show success toast
    setRejectDialogOpen(false);
    setSelectedRequest(null);
    
    toast({
      title: "KYC Rejected",
      description: "The user will be notified about the rejection reason.",
    });
  };
  
  const getKycStatusCount = (status: KycStatus) => {
    return kycRequests.filter(req => req.status === status).length;
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">KYC Management</h1>
            <p className="text-white/60">
              Review and manage user identity verification requests
            </p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
            <Input
              placeholder="Search users..."
              className="pl-10 bg-casino-thunder-gray/50 border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-casino-thunder-dark border-white/10">
            <CardContent className="p-6 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-4">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Pending</p>
                  <p className="text-2xl font-bold">{getKycStatusCount(KycStatus.PENDING)}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentTab("pending")}
                className="border-white/10 hover:bg-white/5"
              >
                View
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-casino-thunder-dark border-white/10">
            <CardContent className="p-6 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Verified</p>
                  <p className="text-2xl font-bold">{getKycStatusCount(KycStatus.VERIFIED)}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentTab("verified")}
                className="border-white/10 hover:bg-white/5"
              >
                View
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-casino-thunder-dark border-white/10">
            <CardContent className="p-6 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mr-4">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Rejected</p>
                  <p className="text-2xl font-bold">{getKycStatusCount(KycStatus.REJECTED)}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentTab("rejected")}
                className="border-white/10 hover:bg-white/5"
              >
                View
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="pending" value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-3 mb-6 w-full md:w-auto">
            <TabsTrigger value="pending" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" /> Pending
            </TabsTrigger>
            <TabsTrigger value="verified" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> Verified
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center">
              <XCircle className="h-4 w-4 mr-2" /> Rejected
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <KycRequestsTable 
              requests={filteredRequests} 
              onView={setSelectedRequest}
              onApprove={approveKyc}
              onReject={openRejectDialog}
            />
          </TabsContent>
          
          <TabsContent value="verified">
            <KycRequestsTable 
              requests={filteredRequests} 
              onView={setSelectedRequest}
              isReadOnly
            />
          </TabsContent>
          
          <TabsContent value="rejected">
            <KycRequestsTable 
              requests={filteredRequests} 
              onView={setSelectedRequest}
              isReadOnly
            />
          </TabsContent>
        </Tabs>
        
        {/* KYC Details Dialog */}
        {selectedRequest && (
          <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
            <DialogContent className="max-w-4xl bg-casino-thunder-dark border-white/10">
              <DialogHeader>
                <DialogTitle>KYC Request Details</DialogTitle>
                <DialogDescription>
                  Submitted on {new Date(selectedRequest.submittedAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Full Name</span>
                      <span>{selectedRequest.data.fullName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Email</span>
                      <span>{selectedRequest.email}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Date of Birth</span>
                      <span>{selectedRequest.data.dateOfBirth}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Nationality</span>
                      <span>{selectedRequest.data.nationality}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Address</span>
                      <span>{selectedRequest.data.address}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">City, ZIP, Country</span>
                      <span>{selectedRequest.data.city}, {selectedRequest.data.zipCode}, {selectedRequest.data.country}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Phone Number</span>
                      <span>{selectedRequest.data.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Document Type</span>
                      <span>{selectedRequest.data.documentType}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Verification Documents</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-white/60 mb-2">Document Front</p>
                      <div className="h-40 flex items-center justify-center bg-white/5 rounded-lg overflow-hidden border border-white/10">
                        {selectedRequest.data.documentFront ? (
                          <div className="text-center text-white/60">
                            <p>{selectedRequest.data.documentFront}</p>
                            <p className="text-sm mt-2">File preview not available in demo</p>
                          </div>
                        ) : (
                          <p className="text-white/40">No document uploaded</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-white/60 mb-2">Document Back</p>
                      <div className="h-40 flex items-center justify-center bg-white/5 rounded-lg overflow-hidden border border-white/10">
                        {selectedRequest.data.documentBack ? (
                          <div className="text-center text-white/60">
                            <p>{selectedRequest.data.documentBack}</p>
                            <p className="text-sm mt-2">File preview not available in demo</p>
                          </div>
                        ) : (
                          <p className="text-white/40">No document uploaded</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-white/60 mb-2">Selfie with Document</p>
                      <div className="h-40 flex items-center justify-center bg-white/5 rounded-lg overflow-hidden border border-white/10">
                        {selectedRequest.data.selfie ? (
                          <div className="text-center text-white/60">
                            <p>{selectedRequest.data.selfie}</p>
                            <p className="text-sm mt-2">File preview not available in demo</p>
                          </div>
                        ) : (
                          <p className="text-white/40">No selfie uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedRequest.status === KycStatus.REJECTED && selectedRequest.rejectionReason && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Rejection Reason</h3>
                  <p className="text-white/70">{selectedRequest.rejectionReason}</p>
                </div>
              )}
              
              <DialogFooter className="gap-2 mt-6">
                {selectedRequest.status === KycStatus.PENDING && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => openRejectDialog(selectedRequest)}
                      className="border-red-500/50 hover:bg-red-500/10 text-red-500"
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                    <Button
                      onClick={() => approveKyc(selectedRequest)}
                      className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve
                    </Button>
                  </>
                )}
                
                {selectedRequest.status !== KycStatus.PENDING && (
                  <Button onClick={() => setSelectedRequest(null)}>
                    Close
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Rejection Reason Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="bg-casino-thunder-dark border-white/10">
            <DialogHeader>
              <DialogTitle>Reject KYC Verification</DialogTitle>
              <DialogDescription>
                Please provide a clear reason for rejection. This will be visible to the user.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="h-32 border-white/10 focus-visible:ring-casino-thunder-green"
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={rejectKyc} className="bg-red-500 hover:bg-red-600">
                Reject Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

interface KycRequestsTableProps {
  requests: KycRequest[];
  onView: (request: KycRequest) => void;
  onApprove?: (request: KycRequest) => void;
  onReject?: (request: KycRequest) => void;
  isReadOnly?: boolean;
}

const KycRequestsTable = ({ requests, onView, onApprove, onReject, isReadOnly = false }: KycRequestsTableProps) => {
  return (
    <Card className="bg-casino-thunder-dark border-white/10">
      <CardContent className="p-0">
        {requests.length > 0 ? (
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
                    Document Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-white/60" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{request.data.fullName}</div>
                          <div className="text-sm text-white/60">{request.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(request.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {request.data.documentType.charAt(0).toUpperCase() + request.data.documentType.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === KycStatus.PENDING ? 'bg-yellow-100/10 text-yellow-500' : 
                        request.status === KycStatus.VERIFIED ? 'bg-green-100/10 text-green-500' : 
                        'bg-red-100/10 text-red-500'
                      }`}>
                        {request.status === KycStatus.PENDING ? (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        ) : request.status === KycStatus.VERIFIED ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onView(request)}
                          className="text-white/70 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {!isReadOnly && request.status === KycStatus.PENDING && onApprove && onReject && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onApprove(request)}
                              className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onReject(request)}
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No KYC Requests</h3>
            <p className="text-white/60 text-center max-w-md">
              {currentTab === "pending" ? "No pending KYC requests to review." :
               currentTab === "verified" ? "No verified KYC requests yet." :
               "No rejected KYC requests found."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KycManagement;

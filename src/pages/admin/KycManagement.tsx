
import React, { useState, useEffect } from "react";
import { Eye, Check, X, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { KycRequest } from "@/types";

const KycManagement = () => {
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<KycRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedKyc, setSelectedKyc] = useState<KycRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  useEffect(() => {
    const fetchKycRequests = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockKycRequests: KycRequest[] = [
          {
            id: "kyc-1",
            userId: "user-1",
            userName: "johndoe",
            email: "john.doe@example.com",
            submittedDate: "2023-03-15T10:30:00Z",
            status: "pending",
            documentType: "ID Verification",
            documentFiles: ["/path/to/id_front.jpg", "/path/to/id_back.jpg"],
            notes: "First-time submission"
          },
          {
            id: "kyc-2",
            userId: "user-2",
            userName: "janedoe",
            email: "jane.doe@example.com",
            submittedDate: "2023-03-14T14:20:00Z",
            status: "verified",
            documentType: "Address Verification",
            documentFiles: ["/path/to/utility_bill.pdf"],
            notes: "Address matches user profile"
          },
          {
            id: "kyc-3",
            userId: "user-3",
            userName: "bobsmith",
            email: "bob.smith@example.com",
            submittedDate: "2023-03-13T09:15:00Z",
            status: "rejected",
            documentType: "ID Verification",
            documentFiles: ["/path/to/id_front.jpg", "/path/to/id_back.jpg"],
            rejectionReason: "ID appears to be expired"
          }
        ];
        
        setKycRequests(mockKycRequests);
        setFilteredRequests(mockKycRequests);
        setLoading(false);
      }, 1000);
    };
    
    fetchKycRequests();
  }, []);
  
  useEffect(() => {
    let results = kycRequests;
    
    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter(kyc => kyc.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        kyc => 
          kyc.userName.toLowerCase().includes(query) ||
          (kyc.email && kyc.email.toLowerCase().includes(query)) ||
          kyc.userId.toLowerCase().includes(query)
      );
    }
    
    setFilteredRequests(results);
  }, [kycRequests, statusFilter, searchQuery]);
  
  const handleApprove = () => {
    if (!selectedKyc) return;
    
    const updatedKycRequests = kycRequests.map(kyc => 
      kyc.id === selectedKyc.id 
        ? { 
            ...kyc, 
            status: "verified" as const
          } 
        : kyc
    );
    
    setKycRequests(updatedKycRequests);
    setFilteredRequests(updatedKycRequests);
    setIsActionDialogOpen(false);
    setSelectedKyc(null);
    
    toast({
      title: "KYC Approved",
      description: `${selectedKyc.userName}'s KYC has been approved.`,
      variant: "default"
    });
  };
  
  const handleReject = () => {
    if (!selectedKyc) return;
    
    const updatedKycRequests = kycRequests.map(kyc => 
      kyc.id === selectedKyc.id 
        ? { 
            ...kyc, 
            status: "rejected" as const, 
            rejectionReason: rejectionReason,
            reviewedBy: "Admin"
          } 
        : kyc
    );
    
    setKycRequests(updatedKycRequests);
    setFilteredRequests(updatedKycRequests);
    setIsActionDialogOpen(false);
    setSelectedKyc(null);
    setRejectionReason("");
    
    toast({
      title: "KYC Rejected",
      description: `${selectedKyc.userName}'s KYC has been rejected.`,
      variant: "destructive"
    });
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
  
  return (
    <div className="py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">KYC Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="search"
              className="thunder-input w-full pl-10"
              placeholder="Search by username, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue="all" 
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value as any)}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="thunder-card overflow-hidden">
            {renderKycTable()}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-4">
          <div className="thunder-card overflow-hidden">
            {renderKycTable()}
          </div>
        </TabsContent>
        
        <TabsContent value="verified" className="mt-4">
          <div className="thunder-card overflow-hidden">
            {renderKycTable()}
          </div>
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-4">
          <div className="thunder-card overflow-hidden">
            {renderKycTable()}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Document Viewer Dialog */}
      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Document Viewer - {selectedKyc?.documentType}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="text-base font-medium mb-2">User: {selectedKyc?.userName} ({selectedKyc?.email})</h3>
            <p className="text-sm text-white/70 mb-4">
              Submitted: {selectedKyc && formatDate(selectedKyc.submittedDate)}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {selectedKyc?.documentFiles.map((file, index) => (
                <div key={index} className="bg-white/5 p-3 rounded-lg">
                  <img 
                    src={file} 
                    alt={`Document ${index + 1}`} 
                    className="w-full h-auto max-h-[300px] object-contain rounded border border-white/10"
                  />
                  <p className="text-center mt-2 text-sm text-white/70">Document {index + 1}</p>
                </div>
              ))}
            </div>
            
            {selectedKyc?.status === "rejected" && selectedKyc?.rejectionReason && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h4 className="font-medium text-red-400">Rejection Reason:</h4>
                <p className="text-white/70">{selectedKyc.rejectionReason}</p>
              </div>
            )}
            
            {selectedKyc?.status === "pending" && (
              <div className="flex justify-end gap-3">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsDocumentDialogOpen(false);
                    setIsActionDialogOpen(true);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Rejection Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject KYC Request</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">
              Please provide a reason for rejecting the KYC request from {selectedKyc?.userName}.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="rejection-reason">
                Rejection Reason
              </label>
              <textarea
                id="rejection-reason"
                className="thunder-input w-full"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this KYC request is being rejected..."
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsActionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
  
  function renderKycTable() {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-casino-thunder-green"></div>
        </div>
      );
    }
    
    if (filteredRequests.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-white/60">No KYC requests found</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                Document Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                Submitted Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredRequests.map((kyc) => (
              <tr key={kyc.id} className="hover:bg-white/5">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium">{kyc.userName}</div>
                      <div className="text-xs text-white/60">{kyc.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  {kyc.documentType}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  {formatDate(kyc.submittedDate)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    kyc.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : kyc.status === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-white/70"
                    onClick={() => {
                      setSelectedKyc(kyc);
                      setIsDocumentDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {kyc.status === 'pending' && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-green-500"
                        onClick={() => {
                          setSelectedKyc(kyc);
                          handleApprove();
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500"
                        onClick={() => {
                          setSelectedKyc(kyc);
                          setIsActionDialogOpen(true);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
};

export default KycManagement;

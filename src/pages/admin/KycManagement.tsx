
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  PlusCircle, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Clock,
  Trash
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KycRequest, KycStatus } from "@/types";

const KycManagement = () => {
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState<KycRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("submittedDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [newRequest, setNewRequest] = useState({
    userId: "",
    userName: "",
    email: "",
    documentType: "",
    documentImage: "",
    documentFiles: [] as string[],
    rejectionReason: ""
  });

  useEffect(() => {
    const storedKycRequests = localStorage.getItem('kycRequests');
    if (storedKycRequests) {
      setKycRequests(JSON.parse(storedKycRequests));
    } else {
      // Initialize with some mock data
      const initialKycRequests = [
        {
          id: "1",
          userId: "user1",
          userName: "John Doe",
          email: "john.doe@example.com",
          submittedDate: new Date().toISOString(),
          status: "pending" as const,
          documentType: "Passport",
          documentImage: "https://via.placeholder.com/150",
          documentFiles: ["passport_front.jpg", "passport_back.jpg"],
          rejectionReason: ""
        },
        {
          id: "2",
          userId: "user2",
          userName: "Jane Smith",
          email: "jane.smith@example.com",
          submittedDate: new Date().toISOString(),
          status: "approved" as const,
          documentType: "Driver's License",
          documentImage: "https://via.placeholder.com/150",
          documentFiles: ["license_front.jpg", "license_back.jpg"],
          rejectionReason: ""
        },
        {
          id: "3",
          userId: "user3",
          userName: "Alice Johnson",
          email: "alice.johnson@example.com",
          submittedDate: new Date().toISOString(),
          status: "rejected" as const,
          documentType: "ID Card",
          documentImage: "https://via.placeholder.com/150",
          documentFiles: ["id_front.jpg", "id_back.jpg"],
          rejectionReason: "Invalid document"
        }
      ];
      localStorage.setItem('kycRequests', JSON.stringify(initialKycRequests));
      setKycRequests(initialKycRequests);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('kycRequests', JSON.stringify(kycRequests));
  }, [kycRequests]);

  const handleOpenDialog = (kycRequest: KycRequest) => {
    setSelectedKyc(kycRequest);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedKyc(null);
    setIsDialogOpen(false);
    setRejectionReason("");
  };

  const handleApprove = (id: string) => {
    const updatedRequests = kycRequests.map(req =>
      req.id === id ? { ...req, status: "approved" as const } : req
    );
    setKycRequests(updatedRequests);
    handleCloseDialog();
    toast.success("KYC request approved");
  };

  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    const updatedRequests = kycRequests.map(req =>
      req.id === id ? { ...req, status: "rejected" as const, rejectionReason } : req
    );
    setKycRequests(updatedRequests);
    handleCloseDialog();
    toast.success("KYC request rejected");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewRequest({
      ...newRequest,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (!newRequest.userId.trim() || !newRequest.userName.trim() || !newRequest.email.trim() || !newRequest.documentType.trim() || !newRequest.documentImage.trim()) {
      toast.error("All fields are required");
      return;
    }

    const newKycRequest: KycRequest = {
      id: Date.now().toString(),
      userId: newRequest.userId,
      userName: newRequest.userName,
      email: newRequest.email,
      submittedDate: new Date().toISOString(),
      status: "pending",
      documentType: newRequest.documentType,
      documentImage: newRequest.documentImage,
      documentFiles: [],
      rejectionReason: ""
    };

    setKycRequests(prev => [...prev, newKycRequest]);
    setNewRequest({
      userId: "",
      userName: "",
      email: "",
      documentType: "",
      documentImage: "",
      documentFiles: [],
      rejectionReason: ""
    });
    setIsDialogOpen(false);
    toast.success("KYC request added successfully");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this KYC request?")) {
      setKycRequests(prev => prev.filter(req => req.id !== id));
      toast.success("KYC request deleted successfully");
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
  };

  // Apply filters and sorting
  const filteredAndSortedRequests = kycRequests
    .filter(request => {
      // Apply search filter
      const matchesSearch = 
        request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.userId.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply status filter
      const matchesStatus = filterStatus === "all" || request.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortField === "submittedDate") {
        return sortDirection === "asc" 
          ? new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime()
          : new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
      } else if (sortField === "userName") {
        return sortDirection === "asc"
          ? a.userName.localeCompare(b.userName)
          : b.userName.localeCompare(a.userName);
      }
      return 0;
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Statistics
  const totalRequests = kycRequests.length;
  const pendingRequests = kycRequests.filter(req => req.status === "pending").length;
  const approvedRequests = kycRequests.filter(req => req.status === "approved").length;
  const rejectedRequests = kycRequests.filter(req => req.status === "rejected").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">KYC Management</h1>
          <p className="text-muted-foreground">Verify and manage user identity documents</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setNewRequest({
                userId: "",
                userName: "",
                email: "",
                documentType: "",
                documentImage: "",
                documentFiles: [],
                rejectionReason: ""
              });
              setSelectedKyc(null);
            }} className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add KYC Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New KYC Request</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new KYC request.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  name="userId"
                  value={newRequest.userId}
                  onChange={handleInputChange}
                  placeholder="e.g. user123"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="userName">User Name</Label>
                <Input
                  id="userName"
                  name="userName"
                  value={newRequest.userName}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newRequest.email}
                  onChange={handleInputChange}
                  placeholder="e.g. john.doe@example.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select 
                  onValueChange={(value) => setNewRequest({...newRequest, documentType: value})}
                  value={newRequest.documentType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Passport">Passport</SelectItem>
                    <SelectItem value="Driver's License">Driver's License</SelectItem>
                    <SelectItem value="ID Card">ID Card</SelectItem>
                    <SelectItem value="Residence Permit">Residence Permit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="documentImage">Document Image URL</Label>
                <Input
                  id="documentImage"
                  name="documentImage"
                  value={newRequest.documentImage}
                  onChange={handleInputChange}
                  placeholder="e.g. https://example.com/image.jpg"
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleSubmit} className="bg-casino-thunder-green text-black hover:bg-casino-thunder-highlight">
                Create KYC Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-casino-thunder-dark border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            <CardDescription className="text-2xl font-bold">{totalRequests}</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="bg-casino-thunder-dark border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <CardDescription className="text-2xl font-bold text-yellow-500">{pendingRequests}</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="bg-casino-thunder-dark border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <CardDescription className="text-2xl font-bold text-green-500">{approvedRequests}</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="bg-casino-thunder-dark border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <CardDescription className="text-2xl font-bold text-red-500">{rejectedRequests}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or user ID..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select onValueChange={handleFilterChange} defaultValue="all">
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="grid">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("submittedDate")}
              className={sortField === "submittedDate" ? "border-casino-thunder-green text-casino-thunder-green" : ""}
            >
              Date {sortField === "submittedDate" && (sortDirection === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("userName")}
              className={sortField === "userName" ? "border-casino-thunder-green text-casino-thunder-green" : ""}
            >
              Name {sortField === "userName" && (sortDirection === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-casino-thunder-green" />
            <p className="mt-2 text-muted-foreground">Loading KYC requests...</p>
          </div>
        ) : filteredAndSortedRequests.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg mt-4">
            <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No KYC requests found matching your filters.</p>
          </div>
        ) : (
          <>
            {/* Grid View */}
            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedRequests.map(request => (
                  <Card key={request.id} className="bg-casino-thunder-dark border-white/10 overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg">{request.userName}</CardTitle>
                          <CardDescription className="text-sm">{request.email}</CardDescription>
                        </div>
                        <div>
                          {request.status === "approved" ? (
                            <CheckCircle className="text-green-500 h-5 w-5" />
                          ) : request.status === "rejected" ? (
                            <XCircle className="text-red-500 h-5 w-5" />
                          ) : (
                            <Clock className="text-yellow-500 h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-muted-foreground">Document:</span>
                        <span>{request.documentType}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{getStatusBadge(request.status)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Submitted:</span>
                        <span>{new Date(request.submittedDate).toLocaleDateString()}</span>
                      </div>
                      {request.status === "rejected" && (
                        <div className="mt-3 p-2 bg-red-500/10 rounded text-sm text-red-400 border border-red-500/20">
                          <p className="font-medium">Reason for rejection:</p>
                          <p>{request.rejectionReason}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2 border-t border-white/10">
                      <Button variant="outline" onClick={() => handleOpenDialog(request)}>
                        View Details
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(request.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Table View */}
            <TabsContent value="table">
              <div className="rounded-md border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-casino-thunder-dark/50">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Document</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Submitted Date</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedRequests.map((request, index) => (
                      <tr key={request.id} className={`border-t border-white/10 ${index % 2 === 0 ? 'bg-casino-thunder-dark/30' : 'bg-casino-thunder-dark/10'}`}>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{request.userName}</div>
                            <div className="text-sm text-muted-foreground">{request.email}</div>
                          </div>
                        </td>
                        <td className="p-3">{request.documentType}</td>
                        <td className="p-3">{new Date(request.submittedDate).toLocaleDateString()}</td>
                        <td className="p-3">{getStatusBadge(request.status)}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(request)}>
                              View
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(request.id)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* KYC Request Details Dialog */}
      <Dialog open={!!selectedKyc} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>KYC Request Details</DialogTitle>
            <DialogDescription>
              Review and manage the KYC request for {selectedKyc?.userName}.
            </DialogDescription>
          </DialogHeader>

          {selectedKyc && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>User ID</Label>
                    <p className="text-sm font-medium mt-1">{selectedKyc.userId}</p>
                  </div>

                  <div>
                    <Label>User Name</Label>
                    <p className="text-sm font-medium mt-1">{selectedKyc.userName}</p>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <p className="text-sm font-medium mt-1">{selectedKyc.email}</p>
                  </div>

                  <div>
                    <Label>Document Type</Label>
                    <p className="text-sm font-medium mt-1">{selectedKyc.documentType}</p>
                  </div>

                  <div>
                    <Label>Submitted Date</Label>
                    <p className="text-sm font-medium mt-1">{new Date(selectedKyc.submittedDate).toLocaleString()}</p>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedKyc.status)}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Document Image</Label>
                    <div className="mt-2 border border-white/10 rounded-md overflow-hidden">
                      <img src={selectedKyc.documentImage} alt="Document" className="w-full h-auto" />
                    </div>
                  </div>

                  {selectedKyc.documentFiles.length > 0 && (
                    <div>
                      <Label>Document Files</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedKyc.documentFiles.map((file, index) => (
                          <Button key={index} variant="outline" size="sm" asChild>
                            <a href={file} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300">
                              {file.split('/').pop()}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedKyc.status === "rejected" && (
                <div className="p-3 bg-red-500/10 rounded-md border border-red-500/20">
                  <Label>Rejection Reason</Label>
                  <p className="text-sm mt-1">{selectedKyc.rejectionReason}</p>
                </div>
              )}

              {selectedKyc.status === "pending" && (
                <div className="grid gap-2">
                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Enter rejection reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                {selectedKyc?.status === "pending" ? (
                  <>
                    <Button variant="destructive" onClick={() => selectedKyc && handleReject(selectedKyc.id)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button 
                      onClick={() => selectedKyc && handleApprove(selectedKyc.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => handleCloseDialog()}>Close</Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KycManagement;

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
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PlusCircle, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { KycRequest, KycStatus } from "@/types";

const KycManagement = () => {
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState<KycRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
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
      req.id === id ? { ...req, status: "approved" } : req
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
      req.id === id ? { ...req, status: "rejected", rejectionReason } : req
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

  const isVerified = (status: string) => status === "verified" || status === "approved";

  const createRejectedKyc = (id: string, userId: string, userName: string, email: string, reason: string) => {
    return {
      id,
      userId,
      userName,
      email,
      submittedDate: new Date().toISOString(),
      status: "rejected" as const,
      documentType: "Identity Document",
      documentImage: "placeholder-image-url.jpg", // Ensure this field is always present
      documentFiles: ["document1.jpg", "document2.jpg"],
      rejectionReason: reason
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">KYC Management</h1>
          <p className="text-gray-500">Manage user KYC verification requests</p>
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
            }}>
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
                <Input
                  id="documentType"
                  name="documentType"
                  value={newRequest.documentType}
                  onChange={handleInputChange}
                  placeholder="e.g. Passport"
                />
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
              <Button onClick={handleSubmit}>
                Create KYC Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
          Loading KYC requests...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kycRequests.map(request => (
            <Card key={request.id} className="bg-casino-thunder-dark border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{request.userName}</CardTitle>
                  {isVerified(request.status) ? (
                    <CheckCircle className="text-green-500 h-5 w-5" />
                  ) : request.status === "rejected" ? (
                    <XCircle className="text-red-500 h-5 w-5" />
                  ) : (
                    <AlertTriangle className="text-yellow-500 h-5 w-5" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Email: {request.email}
                  <br />
                  Document: {request.documentType}
                  <br />
                  Submitted: {new Date(request.submittedDate).toLocaleDateString()}
                </CardDescription>
              </CardContent>
              <div className="p-3 flex justify-between items-center">
                <Button variant="outline" onClick={() => handleOpenDialog(request)}>
                  View Details
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(request.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {kycRequests.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-foreground">No KYC requests available.</p>
        </div>
      )}

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
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>User ID</Label>
                <CardDescription>{selectedKyc.userId}</CardDescription>
              </div>

              <div className="grid gap-2">
                <Label>User Name</Label>
                <CardDescription>{selectedKyc.userName}</CardDescription>
              </div>

              <div className="grid gap-2">
                <Label>Email</Label>
                <CardDescription>{selectedKyc.email}</CardDescription>
              </div>

              <div className="grid gap-2">
                <Label>Document Type</Label>
                <CardDescription>{selectedKyc.documentType}</CardDescription>
              </div>

              <div className="grid gap-2">
                <Label>Submitted Date</Label>
                <CardDescription>{new Date(selectedKyc.submittedDate).toLocaleDateString()}</CardDescription>
              </div>

              <div className="grid gap-2">
                <Label>Document Image</Label>
                <img src={selectedKyc.documentImage} alt="Document" className="rounded-md" />
              </div>

              <div className="grid gap-2">
                <Label>Document Files</Label>
                <div className="flex space-x-2">
                  {selectedKyc.documentFiles.map((file, index) => (
                    <a key={index} href={file} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {file}
                    </a>
                  ))}
                </div>
              </div>

              {selectedKyc.status === "rejected" && (
                <div className="grid gap-2">
                  <Label>Rejection Reason</Label>
                  <CardDescription>{selectedKyc.rejectionReason}</CardDescription>
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
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedKyc?.status === "pending" ? (
              <>
                <Button variant="destructive" onClick={() => selectedKyc && handleReject(selectedKyc.id)}>
                  Reject
                </Button>
                <Button onClick={() => selectedKyc && handleApprove(selectedKyc.id)}>Approve</Button>
              </>
            ) : (
              <Button onClick={() => handleCloseDialog()}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KycManagement;

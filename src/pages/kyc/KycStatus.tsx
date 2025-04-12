
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

enum KycStatus {
  NOT_SUBMITTED = "not_submitted",
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected"
}

const KycStatusPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<KycStatus | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // Fetch the user's KYC status from localStorage
    if (user) {
      const usersDb = JSON.parse(localStorage.getItem("users") || "[]");
      const currentUser = usersDb.find((u: any) => u.id === user.id);
      
      if (currentUser && currentUser.kycStatus) {
        setStatus(currentUser.kycStatus);
        setSubmittedAt(currentUser.kycSubmittedAt || null);
        setRejectionReason(currentUser.kycRejectionReason || null);
      } else {
        setStatus(KycStatus.NOT_SUBMITTED);
      }
    }
  }, [user, isAuthenticated, navigate]);
  
  const renderStatusContent = () => {
    switch (status) {
      case KycStatus.NOT_SUBMITTED:
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} className="text-yellow-500" />
            </div>
            <CardTitle>Not Verified</CardTitle>
            <CardDescription>
              You haven't submitted your KYC verification yet. Complete the verification process to unlock all platform features.
            </CardDescription>
            <Button
              onClick={() => navigate("/kyc")}
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black mt-4"
            >
              Start Verification
            </Button>
          </div>
        );
        
      case KycStatus.PENDING:
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
              <Clock size={32} className="text-yellow-500" />
            </div>
            <CardTitle>Verification In Progress</CardTitle>
            <CardDescription>
              Your documents are being reviewed by our team. This typically takes 24-48 hours.
              {submittedAt && (
                <div className="mt-2">
                  <span className="text-white/60">Submitted on: </span>
                  <span>{new Date(submittedAt).toLocaleString()}</span>
                </div>
              )}
            </CardDescription>
            <div className="w-full max-w-md mx-auto bg-casino-thunder-gray/30 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-medium mb-2">While you wait</h3>
              <p className="text-white/70 text-sm">
                You can still use most features of our platform while your verification is in progress. 
                However, some features may have limited functionality until verification is complete.
              </p>
            </div>
          </div>
        );
        
      case KycStatus.VERIFIED:
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-800/20 flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <CardTitle>Verification Complete</CardTitle>
            <CardDescription>
              Your identity has been successfully verified. You now have full access to all platform features.
            </CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Button
                onClick={() => navigate("/vip")}
                variant="outline"
                className="flex items-center justify-center border-casino-thunder-green text-casino-thunder-green hover:bg-casino-thunder-green hover:text-black"
              >
                VIP Program <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate("/casino")}
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black flex items-center justify-center"
              >
                Play Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case KycStatus.REJECTED:
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-800/20 flex items-center justify-center mx-auto">
              <XCircle size={32} className="text-red-500" />
            </div>
            <CardTitle>Verification Failed</CardTitle>
            <CardDescription>
              Unfortunately, we couldn't verify your identity based on the documents provided.
            </CardDescription>
            {rejectionReason && (
              <div className="w-full max-w-md mx-auto bg-red-900/20 border border-red-500/20 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">Reason for rejection:</h3>
                <p className="text-white/70 text-sm">{rejectionReason}</p>
              </div>
            )}
            <Button
              onClick={() => navigate("/kyc")}
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black mt-4"
            >
              Try Again
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="text-center">
            <CardDescription>
              Loading your verification status...
            </CardDescription>
          </div>
        );
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="w-full max-w-2xl mx-auto bg-casino-thunder-dark border-white/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">KYC Verification Status</h2>
          </div>
        </CardHeader>
        <CardContent>
          {renderStatusContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default KycStatusPage;

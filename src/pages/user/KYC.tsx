import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KycForm from '@/components/kyc/KycForm';
import KycStatusDisplay from '@/components/kyc/KycStatusDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { KycStatus, KycAttempt } from '@/types/kyc';
import { toast } from 'sonner';
import UserLayout from '@/components/layout/UserLayout';
import UserPageLoadingSkeleton from '@/components/user/UserPageLoadingSkeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

const KYCPage: React.FC = () => {
  const { user, loading: authLoading, fetchAndUpdateUser } = useAuth();
  const navigate = useNavigate();

  // State for current KYC attempt details or history, if fetched separately
  // const { data: kycData, isLoading: kycLoading, error: kycError, refetch } = useQuery(...)
  const [currentKycAttempt, setCurrentKycAttempt] = useState<KycAttempt | null>(null); // Example
  const [isLoadingKyc, setIsLoadingKyc] = useState(false); // Example

  // If kycStatus is on user object from AuthContext:
  const kycStatus = user?.kycStatus;

  // Effect to fetch detailed KYC attempt if needed (e.g., for resubmission or history)
  useEffect(() => {
    if (user && (kycStatus === 'resubmit_required' || kycStatus === 'rejected')) {
        // setIsLoadingKyc(true);
        // kycService.getCurrentUserKycAttempt(user.id).then(setCurrentKycAttempt).finally(() => setIsLoadingKyc(false));
    }
  }, [user, kycStatus]);
  

  const handleKycSuccess = () => {
    toast.success("KYC documents submitted successfully! Your documents are now pending review.");
    // Refetch user data to get updated KYC status
    fetchAndUpdateUser(); 
    // Potentially refetch detailed KYC attempt history if displayed
    // refetchKycHistory(); 
  };
  
  const handleKycError = (errorMessage: string) => {
    toast.error(`KYC submission failed: ${errorMessage}`);
  };

  if (authLoading) {
    return <UserPageLoadingSkeleton title="KYC Verification" />;
  }

  if (!user) {
    navigate('/login'); // Should be handled by protected route
    return null;
  }
  
  const canSubmitKyc = !kycStatus || kycStatus === 'not_started' || kycStatus === 'resubmit_required' || kycStatus === 'rejected';


  return (
    <UserLayout title="KYC Verification">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheck className="mr-3 h-6 w-6 text-primary" />
              Identity Verification (KYC)
            </CardTitle>
            <CardDescription>
              Verify your identity to unlock full account features and ensure security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">Your Current KYC Status:</p>
              <KycStatusDisplay status={kycStatus} /> {/* Use optional chaining if kycStatus can be undefined */}
            </div>

            {kycStatus === 'approved' || kycStatus === 'verified' ? (
              <Alert variant="default" className="bg-green-50 border-green-200 text-green-700">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertTitle className="font-semibold">Identity Verified!</AlertTitle>
                <AlertDescription>
                  Your identity has been successfully verified. All account features are now available to you.
                </AlertDescription>
              </Alert>
            ) : kycStatus === 'pending_review' ? (
              <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                <Clock className="h-5 w-5 text-yellow-600" />
                <AlertTitle className="font-semibold">Documents Under Review</AlertTitle>
                <AlertDescription>
                  Your submitted documents are currently being reviewed. This process usually takes 1-2 business days. We'll notify you once the review is complete.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {kycStatus === 'rejected' && currentKycAttempt?.notes && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle>Submission Rejected</AlertTitle>
                    <AlertDescription>
                      Reason: {currentKycAttempt.notes || "Please review the requirements and resubmit."}
                    </AlertDescription>
                  </Alert>
                )}
                {kycStatus === 'resubmit_required' && (
                    <Alert variant="default" className="bg-orange-50 border-orange-200 text-orange-700">
                        <RefreshCw className="h-5 w-5 text-orange-600" />
                        <AlertTitle className="font-semibold">Resubmission Required</AlertTitle>
                        <AlertDescription>
                        There was an issue with your previous submission. Please review the requirements below and submit your documents again.
                        {currentKycAttempt?.notes && <p className="mt-1"><strong>Note:</strong> {currentKycAttempt.notes}</p>}
                        </AlertDescription>
                    </Alert>
                )}

                {canSubmitKyc && (
                  <div>
                    <p className="mb-4 text-muted-foreground">
                      Please submit the required documents to verify your identity. This helps us keep our platform secure and comply with regulations.
                    </p>
                    {/* Assuming KycForm handles its own state and submission logic */}
                    <KycForm 
                        userId={user.id} 
                        onSuccess={handleKycSuccess} 
                        onError={handleKycError} 
                        // Pass existing documents if resubmitting and want to show them
                        // existingDocuments={currentKycAttempt?.documents} 
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Optionally display KYC attempt history here */}
        {/* <Card>
            <CardHeader><CardTitle>KYC Submission History</CardTitle></CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Your submission history will appear here.</p>
            </CardContent>
        </Card> */}
      </div>
    </UserLayout>
  );
};

export default KYCPage;

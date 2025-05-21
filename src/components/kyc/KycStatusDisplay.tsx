
import React from 'react';
import { KycRequest, KycStatus, KycStatusEnum } from '@/types/kyc';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';

interface KycStatusDisplayProps {
  kycRequest: KycRequest | null;
  isLoading: boolean;
  error?: Error | null;
  onResubmit?: () => void; // Callback to trigger KYC form for resubmission
}

const KycStatusDisplay: React.FC<KycStatusDisplayProps> = ({ kycRequest, isLoading, error, onResubmit }) => {
  if (isLoading) {
    return <p>Loading KYC status...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error loading KYC status: {error.message}</p>;
  }

  if (!kycRequest) {
    return <p>No KYC submission found. Please submit your documents for verification.</p>;
  }

  const { status, rejection_reason, notes, submitted_at, reviewed_at } = kycRequest;

  let statusIcon, statusText, statusColor, statusDescription;

  switch (status) {
    case KycStatusEnum.APPROVED:
      statusIcon = <CheckCircle className="h-12 w-12 text-green-500" />;
      statusText = 'Approved';
      statusColor = 'text-green-500';
      statusDescription = 'Your identity has been successfully verified.';
      break;
    case KycStatusEnum.REJECTED:
      statusIcon = <XCircle className="h-12 w-12 text-red-500" />;
      statusText = 'Rejected';
      statusColor = 'text-red-500';
      statusDescription = `Your verification was not successful. ${rejection_reason ? `Reason: ${rejection_reason}` : ''}`;
      break;
    case KycStatusEnum.PENDING:
      statusIcon = <Clock className="h-12 w-12 text-yellow-500" />;
      statusText = 'Pending Review';
      statusColor = 'text-yellow-500';
      statusDescription = 'Your documents have been submitted and are awaiting review.';
      break;
    case KycStatusEnum.RESUBMIT:
      statusIcon = <RefreshCw className="h-12 w-12 text-orange-500" />;
      statusText = 'Resubmission Required';
      statusColor = 'text-orange-500';
      statusDescription = `There was an issue with your submission. ${rejection_reason ? `Details: ${rejection_reason}` : 'Please review and resubmit your documents.'}`;
      break;
    default:
      statusIcon = <AlertCircle className="h-12 w-12 text-gray-500" />;
      statusText = 'Unknown Status';
      statusColor = 'text-gray-500';
      statusDescription = 'There was an issue determining your KYC status. Please contact support.';
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        {statusIcon}
        <CardTitle className={`mt-4 text-2xl font-semibold ${statusColor}`}>{statusText}</CardTitle>
        <CardDescription className="mt-2">{statusDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <p><strong>Submitted:</strong> {new Date(submitted_at).toLocaleString()}</p>
          {reviewed_at && <p><strong>Reviewed:</strong> {new Date(reviewed_at).toLocaleString()}</p>}
        </div>
        
        {notes && (status === KycStatusEnum.REJECTED || status === KycStatusEnum.RESUBMIT) && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm font-medium text-yellow-700">Reviewer Notes:</p>
            <p className="text-sm text-yellow-600">{notes}</p>
          </div>
        )}
        
        {(status === KycStatusEnum.REJECTED || status === KycStatusEnum.RESUBMIT) && onResubmit && (
          <Button onClick={onResubmit} className="w-full mt-4">
            Resubmit Documents
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default KycStatusDisplay;

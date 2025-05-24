
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { KycStatus } from '@/types/kyc';

interface KycStatusDisplayProps {
  status?: string;
}

const KycStatusDisplay: React.FC<KycStatusDisplayProps> = ({ status }) => {
  const getStatusVariant = (status?: string) => {
    switch (status) {
      case KycStatus.APPROVED:
      case KycStatus.VERIFIED:
        return 'default';
      case KycStatus.PENDING:
      case KycStatus.PENDING_REVIEW:
        return 'secondary';
      case KycStatus.REJECTED:
        return 'destructive';
      case KycStatus.RESUBMIT_REQUIRED:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case KycStatus.APPROVED:
        return 'Approved';
      case KycStatus.VERIFIED:
        return 'Verified';
      case KycStatus.PENDING:
      case KycStatus.PENDING_REVIEW:
        return 'Pending Review';
      case KycStatus.REJECTED:
        return 'Rejected';
      case KycStatus.RESUBMIT_REQUIRED:
        return 'Resubmission Required';
      case KycStatus.NOT_STARTED:
        return 'Not Started';
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge variant={getStatusVariant(status)}>
      {getStatusText(status)}
    </Badge>
  );
};

export default KycStatusDisplay;


import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KycStatusDisplayProps, KycStatus } from '@/types/kyc';

const KycStatusDisplay: React.FC<KycStatusDisplayProps> = ({ 
  status, 
  kycStatus,
  kycRequest,
  onResubmit 
}) => {
  const displayStatus = status || kycStatus || 'not_submitted';

  const getStatusColor = (status: KycStatus) => {
    switch(status) {
      case 'approved':
      case 'verified':
        return 'bg-green-500 hover:bg-green-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'rejected':
      case 'resubmit_required':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusLabel = (status: KycStatus) => {
    switch(status) {
      case 'approved': return 'Verified';
      case 'verified': return 'Verified';
      case 'pending': return 'Pending Review';
      case 'rejected': return 'Rejected';
      case 'resubmit_required': return 'Resubmission Required';
      case 'not_submitted': return 'Not Submitted';
      default: return 'Not Started';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge className={getStatusColor(displayStatus as KycStatus)}>
        {getStatusLabel(displayStatus as KycStatus)}
      </Badge>
      
      {(displayStatus === 'rejected' || displayStatus === 'resubmit_required') && onResubmit && (
        <Button variant="outline" size="sm" onClick={onResubmit}>
          Resubmit
        </Button>
      )}
    </div>
  );
};

export default KycStatusDisplay;


import React from 'react';
import { KycRequest, KycStatus } from '@/types/kyc'; // Assuming KycStatus is defined in kyc types

interface KycStatusDisplayProps {
  kycStatus: KycStatus | undefined; // Made kycStatus optional
  kycRequest: KycRequest | null;
  onResubmit: () => void;
}

const KycStatusDisplay: React.FC<KycStatusDisplayProps> = ({ kycStatus, kycRequest, onResubmit }) => {
  if (!kycStatus) {
    return <p>Loading KYC status...</p>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">KYC Status: <span className={`capitalize ${
        kycStatus === 'approved' ? 'text-green-500' :
        kycStatus === 'rejected' ? 'text-red-500' :
        kycStatus === 'pending' ? 'text-yellow-500' :
        'text-gray-500'
      }`}>{kycStatus.replace('_', ' ')}</span></h3>
      {kycRequest?.rejection_reason && kycStatus === 'rejected' && (
        <p className="text-sm text-red-600 mt-1">Reason: {kycRequest.rejection_reason}</p>
      )}
      {kycRequest?.review_notes && (
        <p className="text-sm text-muted-foreground mt-1">Notes: {kycRequest.review_notes}</p>
      )}
      {kycStatus === 'resubmit_required' && (
        <button onClick={onResubmit} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Resubmit Documents
        </button>
      )}
    </div>
  );
};

export default KycStatusDisplay;

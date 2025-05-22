
import React from 'react';
// Removed KycRequest as it's not defined in types/kyc.ts and seems unused
import { KycStatus } from '@/types/kyc'; // Corrected KycStatusEnum to KycStatus
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, HelpCircle, Loader2 } from 'lucide-react';

interface KycStatusDisplayProps {
  status?: KycStatus | null; // Make status optional to handle undefined
  className?: string;
}

const KycStatusDisplay: React.FC<KycStatusDisplayProps> = ({ status, className }) => {
  if (status === undefined || status === null) { // Handle undefined or null status
    return (
      <Badge variant="outline" className={`flex items-center ${className}`}>
        <HelpCircle className="mr-1 h-4 w-4" />
        Unknown
      </Badge>
    );
  }

  const statusConfig: Record<KycStatus, { label: string; icon: React.ElementType; color: string }> = {
    not_started: { label: 'Not Started', icon: HelpCircle, color: 'bg-gray-500 hover:bg-gray-500' },
    pending_review: { label: 'Pending Review', icon: Clock, color: 'bg-yellow-500 hover:bg-yellow-500 text-black' },
    approved: { label: 'Approved', icon: CheckCircle2, color: 'bg-green-500 hover:bg-green-500' },
    verified: { label: 'Verified', icon: CheckCircle2, color: 'bg-emerald-500 hover:bg-emerald-500' },
    rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-500 hover:bg-red-500' },
    resubmit_required: { label: 'Resubmit Required', icon: RefreshCw, color: 'bg-orange-500 hover:bg-orange-500' },
    failed: { label: 'Failed', icon: AlertTriangle, color: 'bg-destructive hover:bg-destructive' },
    // 'loading' was not in KycStatus, if needed, add it to the type
  };

  const currentStatus = statusConfig[status] || { label: 'Unknown', icon: HelpCircle, color: 'bg-gray-400' };
  const IconComponent = currentStatus.icon;

  return (
    <Badge variant="secondary" className={`flex items-center ${currentStatus.color} text-primary-foreground ${className}`}>
      <IconComponent className="mr-1.5 h-4 w-4" />
      {currentStatus.label}
    </Badge>
  );
};

export default KycStatusDisplay;


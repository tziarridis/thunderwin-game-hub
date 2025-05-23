
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { KycStatus } from '@/types/kyc';

interface KycStatusDisplayProps {
  status: KycStatus | string;
  className?: string;
}

const KycStatusDisplay: React.FC<KycStatusDisplayProps> = ({ status, className }) => {
  const statusConfig = {
    [KycStatus.PENDING]: {
      label: 'Pending Review',
      icon: Clock,
      color: 'bg-yellow-500 text-white',
    },
    [KycStatus.APPROVED]: {
      label: 'Approved',
      icon: CheckCircle,
      color: 'bg-green-500 text-white',
    },
    [KycStatus.REJECTED]: {
      label: 'Rejected',
      icon: XCircle,
      color: 'bg-red-500 text-white',
    },
    [KycStatus.RESUBMIT_REQUIRED]: {
      label: 'Resubmit Required',
      icon: AlertTriangle,
      color: 'bg-orange-500 text-white',
    },
  };

  const config = statusConfig[status as KycStatus] || {
    label: 'Unknown',
    icon: AlertTriangle,
    color: 'bg-gray-500 text-white',
  };

  const IconComponent = config.icon;

  return (
    <Badge className={`${config.color} ${className}`}>
      <IconComponent className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default KycStatusDisplay;

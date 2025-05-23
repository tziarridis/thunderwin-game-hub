
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { KycStatusEnum } from '@/types/kyc';

interface KycStatusDisplayProps {
  status: string;
  className?: string;
}

const KycStatusDisplay: React.FC<KycStatusDisplayProps> = ({ status, className }) => {
  const statusConfig: Record<string, { label: string, icon: React.FC<any>, color: string }> = {
    "pending": {
      label: 'Pending Review',
      icon: Clock,
      color: 'bg-yellow-500 text-white',
    },
    "approved": {
      label: 'Approved',
      icon: CheckCircle,
      color: 'bg-green-500 text-white',
    },
    "rejected": {
      label: 'Rejected',
      icon: XCircle,
      color: 'bg-red-500 text-white',
    },
    "resubmit_required": {
      label: 'Resubmit Required',
      icon: AlertTriangle,
      color: 'bg-orange-500 text-white',
    },
  };

  const config = statusConfig[status] || {
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

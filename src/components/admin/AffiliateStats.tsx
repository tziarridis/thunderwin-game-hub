import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AffiliateStatsProps {
  affiliateData: Affiliate;
}

const AffiliateStats: React.FC<AffiliateStatsProps> = ({ affiliateData }) => {
  return (
    <Card className="bg-casino-thunder-dark border-casino-thunder-gray/20">
      <CardHeader>
        <CardTitle>Affiliate Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/60">Total Commission</p>
            <p className="font-medium">${affiliateData.commission}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">Commission Paid</p>
            <p className="font-medium">${affiliateData.commission_paid || 0}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">Clicks</p>
            <p className="font-medium">{affiliateData.clicks}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">Registrations</p>
            <p className="font-medium">{affiliateData.registrations}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">Depositing Users</p>
            <p className="font-medium">{affiliateData.depositingUsers}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateStats;

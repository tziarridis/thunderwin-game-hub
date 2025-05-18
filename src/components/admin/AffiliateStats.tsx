
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, BarChart2, Link2 } from "lucide-react";
import { Affiliate } from "@/types"; // Assuming Affiliate type is defined in types

interface AffiliateStatsProps {
  affiliate: Affiliate;
  // Add other relevant props like historical data if needed
}

const AffiliateStats = ({ affiliate }: AffiliateStatsProps) => {
  if (!affiliate) return <p>No affiliate data available.</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Commission
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(affiliate.commission_paid ?? 0).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Based on {affiliate.commission}% rate</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clicks</CardTitle>
          <Link2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{affiliate.clicks ?? 0}</div>
          <p className="text-xs text-muted-foreground">Total link clicks</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Registrations</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{affiliate.registrations ?? 0}</div>
          <p className="text-xs text-muted-foreground">New users via affiliate</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Depositing Users
          </CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{affiliate.depositingUsers ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            {affiliate.registrations ? 
            `${(( (affiliate.depositingUsers ?? 0) / affiliate.registrations) * 100).toFixed(1)}% conversion` 
            : 'N/A conversion'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateStats;

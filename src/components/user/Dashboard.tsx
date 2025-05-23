
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { User, Wallet, CreditCard, Activity, Trophy, Gift } from 'lucide-react';
import { UserRole } from '@/types/user';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'destructive';
      case UserRole.VIP:
        return 'default';
      case UserRole.MODERATOR:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const stats = [
    { icon: Wallet, label: 'Balance', value: '$0.00', color: 'text-green-600' },
    { icon: Activity, label: 'Games Played', value: '0', color: 'text-blue-600' },
    { icon: Trophy, label: 'VIP Level', value: user.vip_level_id || '1', color: 'text-yellow-600' },
    { icon: Gift, label: 'Bonus Points', value: user.user_metadata?.bonus_points || '0', color: 'text-purple-600' },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.username || user.email}</p>
        </div>
        <Badge variant={getRoleBadgeVariant(user.role)}>
          {user.role || 'User'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <p className="font-medium">{user.username || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant="outline">{user.status || 'Active'}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="default">
              Make Deposit
            </Button>
            <Button className="w-full" variant="outline">
              View Transactions
            </Button>
            <Button className="w-full" variant="outline">
              Bonus History
            </Button>
            <Button className="w-full" variant="outline">
              Game History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

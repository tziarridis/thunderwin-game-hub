
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VipLevel, VipBenefit, Bonus, BonusType, BonusStatus } from '@/types';
import { Crown, Gift, Plus } from 'lucide-react';

// Mock data
const mockVipData = {
  benefits: [
    { 
      id: '1', 
      name: 'Priority Support', 
      description: 'Get priority customer support', 
      icon: 'headphones',
      vip_level_id: '1'
    }
  ] as VipBenefit[],
  
  levels: [
    {
      id: '1',
      name: 'Bronze',
      level: 1,
      required_points: 1000,
      points_required: 1000,
      cashback_rate: 0.5,
      weekly_bonus: 10,
      monthly_bonus: 50,
      withdrawal_limit: 1000,
      benefits: [
        { 
          id: '1', 
          name: 'Priority Support', 
          description: 'Get priority customer support', 
          icon: 'headphones',
          vip_level_id: '1'
        }
      ],
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
  ] as VipLevel[],
  
  bonuses: [
    {
      id: '1',
      user_id: 'user-1',
      name: 'Welcome Bonus',
      type: BonusType.DEPOSIT_MATCH,
      amount: 100,
      currency: 'USD',
      status: BonusStatus.ACTIVE,
      terms: 'Wagering requirement: 30x',
      wagering_requirement: 30,
      wagering_remaining: 30,
      expires_at: '2024-12-31T23:59:59Z',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
  ] as Bonus[]
};

const VipBonusManagement = () => {
  const [activeTab, setActiveTab] = React.useState<'vip' | 'bonuses'>('vip');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">VIP & Bonus Management</h1>
          <p className="text-muted-foreground">Manage VIP levels and bonus programs</p>
        </div>
        <div className="flex space-x-2">
          <Button variant={activeTab === 'vip' ? 'default' : 'outline'} onClick={() => setActiveTab('vip')}>
            <Crown className="mr-2 h-4 w-4" />
            VIP Levels
          </Button>
          <Button variant={activeTab === 'bonuses' ? 'default' : 'outline'} onClick={() => setActiveTab('bonuses')}>
            <Gift className="mr-2 h-4 w-4" />
            Bonuses
          </Button>
        </div>
      </div>

      {activeTab === 'vip' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>VIP Levels</CardTitle>
                <CardDescription>Configure VIP tiers and benefits</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add VIP Level
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockVipData.levels.map((level) => (
                  <Card key={level.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Crown className="mr-2 h-5 w-5 text-yellow-500" />
                          {level.name}
                        </CardTitle>
                        <Badge variant="outline">Level {level.level}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Points Required</p>
                        <p className="text-lg font-bold">{level.points_required.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Cashback Rate</p>
                        <p className="text-sm">{level.cashback_rate}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Weekly Bonus</p>
                        <p className="text-sm">${level.weekly_bonus}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Benefits</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {level.benefits.map((benefit) => (
                            <Badge key={benefit.id} variant="secondary" className="text-xs">
                              {benefit.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'bonuses' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Bonuses</CardTitle>
                <CardDescription>Manage bonus campaigns and offers</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Bonus
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockVipData.bonuses.map((bonus) => (
                  <Card key={bonus.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Gift className="h-8 w-8 text-green-500" />
                          <div>
                            <h3 className="font-semibold">{bonus.name}</h3>
                            <p className="text-sm text-muted-foreground">{bonus.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold">${bonus.amount}</p>
                            <Badge variant={bonus.status === BonusStatus.ACTIVE ? 'default' : 'secondary'}>
                              {bonus.status}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VipBonusManagement;

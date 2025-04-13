
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Gift, Zap, Star, Clock, ChevronRight, Award } from 'lucide-react';

const Bonuses = () => {
  const { isAuthenticated, user } = useAuth();

  const activeBonuses = [
    {
      id: 1,
      name: 'Welcome Bonus',
      description: '100% up to $500 on your first deposit',
      amount: 500,
      type: 'deposit',
      progress: 35,
      expiry: '5 days left',
      status: 'active',
      icon: <Gift className="h-8 w-8 text-casino-thunder-green" />
    },
    {
      id: 2,
      name: 'Free Spins Friday',
      description: '50 free spins on Sweet Bonanza',
      amount: 50,
      type: 'free_spins',
      progress: 0,
      expiry: '2 days left',
      status: 'active',
      icon: <Zap className="h-8 w-8 text-yellow-500" />
    }
  ];

  const availableBonuses = [
    {
      id: 3,
      name: 'Reload Bonus',
      description: '50% up to $200 on your next deposit',
      amount: 200,
      minDeposit: 20,
      type: 'reload',
      wageringReq: '35x',
      icon: <Star className="h-8 w-8 text-blue-500" />
    },
    {
      id: 4,
      name: 'Cashback Offer',
      description: '10% cashback on net losses up to $100',
      amount: 100,
      type: 'cashback',
      wageringReq: '1x',
      icon: <Award className="h-8 w-8 text-purple-500" />
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Bonus Hub</h1>
        <p className="text-gray-400">Explore available bonuses and track your active promotions</p>
      </div>

      {!isAuthenticated ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Login to access exclusive bonuses</h2>
          <p className="text-gray-400 mb-6">Create an account or login to claim your bonuses and start playing with extra funds.</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" className="border-casino-thunder-green text-casino-thunder-green hover:bg-casino-thunder-green/20">
              Login
            </Button>
            <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black font-medium">
              Register Now
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Active Bonuses Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Your Active Bonuses</h2>
              <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-white/5">
                Bonus History
              </Button>
            </div>

            {activeBonuses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBonuses.map(bonus => (
                  <Card key={bonus.id} className="bg-white/5 border-white/10 text-white overflow-hidden relative group hover:border-casino-thunder-green/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="p-2 bg-black/20 rounded-lg border border-white/10">
                          {bonus.icon}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-400">{bonus.expiry}</span>
                        </div>
                      </div>
                      <CardTitle className="mt-3">{bonus.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {bonus.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Wagering progress</span>
                          <span className="text-casino-thunder-green">{bonus.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-casino-thunder-green to-green-400 h-2 rounded-full" 
                            style={{ width: `${bonus.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center border-t border-white/10 bg-white/5 pt-4">
                      <div className="text-sm text-gray-400">
                        <span className="text-white font-medium">{bonus.type === 'free_spins' ? `${bonus.amount} Spins` : `$${bonus.amount}`}</span>
                      </div>
                      <Button variant="ghost" className="hover:bg-white/10 p-0 h-8 w-8 rounded-full">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center bg-white/5 border border-white/10 rounded-xl py-12 px-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Gift className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No Active Bonuses</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  You don't have any active bonuses at the moment. Check out available offers below!
                </p>
              </div>
            )}
          </div>

          {/* Available Bonuses Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-semibold text-white">Available Bonuses</h2>
              <div className="px-3 py-1 bg-casino-thunder-green/20 text-casino-thunder-green text-xs rounded-full">
                {availableBonuses.length} offers
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableBonuses.map(bonus => (
                <Card key={bonus.id} className="bg-white/5 border-white/10 text-white overflow-hidden group hover:border-casino-thunder-green/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-black/20 rounded-lg border border-white/10">
                        {bonus.icon}
                      </div>
                    </div>
                    <CardTitle className="mt-3">{bonus.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {bonus.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2 text-sm">
                      {bonus.minDeposit && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Minimum deposit</span>
                          <span className="text-white">${bonus.minDeposit}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Wagering requirement</span>
                        <span className="text-white">{bonus.wageringReq}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-white/10 bg-white/5 pt-4">
                    <Button className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                      Claim Bonus
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Bonuses;

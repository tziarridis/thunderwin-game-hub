
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Play, Gift, Trophy, Zap, Users, Shield } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const features = [
    {
      icon: Play,
      title: 'Premium Games',
      description: 'Access thousands of slots, table games, and live casino experiences'
    },
    {
      icon: Gift,
      title: 'Generous Bonuses',
      description: 'Welcome bonuses, free spins, and daily rewards for all players'
    },
    {
      icon: Trophy,
      title: 'VIP Program',
      description: 'Exclusive perks and rewards for our most valued players'
    },
    {
      icon: Zap,
      title: 'Instant Play',
      description: 'No downloads required - play directly in your browser'
    },
    {
      icon: Users,
      title: 'Live Casino',
      description: 'Real dealers, real-time action with live streaming'
    },
    {
      icon: Shield,
      title: 'Secure & Fair',
      description: 'Licensed, regulated, and provably fair gaming environment'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Welcome to the Ultimate Casino
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Experience the thrill of world-class gaming with premium slots, live dealers, 
            and incredible bonuses. Join thousands of players in the most exciting online casino.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {!isAuthenticated ? (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate('/auth/register')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-bold px-8 py-4 text-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Join Now & Get Bonus
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/auth/login')}
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
                >
                  Sign In
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={() => navigate('/casino')}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-bold px-8 py-4 text-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Play Now
              </Button>
            )}
            
            {isAdmin && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
                className="border-purple-400 text-purple-400 hover:bg-purple-400/10 px-8 py-4 text-lg"
              >
                <Shield className="mr-2 h-5 w-5" />
                Admin Panel
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">10,000+</div>
              <div className="text-blue-200">Games Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-blue-200">Customer Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">98%</div>
              <div className="text-blue-200">Average RTP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why Choose Our Casino?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader className="text-center">
                  <feature.icon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-blue-200 text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Winning?
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Join our community of winners today and claim your welcome bonus. 
            The jackpot is waiting for you!
          </p>
          
          {!isAuthenticated && (
            <Button
              size="lg"
              onClick={() => navigate('/auth/register')}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold px-12 py-6 text-xl"
            >
              <Gift className="mr-2 h-6 w-6" />
              Claim Your Bonus Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

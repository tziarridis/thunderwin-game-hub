
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GameGrid from "@/components/games/GameGrid";
import PromotionSlider from "@/components/promotions/PromotionSlider";
import PromotionCard from "@/components/promotions/PromotionCard";
import DepositButton from "@/components/user/DepositButton";
import { 
  Trophy, 
  Zap, 
  Shield, 
  Clock, 
  Wallet,
  Sparkles,
  Gamepad2,
  Gift,
  Swords
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Promotion } from "@/types";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    // Load promotions from localStorage
    const storedPromotions = localStorage.getItem('promotions');
    if (storedPromotions) {
      const parsedPromotions = JSON.parse(storedPromotions);
      // Only use active promotions and limit to 3
      const activePromotions = parsedPromotions
        .filter((promo: Promotion) => promo.isActive)
        .slice(0, 3);
      setPromotions(activePromotions);
    }
  }, []);

  const handleSignUp = () => {
    if (isAuthenticated) {
      toast("You're already logged in!");
      navigate('/profile');
    } else {
      navigate('/register');
    }
  };

  const handleExploreGames = () => {
    const gamesSection = document.getElementById('games-section');
    if (gamesSection) {
      gamesSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      toast.error("Games section not found");
    }
  };

  const handleViewPromotion = (promotionName: string) => {
    toast.info(`Viewing promotion: ${promotionName}`);
    navigate('/promotions');
  };

  return (
    <div className="bg-casino-thunder-deeper text-white">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-casino-thunder-darker">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1595815771614-ade041640239?auto=format&fit=crop&q=80&w=1280" 
            alt="Casino Background" 
            className="w-full h-full object-cover opacity-30"
          />
          {/* Animated overlay */}
          <div className="absolute inset-0 z-5 bg-gradient-to-b from-casino-deep-black/80 via-transparent to-casino-thunder-darker"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-white block">Experience the</span>
              <span className="text-casino-thunder-green thunder-glow block">Ultimate Thrill</span>
            </h1>
            <p className="text-white/80 text-xl mb-8 leading-relaxed">
              Play the most exciting casino games with incredible bonuses and lightning-fast payouts at ThunderWin
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black text-lg py-7 px-8 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                onClick={handleSignUp}
              >
                {isAuthenticated ? 'Visit Profile' : 'Sign Up Now'}
              </Button>
              <DepositButton variant="highlight" className="text-lg py-7 px-8 rounded-xl font-bold transition-all duration-300 hover:scale-105" />
              <Button 
                variant="outline" 
                className="text-lg py-7 px-8 rounded-xl border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
                onClick={handleExploreGames}
              >
                Explore Games
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-16">
              <FeatureItem 
                icon={<Trophy size={28} />} 
                title="Weekly Tournaments"
                text="Compete for massive prizes" 
                onClick={() => navigate('/casino')}
              />
              <FeatureItem 
                icon={<Zap size={28} />} 
                title="Fast Payouts"
                text="Get your winnings instantly" 
                onClick={() => navigate('/transactions')}
              />
              <FeatureItem 
                icon={<Shield size={28} />} 
                title="Secure Gaming"
                text="Play with confidence" 
                onClick={() => navigate('/vip')}
              />
            </div>
          </div>
        </div>
        
        {/* Animated chips elements */}
        <div className="hidden md:block absolute -right-20 -bottom-20 w-80 h-80 opacity-20 animate-spin-slow pointer-events-none">
          <div className="w-40 h-40 rounded-full bg-casino-thunder-green absolute top-10 left-10"></div>
          <div className="w-24 h-24 rounded-full bg-casino-gold absolute bottom-20 right-20"></div>
          <div className="w-16 h-16 rounded-full bg-casino-royal-blue absolute top-0 right-40"></div>
        </div>
      </section>

      {/* Quick Deposit Banner with pulsing effect */}
      <section className="relative overflow-hidden py-6">
        <div className="absolute inset-0 bg-gradient-to-r from-casino-thunder-green/90 to-casino-thunder-highlight/90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10"></div>
          <div className="absolute inset-0 shimmer-bg"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-black mb-4 md:mb-0">
              <h3 className="text-2xl font-extrabold">Ready to Play?</h3>
              <p className="text-black/80 font-medium">Make a deposit and claim your bonus now!</p>
            </div>
            <div className="flex gap-3">
              <Button 
                className="bg-black hover:bg-gray-900 text-white font-bold px-6 py-2.5 rounded-lg"
                onClick={() => navigate('/promotions')}
              >
                View Bonuses
              </Button>
              <DepositButton className="bg-white hover:bg-gray-100 text-black font-bold px-6 py-2.5 rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Slider */}
      <section className="bg-casino-thunder-dark py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <Sparkles className="mr-3 text-casino-thunder-green" />
            Featured Promotions
          </h2>
          <PromotionSlider />
        </div>
      </section>

      {/* Popular Games */}
      <section id="games-section" className="bg-casino-thunder-dark py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <Gamepad2 className="mr-3 text-casino-thunder-green" />
            Featured Games
          </h2>
          <GameGrid />
        </div>
      </section>

      {/* Why Choose ThunderWin */}
      <section className="py-20 bg-gradient-to-b from-casino-thunder-dark to-casino-thunder-deeper">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white text-center mb-16">
            Why Choose <span className="text-casino-thunder-green thunder-glow">ThunderWin</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <WhyChooseCard 
              icon={<Zap size={40} />}
              title="Lightning Fast Payouts"
              description="Get your winnings quickly with our rapid withdrawal system that processes in minutes, not days."
              onClick={() => navigate('/transactions')}
            />
            <WhyChooseCard 
              icon={<Gift size={40} />}
              title="Generous Bonuses"
              description="Enjoy massive welcome bonuses, free spins, and regular promotions to boost your bankroll."
              onClick={() => navigate('/promotions')}
            />
            <WhyChooseCard 
              icon={<Shield size={40} />}
              title="Safe & Secure"
              description="Play with confidence on our fully encrypted platform with advanced security measures."
              onClick={() => navigate('/settings')}
            />
            <WhyChooseCard 
              icon={<Clock size={40} />}
              title="24/7 Support"
              description="Our friendly support team is always available to assist you with any questions or concerns."
              onClick={() => {
                toast.info("Support is available 24/7");
                navigate('/settings');
              }}
            />
          </div>
        </div>
      </section>

      {/* More Promotions */}
      <section className="bg-casino-thunder-dark py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <Gift className="mr-3 text-casino-thunder-green" />
              Current Promotions
            </h2>
            <Link to="/promotions" className="text-casino-thunder-green hover:text-casino-thunder-highlight font-semibold text-lg">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {promotions.length > 0 ? (
              promotions.map((promotion) => (
                <PromotionCard 
                  key={promotion.id}
                  title={promotion.title}
                  description={promotion.description}
                  image={promotion.image}
                  endDate={promotion.endDate}
                  onClick={() => handleViewPromotion(promotion.title)}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-16 glass-card">
                <p className="text-white/70 text-lg">No active promotions at the moment. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Games Categories Section */}
      <section className="py-16 bg-casino-thunder-darker">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <Swords className="mr-3 text-casino-thunder-green" />
            Game Categories
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GameCategoryCard 
              title="Slots"
              description="Hundreds of slot games with massive jackpots"
              icon={<Gamepad2 size={32} />}
              onClick={() => navigate('/casino/slots')}
            />
            <GameCategoryCard 
              title="Table Games"
              description="Classic casino tables with modern twists"
              icon={<Trophy size={32} />}
              onClick={() => navigate('/casino/table-games')}
            />
            <GameCategoryCard 
              title="Live Casino"
              description="Real dealers, real-time action, real winnings"
              icon={<Zap size={32} />}
              onClick={() => navigate('/casino/live-casino')}
            />
            <GameCategoryCard 
              title="Sports Betting"
              description="Bet on all major sports events worldwide"
              icon={<Swords size={32} />}
              onClick={() => navigate('/sports')}
            />
          </div>
        </div>
      </section>

      {/* Floating Deposit Button */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <DepositButton variant="icon" className="shadow-lg w-14 h-14" />
      </div>

      {/* CTA Section */}
      <section className="py-20 overflow-hidden relative">
        <div className="absolute inset-0 bg-casino-thunder-green/90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 shimmer-bg"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-6">
            Ready to Start Winning?
          </h2>
          <p className="text-black/80 text-xl mb-10 max-w-3xl mx-auto font-medium">
            Join ThunderWin today and experience the most electrifying online casino. Get started with a massive welcome bonus!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button 
              className="bg-black hover:bg-gray-900 text-white text-xl py-7 px-10 rounded-xl font-bold transition-all duration-300 hover:scale-105"
              onClick={handleSignUp}
            >
              {isAuthenticated ? 'Visit Your Account' : 'Create Account'}
            </Button>
            <DepositButton variant="highlight" className="bg-white hover:bg-gray-100 text-black text-xl py-7 px-10 rounded-xl font-bold transition-all duration-300 hover:scale-105" />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureItem = ({ 
  icon, 
  title,
  text, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string;
  text: string;
  onClick?: () => void;
}) => (
  <div 
    className="glass-card p-6 cursor-pointer hover:translate-y-[-5px] transition-all duration-300" 
    onClick={onClick}
  >
    <div className="text-casino-thunder-green mb-4">
      {icon}
    </div>
    <h3 className="font-bold text-xl mb-2">{title}</h3>
    <p className="text-white/70">{text}</p>
  </div>
);

const WhyChooseCard = ({ 
  icon, 
  title, 
  description,
  onClick
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  onClick?: () => void;
}) => (
  <div 
    className="glass-card p-8 text-center cursor-pointer hover:translate-y-[-5px] transition-all duration-300" 
    onClick={onClick}
  >
    <div className="text-casino-thunder-green mb-6 flex justify-center">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
    <p className="text-white/70 leading-relaxed">{description}</p>
  </div>
);

const GameCategoryCard = ({
  title,
  description,
  icon,
  onClick
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) => (
  <div 
    className="glass-card p-6 cursor-pointer hover:translate-y-[-5px] transition-all duration-300"
    onClick={onClick}
  >
    <div className="bg-casino-thunder-green/10 w-16 h-16 rounded-full flex items-center justify-center text-casino-thunder-green mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-white/70">{description}</p>
  </div>
);

export default Index;

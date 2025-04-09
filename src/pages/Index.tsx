
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GameGrid from "@/components/games/GameGrid";
import PromotionSlider from "@/components/promotions/PromotionSlider";
import PromotionCard from "@/components/promotions/PromotionCard";
import { 
  Trophy, 
  Zap, 
  Shield, 
  Clock, 
  Wallet,
  DollarSign
} from "lucide-react";

const Index = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-casino-thunder-darker py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1595815771614-ade041640239?auto=format&fit=crop&q=80&w=1280" 
            alt="Casino Background" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Welcome to <span className="text-casino-thunder-green thunder-glow">ThunderWin</span>
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Experience the thrill of lightning-fast gaming with incredible bonuses and the most exciting casino games.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black text-lg py-6 px-8">
                Sign Up Now
              </Button>
              <Button variant="outline" className="text-lg py-6 px-8">
                Explore Games
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
              <FeatureItem icon={<Trophy />} text="Weekly Tournaments" />
              <FeatureItem icon={<Zap />} text="Fast Payouts" />
              <FeatureItem icon={<Shield />} text="Secure Gaming" />
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Slider */}
      <section className="bg-casino-thunder-dark py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Zap className="mr-2 text-casino-thunder-green" />
            Featured Promotions
          </h2>
          <PromotionSlider />
        </div>
      </section>

      {/* Popular Games */}
      <section className="bg-casino-thunder-dark py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Trophy className="mr-2 text-casino-thunder-green" />
            Featured Games
          </h2>
          <GameGrid />
        </div>
      </section>

      {/* Why Choose ThunderWin */}
      <section className="py-16 bg-gradient-to-b from-casino-thunder-dark to-casino-thunder-darker">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-white text-center mb-12">
            Why Choose <span className="text-casino-thunder-green">ThunderWin</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <WhyChooseCard 
              icon={<Zap size={40} />}
              title="Lightning Fast Payouts"
              description="Get your winnings quickly with our rapid withdrawal system."
            />
            <WhyChooseCard 
              icon={<Wallet size={40} />}
              title="Generous Bonuses"
              description="Enjoy massive welcome bonuses and regular promotions."
            />
            <WhyChooseCard 
              icon={<Shield size={40} />}
              title="Safe & Secure"
              description="Play with confidence on our fully encrypted platform."
            />
            <WhyChooseCard 
              icon={<Clock size={40} />}
              title="24/7 Support"
              description="Our support team is always available to assist you."
            />
          </div>
        </div>
      </section>

      {/* More Promotions */}
      <section className="bg-casino-thunder-dark py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <DollarSign className="mr-2 text-casino-thunder-green" />
              Current Promotions
            </h2>
            <Link to="/promotions" className="text-casino-thunder-green hover:text-casino-thunder-highlight">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PromotionCard 
              title="Welcome Bonus"
              description="Get a 100% match up to $1,000 + 50 free spins on your first deposit."
              image="https://images.unsplash.com/photo-1596731490442-1533cf2a1f18?auto=format&fit=crop&q=80&w=400"
              endDate="Ongoing"
            />
            <PromotionCard 
              title="Thunder Thursday"
              description="Every Thursday, get 50 free spins when you deposit $50 or more."
              image="https://images.unsplash.com/photo-1587302273406-7104978770d2?auto=format&fit=crop&q=80&w=400"
              endDate="Every Thursday"
            />
            <PromotionCard 
              title="Weekend Reload"
              description="Reload your account during weekends and get a 75% bonus up to $500."
              image="https://images.unsplash.com/photo-1593183630166-2b4c86293796?auto=format&fit=crop&q=80&w=400"
              endDate="Every Weekend"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-casino-thunder-green">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">
            Ready to Start Winning?
          </h2>
          <p className="text-black/80 text-lg mb-8 max-w-2xl mx-auto">
            Join ThunderWin today and experience the most electrifying online casino. Get started with a massive welcome bonus!
          </p>
          <Button className="bg-black hover:bg-gray-900 text-white text-lg py-6 px-8">
            Create Account
          </Button>
        </div>
      </section>
    </div>
  );
};

const FeatureItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center space-x-2">
    <div className="text-casino-thunder-green">
      {icon}
    </div>
    <span className="text-white/80 text-sm">{text}</span>
  </div>
);

const WhyChooseCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="bg-casino-thunder-gray/50 border border-white/5 rounded-lg p-6 text-center hover:border-casino-thunder-green/30 transition-all duration-300">
    <div className="text-casino-thunder-green mb-4 flex justify-center">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-white/70">{description}</p>
  </div>
);

export default Index;

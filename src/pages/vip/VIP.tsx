
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  BadgeDollarSign, 
  Gift, 
  Trophy, 
  Clock, 
  Star, 
  Zap,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import DepositButton from "@/components/user/DepositButton";

const VIP = () => {
  const { isAuthenticated, user } = useAuth();

  const handleJoinVIP = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to join the VIP program");
      return;
    }
    toast.success("VIP request sent! Our team will contact you soon.");
  };

  return (
    <div className="bg-casino-thunder-darker min-h-screen pt-8 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            VIP <span className="text-casino-thunder-green thunder-glow">Program</span>
          </h1>
          <p className="text-white/70 text-lg mb-8">
            Join our exclusive VIP program and enjoy special benefits, personalized service, and enhanced rewards.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button 
              className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black text-lg py-6 px-8"
              onClick={handleJoinVIP}
            >
              <Star className="mr-2 h-5 w-5" />
              Join VIP
            </Button>
            
            <DepositButton variant="highlight" className="text-lg py-6 px-8" />
          </div>
        </div>
        
        {/* VIP Levels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <VIPCard 
            title="Gold"
            description="Start your VIP journey with enhanced rewards and special access."
            features={[
              "5% Weekly Cashback",
              "Dedicated Account Manager",
              "Faster Withdrawals",
              "Birthday Bonus"
            ]}
            icon={<BadgeDollarSign size={40} />}
            buttonLabel="Join Gold"
            onClick={handleJoinVIP}
          />
          
          <VIPCard 
            title="Platinum"
            description="Elevate your experience with premium rewards and exclusive events."
            features={[
              "10% Weekly Cashback",
              "Premium Account Manager",
              "Exclusive Tournaments",
              "Luxury Gifts",
              "Higher Betting Limits"
            ]}
            icon={<Trophy size={40} />}
            highlighted
            buttonLabel="Join Platinum"
            onClick={handleJoinVIP}
          />
          
          <VIPCard 
            title="Diamond"
            description="The ultimate VIP experience with unmatched perks and rewards."
            features={[
              "15% Weekly Cashback",
              "VIP Host Available 24/7",
              "Invitation to VIP Events",
              "Personalized Bonuses",
              "Priority Support",
              "Luxury Travel Packages"
            ]}
            icon={<Star size={40} />}
            buttonLabel="Join Diamond"
            onClick={handleJoinVIP}
          />
        </div>
        
        {/* VIP Benefits */}
        <div className="bg-casino-thunder-dark rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Gift className="mr-3 text-casino-thunder-green" />
            VIP Benefits
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitItem 
              icon={<Clock />}
              title="Fast Withdrawals"
              description="VIP members enjoy expedited withdrawal processing times."
            />
            <BenefitItem 
              icon={<Gift />}
              title="Exclusive Bonuses"
              description="Special promotions and bonuses available only to VIP members."
            />
            <BenefitItem 
              icon={<BadgeDollarSign />}
              title="Higher Limits"
              description="Enjoy increased deposit and betting limits."
            />
            <BenefitItem 
              icon={<Trophy />}
              title="VIP Events"
              description="Invitations to exclusive events and tournaments."
            />
            <BenefitItem 
              icon={<Star />}
              title="Personal Manager"
              description="Dedicated account manager for personalized service."
            />
            <BenefitItem 
              icon={<Zap />}
              title="Tailored Rewards"
              description="Custom bonuses based on your playing preferences."
            />
          </div>
        </div>
        
        {/* How to Qualify */}
        <div className="bg-casino-thunder-dark rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">How to Qualify</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-casino-thunder-green text-black rounded-full flex items-center justify-center mr-4">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Create an Account</h3>
                <p className="text-white/70">Sign up and verify your account at ThunderWin.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-casino-thunder-green text-black rounded-full flex items-center justify-center mr-4">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Make Deposits</h3>
                <p className="text-white/70">Fund your account and start playing your favorite games.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-casino-thunder-green text-black rounded-full flex items-center justify-center mr-4">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Play Regularly</h3>
                <p className="text-white/70">The more you play, the faster you'll qualify for VIP status.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-casino-thunder-green text-black rounded-full flex items-center justify-center mr-4">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Get Invited</h3>
                <p className="text-white/70">Our team will recognize your activity and invite you to the VIP program.</p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Button 
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                onClick={handleJoinVIP}
              >
                <Star className="mr-2 h-4 w-4" />
                Request VIP Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VIPCard = ({ 
  title, 
  description, 
  features, 
  icon, 
  highlighted = false,
  buttonLabel,
  onClick
}: { 
  title: string; 
  description: string; 
  features: string[]; 
  icon: React.ReactNode; 
  highlighted?: boolean;
  buttonLabel: string;
  onClick: () => void;
}) => (
  <Card className={`overflow-hidden ${
    highlighted 
      ? 'border-casino-thunder-green bg-casino-thunder-gray/50 transform scale-105 shadow-lg shadow-casino-thunder-green/20' 
      : 'bg-casino-thunder-dark border-white/10'
  }`}>
    <CardHeader className={`${highlighted ? 'bg-casino-thunder-green text-black' : ''}`}>
      <div className="flex justify-between items-center">
        <CardTitle className="text-xl">{title}</CardTitle>
        <div className="text-casino-thunder-green">
          {highlighted ? <div className="text-black">{icon}</div> : icon}
        </div>
      </div>
      <CardDescription className={highlighted ? 'text-black/80' : 'text-white/60'}>
        {description}
      </CardDescription>
    </CardHeader>
    <CardContent className="pt-6">
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="mr-2 h-4 w-4 text-casino-thunder-green" />
            <span className="text-white/80">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button 
        className={`w-full ${
          highlighted 
            ? 'bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black' 
            : 'bg-transparent border border-casino-thunder-green text-casino-thunder-green hover:bg-casino-thunder-green hover:text-black'
        }`}
        onClick={onClick}
      >
        {buttonLabel}
      </Button>
    </CardFooter>
  </Card>
);

const BenefitItem = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="flex items-start p-4 bg-casino-thunder-gray/30 rounded-lg border border-white/5">
    <div className="flex-shrink-0 text-casino-thunder-green mr-4 mt-1">
      {icon}
    </div>
    <div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-white/70 text-sm">{description}</p>
    </div>
  </div>
);

export default VIP;

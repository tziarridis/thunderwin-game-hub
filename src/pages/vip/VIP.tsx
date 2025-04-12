
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
  ChevronRight,
  Crown,
  Shield,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import DepositButton from "@/components/user/DepositButton";
import { motion } from "framer-motion";

const VIP = () => {
  const { isAuthenticated, user } = useAuth();

  const handleJoinVIP = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to join the VIP program");
      return;
    }
    toast.success("VIP request sent! Our team will contact you soon.");
  };

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="bg-gradient-to-b from-casino-thunder-darker to-black min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="relative inline-block mb-8">
            <Crown className="text-casino-gold w-12 h-12 mb-2 mx-auto animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              VIP <span className="text-casino-thunder-green thunder-glow">Program</span>
            </h1>
            <div className="absolute -z-10 w-64 h-64 bg-casino-thunder-green/10 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Join our exclusive VIP program and enjoy premium benefits, personalized service, 
            and enhanced rewards tailored to your gaming style.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black text-lg py-7 px-8 rounded-xl shadow-lg shadow-casino-thunder-green/20"
                onClick={handleJoinVIP}
              >
                <Crown className="mr-2 h-5 w-5" />
                Join VIP Program
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Fixed the variant here to use a proper variant */}
              <DepositButton variant="default" className="text-lg py-7 px-8 rounded-xl bg-transparent border-2 border-casino-thunder-green/50 hover:bg-casino-thunder-green/10" />
            </motion.div>
          </div>
        </motion.div>
        
        {/* VIP Levels */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          <motion.div variants={itemVariants}>
            <VIPCard 
              title="Gold VIP"
              description="Begin your premium journey with enhanced rewards and special access."
              features={[
                "5% Weekly Cashback",
                "Dedicated Account Manager",
                "Faster Withdrawals",
                "Birthday Bonus",
                "Monthly Reload Bonus"
              ]}
              icon={<BadgeDollarSign size={44} className="text-casino-gold" />}
              color="gold"
              buttonLabel="Join Gold VIP"
              onClick={handleJoinVIP}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <VIPCard 
              title="Platinum VIP"
              description="Elevate your experience with premium rewards and exclusive events."
              features={[
                "10% Weekly Cashback",
                "Premium Account Manager",
                "Exclusive Tournaments",
                "Luxury Gifts",
                "Higher Betting Limits",
                "Monthly Free Spins"
              ]}
              icon={<Trophy size={44} />}
              highlighted
              buttonLabel="Join Platinum VIP"
              onClick={handleJoinVIP}
              color="platinum"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <VIPCard 
              title="Diamond VIP"
              description="The ultimate VIP experience with unmatched perks and rewards."
              features={[
                "15% Weekly Cashback",
                "VIP Host Available 24/7",
                "Invitation to VIP Events",
                "Personalized Bonuses",
                "Priority Support",
                "Luxury Travel Packages",
                "Custom Payment Plans"
              ]}
              icon={<Sparkles size={44} className="text-blue-400" />}
              buttonLabel="Join Diamond VIP"
              onClick={handleJoinVIP}
              color="diamond"
            />
          </motion.div>
        </motion.div>
        
        {/* VIP Benefits */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
          className="glass-card p-10 mb-20"
        >
          <div className="flex items-center mb-10">
            <div className="bg-casino-thunder-green/20 p-3 rounded-full mr-4">
              <Gift className="text-casino-thunder-green h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold text-white">VIP Benefits</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitItem 
              icon={<Clock />}
              title="Fast Withdrawals"
              description="VIP members enjoy expedited withdrawal processing times with priority handling."
            />
            <BenefitItem 
              icon={<Gift />}
              title="Exclusive Bonuses"
              description="Special promotions and bonuses available only to VIP members with lower wagering requirements."
            />
            <BenefitItem 
              icon={<BadgeDollarSign />}
              title="Higher Limits"
              description="Enjoy increased deposit and betting limits tailored to your VIP level."
            />
            <BenefitItem 
              icon={<Trophy />}
              title="VIP Events"
              description="Invitations to exclusive events, tournaments, and real-world experiences."
            />
            <BenefitItem 
              icon={<Star />}
              title="Personal Manager"
              description="Dedicated account manager for personalized service available when you need them."
            />
            <BenefitItem 
              icon={<Zap />}
              title="Tailored Rewards"
              description="Custom bonuses based on your playing preferences and gaming history."
            />
          </div>
        </motion.div>
        
        {/* How to Qualify */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true, amount: 0.2 }}
          className="glass-card p-10 mb-10"
        >
          <div className="flex items-center mb-10">
            <div className="bg-casino-thunder-green/20 p-3 rounded-full mr-4">
              <Shield className="text-casino-thunder-green h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold text-white">How to Qualify</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-casino-thunder-green to-green-400 text-black rounded-full flex items-center justify-center mr-5 shadow-lg shadow-casino-thunder-green/20">
                  <span className="text-lg font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Create an Account</h3>
                  <p className="text-white/70 leading-relaxed">Sign up and verify your account at ThunderWin to begin your journey.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-casino-thunder-green to-green-400 text-black rounded-full flex items-center justify-center mr-5 shadow-lg shadow-casino-thunder-green/20">
                  <span className="text-lg font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Make Deposits</h3>
                  <p className="text-white/70 leading-relaxed">Fund your account and start playing your favorite games to build your VIP status.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-casino-thunder-green to-green-400 text-black rounded-full flex items-center justify-center mr-5 shadow-lg shadow-casino-thunder-green/20">
                  <span className="text-lg font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Play Regularly</h3>
                  <p className="text-white/70 leading-relaxed">The more you play, the faster you'll qualify for VIP status and advance through the levels.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-casino-thunder-green to-green-400 text-black rounded-full flex items-center justify-center mr-5 shadow-lg shadow-casino-thunder-green/20">
                  <span className="text-lg font-bold">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Get Invited</h3>
                  <p className="text-white/70 leading-relaxed">Our team will recognize your activity and invite you to the VIP program with a custom welcome bonus.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button 
                className="bg-gradient-to-r from-casino-thunder-green to-green-400 hover:from-green-400 hover:to-casino-thunder-green text-black text-lg px-8 py-6 rounded-xl shadow-lg shadow-casino-thunder-green/20"
                onClick={handleJoinVIP}
              >
                <Crown className="mr-2 h-5 w-5" />
                Request VIP Status
              </Button>
            </motion.div>
          </div>
        </motion.div>
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
  onClick,
  color = 'default'
}: { 
  title: string; 
  description: string; 
  features: string[]; 
  icon: React.ReactNode; 
  highlighted?: boolean;
  buttonLabel: string;
  onClick: () => void;
  color?: 'gold' | 'platinum' | 'diamond' | 'default';
}) => {
  const getBgGradient = () => {
    switch(color) {
      case 'gold':
        return 'bg-gradient-to-b from-yellow-700/40 to-yellow-900/30';
      case 'platinum':
        return 'bg-gradient-to-b from-slate-500/40 to-slate-700/30';
      case 'diamond':
        return 'bg-gradient-to-b from-blue-700/40 to-blue-900/30';
      default:
        return 'bg-casino-thunder-dark';
    }
  };

  const getHeaderGradient = () => {
    if (!highlighted) return '';
    
    switch(color) {
      case 'gold':
        return 'bg-gradient-to-r from-yellow-600 to-yellow-400';
      case 'platinum':
        return 'bg-gradient-to-r from-slate-400 to-slate-300';
      case 'diamond':
        return 'bg-gradient-to-r from-blue-500 to-blue-400';
      default:
        return 'bg-casino-thunder-green';
    }
  };

  return (
    <Card className={`overflow-hidden rounded-xl border-0 ${
      highlighted 
        ? `transform scale-105 shadow-xl ${getBgGradient()} backdrop-blur-sm` 
        : `${getBgGradient()} border-white/5`
    }`}>
      <CardHeader className={`${highlighted ? `${getHeaderGradient()} text-black` : ''}`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <div className={highlighted ? 'text-black' : 'text-casino-thunder-green'}>
            {icon}
          </div>
        </div>
        <CardDescription className={`${highlighted ? 'text-black/90' : 'text-white/70'} text-base`}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <motion.li 
              key={index} 
              className="flex items-center"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ChevronRight className="mr-2 h-4 w-4 text-casino-thunder-green" />
              <span className="text-white/90">{feature}</span>
            </motion.li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full py-6 ${
            highlighted 
              ? 'bg-gradient-to-r from-casino-thunder-green to-green-400 hover:from-green-400 hover:to-casino-thunder-green text-black shadow-lg shadow-casino-thunder-green/20' 
              : 'bg-transparent border border-casino-thunder-green text-casino-thunder-green hover:bg-casino-thunder-green/10'
          }`}
          onClick={onClick}
        >
          {buttonLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};

const BenefitItem = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="flex items-start p-6 bg-white/5 rounded-xl border border-white/10 hover:border-casino-thunder-green/30 transition-colors duration-300"
  >
    <div className="flex-shrink-0 text-casino-thunder-green mr-4 mt-1">
      {icon}
    </div>
    <div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
  </motion.div>
);

export default VIP;

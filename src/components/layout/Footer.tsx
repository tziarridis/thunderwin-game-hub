
import { Link } from "react-router-dom";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  CreditCard,
  Lock,
  Award,
  Globe,
  DollarSign
} from "lucide-react";
import { scrollToTop } from "../../utils/scrollUtils";
import { useNavigate } from "react-router-dom";
import { navigateByButtonName } from "../../utils/navigationUtils";
import { toast } from "sonner";

const Footer = () => {
  const navigate = useNavigate();
  
  const handleNavigate = (path: string) => {
    console.log(`Footer navigating to: ${path}`);
    navigate(path);
    scrollToTop();
  };
  
  const handleSocialClick = (platform: string) => {
    toast.success(`Following ${platform}!`);
  };
  
  const handleTextNavigation = (text: string) => {
    navigateByButtonName(text, navigate);
    scrollToTop();
  };
  
  return (
    <footer className="bg-casino-thunder-darker border-t border-white/5 pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Payment Methods */}
        <div className="mb-10">
          <h4 className="text-sm uppercase text-white/70 mb-4 font-medium">Payment Methods</h4>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            <PaymentMethodCard icon={<CreditCard className="h-6 w-6" />} name="Credit Card" />
            <PaymentMethodCard icon={<DollarSign className="h-6 w-6" />} name="Bitcoin" />
            <PaymentMethodCard icon={<DollarSign className="h-6 w-6" />} name="Ethereum" />
            <PaymentMethodCard icon={<CreditCard className="h-6 w-6" />} name="Bank Transfer" />
            <PaymentMethodCard icon={<CreditCard className="h-6 w-6" />} name="E-Wallet" />
            <PaymentMethodCard icon={<CreditCard className="h-6 w-6" />} name="Vouchers" />
          </div>
        </div>
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img 
                src="/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png" 
                alt="ThunderWin" 
                className="h-8 w-auto thunder-glow"
                onClick={() => handleNavigate("/")}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <p className="text-white/70 text-sm mb-4">
              ThunderWin offers the best online casino experience with a vast selection of games, 
              reliable payments, and generous bonuses.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Facebook size={18} />} onClick={() => handleSocialClick("Facebook")} />
              <SocialIcon icon={<Twitter size={18} />} onClick={() => handleSocialClick("Twitter")} />
              <SocialIcon icon={<Instagram size={18} />} onClick={() => handleSocialClick("Instagram")} />
              <SocialIcon icon={<Youtube size={18} />} onClick={() => handleSocialClick("YouTube")} />
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Casino</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("All Casino Games")}
                >
                  All Casino Games
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Slots")}
                >
                  Slots
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Live Casino")}
                >
                  Live Casino
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Table Games")}
                >
                  Table Games
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Jackpots")}
                >
                  Jackpots
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Sports</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("All Sports")}
                >
                  All Sports
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Football")}
                >
                  Football
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Basketball")}
                >
                  Basketball
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Tennis")}
                >
                  Tennis
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Hockey")}
                >
                  Hockey
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("eSports")}
                >
                  eSports
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Help Center")}
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("FAQ")}
                >
                  FAQ
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Responsible Gaming")}
                >
                  Responsible Gaming
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Terms & Conditions")}
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Privacy Policy")}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Contact Us")}
                >
                  Contact Us
                </button>
              </li>
              
              <li className="pt-4 mt-2 border-t border-white/10">
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleTextNavigation("Admin Login")}
                >
                  Admin Login
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 my-10">
          <TrustBadge icon={<Lock />} text="Secure Payments" />
          <TrustBadge icon={<Award />} text="Licensed & Regulated" />
          <TrustBadge icon={<Globe />} text="24/7 Support" />
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6 mt-6 text-center">
          <p className="text-white/50 text-xs">
            © {new Date().getFullYear()} ThunderWin. All rights reserved. 18+. Play responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ text, to }: { text: string; to: string }) => (
  <li>
    <Link 
      to={to} 
      className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm"
      onClick={scrollToTop}
    >
      {text}
    </Link>
  </li>
);

const SocialIcon = ({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) => (
  <button 
    className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-casino-thunder-green hover:text-black transition-colors"
    onClick={onClick}
  >
    {icon}
  </button>
);

const PaymentMethodCard = ({ icon, name }: { icon: React.ReactNode; name: string }) => (
  <div className="bg-white/5 rounded-md py-3 px-4 flex flex-col items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
    {icon}
    <span className="text-xs text-white/70 mt-1">{name}</span>
  </div>
);

const TrustBadge = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center">
    <div className="text-casino-thunder-green mr-2">
      {icon}
    </div>
    <span className="text-white/80 text-sm">{text}</span>
  </div>
);

export default Footer;

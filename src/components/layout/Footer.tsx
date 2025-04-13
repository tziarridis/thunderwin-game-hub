
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

const Footer = () => {
  const navigate = useNavigate();
  
  const handleNavigate = (path: string) => {
    navigate(path);
    scrollToTop();
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
              <SocialIcon icon={<Facebook size={18} />} />
              <SocialIcon icon={<Twitter size={18} />} />
              <SocialIcon icon={<Instagram size={18} />} />
              <SocialIcon icon={<Youtube size={18} />} />
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Casino</h4>
            <ul className="space-y-2">
              <FooterLink text="All Casino Games" to="/casino" />
              <FooterLink text="Slots" to="/casino/slots" />
              <FooterLink text="Live Casino" to="/casino/live-casino" />
              <FooterLink text="Table Games" to="/casino/table-games" />
              <FooterLink text="Jackpots" to="/casino/jackpots" />
              <FooterLink text="Providers" to="/casino/providers" />
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Sports</h4>
            <ul className="space-y-2">
              <FooterLink text="All Sports" to="/sports" />
              <FooterLink text="Football" to="/sports/football" />
              <FooterLink text="Basketball" to="/sports/basketball" />
              <FooterLink text="Tennis" to="/sports/tennis" />
              <FooterLink text="Hockey" to="/sports/hockey" />
              <FooterLink text="eSports" to="/sports/esports" />
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleNavigate("/support/help")}
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  className="text-white/70 hover:text-casino-thunder-green transition-colors text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                  onClick={() => handleNavigate("/support/faq")}
                >
                  FAQ
                </button>
              </li>
              <FooterLink text="Responsible Gaming" to="/support/responsible-gaming" />
              <FooterLink text="Terms & Conditions" to="/legal/terms" />
              <FooterLink text="Privacy Policy" to="/legal/privacy" />
              <FooterLink text="Contact Us" to="/support/contact" />
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

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
  <a 
    href="#" 
    className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-casino-thunder-green hover:text-black transition-colors"
  >
    {icon}
  </a>
);

const PaymentMethodCard = ({ icon, name }: { icon: React.ReactNode; name: string }) => (
  <div className="bg-white/5 rounded-md py-3 px-4 flex flex-col items-center justify-center">
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

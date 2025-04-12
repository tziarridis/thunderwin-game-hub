
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, MessageSquare, Shield, FileText, Book, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const HelpCenterPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex justify-center mb-4">
          <div className="bg-casino-thunder-green/20 p-4 rounded-full">
            <HelpCircle size={40} className="text-casino-thunder-green" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Help Center</h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          Welcome to our Help Center. Find answers to common questions, get support, or learn more about our services.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="bg-casino-thunder-gray/30 border border-white/5 hover:border-casino-thunder-green transition-colors">
          <CardContent className="p-6">
            <div className="text-casino-thunder-green mb-4">
              <HelpCircle size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-white/70 mb-4">
              Find answers to common questions about account management, games, payments, and more.
            </p>
            <Link to="/support/faq">
              <Button className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                View FAQs
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-casino-thunder-gray/30 border border-white/5 hover:border-casino-thunder-green transition-colors">
          <CardContent className="p-6">
            <div className="text-casino-thunder-green mb-4">
              <MessageSquare size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">Contact Support</h2>
            <p className="text-white/70 mb-4">
              Our support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <Link to="/support/contact">
              <Button className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                Contact Us
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-casino-thunder-gray/30 border border-white/5 hover:border-casino-thunder-green transition-colors">
          <CardContent className="p-6">
            <div className="text-casino-thunder-green mb-4">
              <Shield size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">Responsible Gaming</h2>
            <p className="text-white/70 mb-4">
              Learn about our responsible gaming tools and resources to help keep gambling fun and under control.
            </p>
            <Link to="/support/responsible-gaming">
              <Button className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                Learn More
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-casino-thunder-gray/30 border border-white/5 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">Common Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <Link to="/support/faq?topic=account" className="flex items-center p-3 hover:bg-white/5 rounded-md transition-colors">
            <div className="bg-white/10 p-2 rounded-md mr-3">
              <HelpCircle size={16} />
            </div>
            <span>Account Management</span>
          </Link>
          
          <Link to="/support/faq?topic=payments" className="flex items-center p-3 hover:bg-white/5 rounded-md transition-colors">
            <div className="bg-white/10 p-2 rounded-md mr-3">
              <HelpCircle size={16} />
            </div>
            <span>Deposits & Withdrawals</span>
          </Link>
          
          <Link to="/support/faq?topic=games" className="flex items-center p-3 hover:bg-white/5 rounded-md transition-colors">
            <div className="bg-white/10 p-2 rounded-md mr-3">
              <HelpCircle size={16} />
            </div>
            <span>Games & Betting</span>
          </Link>
          
          <Link to="/support/faq?topic=bonuses" className="flex items-center p-3 hover:bg-white/5 rounded-md transition-colors">
            <div className="bg-white/10 p-2 rounded-md mr-3">
              <HelpCircle size={16} />
            </div>
            <span>Bonuses & Promotions</span>
          </Link>
          
          <Link to="/support/faq?topic=security" className="flex items-center p-3 hover:bg-white/5 rounded-md transition-colors">
            <div className="bg-white/10 p-2 rounded-md mr-3">
              <HelpCircle size={16} />
            </div>
            <span>Security & Privacy</span>
          </Link>
          
          <Link to="/support/faq?topic=vip" className="flex items-center p-3 hover:bg-white/5 rounded-md transition-colors">
            <div className="bg-white/10 p-2 rounded-md mr-3">
              <HelpCircle size={16} />
            </div>
            <span>VIP Program</span>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-casino-thunder-gray/30 border border-white/5">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FileText className="mr-2" size={20} />
              Legal Information
            </h2>
            <ul className="space-y-3">
              <li>
                <Link to="/legal/terms" className="text-white/80 hover:text-casino-thunder-green flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="text-white/80 hover:text-casino-thunder-green flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/support/responsible-gaming" className="text-white/80 hover:text-casino-thunder-green flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  Responsible Gaming Policy
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="bg-casino-thunder-gray/30 border border-white/5">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Book className="mr-2" size={20} />
              Guides & Tutorials
            </h2>
            <ul className="space-y-3">
              <li>
                <Link to="/support/faq?topic=getting-started" className="text-white/80 hover:text-casino-thunder-green flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  Getting Started Guide
                </Link>
              </li>
              <li>
                <Link to="/support/faq?topic=deposits" className="text-white/80 hover:text-casino-thunder-green flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  How to Make a Deposit
                </Link>
              </li>
              <li>
                <Link to="/support/faq?topic=withdrawals" className="text-white/80 hover:text-casino-thunder-green flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  How to Request a Withdrawal
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpCenterPage;

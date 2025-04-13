
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  HelpCircle, 
  MessageSquare, 
  Shield, 
  FileText, 
  Book, 
  ExternalLink, 
  Search,
  TicketCheck,
  DollarSign,
  CreditCard,
  Lock,
  Gift,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Search functionality would be implemented here
  };

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
      
      {/* Search Bar - Made more prominent */}
      <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for answers..."
            className="pl-10 py-6 bg-casino-thunder-gray/30 border-white/10 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
          <Button 
            type="submit"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
          >
            Search
          </Button>
        </div>
      </form>
      
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
            <Link to="/support/faq" onClick={() => window.scrollTo(0, 0)}>
              <Button className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                View FAQs
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-casino-thunder-gray/30 border border-white/5 hover:border-casino-thunder-green transition-colors">
          <CardContent className="p-6">
            <div className="text-casino-thunder-green mb-4">
              <TicketCheck size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">Submit a Support Ticket</h2>
            <p className="text-white/70 mb-4">
              Need personalized help? Submit a ticket and our team will assist you with your specific issue.
            </p>
            <Link to="#support-request-template" onClick={() => document.getElementById('support-request-template')?.scrollIntoView({ behavior: 'smooth' })}>
              <Button className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                Raise a Ticket
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
            <Link to="/support/responsible-gaming" onClick={() => window.scrollTo(0, 0)}>
              <Button className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                Learn More
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {/* Common Topics Section */}
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
      
      {/* Support Request Template Section */}
      <div id="support-request-template" className="bg-casino-thunder-gray/30 border border-white/5 rounded-lg p-8 mb-12 scroll-mt-24">
        <h2 className="text-2xl font-bold mb-6">Support Request Templates</h2>
        <p className="text-white/70 mb-6">
          To help us resolve your issue more efficiently, please use the appropriate template below when contacting support.
        </p>
        
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="mb-6 w-full justify-start overflow-auto enhanced-tabs">
            <TabsTrigger value="deposit" className="flex items-center tab-highlight">
              <DollarSign className="mr-2 h-4 w-4" />
              Deposit Issues
            </TabsTrigger>
            <TabsTrigger value="inr-deposit" className="flex items-center tab-highlight">
              <CreditCard className="mr-2 h-4 w-4" />
              INR Deposits
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center tab-highlight">
              <Lock className="mr-2 h-4 w-4" />
              Account Issues
            </TabsTrigger>
            <TabsTrigger value="withdrawal" className="flex items-center tab-highlight">
              <DollarSign className="mr-2 h-4 w-4" />
              Withdrawal
            </TabsTrigger>
            <TabsTrigger value="bonus" className="flex items-center tab-highlight">
              <Gift className="mr-2 h-4 w-4" />
              Bonus Issues
            </TabsTrigger>
          </TabsList>
          
          {/* Deposit Issues Tab */}
          <TabsContent value="deposit">
            <Card className="border-white/10 bg-black/20">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <DollarSign className="mr-2 text-casino-thunder-green" />
                  How to Raise a Ticket to Speed Up Your Deposit
                </h3>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="template">
                    <AccordionTrigger>View Template</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-casino-deep-black/50 p-4 rounded-md mb-4 border border-white/5">
                        <pre className="whitespace-pre-wrap text-white/80 text-sm">
{`Hi ThunderWin Support,

I need help with my deposit. Below are the details:

Username: [your username]
Payment method: [method used]
Transaction ID: [ID number]
Date & time: [when you made the transaction]
Amount: [amount deposited]

[Any additional information about your issue]

Thank you for your assistance.`}
                        </pre>
                      </div>
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `Hi ThunderWin Support,\n\nI need help with my deposit. Below are the details:\n\nUsername: [your username]\nPayment method: [method used]\nTransaction ID: [ID number]\nDate & time: [when you made the transaction]\nAmount: [amount deposited]\n\n[Any additional information about your issue]\n\nThank you for your assistance.`
                          );
                          alert("Template copied to clipboard!");
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Copy Template
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="mt-4">
                  <p className="text-white/70 mb-3">Please include:</p>
                  <ul className="list-disc pl-5 space-y-2 text-white/70">
                    <li>Username</li>
                    <li>Payment method</li>
                    <li>Transaction ID</li>
                    <li>Date & time of transaction</li>
                    <li>Amount</li>
                    <li>Screenshot (if available)</li>
                  </ul>
                </div>
                
                <Link to="/support/contact" className="block mt-6">
                  <Button className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* INR Deposits Tab */}
          <TabsContent value="inr-deposit">
            <Card className="border-white/10 bg-black/20">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <CreditCard className="mr-2 text-casino-thunder-green" />
                  Submit a Ticket – INR Deposit Issues
                </h3>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="template">
                    <AccordionTrigger>View Template</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-casino-deep-black/50 p-4 rounded-md mb-4 border border-white/5">
                        <pre className="whitespace-pre-wrap text-white/80 text-sm">
{`Hi ThunderWin Support,

I'm having an issue with my INR deposit. Here are the details:

Username: [your username]
Payment gateway used: [gateway name]
Bank/UPI details: [details]
Reference number: [reference]
Time of deposit attempt: [time]
Bank confirmation: [Yes/No]

[Any additional information about your issue]

Thank you for your assistance.`}
                        </pre>
                      </div>
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `Hi ThunderWin Support,\n\nI'm having an issue with my INR deposit. Here are the details:\n\nUsername: [your username]\nPayment gateway used: [gateway name]\nBank/UPI details: [details]\nReference number: [reference]\nTime of deposit attempt: [time]\nBank confirmation: [Yes/No]\n\n[Any additional information about your issue]\n\nThank you for your assistance.`
                          );
                          alert("Template copied to clipboard!");
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Copy Template
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="mt-4">
                  <p className="text-white/70 mb-3">If the deposit was made in INR, please include:</p>
                  <ul className="list-disc pl-5 space-y-2 text-white/70">
                    <li>Payment gateway used</li>
                    <li>Bank/UPI details</li>
                    <li>Reference number</li>
                    <li>Time of deposit attempt</li>
                    <li>Bank confirmation (if any)</li>
                    <li>Screenshot of payment proof</li>
                  </ul>
                </div>
                
                <Link to="/support/contact" className="block mt-6">
                  <Button className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Account Issues Tab */}
          <TabsContent value="account">
            <Card className="border-white/10 bg-black/20">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Lock className="mr-2 text-casino-thunder-green" />
                  Account Temporarily Unavailable – What It Means and What to Do
                </h3>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="template">
                    <AccordionTrigger>View Template</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-casino-deep-black/50 p-4 rounded-md mb-4 border border-white/5">
                        <pre className="whitespace-pre-wrap text-white/80 text-sm">
{`Hi ThunderWin Support,

My account seems to be temporarily unavailable. Here are the details:

Username: [your username]
Error message received: [exact error message]
Last successful login: [date and time]
Recent changes made: [any changes to account, deposits, etc.]
KYC submitted: [Yes/No]
Previous violations or warnings: [details if any]

[Any additional information that might help]

Thank you for your assistance.`}
                        </pre>
                      </div>
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `Hi ThunderWin Support,\n\nMy account seems to be temporarily unavailable. Here are the details:\n\nUsername: [your username]\nError message received: [exact error message]\nLast successful login: [date and time]\nRecent changes made: [any changes to account, deposits, etc.]\nKYC submitted: [Yes/No]\nPrevious violations or warnings: [details if any]\n\n[Any additional information that might help]\n\nThank you for your assistance.`
                          );
                          alert("Template copied to clipboard!");
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Copy Template
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="mt-4">
                  <p className="text-white/70 mb-3">Guide users to provide the following information:</p>
                  <ul className="list-disc pl-5 space-y-2 text-white/70">
                    <li>Username</li>
                    <li>Error message received</li>
                    <li>Last successful login</li>
                    <li>Recent changes made</li>
                    <li>KYC submitted: Yes / No</li>
                    <li>Previous violations or warnings</li>
                  </ul>
                </div>
                
                <Link to="/support/contact" className="block mt-6">
                  <Button className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Withdrawal Tab */}
          <TabsContent value="withdrawal">
            <Card className="border-white/10 bg-black/20">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <DollarSign className="mr-2 text-casino-thunder-green" />
                  Withdrawal Issues
                </h3>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="template">
                    <AccordionTrigger>View Template</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-casino-deep-black/50 p-4 rounded-md mb-4 border border-white/5">
                        <pre className="whitespace-pre-wrap text-white/80 text-sm">
{`Hi ThunderWin Support,

I'm having an issue with my withdrawal. Here are the details:

Username: [your username]
Withdrawal method: [method used]
Wallet address or bank account: [details]
Amount requested: [amount]
Transaction hash / ID: [if available]
Date requested: [date]

[Describe the issue you're experiencing]

Thank you for your assistance.`}
                        </pre>
                      </div>
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `Hi ThunderWin Support,\n\nI'm having an issue with my withdrawal. Here are the details:\n\nUsername: [your username]\nWithdrawal method: [method used]\nWallet address or bank account: [details]\nAmount requested: [amount]\nTransaction hash / ID: [if available]\nDate requested: [date]\n\n[Describe the issue you're experiencing]\n\nThank you for your assistance.`
                          );
                          alert("Template copied to clipboard!");
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Copy Template
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="mt-4">
                  <p className="text-white/70 mb-3">For smoother resolution of withdrawal problems:</p>
                  <ul className="list-disc pl-5 space-y-2 text-white/70">
                    <li>Withdrawal method</li>
                    <li>Wallet address or bank account</li>
                    <li>Amount requested</li>
                    <li>Transaction hash / ID</li>
                    <li>Screenshot from withdrawal page</li>
                  </ul>
                </div>
                
                <Link to="/support/contact" className="block mt-6">
                  <Button className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Bonus Issues Tab */}
          <TabsContent value="bonus">
            <Card className="border-white/10 bg-black/20">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Gift className="mr-2 text-casino-thunder-green" />
                  Bonus or Promotion Issue
                </h3>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="template">
                    <AccordionTrigger>View Template</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-casino-deep-black/50 p-4 rounded-md mb-4 border border-white/5">
                        <pre className="whitespace-pre-wrap text-white/80 text-sm">
{`Hi ThunderWin Support,

I'm having an issue with a bonus or promotion. Here are the details:

Username: [your username]
Name of promotion: [promotion name]
Time and date of participation: [when you tried to use the bonus]
Expected bonus/reward: [what you should have received]
Issue encountered: [describe what happened]

[Any additional information]

Thank you for your assistance.`}
                        </pre>
                      </div>
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `Hi ThunderWin Support,\n\nI'm having an issue with a bonus or promotion. Here are the details:\n\nUsername: [your username]\nName of promotion: [promotion name]\nTime and date of participation: [when you tried to use the bonus]\nExpected bonus/reward: [what you should have received]\nIssue encountered: [describe what happened]\n\n[Any additional information]\n\nThank you for your assistance.`
                          );
                          alert("Template copied to clipboard!");
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Copy Template
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="mt-4">
                  <p className="text-white/70 mb-3">Help users report issues related to bonuses or promotions effectively:</p>
                  <ul className="list-disc pl-5 space-y-2 text-white/70">
                    <li>Name of promotion</li>
                    <li>Time and date of participation</li>
                    <li>Expected bonus/reward</li>
                    <li>Issue encountered</li>
                  </ul>
                </div>
                
                <Link to="/support/contact" className="block mt-6">
                  <Button className="w-full bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
                <Link to="/legal/terms" className="text-white/80 hover:text-casino-thunder-green flex items-center" onClick={() => window.scrollTo(0, 0)}>
                  <ExternalLink size={14} className="mr-2" />
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="text-white/80 hover:text-casino-thunder-green flex items-center" onClick={() => window.scrollTo(0, 0)}>
                  <ExternalLink size={14} className="mr-2" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/support/responsible-gaming" className="text-white/80 hover:text-casino-thunder-green flex items-center" onClick={() => window.scrollTo(0, 0)}>
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
                <Link to="/support/faq?topic=getting-started" className="text-white/80 hover:text-casino-thunder-green flex items-center" onClick={() => window.scrollTo(0, 0)}>
                  <ExternalLink size={14} className="mr-2" />
                  Getting Started Guide
                </Link>
              </li>
              <li>
                <Link to="/support/faq?topic=deposits" className="text-white/80 hover:text-casino-thunder-green flex items-center" onClick={() => window.scrollTo(0, 0)}>
                  <ExternalLink size={14} className="mr-2" />
                  How to Make a Deposit
                </Link>
              </li>
              <li>
                <Link to="/support/faq?topic=withdrawals" className="text-white/80 hover:text-casino-thunder-green flex items-center" onClick={() => window.scrollTo(0, 0)}>
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

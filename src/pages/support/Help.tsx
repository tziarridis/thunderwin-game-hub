
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  HelpCircle, 
  CreditCard, 
  Users, 
  MessageSquare, 
  Lock, 
  DollarSign, 
  Gift, 
  Copy,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HelpCenter = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("deposit");
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The template has been copied to your clipboard.",
      variant: "default",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const supportCategories = [
    { id: "deposit", name: "Deposit Issues", icon: <CreditCard className="h-5 w-5" /> },
    { id: "inr", name: "INR Deposit Issues", icon: <DollarSign className="h-5 w-5" /> },
    { id: "account", name: "Account Access", icon: <Lock className="h-5 w-5" /> },
    { id: "withdrawal", name: "Withdrawal Issues", icon: <DollarSign className="h-5 w-5" /> },
    { id: "bonus", name: "Bonus Issues", icon: <Gift className="h-5 w-5" /> },
    { id: "general", name: "General Help", icon: <HelpCircle className="h-5 w-5" /> },
  ];
  
  const depositTemplate = `Hi ThunderWin Support,
I need help with a deposit issue. Please see the details below:

Username: 
Payment method: 
Transaction ID: 
Date & time of transaction: 
Amount: 
Additional details:

I've attached a screenshot of the transaction (if available).
Looking forward to your assistance.`;

  const inrTemplate = `Hi ThunderWin Support,
I need help with an INR deposit issue. Please see the details below:

Username: 
Payment gateway used: 
Bank/UPI details: 
Reference number: 
Time of deposit attempt: 
Bank confirmation: 
Additional details:

I've attached a screenshot of the payment proof.
Looking forward to your assistance.`;

  const accountTemplate = `Hi ThunderWin Support,
I'm having issues accessing my account. Please see the details below:

Username: 
Error message received: 
Last successful login: 
Recent changes made: 
KYC submitted: Yes / No
Previous violations or warnings: 
Additional details:

Looking forward to your assistance.`;

  const withdrawalTemplate = `Hi ThunderWin Support,
I'm having issues with a withdrawal. Please see the details below:

Username: 
Withdrawal method: 
Wallet address or bank account: 
Amount requested: 
Transaction hash / ID: 
Date and time of request: 
Additional details:

I've attached a screenshot from the withdrawal page.
Looking forward to your assistance.`;

  const bonusTemplate = `Hi ThunderWin Support,
I need help with a bonus or promotion issue. Please see the details below:

Username: 
Name of promotion: 
Time and date of participation: 
Expected bonus/reward: 
Issue encountered: 
Additional details:

Looking forward to your assistance.`;

  const generalTemplate = `Hi ThunderWin Support,
I need help with the following issue:

Username: 
Issue category: 
Description of the issue: 
When did it start: 
Steps to reproduce: 
Additional details:

Looking forward to your assistance.`;

  const getTemplateForCategory = (categoryId: string) => {
    switch(categoryId) {
      case 'deposit': return depositTemplate;
      case 'inr': return inrTemplate;
      case 'account': return accountTemplate;
      case 'withdrawal': return withdrawalTemplate;
      case 'bonus': return bonusTemplate;
      case 'general': return generalTemplate;
      default: return generalTemplate;
    }
  };
  
  const faqs = [
    {
      category: "deposit",
      questions: [
        {
          question: "Why is my deposit pending?",
          answer: "Deposits can be pending for several reasons: 1) Bank verification is still in progress 2) The payment provider is experiencing delays 3) Additional verification is needed due to security protocols. Most deposits are processed within 15 minutes, but can take up to 24 hours in some cases."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept Credit/Debit Cards, Cryptocurrency (Bitcoin, Ethereum, Litecoin), Bank Transfers, UPI (for INR), and various E-Wallets. The available methods depend on your region."
        },
        {
          question: "Is there a minimum deposit amount?",
          answer: "Yes, the minimum deposit amount is $10 or equivalent in your local currency. For cryptocurrencies, please check the deposit page for specific minimums as they can vary based on network fees."
        }
      ]
    },
    {
      category: "inr",
      questions: [
        {
          question: "Why was my INR deposit rejected?",
          answer: "INR deposits might be rejected if: 1) The bank details don't match your registered information 2) The payment was sent from a third-party account 3) Required UPI verification failed 4) Transaction limits were exceeded."
        },
        {
          question: "How long do INR deposits take to process?",
          answer: "Most INR deposits are processed within 15-30 minutes. During high volume periods or bank holidays, it might take up to 2 hours. If your deposit hasn't been credited after 2 hours, please contact support with your transaction details."
        },
        {
          question: "Which UPI methods are supported?",
          answer: "We support all major UPI apps including BHIM, Google Pay, PhonePe, Paytm, and bank UPI apps. Make sure to use the exact payment details provided on the deposit screen."
        }
      ]
    },
    {
      category: "account",
      questions: [
        {
          question: "Why is my account temporarily unavailable?",
          answer: "Your account might be temporarily unavailable due to: 1) Multiple failed login attempts 2) Suspicious activity detected 3) Pending verification requirements 4) Terms of service violation investigation. Please contact support for specific details about your account."
        },
        {
          question: "How do I reset my password?",
          answer: "To reset your password, click 'Forgot Password' on the login page, enter your registered email address, and follow the instructions sent to your email. If you don't receive the email, check your spam folder or contact support."
        },
        {
          question: "Why am I being asked to verify my account again?",
          answer: "Additional verification may be requested for various reasons: 1) Significant deposit or withdrawal activity 2) Account access from a new location 3) Regulatory requirements 4) Periodic security checks. This is for your protection and to comply with gaming regulations."
        }
      ]
    },
    {
      category: "withdrawal",
      questions: [
        {
          question: "Why was my withdrawal declined?",
          answer: "Withdrawals might be declined if: 1) Your KYC verification is incomplete 2) Withdrawal amount exceeds your available balance 3) Wagering requirements on bonuses haven't been met 4) The withdrawal method differs from your deposit method (anti-money laundering policy)."
        },
        {
          question: "How long do withdrawals take to process?",
          answer: "Processing times vary by method: Cryptocurrencies: 10-60 minutes after approval, E-Wallets: 0-24 hours, Bank Transfers: 1-5 business days, Cards: 1-5 business days. All withdrawals undergo a review period of up to 24 hours before processing."
        },
        {
          question: "Is there a withdrawal limit?",
          answer: "Yes, withdrawal limits depend on your account level and verification status. Standard accounts: $2,000 per day, $10,000 per week, $40,000 per month. VIP accounts have higher limits. Please check your account settings for your specific limits."
        }
      ]
    },
    {
      category: "bonus",
      questions: [
        {
          question: "Why didn't I receive my welcome bonus?",
          answer: "Welcome bonuses may not be credited if: 1) You didn't enter the required bonus code during deposit 2) Your deposit amount was below the minimum required 3) You're not eligible due to country restrictions 4) You've already claimed a welcome bonus on another account."
        },
        {
          question: "What are wagering requirements?",
          answer: "Wagering requirements specify how many times you need to bet the bonus amount before you can withdraw winnings associated with that bonus. For example, a 30x requirement on a $10 bonus means you need to place bets totaling $300 before withdrawal. Different games contribute differently toward wagering requirements."
        },
        {
          question: "Can I withdraw my bonus?",
          answer: "Bonuses themselves cannot be withdrawn directly. They must first be wagered according to the wagering requirements. Once the requirements are met, the bonus converts to real cash which can then be withdrawn. If you request a withdrawal before meeting requirements, the bonus and associated winnings may be forfeited."
        }
      ]
    },
    {
      category: "general",
      questions: [
        {
          question: "Is my personal information secure?",
          answer: "Yes, we protect your personal information using industry-standard encryption and security protocols. We never share your data with unauthorized third parties and comply with all relevant data protection regulations. For more details, please refer to our Privacy Policy."
        },
        {
          question: "How do I close my account?",
          answer: "To close your account, go to Settings > Account > Close Account. Alternatively, contact our support team who can assist you. Please note that any remaining funds should be withdrawn before closing your account."
        },
        {
          question: "How can I set gaming limits?",
          answer: "You can set deposit limits, loss limits, session time limits, or temporary self-exclusion by going to Settings > Responsible Gaming. These limits help you maintain control over your gaming habits. Once set, reduction of limits takes effect immediately, while increases require a cooling-off period."
        }
      ]
    }
  ];
  
  const filteredFaqs = searchQuery 
    ? faqs.flatMap(category => 
        category.questions.filter(q => 
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(q => ({ ...q, category: category.category }))
      )
    : faqs.find(category => category.category === activeCategory)?.questions || [];

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 thunder-glow">Help Center</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our support team for personalized assistance.
          </p>
        </div>
        
        <div className="mb-10">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            <Input 
              className="bg-white/5 border-white/10 pl-10 h-12 text-lg focus:ring-casino-thunder-green focus:border-casino-thunder-green"
              placeholder="Search for help topics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="faqs" className="enhanced-tabs">
          <TabsList className="bg-white/5 p-1 mb-8">
            <TabsTrigger value="faqs" className="tab-highlight">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="support" className="tab-highlight">Support Tickets</TabsTrigger>
            <TabsTrigger value="contact" className="tab-highlight">Contact Us</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faqs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>Browse help topics by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {supportCategories.map((category) => (
                        <button
                          key={category.id}
                          className={`w-full flex items-center p-3 rounded-lg transition-all ${
                            activeCategory === category.id
                              ? "bg-casino-thunder-green/20 text-casino-thunder-green"
                              : "hover:bg-white/5 text-white/80"
                          }`}
                          onClick={() => {
                            setActiveCategory(category.id);
                            setSearchQuery("");
                          }}
                        >
                          <div className="mr-3">{category.icon}</div>
                          <span>{category.name}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/5 border-white/10 mt-6">
                  <CardHeader>
                    <CardTitle>Still need help?</CardTitle>
                    <CardDescription>Contact our support team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full bg-casino-thunder-green hover:bg-casino-thunder-green/90 text-black"
                      onClick={() => window.location.href = "/support/contact"}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle>
                      {searchQuery 
                        ? `Search Results for "${searchQuery}"` 
                        : `${supportCategories.find(c => c.id === activeCategory)?.name} FAQs`}
                    </CardTitle>
                    <CardDescription>
                      {searchQuery 
                        ? `${filteredFaqs.length} results found` 
                        : "Find answers to common questions"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredFaqs.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {filteredFaqs.map((faq, index) => (
                          <AccordionItem key={index} value={`faq-${index}`} className="border-white/10">
                            <AccordionTrigger className="text-white hover:text-casino-thunder-green">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-white/80">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-center py-12">
                        <HelpCircle className="mx-auto h-12 w-12 text-white/30 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No results found</h3>
                        <p className="text-white/60 mb-6">
                          Try adjusting your search or browse our categories for help
                        </p>
                        <Button 
                          variant="outline" 
                          className="border-casino-thunder-green text-casino-thunder-green hover:bg-casino-thunder-green hover:text-black"
                          onClick={() => setSearchQuery("")}
                        >
                          Clear Search
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="support">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle>Support Categories</CardTitle>
                    <CardDescription>Select the type of support you need</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {supportCategories.map((category) => (
                        <button
                          key={category.id}
                          className={`w-full flex items-center p-3 rounded-lg transition-all ${
                            activeCategory === category.id
                              ? "bg-casino-thunder-green/20 text-casino-thunder-green"
                              : "hover:bg-white/5 text-white/80"
                          }`}
                          onClick={() => setActiveCategory(category.id)}
                        >
                          <div className="mr-3">{category.icon}</div>
                          <span>{category.name}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{supportCategories.find(c => c.id === activeCategory)?.name} Template</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-casino-thunder-green"
                        onClick={() => handleCopy(getTemplateForCategory(activeCategory))}
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copied ? "Copied!" : "Copy Template"}
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Use this template to submit a detailed support request
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] rounded-md bg-white/5 p-4">
                      <pre className="whitespace-pre-wrap text-white/80 font-mono text-sm">
                        {getTemplateForCategory(activeCategory)}
                      </pre>
                    </ScrollArea>
                    
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-medium">Submit Your Request</h3>
                      <Textarea 
                        placeholder="Paste the template here and fill in your details..."
                        className="min-h-[200px] bg-white/5 border-white/10"
                      />
                      <div className="flex justify-between items-center">
                        <Button 
                          variant="outline" 
                          className="border-white/10 text-white/70"
                          onClick={() => handleCopy(getTemplateForCategory(activeCategory))}
                        >
                          Copy Template
                        </Button>
                        <Button 
                          className="bg-casino-thunder-green hover:bg-casino-thunder-green/90 text-black"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Submit Ticket
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>Get in touch with our support team directly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center p-4 bg-white/5 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-casino-thunder-green mr-4" />
                    <div>
                      <h3 className="font-medium">Live Chat</h3>
                      <p className="text-sm text-white/70">Available 24/7. Average response time: &lt;5 minutes</p>
                    </div>
                    <Button className="ml-auto bg-casino-thunder-green text-black hover:bg-casino-thunder-green/90">
                      Start Chat
                    </Button>
                  </div>
                  
                  <div className="flex items-center p-4 bg-white/5 rounded-lg">
                    <div className="h-6 w-6 text-casino-thunder-green mr-4 flex items-center justify-center">
                      📧
                    </div>
                    <div>
                      <h3 className="font-medium">Email Support</h3>
                      <p className="text-sm text-white/70">support@thunderwin.com</p>
                      <p className="text-sm text-white/70">Response time: 12-24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-white/5 rounded-lg">
                    <div className="h-6 w-6 text-casino-thunder-green mr-4 flex items-center justify-center">
                      📞
                    </div>
                    <div>
                      <h3 className="font-medium">Phone Support</h3>
                      <p className="text-sm text-white/70">+1-800-THUNDER</p>
                      <p className="text-sm text-white/70">Hours: 9AM-9PM (UTC)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>Responsible Gaming</CardTitle>
                  <CardDescription>Help and resources for responsible gambling</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/80">
                    At ThunderWin, we're committed to promoting responsible gaming. If you need help or want to set limits on your gaming:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="border-white/10 hover:bg-white/5 flex items-center justify-start text-left"
                      onClick={() => window.location.href = "/support/responsible-gaming"}
                    >
                      <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center mr-3">
                        🛑
                      </div>
                      <div>
                        <span className="block font-medium">Set Limits</span>
                        <span className="text-xs text-white/60">Deposit, loss, or time limits</span>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="border-white/10 hover:bg-white/5 flex items-center justify-start text-left"
                      onClick={() => window.location.href = "/support/responsible-gaming"}
                    >
                      <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center mr-3">
                        ⏰
                      </div>
                      <div>
                        <span className="block font-medium">Time Out</span>
                        <span className="text-xs text-white/60">Take a short break</span>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="border-white/10 hover:bg-white/5 flex items-center justify-start text-left"
                      onClick={() => window.location.href = "/support/responsible-gaming"}
                    >
                      <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center mr-3">
                        🔒
                      </div>
                      <div>
                        <span className="block font-medium">Self-Exclusion</span>
                        <span className="text-xs text-white/60">Long-term account closure</span>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="border-white/10 hover:bg-white/5 flex items-center justify-start text-left"
                      onClick={() => window.location.href = "/support/responsible-gaming"}
                    >
                      <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center mr-3">
                        📊
                      </div>
                      <div>
                        <span className="block font-medium">Account History</span>
                        <span className="text-xs text-white/60">View your gaming activity</span>
                      </div>
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-casino-thunder-green/10 rounded-lg mt-4 border border-casino-thunder-green/30">
                    <h3 className="font-medium mb-2 flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2" />
                      Need help with gambling addiction?
                    </h3>
                    <p className="text-sm text-white/80 mb-3">
                      If you or someone you know is struggling with gambling addiction, these resources can help:
                    </p>
                    <ul className="text-sm space-y-1 text-white/80">
                      <li>• GamCare: 0808 8020 133</li>
                      <li>• BeGambleAware: www.begambleaware.org</li>
                      <li>• Gamblers Anonymous: www.gamblersanonymous.org</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HelpCenter;

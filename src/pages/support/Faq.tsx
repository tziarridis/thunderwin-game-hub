
import { useState } from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Gamepad2, CreditCard, Shield, Users, HelpCircle } from "lucide-react";

const HelpCenterFaqPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would be implemented here
    console.log("Searching for:", searchQuery);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Help Center</h1>
        <p className="text-white/70 text-center mb-8">
          Find answers to commonly asked questions about our services
        </p>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for answers..."
              className="pl-10 py-6 bg-casino-thunder-gray/30 border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
            <Button 
              type="submit"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            >
              Search
            </Button>
          </div>
        </form>
        
        {/* FAQ Categories */}
        <Tabs defaultValue="account">
          <TabsList className="mb-8 w-full justify-start overflow-auto">
            <TabsTrigger value="account" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center">
              <Gamepad2 className="mr-2 h-4 w-4" />
              Games
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center">
              <HelpCircle className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
          </TabsList>
          
          {/* Account FAQs */}
          <TabsContent value="account">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I create an account?</AccordionTrigger>
                <AccordionContent>
                  To create an account, click on the "Register" button in the top right corner of the page. 
                  Fill in your personal information, create a username and password, and agree to our terms and conditions. 
                  Once you've completed the registration form, click "Create Account" to finalize the process. 
                  You'll receive a confirmation email to verify your account.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                <AccordionContent>
                  If you've forgotten your password, click on the "Login" button, then select the "Forgot Password" link. 
                  Enter the email address associated with your account, and we'll send you a password reset link. 
                  Click on the link in the email and follow the instructions to create a new password.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I have multiple accounts?</AccordionTrigger>
                <AccordionContent>
                  No, our terms of service prohibit users from creating multiple accounts. Each user is allowed only one account. 
                  Creating multiple accounts may result in all your accounts being suspended and potential forfeiture of funds. 
                  This policy helps us maintain a fair gaming environment for all users.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How do I verify my account?</AccordionTrigger>
                <AccordionContent>
                  Account verification is required before your first withdrawal. To verify your account, go to your Profile page 
                  and select the "Verification" tab. You'll need to provide a valid government-issued ID (passport, driver's license, 
                  or national ID card) and proof of address (utility bill or bank statement issued within the last 3 months). 
                  Once submitted, verification typically takes 24-48 hours to complete.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>How do I close my account?</AccordionTrigger>
                <AccordionContent>
                  If you wish to close your account, please visit the Settings page and select "Close Account" option. 
                  Alternatively, you can contact our customer support team who will assist you with closing your account. 
                  Please note that any remaining balance should be withdrawn before account closure. Once closed, accounts cannot be reopened.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          {/* Games FAQs */}
          <TabsContent value="games">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What types of games do you offer?</AccordionTrigger>
                <AccordionContent>
                  We offer a wide variety of casino games including slots, live casino games (roulette, blackjack, baccarat, poker), 
                  table games, jackpot games, and sports betting options. Our games come from top providers in the industry, 
                  ensuring high-quality gameplay and fair outcomes.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Are your games fair?</AccordionTrigger>
                <AccordionContent>
                  Yes, all our games use certified Random Number Generators (RNGs) to ensure fair outcomes. 
                  Our games are regularly audited by independent testing agencies to verify fairness and randomness. 
                  Additionally, we publish the Return to Player (RTP) percentages for all our games, which indicates 
                  the theoretical payout percentage over time.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Can I play games on my mobile device?</AccordionTrigger>
                <AccordionContent>
                  Yes, our platform is fully optimized for mobile play. You can access all our games through your mobile 
                  browser without downloading any apps. Our responsive design ensures a seamless gaming experience 
                  across all devices, including smartphones and tablets running iOS, Android, or other operating systems.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>What is RTP and volatility?</AccordionTrigger>
                <AccordionContent>
                  RTP (Return to Player) is the theoretical percentage of all wagered money that a game will pay back to players over time. 
                  For example, a game with 96% RTP will theoretically return $96 for every $100 wagered over millions of spins.
                  
                  Volatility (or variance) refers to the risk level of a game. Low volatility games provide frequent but smaller wins, 
                  while high volatility games offer larger but less frequent wins. Medium volatility games balance these characteristics.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>How do jackpot games work?</AccordionTrigger>
                <AccordionContent>
                  Jackpot games feature special prize pools that grow over time. There are two main types:
                  
                  - Progressive jackpots increase every time someone plays the game without winning the jackpot.
                  - Fixed jackpots offer a predetermined prize amount.
                  
                  To win a jackpot, you typically need to trigger a special bonus round or land specific symbol combinations.
                  Each game has its own jackpot rules, which are explained in the game's information section.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          {/* Payments FAQs */}
          <TabsContent value="payments">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept various payment methods including credit/debit cards (Visa, Mastercard), e-wallets (like PayPal, Skrill, Neteller), 
                  bank transfers, and cryptocurrencies (Bitcoin, Ethereum, etc.). Available payment methods may vary based on your location.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>What are the minimum and maximum deposit amounts?</AccordionTrigger>
                <AccordionContent>
                  The minimum deposit amount is $10 or equivalent in other currencies. Maximum deposit limits vary by 
                  payment method and your account status. VIP players may have higher deposit limits. You can find 
                  specific limits for each payment method on the deposit page.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>How long do withdrawals take?</AccordionTrigger>
                <AccordionContent>
                  Withdrawal processing times vary by method:
                  
                  - E-wallets: 0-24 hours
                  - Cryptocurrencies: 0-24 hours
                  - Credit/debit cards: 1-5 business days
                  - Bank transfers: 3-7 business days
                  
                  Please note that first-time withdrawals require account verification, which may extend processing time.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Are there any fees for deposits or withdrawals?</AccordionTrigger>
                <AccordionContent>
                  We don't charge any fees for deposits. For withdrawals, most methods are free, but some payment 
                  providers may charge their own fees. Any applicable fees will be clearly displayed before you confirm 
                  your transaction. VIP players enjoy reduced or waived withdrawal fees across all payment methods.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Why was my withdrawal declined?</AccordionTrigger>
                <AccordionContent>
                  Withdrawals may be declined for several reasons, including:
                  
                  - Incomplete account verification
                  - Bonus wagering requirements not met
                  - Withdrawal amount below the minimum threshold
                  - Payment method differs from the deposit method
                  - Security concerns requiring additional verification
                  
                  If your withdrawal was declined, please contact customer support for assistance.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          {/* Security FAQs */}
          <TabsContent value="security">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do you protect my personal information?</AccordionTrigger>
                <AccordionContent>
                  We use industry-standard encryption technology to protect your personal and financial information. 
                  All data is transmitted using secure socket layer (SSL) encryption, ensuring that your information 
                  cannot be intercepted. We also have strict internal access controls and regular security audits to maintain data integrity.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>What is two-factor authentication (2FA)?</AccordionTrigger>
                <AccordionContent>
                  Two-factor authentication (2FA) adds an extra layer of security to your account. When enabled, 
                  you'll need both your password and a temporary code sent to your mobile device to log in. 
                  This prevents unauthorized access even if your password is compromised. You can enable 2FA 
                  in your account settings under the "Security" tab.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>How can I set gambling limits on my account?</AccordionTrigger>
                <AccordionContent>
                  You can set various responsible gambling limits in your account settings:
                  
                  - Deposit limits: Control how much you can deposit daily, weekly, or monthly
                  - Wager limits: Restrict the amount you can bet in a given period
                  - Loss limits: Set maximum loss thresholds
                  - Session limits: Limit how long you can play in one session
                  
                  These limits can be adjusted in the "Responsible Gaming" section of your account settings.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>What should I do if I suspect unauthorized activity on my account?</AccordionTrigger>
                <AccordionContent>
                  If you notice any suspicious activity on your account:
                  
                  1. Change your password immediately
                  2. Enable two-factor authentication if not already active
                  3. Contact our customer support team as soon as possible
                  
                  We take security breaches very seriously and will investigate thoroughly. If unauthorized activity is confirmed, 
                  we will secure your account and work with you to resolve any issues.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Is my money safe with you?</AccordionTrigger>
                <AccordionContent>
                  Yes, we implement a strict segregation policy where player funds are kept separate from operational accounts. 
                  This ensures that your money is always available for withdrawal regardless of the company's financial situation. 
                  Additionally, we are licensed and regulated by reputable gambling authorities that enforce strict financial 
                  requirements and regular audits to protect player funds.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          
          {/* General FAQs */}
          <TabsContent value="general">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What are your customer service hours?</AccordionTrigger>
                <AccordionContent>
                  Our customer service team is available 24/7, 365 days a year. You can contact us via live chat, 
                  email, or phone at any time, and we'll be happy to assist you with any questions or concerns.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>How do I become a VIP member?</AccordionTrigger>
                <AccordionContent>
                  Our VIP program operates on an invitation basis. The more you play, the more likely you are to receive an invitation. 
                  Factors we consider include deposit amounts, betting activity, and account longevity. Once you reach certain thresholds, 
                  our VIP team will reach out to you with an exclusive invitation. VIP members enjoy personalized service, 
                  higher limits, special bonuses, and other premium benefits.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>What is your responsible gambling policy?</AccordionTrigger>
                <AccordionContent>
                  We are committed to promoting responsible gambling. We provide tools for players to control their gambling activity, 
                  including deposit limits, time limits, self-exclusion options, and reality checks. We also work with organizations 
                  that provide support for problem gambling. For more information, please visit our Responsible Gaming page.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Do you offer bonuses and promotions?</AccordionTrigger>
                <AccordionContent>
                  Yes, we offer various bonuses and promotions, including welcome bonuses for new players, reload bonuses, 
                  free spins, cashback offers, and seasonal promotions. Each promotion has its own terms and conditions, 
                  including wagering requirements. You can find all current offers on our Promotions page. We also send 
                  personalized offers to players via email and SMS if you've opted in to receive marketing communications.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Which countries are restricted from playing?</AccordionTrigger>
                <AccordionContent>
                  Due to regulatory requirements, we cannot accept players from certain jurisdictions. 
                  The list of restricted countries includes, but is not limited to, the United States, France, Spain, Italy, 
                  Turkey, and certain other territories where online gambling is prohibited or restricted by local laws. 
                  For a complete and up-to-date list of restricted countries, please refer to our Terms and Conditions.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 text-center">
          <p className="text-white/70 mb-4">Still have questions?</p>
          <Button 
            className="bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
            onClick={() => window.location.href = "/contact"}
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterFaqPage;

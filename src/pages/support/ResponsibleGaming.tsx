
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertCircle, Clock, DollarSign, CalendarDays, Ban, Bell, Headphones } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const ResponsibleGamingPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  const handleSetLimit = (limitType: string) => {
    toast({
      title: "Limit Request Submitted",
      description: `Your ${limitType} limit request has been submitted for processing.`,
      variant: "default",
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex justify-center mb-4">
          <div className="bg-green-500/20 p-4 rounded-full">
            <ShieldCheck size={40} className="text-green-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Responsible Gaming</h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          We're committed to promoting responsible gaming. Learn about our tools and resources to help you keep gambling fun and under control.
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-12">
        <TabsList className="w-full justify-start overflow-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="limits">Set Limits</TabsTrigger>
          <TabsTrigger value="selfAssessment">Self-Assessment</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-casino-thunder-gray/30 border border-white/5">
              <CardContent className="p-6">
                <div className="text-green-500 mb-4">
                  <Clock size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2">Time Limits</h3>
                <p className="text-white/70 mb-4">
                  Set daily, weekly, or monthly limits on how long you can play. We'll send you notifications when you're approaching your limit.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab("limits")}
                >
                  Set Time Limits
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-casino-thunder-gray/30 border border-white/5">
              <CardContent className="p-6">
                <div className="text-green-500 mb-4">
                  <DollarSign size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2">Deposit Limits</h3>
                <p className="text-white/70 mb-4">
                  Control how much you can deposit in a given time period. This is one of the most effective tools to manage your gambling budget.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab("limits")}
                >
                  Set Deposit Limits
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-casino-thunder-gray/30 border border-white/5">
              <CardContent className="p-6">
                <div className="text-green-500 mb-4">
                  <CalendarDays size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2">Self-Exclusion</h3>
                <p className="text-white/70 mb-4">
                  Take a break from gambling by setting a self-exclusion period. During this time, you won't be able to access your account.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab("limits")}
                >
                  Set Self-Exclusion
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-casino-thunder-gray/30 border border-white/5 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Our Responsible Gaming Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <AlertCircle className="mr-2 text-green-500" size={18} />
                  Prevention
                </h3>
                <p className="text-white/70">
                  We provide tools and information to help prevent problem gambling before it starts. This includes educational resources and account controls.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Bell className="mr-2 text-green-500" size={18} />
                  Awareness
                </h3>
                <p className="text-white/70">
                  We raise awareness about responsible gambling through regular communications, prominently displayed information, and player education programs.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Ban className="mr-2 text-green-500" size={18} />
                  Protection
                </h3>
                <p className="text-white/70">
                  We protect vulnerable players by monitoring play patterns, implementing age verification, and offering tools to control gambling activity.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Headphones className="mr-2 text-green-500" size={18} />
                  Support
                </h3>
                <p className="text-white/70">
                  We provide support to players who may be experiencing gambling problems through trained customer service staff and partnerships with expert organizations.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0">
                <ShieldCheck size={48} className="text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                <p className="text-white/80 mb-4">
                  If you're concerned about your gambling habits or those of someone close to you, help is available. Contact our support team or reach out to one of our partner organizations specializing in gambling addiction support.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/contact">
                    <Button variant="outline">Contact Support</Button>
                  </Link>
                  <Button 
                    onClick={() => setActiveTab("resources")}
                    className="bg-green-500 hover:bg-green-600 text-black"
                  >
                    View Resources
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="limits" className="mt-6">
          <div className="bg-casino-thunder-gray/30 border border-white/5 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Set Your Gambling Limits</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Deposit Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="daily-limit">Daily Limit ($)</Label>
                    <Input id="daily-limit" type="number" min="0" className="bg-casino-thunder-gray/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekly-limit">Weekly Limit ($)</Label>
                    <Input id="weekly-limit" type="number" min="0" className="bg-casino-thunder-gray/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly-limit">Monthly Limit ($)</Label>
                    <Input id="monthly-limit" type="number" min="0" className="bg-casino-thunder-gray/30" />
                  </div>
                </div>
                <Button 
                  className="mt-4 bg-green-500 hover:bg-green-600 text-black"
                  onClick={() => handleSetLimit("deposit")}
                >
                  Set Deposit Limits
                </Button>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Session Time Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-limit">Session Duration (minutes)</Label>
                    <Input id="session-limit" type="number" min="0" className="bg-casino-thunder-gray/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="break-reminder">Break Reminder (minutes)</Label>
                    <Input id="break-reminder" type="number" min="0" className="bg-casino-thunder-gray/30" />
                  </div>
                </div>
                <Button 
                  className="mt-4 bg-green-500 hover:bg-green-600 text-black"
                  onClick={() => handleSetLimit("time")}
                >
                  Set Time Limits
                </Button>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Loss Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="daily-loss">Daily Loss Limit ($)</Label>
                    <Input id="daily-loss" type="number" min="0" className="bg-casino-thunder-gray/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekly-loss">Weekly Loss Limit ($)</Label>
                    <Input id="weekly-loss" type="number" min="0" className="bg-casino-thunder-gray/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly-loss">Monthly Loss Limit ($)</Label>
                    <Input id="monthly-loss" type="number" min="0" className="bg-casino-thunder-gray/30" />
                  </div>
                </div>
                <Button 
                  className="mt-4 bg-green-500 hover:bg-green-600 text-black"
                  onClick={() => handleSetLimit("loss")}
                >
                  Set Loss Limits
                </Button>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Self-Exclusion</h3>
                <p className="text-white/70 mb-4">
                  Take a break from gambling by setting a self-exclusion period. During this time, you won't be able to access your account.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSetLimit("24-hour exclusion")}
                  >
                    24 Hours
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSetLimit("7-day exclusion")}
                  >
                    7 Days
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSetLimit("30-day exclusion")}
                  >
                    30 Days
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleSetLimit("permanent exclusion")}
                    className="bg-red-900/20 hover:bg-red-900/30 text-red-400"
                  >
                    Permanent
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-casino-thunder-gray/20 border border-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Important Information</h3>
            <ul className="list-disc list-inside space-y-2 text-white/70">
              <li>Limits take effect immediately upon setting.</li>
              <li>Decreasing a limit takes effect immediately.</li>
              <li>Increasing or removing a limit requires a 24-hour cooling-off period.</li>
              <li>Self-exclusion cannot be reversed once set.</li>
              <li>If you need assistance with setting limits, please contact our support team.</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="selfAssessment" className="mt-6">
          <div className="bg-casino-thunder-gray/30 border border-white/5 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Self-Assessment Questionnaire</h2>
            <p className="text-white/70 mb-6">
              This self-assessment can help you determine if your gambling habits are healthy. Answer the following questions honestly to get a better understanding of your relationship with gambling.
            </p>
            
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="p-4 bg-casino-thunder-gray/20 rounded-md">
                  <p className="mb-3 font-medium">{question}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">Never</Button>
                    <Button variant="outline" size="sm">Rarely</Button>
                    <Button variant="outline" size="sm">Sometimes</Button>
                    <Button variant="outline" size="sm">Often</Button>
                    <Button variant="outline" size="sm">Always</Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              className="mt-6 bg-green-500 hover:bg-green-600 text-black"
              onClick={() => {
                toast({
                  title: "Self-Assessment Completed",
                  description: "This is a self-assessment tool. For professional help, please contact a gambling support organization.",
                  variant: "default",
                });
              }}
            >
              Submit Assessment
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="resources" className="mt-6">
          <div className="bg-casino-thunder-gray/30 border border-white/5 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Support Resources</h2>
            <p className="text-white/70 mb-6">
              These organizations provide professional support for gambling-related issues. All contacts are confidential and many offer 24/7 assistance.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportOrganizations.map((org, index) => (
                <Card key={index} className="bg-casino-thunder-gray/20 border border-white/5">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{org.name}</h3>
                    <p className="text-white/70 mb-4">{org.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="font-medium w-20">Phone:</span>
                        <span>{org.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium w-20">Website:</span>
                        <a 
                          href="#" 
                          className="text-casino-thunder-green hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            toast({
                              title: "External Link",
                              description: `This would navigate to ${org.website}`,
                            });
                          }}
                        >
                          {org.website}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="bg-casino-thunder-gray/30 border border-white/5 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Educational Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-casino-thunder-gray/20 border border-white/5">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2">Understanding Gambling Addiction</h3>
                  <p className="text-white/70 mb-4">Learn about the signs, causes, and treatments for gambling addiction.</p>
                  <Button variant="outline" className="w-full">Read Article</Button>
                </CardContent>
              </Card>
              
              <Card className="bg-casino-thunder-gray/20 border border-white/5">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2">Responsible Gambling Tips</h3>
                  <p className="text-white/70 mb-4">Practical advice to keep gambling enjoyable and under control.</p>
                  <Button variant="outline" className="w-full">Read Article</Button>
                </CardContent>
              </Card>
              
              <Card className="bg-casino-thunder-gray/20 border border-white/5">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2">Helping a Loved One</h3>
                  <p className="text-white/70 mb-4">Guidance for supporting someone with gambling problems.</p>
                  <Button variant="outline" className="w-full">Read Article</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Sample questions for self-assessment
const questions = [
  "Have you ever felt the need to bet more and more money?",
  "Have you ever had to lie to people important to you about how much you gamble?",
  "Have you ever spent more time or money gambling than you intended?",
  "Have you ever gambled to escape worry or trouble?",
  "Have you ever felt guilty about the way you gamble or what happens when you gamble?",
  "Have you ever borrowed money or sold anything to finance gambling?",
  "Has gambling ever caused you financial problems?",
  "Has your gambling ever caused problems in your relationships?",
  "Have you ever gambled to win back money you lost gambling?",
  "Have you ever tried to cut down or stop gambling but couldn't?"
];

// Sample support organizations
const supportOrganizations = [
  {
    name: "National Problem Gambling Helpline",
    description: "24/7 confidential helpline for problem gamblers and their family members.",
    phone: "1-800-522-4700",
    website: "www.ncpgambling.org"
  },
  {
    name: "Gamblers Anonymous",
    description: "Fellowship of men and women who share their experience, strength and hope to solve their common problem.",
    phone: "1-626-960-3500",
    website: "www.gamblersanonymous.org"
  },
  {
    name: "GamCare",
    description: "Leading provider of information, advice and support for anyone affected by gambling problems.",
    phone: "0808 8020 133",
    website: "www.gamcare.org.uk"
  },
  {
    name: "Gambling Therapy",
    description: "Global service offering free practical advice and emotional support to anyone affected by gambling.",
    phone: "N/A - Online Service",
    website: "www.gamblingtherapy.org"
  }
];

export default ResponsibleGamingPage;

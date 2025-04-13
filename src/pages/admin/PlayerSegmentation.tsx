
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { 
  FilterIcon, 
  Users, 
  DollarSign, 
  Gamepad2, 
  AlertTriangle,
  Globe, 
  Clock, 
  Smartphone,
  Calendar, 
  BarChart, 
  Save,
  InfoIcon,
  ChevronDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SegmentationMetricsPanel } from "@/components/segmentation/SegmentationMetricsPanel";
import { SegmentFilterSidebar } from "@/components/segmentation/SegmentFilterSidebar";
import { SegmentationTable } from "@/components/segmentation/SegmentationTable";

const PlayerSegmentation = () => {
  const [activeTab, setActiveTab] = useState("activity");
  const [useCustomSegments, setUseCustomSegments] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Player Segmentation</h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="segment-mode" className="text-white">
              {useCustomSegments ? "Custom Segments" : "Predefined Segments"}
            </Label>
            <Switch
              id="segment-mode"
              checked={useCustomSegments}
              onCheckedChange={setUseCustomSegments}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <CalendarDateRangePicker />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className={`lg:col-span-${isFilterOpen ? '3' : '4'} space-y-6`}>
          <SegmentationMetricsPanel />
          
          <Card className="thunder-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-casino-thunder-green" />
                Player Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start mb-4 overflow-x-auto flex-nowrap">
                  <TabsTrigger value="activity" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    By Activity
                  </TabsTrigger>
                  <TabsTrigger value="spendings" className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    By Spendings
                  </TabsTrigger>
                  <TabsTrigger value="betting" className="flex items-center">
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    By Betting Habits
                  </TabsTrigger>
                  <TabsTrigger value="risk" className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    By Risk
                  </TabsTrigger>
                  <TabsTrigger value="geo" className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    By GEO
                  </TabsTrigger>
                  <TabsTrigger value="lifecycle" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    By Lifecycle Stages
                  </TabsTrigger>
                  <TabsTrigger value="device" className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    By Device
                  </TabsTrigger>
                </TabsList>

                {/* By Activity Tab */}
                <TabsContent value="activity" className="mt-0">
                  <SegmentCard 
                    title="High Activity Players"
                    description="Players who engage with the platform frequently (7+ sessions per week)"
                    filters={["Sessions > 7 per week", "Daily logins > 5 per week"]}
                    recommendations="Reward with exclusive bonuses and VIP perks to maintain engagement. Focus on retention rather than activation."
                    color="bg-green-500/10"
                    count={1245}
                  />
                  <SegmentCard 
                    title="Medium Activity Players"
                    description="Players with moderate engagement (3-6 sessions per week)"
                    filters={["Sessions: 3-6 per week", "Daily logins: 2-4 per week"]}
                    recommendations="Encourage more frequent play with targeted promotions. Consider weekly bonuses to build habits."
                    color="bg-yellow-500/10"
                    count={2876}
                  />
                  <SegmentCard 
                    title="Low Activity Players"
                    description="Players who rarely engage (1-2 sessions per week or less)"
                    filters={["Sessions: 1-2 per week", "Inactive: > 7 days without login"]}
                    recommendations="Re-engagement campaigns with compelling comeback bonuses. Consider email/SMS reminders about new games or features."
                    color="bg-red-500/10"
                    count={4532}
                  />
                  
                  <SegmentationTable segmentType="activity" />
                </TabsContent>
                
                {/* By Spendings Tab */}
                <TabsContent value="spendings" className="mt-0">
                  <SegmentCard 
                    title="High Rollers"
                    description="Players who make large deposits and place high-value bets"
                    filters={["Avg. deposit > $500", "Avg. bet > $50"]}
                    recommendations="Provide personalized VIP treatment, dedicated account manager, and exclusive high-roller tournaments."
                    color="bg-purple-500/10"
                    count={468}
                  />
                  <SegmentCard 
                    title="Mid-Tier Spenders"
                    description="Players with moderate deposit and betting patterns"
                    filters={["Avg. deposit: $100-$500", "Avg. bet: $10-$50"]}
                    recommendations="Encourage upgrades with deposit match bonuses and special event invitations."
                    color="bg-blue-500/10"
                    count={1756}
                  />
                  <SegmentCard 
                    title="Low Spenders"
                    description="Players who make minimal deposits and place low-value bets"
                    filters={["Avg. deposit < $100", "Avg. bet < $10"]}
                    recommendations="Focus on value offerings, free spins, and low-risk bonuses to encourage more deposits."
                    color="bg-gray-500/10"
                    count={6421}
                  />
                  
                  <SegmentationTable segmentType="spendings" />
                </TabsContent>
                
                {/* By Betting Habits Tab */}
                <TabsContent value="betting" className="mt-0">
                  <SegmentCard 
                    title="Fan Players"
                    description="Players who typically bet on specific sports teams or events"
                    filters={["Specific team bets > 70%", "Sport category focused"]}
                    recommendations="Offer targeted promotions based on their favorite teams or sports. Push notifications for relevant matches."
                    color="bg-blue-600/10"
                    count={2134}
                  />
                  <SegmentCard 
                    title="Casual Players"
                    description="Players who play irregularly with no clear pattern"
                    filters={["Random game selection", "Irregular play times"]}
                    recommendations="Introduce them to game variety through free spins on different games. Use general promotions."
                    color="bg-teal-500/10"
                    count={3567}
                  />
                  <SegmentCard 
                    title="Passion Players"
                    description="Players who are devoted to specific game types (slots, poker, etc.)"
                    filters={["Game type focus > 80%", "Regular play patterns"]}
                    recommendations="Provide promotions specific to their preferred game type. Early access to new games in their category."
                    color="bg-pink-500/10"
                    count={1879}
                  />
                  <SegmentCard 
                    title="Hard Players"
                    description="Players who approach gaming strategically, often with systems"
                    filters={["Table games > 60%", "Consistent bet sizing"]}
                    recommendations="Offer competitions, tournaments, and skill-based promotions. Special VIP status for table game experts."
                    color="bg-orange-500/10"
                    count={932}
                  />
                  
                  <SegmentationTable segmentType="betting" />
                </TabsContent>
                
                {/* By Risk Tab */}
                <TabsContent value="risk" className="mt-0">
                  <SegmentCard 
                    title="Negative Risk Players"
                    description="Players who consistently win or show signs of advantage play"
                    filters={["Win/Bet ratio > 1.2", "Large bet variations"]}
                    recommendations="Monitor closely for potential advantage play. Consider implementing bet limits or enhanced verification."
                    color="bg-red-600/10"
                    count={346}
                  />
                  <SegmentCard 
                    title="Neutral Risk Players"
                    description="Players whose wins and losses balance out over time"
                    filters={["Win/Bet ratio: 0.8-1.2", "Consistent play patterns"]}
                    recommendations="Standard bonuses and promotions. Focus on extending playtime and game variety."
                    color="bg-blue-400/10"
                    count={5687}
                  />
                  <SegmentCard 
                    title="Positive Risk Players"
                    description="Players who tend to lose more than they win"
                    filters={["Win/Bet ratio < 0.8", "High session frequency"]}
                    recommendations="Monitor for responsible gambling issues. Offer balanced promotions without encouraging excessive play."
                    color="bg-yellow-600/10"
                    count={2451}
                  />
                  <SegmentCard 
                    title="Premium Risk Players"
                    description="High-value players with favorable risk profiles"
                    filters={["High deposits", "Balanced win/loss", "Long-term loyalty"]}
                    recommendations="Provide premium bonuses and personalized offers. VIP treatment with account managers and special events."
                    color="bg-green-600/10"
                    count={578}
                  />
                  
                  <SegmentationTable segmentType="risk" />
                </TabsContent>
                
                {/* By GEO Tab */}
                <TabsContent value="geo" className="mt-0">
                  <SegmentCard 
                    title="Region-Based Players"
                    description="Players grouped by geographical location"
                    filters={["Country", "Region", "City"]}
                    recommendations="Localized promotions relevant to regional events or holidays. Support in local languages."
                    color="bg-indigo-500/10"
                    count={8654}
                  />
                  <SegmentCard 
                    title="Currency-Based Players"
                    description="Players grouped by their preferred currency"
                    filters={["USD", "EUR", "GBP", "Crypto"]}
                    recommendations="Currency-specific bonuses and promotions. Special crypto-exclusive offers for crypto users."
                    color="bg-green-400/10"
                    count={8654}
                  />
                  <SegmentCard 
                    title="Language-Based Players"
                    description="Players grouped by their preferred language"
                    filters={["English", "Spanish", "German", "Chinese"]}
                    recommendations="Communication in native language. Culturally relevant promotions and support."
                    color="bg-blue-300/10"
                    count={8654}
                  />
                  <SegmentCard 
                    title="Domain-Based Players"
                    description="Players grouped by the sign-up domain"
                    filters={["Main domain", "Partner referrals", "Affiliate channels"]}
                    recommendations="Track acquisition channels and tailor offers based on entry point. Special promotions for affiliate-referred players."
                    color="bg-purple-300/10"
                    count={8654}
                  />
                  
                  <SegmentationTable segmentType="geo" />
                </TabsContent>
                
                {/* By Lifecycle Stages Tab */}
                <TabsContent value="lifecycle" className="mt-0">
                  <SegmentCard 
                    title="Newcomers"
                    description="Recently registered players (<30 days)"
                    filters={["Account age < 30 days", "First deposits only"]}
                    recommendations="Welcome offers and onboarding assistance. First-time deposit bonuses and tutorials."
                    color="bg-green-300/10"
                    count={1243}
                  />
                  <SegmentCard 
                    title="Regular Players"
                    description="Established players with consistent activity"
                    filters={["Account age > 30 days", "Active in last 14 days"]}
                    recommendations="Loyalty rewards and reload bonuses. Regular communication about new features and games."
                    color="bg-blue-300/10"
                    count={3567}
                  />
                  <SegmentCard 
                    title="Inactive Players"
                    description="Players who haven't engaged for an extended period"
                    filters={["No login > 30 days", "No bets > 45 days"]}
                    recommendations="Re-engagement campaigns with comeback bonuses. Surveys to understand reasons for inactivity."
                    color="bg-orange-300/10"
                    count={4321}
                  />
                  <SegmentCard 
                    title="At-Risk Churners"
                    description="Players showing signs of disengagement"
                    filters={["Declining login frequency", "Declining bet amounts"]}
                    recommendations="Targeted retention offers. Personalized communication from account managers to address concerns."
                    color="bg-red-300/10"
                    count={876}
                  />
                  
                  <SegmentationTable segmentType="lifecycle" />
                </TabsContent>
                
                {/* By Device Tab */}
                <TabsContent value="device" className="mt-0">
                  <SegmentCard 
                    title="Mobile Players"
                    description="Players who primarily access via mobile devices"
                    filters={["Mobile access > 80%", "App or mobile web"]}
                    recommendations="Mobile-exclusive promotions. Push notifications for mobile app users. Mobile-optimized bonuses."
                    color="bg-emerald-400/10"
                    count={5432}
                  />
                  <SegmentCard 
                    title="Desktop Players"
                    description="Players who primarily access via desktop computers"
                    filters={["Desktop access > 80%", "PC or Mac"]}
                    recommendations="Feature-rich promotions that leverage full screen experience. Email marketing for desktop users."
                    color="bg-blue-400/10"
                    count={2198}
                  />
                  <SegmentCard 
                    title="Tablet Players"
                    description="Players who primarily access via tablet devices"
                    filters={["Tablet access > 80%", "iPad or Android tablets"]}
                    recommendations="Tablet-optimized promotions. Focus on games with touch-friendly interfaces."
                    color="bg-purple-400/10"
                    count={876}
                  />
                  <SegmentCard 
                    title="Multi-Device Players"
                    description="Players who access via multiple device types"
                    filters={["No dominant device > 80%", "Uses 2+ device types"]}
                    recommendations="Cross-platform promotions. Continuous session features that work across devices."
                    color="bg-indigo-400/10"
                    count={1543}
                  />
                  
                  <SegmentationTable segmentType="device" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {isFilterOpen && (
          <div className="lg:col-span-1">
            <SegmentFilterSidebar />
          </div>
        )}
      </div>
    </div>
  );
};

interface SegmentCardProps {
  title: string;
  description: string;
  filters: string[];
  recommendations: string;
  color: string;
  count: number;
}

const SegmentCard = ({ title, description, filters, recommendations, color, count }: SegmentCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`mb-4 rounded-lg border border-white/10 ${color}`}
    >
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-start space-x-4">
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8 ml-2">
                      <InfoIcon className="h-4 w-4 text-white/60" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="w-80 p-4">
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <p className="text-sm">{recommendations}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-white/70 text-sm mt-1">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xl font-bold text-white">{count.toLocaleString()}</div>
            <div className="text-xs text-white/60">players</div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
              <ChevronDown className={`h-4 w-4 text-white/60 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent>
        <div className="px-4 pb-4 pt-0">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white/80 mb-2">Suggested Filters</h4>
            <ul className="space-y-1">
              {filters.map((filter, index) => (
                <li key={index} className="text-sm text-white/70 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-casino-thunder-green mr-2"></span>
                  {filter}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="mr-2">
              <FilterIcon className="h-3 w-3 mr-1" />
              Apply Filters
            </Button>
            <Button size="sm" className="bg-casino-thunder-green text-black hover:bg-casino-thunder-green/90">
              <Users className="h-3 w-3 mr-1" />
              View Players
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PlayerSegmentation;

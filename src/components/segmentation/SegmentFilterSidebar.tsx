
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  FilterIcon, 
  Save, 
  RotateCcw,
  ChevronsUpDown,
  Check 
} from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const SegmentFilterSidebar = () => {
  const [depositRange, setDepositRange] = useState([100, 1000]);
  const [activityRange, setActivityRange] = useState([1, 7]);
  
  return (
    <Card className="thunder-card sticky top-20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <FilterIcon className="h-4 w-4 mr-2 text-casino-thunder-green" />
            Segment Filters
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RotateCcw className="h-4 w-4 text-white/60" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <Accordion type="multiple" defaultValue={["date", "geo", "lifecycle", "betting", "risk"]}>
          <AccordionItem value="date" className="border-white/10">
            <AccordionTrigger className="py-2 text-white hover:text-casino-thunder-green hover:no-underline">
              Date Range
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="date-preset" className="text-sm text-white/70">Preset</Label>
                  <Select defaultValue="last30">
                    <SelectTrigger id="date-preset" className="bg-casino-thunder-gray/30 border-white/10">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="last7">Last 7 days</SelectItem>
                      <SelectItem value="last30">Last 30 days</SelectItem>
                      <SelectItem value="thisMonth">This month</SelectItem>
                      <SelectItem value="lastMonth">Last month</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="geo" className="border-white/10">
            <AccordionTrigger className="py-2 text-white hover:text-casino-thunder-green hover:no-underline">
              Geo Location
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="region" className="text-sm text-white/70">Region</Label>
                  <Select>
                    <SelectTrigger id="region" className="bg-casino-thunder-gray/30 border-white/10">
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="northAmerica">North America</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="latinAmerica">Latin America</SelectItem>
                      <SelectItem value="africa">Africa</SelectItem>
                      <SelectItem value="oceania">Oceania</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="country" className="text-sm text-white/70">Country</Label>
                  <Select>
                    <SelectTrigger id="country" className="bg-casino-thunder-gray/30 border-white/10">
                      <SelectValue placeholder="All countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="es">Spain</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="currency" className="text-sm text-white/70">Currency</Label>
                  <Select>
                    <SelectTrigger id="currency" className="bg-casino-thunder-gray/30 border-white/10">
                      <SelectValue placeholder="All currencies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                      <SelectItem value="jpy">JPY</SelectItem>
                      <SelectItem value="cad">CAD</SelectItem>
                      <SelectItem value="btc">BTC</SelectItem>
                      <SelectItem value="eth">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="language" className="text-sm text-white/70">Language</Label>
                  <Select>
                    <SelectTrigger id="language" className="bg-casino-thunder-gray/30 border-white/10">
                      <SelectValue placeholder="All languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="jp">Japanese</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="lifecycle" className="border-white/10">
            <AccordionTrigger className="py-2 text-white hover:text-casino-thunder-green hover:no-underline">
              Lifecycle Stage
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="lifecycle-stage" className="text-sm text-white/70">Stage</Label>
                  <Select>
                    <SelectTrigger id="lifecycle-stage" className="bg-casino-thunder-gray/30 border-white/10">
                      <SelectValue placeholder="All stages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newcomer">Newcomers (< 30 days)</SelectItem>
                      <SelectItem value="regular">Regular Players</SelectItem>
                      <SelectItem value="inactive">Inactive (> 30 days)</SelectItem>
                      <SelectItem value="churned">Churned (> 90 days)</SelectItem>
                      <SelectItem value="reactivated">Recently Reactivated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="account-age" className="text-sm text-white/70">Account Age</Label>
                  <Select>
                    <SelectTrigger id="account-age" className="bg-casino-thunder-gray/30 border-white/10">
                      <SelectValue placeholder="Any age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-30">0-30 days</SelectItem>
                      <SelectItem value="31-90">31-90 days</SelectItem>
                      <SelectItem value="91-180">91-180 days</SelectItem>
                      <SelectItem value="181-365">181-365 days</SelectItem>
                      <SelectItem value="365+">Over 1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="betting" className="border-white/10">
            <AccordionTrigger className="py-2 text-white hover:text-casino-thunder-green hover:no-underline">
              Betting Behavior
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-white/70">Activity Level (sessions per week)</Label>
                  <div className="pt-4 pb-2 px-2">
                    <Slider
                      value={activityRange}
                      min={0}
                      max={14}
                      step={1}
                      onValueChange={setActivityRange}
                      className="my-4"
                    />
                    <div className="flex justify-between text-xs text-white/60">
                      <span>{activityRange[0]} sessions</span>
                      <span>{activityRange[1]} sessions</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="deposit-range" className="text-sm text-white/70">Average Deposit</Label>
                  <div className="pt-4 pb-2 px-2">
                    <Slider
                      value={depositRange}
                      min={0}
                      max={2000}
                      step={50}
                      onValueChange={setDepositRange}
                      className="my-4"
                    />
                    <div className="flex justify-between text-xs text-white/60">
                      <span>${depositRange[0]}</span>
                      <span>${depositRange[1]}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="preferred-game" className="text-sm text-white/70">Preferred Game Type</Label>
                  <Select>
                    <SelectTrigger id="preferred-game" className="bg-casino-thunder-gray/30 border-white/10">
                      <SelectValue placeholder="All game types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slots">Slots</SelectItem>
                      <SelectItem value="table">Table Games</SelectItem>
                      <SelectItem value="live">Live Casino</SelectItem>
                      <SelectItem value="sports">Sports Betting</SelectItem>
                      <SelectItem value="poker">Poker</SelectItem>
                      <SelectItem value="bingo">Bingo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="betting-habits" className="text-sm text-white/70">Betting Style</Label>
                  <Select>
                    <SelectTrigger id="betting-habits" className="bg-casino-thunder-gray/30 border-white/10">
                      <SelectValue placeholder="All styles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fan">Fan</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="passion">Passion</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="risk" className="border-white/10">
            <AccordionTrigger className="py-2 text-white hover:text-casino-thunder-green hover:no-underline">
              Risk Profile
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="risk-level" className="text-sm text-white/70">Risk Level</Label>
                  <Select>
                    <SelectTrigger id="risk-level" className="bg-casino-thunder-gray/30 border-white/10">
                      <SelectValue placeholder="All risk levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="win-ratio" className="text-sm text-white/70">Win/Bet Ratio</Label>
                  <Select>
                    <SelectTrigger id="win-ratio" className="bg-casino-thunder-gray/30 border-white/10">
                      <SelectValue placeholder="Any ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High (>1.2)</SelectItem>
                      <SelectItem value="balanced">Balanced (0.8-1.2)</SelectItem>
                      <SelectItem value="low">Low (<0.8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="device" className="border-white/10">
            <AccordionTrigger className="py-2 text-white hover:text-casino-thunder-green hover:no-underline">
              Device
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="device-type" className="text-sm text-white/70">Device Type</Label>
                  <Select>
                    <SelectTrigger id="device-type" className="bg-casino-thunder-gray/30 border-white/10">
                      <SelectValue placeholder="All devices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="multi">Multi-device</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="os-type" className="text-sm text-white/70">Operating System</Label>
                  <Select>
                    <SelectTrigger id="os-type" className="bg-casino-thunder-gray/30 border-white/10">
                      <SelectValue placeholder="All OS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ios">iOS</SelectItem>
                      <SelectItem value="android">Android</SelectItem>
                      <SelectItem value="windows">Windows</SelectItem>
                      <SelectItem value="mac">macOS</SelectItem>
                      <SelectItem value="linux">Linux</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6 space-y-3">
          <Input 
            placeholder="Save segment as..." 
            className="bg-casino-thunder-gray/30 border-white/10" 
          />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full">
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
            <Button className="w-full bg-casino-thunder-green text-black hover:bg-casino-thunder-green/90">
              <Save className="h-3.5 w-3.5 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

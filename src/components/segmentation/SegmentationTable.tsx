
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, ArrowUpDown } from "lucide-react";

type SegmentType = "activity" | "spendings" | "betting" | "risk" | "geo" | "lifecycle" | "device";

interface SegmentationTableProps {
  segmentType: SegmentType;
}

export const SegmentationTable = ({ segmentType }: SegmentationTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Generate sample data based on segment type
  const generateSampleData = () => {
    const data = [];
    
    // Basic player data for all segment types
    for (let i = 1; i <= 10; i++) {
      const basePlayer = {
        id: `P${1000 + i}`,
        username: `player${i}`,
        email: `player${i}@example.com`,
        country: ["USA", "UK", "Canada", "Germany", "France"][Math.floor(Math.random() * 5)],
        registrationDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastLogin: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        depositsTotal: `$${Math.floor(Math.random() * 5000)}`,
        betsTotal: `$${Math.floor(Math.random() * 8000)}`,
        winsTotal: `$${Math.floor(Math.random() * 6000)}`,
        netRevenue: `$${Math.floor(Math.random() * 2000 - 500)}`,
      };
      
      // Add segment-specific metrics
      switch (segmentType) {
        case "activity":
          data.push({
            ...basePlayer,
            activityLevel: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
            sessionsPerWeek: Math.floor(Math.random() * 20),
            avgSessionDuration: `${Math.floor(Math.random() * 120)} min`,
            daysActive: Math.floor(Math.random() * 30),
          });
          break;
          
        case "spendings":
          data.push({
            ...basePlayer,
            spendingTier: ["High Roller", "Mid-Tier", "Low Spender"][Math.floor(Math.random() * 3)],
            avgDeposit: `$${Math.floor(Math.random() * 1000)}`,
            avgBet: `$${Math.floor(Math.random() * 100)}`,
            highestDeposit: `$${Math.floor(Math.random() * 5000)}`,
          });
          break;
          
        case "betting":
          data.push({
            ...basePlayer,
            bettingStyle: ["Fan", "Casual", "Passion", "Hard"][Math.floor(Math.random() * 4)],
            favoriteGameType: ["Slots", "Table Games", "Live Casino", "Sports"][Math.floor(Math.random() * 4)],
            betConsistency: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
            gameVariety: Math.floor(Math.random() * 20),
          });
          break;
          
        case "risk":
          data.push({
            ...basePlayer,
            riskProfile: ["Negative", "Neutral", "Positive", "Premium"][Math.floor(Math.random() * 4)],
            winBetRatio: (Math.random() * 1.5).toFixed(2),
            bonusUtilization: `${Math.floor(Math.random() * 100)}%`,
            withdrawalFrequency: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
          });
          break;
          
        case "geo":
          data.push({
            ...basePlayer,
            region: ["North America", "Europe", "Asia", "Latin America"][Math.floor(Math.random() * 4)],
            language: ["English", "Spanish", "German", "French"][Math.floor(Math.random() * 4)],
            currency: ["USD", "EUR", "GBP", "JPY"][Math.floor(Math.random() * 4)],
            signupDomain: ["Main", "Affiliate", "Partner"][Math.floor(Math.random() * 3)],
          });
          break;
          
        case "lifecycle":
          data.push({
            ...basePlayer,
            lifecycleStage: ["Newcomer", "Regular", "Inactive", "At-Risk"][Math.floor(Math.random() * 4)],
            accountAge: `${Math.floor(Math.random() * 365)} days`,
            retentionRisk: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
            loyaltyPoints: Math.floor(Math.random() * 5000),
          });
          break;
          
        case "device":
          data.push({
            ...basePlayer,
            primaryDevice: ["Mobile", "Desktop", "Tablet"][Math.floor(Math.random() * 3)],
            operatingSystem: ["iOS", "Android", "Windows", "macOS"][Math.floor(Math.random() * 4)],
            deviceCount: Math.floor(Math.random() * 4) + 1,
            appUsage: `${Math.floor(Math.random() * 100)}%`,
          });
          break;
          
        default:
          data.push(basePlayer);
      }
    }
    
    return data;
  };
  
  const sampleData = generateSampleData();
  
  // Generate columns based on segment type
  const getColumns = () => {
    // Common columns for all segment types
    const baseColumns = [
      {
        header: "ID",
        accessorKey: "id",
      },
      {
        header: "Username",
        accessorKey: "username",
      },
      {
        header: "Net Revenue",
        accessorKey: "netRevenue",
        cell: (row: any) => (
          <span className={
            row.netRevenue.startsWith("$-") ? "text-red-400" : "text-green-400"
          }>
            {row.netRevenue}
          </span>
        )
      },
    ];
    
    // Add segment-specific columns
    let additionalColumns = [];
    
    switch (segmentType) {
      case "activity":
        additionalColumns = [
          {
            header: "Activity Level",
            accessorKey: "activityLevel",
            cell: (row: any) => (
              <span className={
                row.activityLevel === "High" ? "text-green-400" : 
                row.activityLevel === "Medium" ? "text-amber-400" : "text-red-400"
              }>
                {row.activityLevel}
              </span>
            )
          },
          {
            header: "Sessions/Week",
            accessorKey: "sessionsPerWeek",
          },
          {
            header: "Avg. Session",
            accessorKey: "avgSessionDuration",
          },
          {
            header: "Days Active",
            accessorKey: "daysActive",
          },
        ];
        break;
        
      case "spendings":
        additionalColumns = [
          {
            header: "Spending Tier",
            accessorKey: "spendingTier",
            cell: (row: any) => (
              <span className={
                row.spendingTier === "High Roller" ? "text-purple-400" : 
                row.spendingTier === "Mid-Tier" ? "text-blue-400" : "text-gray-400"
              }>
                {row.spendingTier}
              </span>
            )
          },
          {
            header: "Avg. Deposit",
            accessorKey: "avgDeposit",
          },
          {
            header: "Avg. Bet",
            accessorKey: "avgBet",
          },
          {
            header: "Highest Deposit",
            accessorKey: "highestDeposit",
          },
        ];
        break;
        
      case "betting":
        additionalColumns = [
          {
            header: "Betting Style",
            accessorKey: "bettingStyle",
            cell: (row: any) => (
              <span className={
                row.bettingStyle === "Fan" ? "text-blue-400" : 
                row.bettingStyle === "Casual" ? "text-teal-400" : 
                row.bettingStyle === "Passion" ? "text-pink-400" : "text-orange-400"
              }>
                {row.bettingStyle}
              </span>
            )
          },
          {
            header: "Favorite Game",
            accessorKey: "favoriteGameType",
          },
          {
            header: "Bet Consistency",
            accessorKey: "betConsistency",
          },
          {
            header: "Game Variety",
            accessorKey: "gameVariety",
          },
        ];
        break;
        
      case "risk":
        additionalColumns = [
          {
            header: "Risk Profile",
            accessorKey: "riskProfile",
            cell: (row: any) => (
              <span className={
                row.riskProfile === "Negative" ? "text-red-400" : 
                row.riskProfile === "Neutral" ? "text-blue-400" : 
                row.riskProfile === "Positive" ? "text-amber-400" : "text-green-400"
              }>
                {row.riskProfile}
              </span>
            )
          },
          {
            header: "Win/Bet Ratio",
            accessorKey: "winBetRatio",
          },
          {
            header: "Bonus Usage",
            accessorKey: "bonusUtilization",
          },
          {
            header: "Withdrawal Freq.",
            accessorKey: "withdrawalFrequency",
          },
        ];
        break;
        
      case "geo":
        additionalColumns = [
          {
            header: "Region",
            accessorKey: "region",
          },
          {
            header: "Country",
            accessorKey: "country",
          },
          {
            header: "Language",
            accessorKey: "language",
          },
          {
            header: "Currency",
            accessorKey: "currency",
          },
        ];
        break;
        
      case "lifecycle":
        additionalColumns = [
          {
            header: "Lifecycle Stage",
            accessorKey: "lifecycleStage",
            cell: (row: any) => (
              <span className={
                row.lifecycleStage === "Newcomer" ? "text-green-400" : 
                row.lifecycleStage === "Regular" ? "text-blue-400" : 
                row.lifecycleStage === "Inactive" ? "text-orange-400" : "text-red-400"
              }>
                {row.lifecycleStage}
              </span>
            )
          },
          {
            header: "Account Age",
            accessorKey: "accountAge",
          },
          {
            header: "Retention Risk",
            accessorKey: "retentionRisk",
          },
          {
            header: "Last Login",
            accessorKey: "lastLogin",
          },
        ];
        break;
        
      case "device":
        additionalColumns = [
          {
            header: "Primary Device",
            accessorKey: "primaryDevice",
            cell: (row: any) => (
              <span className={
                row.primaryDevice === "Mobile" ? "text-emerald-400" : 
                row.primaryDevice === "Desktop" ? "text-blue-400" : "text-purple-400"
              }>
                {row.primaryDevice}
              </span>
            )
          },
          {
            header: "OS",
            accessorKey: "operatingSystem",
          },
          {
            header: "Device Count",
            accessorKey: "deviceCount",
          },
          {
            header: "App Usage",
            accessorKey: "appUsage",
          },
        ];
        break;
    }
    
    return [...baseColumns, ...additionalColumns];
  };
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Player List</h3>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-60 bg-casino-thunder-gray/30 border-white/10"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="border border-white/10 rounded-lg overflow-hidden bg-casino-thunder-gray/20">
        <DataTable
          data={sampleData}
          columns={getColumns()}
        />
      </div>
    </div>
  );
};

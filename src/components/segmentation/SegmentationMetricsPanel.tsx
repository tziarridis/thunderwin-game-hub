
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  BarChart2, 
  Clock, 
  CreditCard, 
  Timer
} from "lucide-react";

export const SegmentationMetricsPanel = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard 
        title="Recency" 
        value="3" 
        label="Days since last bet"
        icon={<Calendar className="h-5 w-5 text-casino-thunder-green" />}
        change="-2"
      />
      <MetricCard 
        title="Frequency" 
        value="12" 
        label="Active betting days"
        icon={<BarChart2 className="h-5 w-5 text-casino-thunder-green" />}
        change="+3"
      />
      <MetricCard 
        title="Monetary" 
        value="$2,453" 
        label="Net revenue (GGR)"
        icon={<CreditCard className="h-5 w-5 text-casino-thunder-green" />}
        change="+$478"
      />
      <MetricCard 
        title="Duration" 
        value="68" 
        label="Hours of engagement"
        icon={<Timer className="h-5 w-5 text-casino-thunder-green" />}
        change="+12"
      />
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  label: string;
  icon: React.ReactNode;
  change: string;
}

const MetricCard = ({ title, value, label, icon, change }: MetricCardProps) => {
  const isPositive = change.startsWith("+");
  
  return (
    <Card className="thunder-card">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-white/70 mb-1">{title}</p>
            <div className="text-2xl font-bold text-white">{value}</div>
            <p className="text-xs text-white/60 mt-1">{label}</p>
          </div>
          <div className="p-2 rounded-full bg-casino-thunder-darker">
            {icon}
          </div>
        </div>
        <div className={`text-xs font-medium mt-4 ${isPositive ? 'text-green-400' : 'text-amber-400'}`}>
          {change} from previous period
        </div>
      </CardContent>
    </Card>
  );
};


import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart as RechartsAreaChart
} from 'recharts';

// Chart component wrapper
export const Chart = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export interface BarChartProps {
  data: any[];
  categories: string[];
  index?: string;
  colors?: string[];
  valueFormatter?: (value: any) => string;
  className?: string;
  height?: number | string;
  yAxisWidth?: number;
}

export const BarChart = ({
  data,
  categories,
  index = "name",
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'],
  valueFormatter = (value) => `${value}`,
  className = 'h-[300px]',
  height = 300,
  yAxisWidth
}: BarChartProps) => {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey={index} stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip 
            formatter={valueFormatter} 
            contentStyle={{ backgroundColor: '#1A1F2C', border: '1px solid #333', borderRadius: '4px' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#ccc' }} />
          {categories.map((category, i) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[i % colors.length]}
              name={category}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export interface LineChartProps {
  data: any[];
  categories: string[];
  index?: string;
  colors?: string[];
  valueFormatter?: (value: any) => string;
  className?: string;
  height?: number | string;
  yAxisWidth?: number;
}

export const LineChart = ({
  data,
  categories,
  index = "name",
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'],
  valueFormatter = (value) => `${value}`,
  className = 'h-[300px]',
  height = 300,
  yAxisWidth
}: LineChartProps) => {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey={index} stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip 
            formatter={valueFormatter} 
            contentStyle={{ backgroundColor: '#1A1F2C', border: '1px solid #333', borderRadius: '4px' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#ccc' }} />
          {categories.map((category, i) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[i % colors.length]}
              activeDot={{ r: 8 }}
              name={category}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export interface AreaChartProps {
  data: any[];
  categories: string[];
  index?: string;
  colors?: string[];
  stacked?: boolean;
  valueFormatter?: (value: any) => string;
  className?: string;
  height?: number | string;
  yAxisWidth?: number;
}

export const AreaChart = ({
  data,
  categories,
  index = "name",
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'],
  stacked = false,
  valueFormatter = (value) => `${value}`,
  className = 'h-[300px]',
  height = 300,
  yAxisWidth
}: AreaChartProps) => {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey={index} stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip 
            formatter={valueFormatter} 
            contentStyle={{ backgroundColor: '#1A1F2C', border: '1px solid #333', borderRadius: '4px' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#ccc' }} />
          {categories.map((category, i) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stackId={stacked ? "1" : undefined}
              fill={colors[i % colors.length]}
              stroke={colors[i % colors.length]}
              name={category}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export interface PieChartProps {
  data: { name: string; value: number }[];
  colors?: string[];
  valueFormatter?: (value: any) => string;
  className?: string;
  height?: number | string;
}

export const PieChart = ({
  data,
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'],
  valueFormatter = (value) => `${value}`,
  className = 'h-[300px]',
  height = 300
}: PieChartProps) => {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            dataKey="value"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={valueFormatter} 
            contentStyle={{ backgroundColor: '#1A1F2C', border: '1px solid #333', borderRadius: '4px' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#ccc' }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Add DonutChart
export const DonutChart = ({ data, colors, valueFormatter, className, height }: PieChartProps) => {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            dataKey="value"
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            fill="#8884d8"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors?.[index % (colors?.length || 1)] || '#8884d8'} />
            ))}
          </Pie>
          <Tooltip 
            formatter={valueFormatter} 
            contentStyle={{ backgroundColor: '#1A1F2C', border: '1px solid #333', borderRadius: '4px' }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#ccc' }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

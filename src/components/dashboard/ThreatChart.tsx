import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", critical: 4, high: 8, medium: 12, low: 5 },
  { name: "Tue", critical: 3, high: 10, medium: 15, low: 8 },
  { name: "Wed", critical: 2, high: 6, medium: 10, low: 12 },
  { name: "Thu", critical: 5, high: 12, medium: 18, low: 7 },
  { name: "Fri", critical: 1, high: 5, medium: 8, low: 15 },
  { name: "Sat", critical: 3, high: 7, medium: 14, low: 10 },
  { name: "Sun", critical: 2, high: 4, medium: 9, low: 6 },
];

export const ThreatChart = () => {
  return (
    <Card className="gradient-card shadow-card border-border/50 p-6">
      <h3 className="text-lg font-semibold mb-4">Threat Detection Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" />
          <XAxis dataKey="name" stroke="hsl(215 20% 65%)" />
          <YAxis stroke="hsl(215 20% 65%)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(222 47% 14%)",
              border: "1px solid hsl(217 33% 22%)",
              borderRadius: "0.5rem",
            }}
          />
          <Area
            type="monotone"
            dataKey="critical"
            stackId="1"
            stroke="hsl(0 84% 60%)"
            fill="url(#colorCritical)"
          />
          <Area
            type="monotone"
            dataKey="high"
            stackId="1"
            stroke="hsl(38 92% 50%)"
            fill="url(#colorHigh)"
          />
          <Area
            type="monotone"
            dataKey="medium"
            stackId="1"
            stroke="hsl(199 89% 48%)"
            fill="url(#colorMedium)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

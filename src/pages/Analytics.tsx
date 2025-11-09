import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const threatData = [
  { name: "Mon", critical: 12, high: 23, medium: 45, low: 18 },
  { name: "Tue", critical: 8, high: 19, medium: 52, low: 21 },
  { name: "Wed", critical: 15, high: 28, medium: 38, low: 19 },
  { name: "Thu", critical: 6, high: 15, medium: 48, low: 31 },
  { name: "Fri", critical: 11, high: 22, medium: 41, low: 26 },
  { name: "Sat", critical: 4, high: 12, medium: 35, low: 29 },
  { name: "Sun", critical: 7, high: 18, medium: 42, low: 23 },
];

const scanTypeData = [
  { name: "URL Scans", value: 342, color: "hsl(var(--chart-1))" },
  { name: "File Scans", value: 156, color: "hsl(var(--chart-2))" },
  { name: "API Scans", value: 89, color: "hsl(var(--chart-3))" },
];

const performanceData = [
  { time: "00:00", scans: 45, avgDuration: 2.3 },
  { time: "04:00", scans: 23, avgDuration: 2.1 },
  { time: "08:00", scans: 78, avgDuration: 2.8 },
  { time: "12:00", scans: 124, avgDuration: 3.2 },
  { time: "16:00", scans: 98, avgDuration: 2.9 },
  { time: "20:00", scans: 67, avgDuration: 2.5 },
];

export default function Analytics() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">Detailed insights into your security scans</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="gradient-card shadow-card border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Threat Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={threatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Bar dataKey="critical" fill="hsl(var(--destructive))" stackId="a" />
                <Bar dataKey="high" fill="hsl(var(--chart-1))" stackId="a" />
                <Bar dataKey="medium" fill="hsl(var(--chart-2))" stackId="a" />
                <Bar dataKey="low" fill="hsl(var(--chart-3))" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="gradient-card shadow-card border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Scan Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scanTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {scanTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="gradient-card shadow-card border-border/50 p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Scan Performance Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="scans" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="avgDuration" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="gradient-card shadow-card border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Calendar View</h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border border-border/50"
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

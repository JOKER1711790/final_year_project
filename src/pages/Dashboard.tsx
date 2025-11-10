
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scan } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ShieldCheck,
  FileWarning,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

const processChartData = (scans: Scan[]) => {
  const dailyThreats = new Map<string, { high: number; medium: number; low: number }>();
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Initialize map for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
    dailyThreats.set(key, { high: 0, medium: 0, low: 0 });
  }

  // Process scans
  scans.forEach((scan) => {
    if (!scan.createdAt) return;
    const scanDate = new Date(scan.createdAt);
    const key = scanDate.toISOString().split("T")[0];

    if (dailyThreats.has(key)) {
      const threatCount = dailyThreats.get(key)!;
      if (scan.threatLevel === "high" || scan.threatLevel === "critical") {
        threatCount.high++;
      } else if (scan.threatLevel === "medium") {
        threatCount.medium++;
      } else if (scan.threatLevel === "low") {
        threatCount.low++;
      }
    }
  });

  const chartData = Array.from(dailyThreats.entries()).map(([date, threats]) => ({
    name: dayLabels[new Date(date).getUTCDay()],
    ...threats,
  }));

  return chartData;
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      {({ scans }) => {
        const summaryStats = useMemo(() => {
          return {
            totalScans: scans.length,
            threatsDetected: scans.filter((s) => s.threats > 0).length,
            cleanFiles: scans.filter((s) => s.threats === 0).length,
            pendingScans: scans.filter(
              (s) => s.status === "pending" || s.status === "scanning"
            ).length,
          };
        }, [scans]);

        const chartData = useMemo(() => processChartData(scans), [scans]);
        const recentScans = scans.slice(0, 5);

        return (
          <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Security Dashboard</h1>
                <p className="text-muted-foreground">Monitor threats and manage your security scans</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="gradient-card shadow-card border-border/50 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                  <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold mt-2">{summaryStats.totalScans}</p>
              </Card>
              <Card className="gradient-card shadow-card border-border/50 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Threats Detected</p>
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <p className="text-3xl font-bold mt-2 text-destructive">{summaryStats.threatsDetected}</p>
              </Card>
              <Card className="gradient-card shadow-card border-border/50 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Clean Files</p>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold mt-2 text-green-500">{summaryStats.cleanFiles}</p>
              </Card>
              <Card className="gradient-card shadow-card border-border/50 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Pending Scans</p>
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold mt-2">{summaryStats.pendingScans}</p>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="gradient-card shadow-card border-border/50 p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Threat Detection Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                        <Legend />
                        <Line type="monotone" dataKey="high" stroke="hsl(var(--destructive))" name="High/Critical" />
                        <Line type="monotone" dataKey="medium" stroke="hsl(var(--chart-1))" name="Medium" />
                        <Line type="monotone" dataKey="low" stroke="hsl(var(--chart-2))" name="Low" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="gradient-card shadow-card border-border/50 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Recent Scans</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/scan-history")}
                        >
                            View All
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {recentScans.length > 0 ? (
                            recentScans.map((scan) => (
                            <div key={scan._id} className="flex items-center">
                                <div className="flex-1">
                                <p className="font-medium truncate">{scan.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {scan.threats} threats found
                                </p>
                                </div>
                                <p className={`text-sm font-medium ml-4 ${
                                    scan.threatLevel === 'critical' || scan.threatLevel === 'high' ? 'text-destructive' :
                                    scan.threatLevel === 'medium' ? 'text-chart-1' : 'text-muted-foreground'
                                }`}>{scan.threatLevel}</p>
                            </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
                                <p>No recent scans found.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
          </div>
        );
      }}
    </DashboardLayout>
  );
}

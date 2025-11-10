
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
import { Scan } from "@/types/index";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

export default function Analytics() {
    const [scansSnapshot, loading] = useCollection(collection(db, "scans"));

    const scans = useMemo(() => {
        if (!scansSnapshot) return [];
        return scansSnapshot.docs.map(doc => ({ _id: doc.id, findings: '', ...doc.data() } as Scan));
    }, [scansSnapshot]);

    const threatData = useMemo(() => {
        const counts = scans.reduce((acc, scan) => {
        acc[scan.threatLevel] = (acc[scan.threatLevel] || 0) + 1;
        return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [scans]);

    const scanTypeData = useMemo(() => {
        const counts = scans.reduce((acc, scan) => {
        acc[scan.type] = (acc[scan.type] || 0) + 1;
        return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [scans]);

    if (loading) {
        return (
          <DashboardLayout>
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="ml-4">Loading analytics...</p>
            </div>
          </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-fade-in">
                <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
                <p className="text-muted-foreground">Detailed insights into your security scans</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                <Card className="gradient-card shadow-card border-border/50 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Threat Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={threatData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="gradient-card shadow-card border-border/50 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Scan Types Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={scanTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {scanTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                        <Legend />
                    </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card className="gradient-card shadow-card border-border/50 p-6 md:col-span-2">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Scan Performance</h3>
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Performance data is not yet available from the backend.</p>
                    </div>
                </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

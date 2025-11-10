
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Info, CheckCircle2, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { Scan } from "@/types/index";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

const getAlertIcon = (type: string) => {
  switch (type) {
    case "critical": return <AlertTriangle className="w-5 h-5 text-destructive" />;
    case "high": return <Shield className="w-5 h-5 text-chart-1" />;
    default: return <Info className="w-5 h-5" />;
  }
};

const getAlertColor = (type: string) => {
  switch (type) {
    case "critical": return "destructive";
    case "high": return "default";
    default: return "outline";
  }
};

export default function Alerts() {
  const [scansSnapshot, loading] = useCollection(collection(db, "scans"));

  const scans = useMemo(() => {
    if (!scansSnapshot) return [];
    return scansSnapshot.docs.map(doc => ({ _id: doc.id, findings: '', ...doc.data() } as Scan));
  }, [scansSnapshot]);

  const alerts = useMemo(() => {
    return scans
      .filter(scan => scan.threatLevel === 'high' || scan.threatLevel === 'critical')
      .map(scan => ({
        id: scan._id,
        type: scan.threatLevel,
        title: `Threat detected in ${scan.name}`,
        message: `A ${scan.threatLevel} threat was detected during the scan of ${scan.name}.`,
        timestamp: new Date(scan.createdAt).toLocaleString(),
      }));
  }, [scans]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="ml-4">Loading alerts...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Security Alerts</h1>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="gradient-card shadow-card border-border/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-foreground">
                  {alerts.filter(a => a.type === "critical").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="gradient-card shadow-card border-border/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-foreground">
                  {alerts.filter(a => a.type === "high").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="gradient-card shadow-card border-border/50 p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">All Alerts</h3>
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <Card key={alert.id} className="p-4 border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getAlertIcon(alert.type)}</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge variant={getAlertColor(alert.type)}>{alert.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h4 className="text-lg font-semibold">No Alerts</h4>
                <p className="text-muted-foreground">Your scans have not triggered any alerts.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

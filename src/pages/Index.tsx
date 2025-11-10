
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { UploadSection } from "@/components/dashboard/UploadSection";
import { ThreatChart } from "@/components/dashboard/ThreatChart";
import { RecentScans } from "@/components/dashboard/RecentScans";
import { Shield, FileWarning, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Scan } from "@/types/index";

const Index = () => {
  const [scans, loading] = useCollection(collection(db, "scans"));

  const totalScans = scans?.docs.length || 0;
  const threatsDetected = scans?.docs.reduce((acc, scan) => acc + (scan.data() as Scan).threats, 0) || 0;
  const cleanFiles = scans?.docs.filter(scan => (scan.data() as Scan).threats === 0).length || 0;
  const pendingScans = scans?.docs.filter(scan => scan.data().status === 'pending' || scan.data().status === 'scanning').length || 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="ml-4">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Security Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor threats and manage your security scans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Shield}
              label="Total Scans"
              value={totalScans.toString()}
            />
            <StatCard
              icon={FileWarning}
              label="Threats Detected"
              value={threatsDetected.toString()}
            />
            <StatCard
              icon={CheckCircle}
              label="Clean Files"
              value={cleanFiles.toString()}
            />
            <StatCard
              icon={AlertTriangle}
              label="Pending Scans"
              value={pendingScans.toString()}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UploadSection />
            <ThreatChart />
          </div>

          <RecentScans scans={scans?.docs.map(doc => ({ _id: doc.id, findings: '', ...doc.data() } as Scan)) || []} />
        </div>
    </DashboardLayout>
  );
};

export default Index;

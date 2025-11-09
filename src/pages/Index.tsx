import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { UploadSection } from "@/components/dashboard/UploadSection";
import { ThreatChart } from "@/components/dashboard/ThreatChart";
import { RecentScans } from "@/components/dashboard/RecentScans";
import { Shield, FileWarning, CheckCircle, AlertTriangle } from "lucide-react";

const Index = () => {
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
            value="1,284"
            change="+12% from last week"
            trend="up"
          />
          <StatCard
            icon={FileWarning}
            label="Threats Detected"
            value="47"
            change="-8% from last week"
            trend="down"
          />
          <StatCard
            icon={CheckCircle}
            label="Clean Files"
            value="1,237"
            change="+15% from last week"
            trend="up"
          />
          <StatCard
            icon={AlertTriangle}
            label="Pending Scans"
            value="3"
            change="2 active now"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UploadSection />
          <ThreatChart />
        </div>

        <RecentScans />
      </div>
    </DashboardLayout>
  );
};

export default Index;

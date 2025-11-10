
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Globe,
  Code,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Scan } from "@/types";

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "destructive";
    case "high":
      return "default";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "outline";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "url":
      return <Globe className="w-5 h-5" />;
    case "api":
      return <Code className="w-5 h-5" />;
    case "file":
      return <FileText className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

export default function ScanResults() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      {({ scans }) => {
        const scan: Scan | undefined = scans.find((s) => s._id === scanId);

        if (!scan) {
          return (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="ml-4">Loading scan results...</p>
            </div>
          );
        }

        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/scan-history")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to History
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Scan Results
                </h1>
              </div>
            </div>

            <Card className="gradient-card shadow-card border-border/50 p-6">
              <div className="flex items-center gap-4">
                {getTypeIcon(scan.type)}
                <div>
                  <h2 className="text-xl font-semibold">{scan.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getSeverityColor(scan.threatLevel)}>
                      {scan.threatLevel}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {scan.threats} threats found
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="gradient-card shadow-card border-border/50 p-12 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
              <h3 className="text-xl font-semibold mb-2">
                Detailed Report Coming Soon
              </h3>
              <p className="text-muted-foreground">
                The backend currently does not support detailed vulnerability reports.
                This feature will be implemented in a future update.
              </p>
            </Card>
          </div>
        );
      }}
    </DashboardLayout>
  );
}

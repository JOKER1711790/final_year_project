
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Globe, Clock } from "lucide-react";
import { Scan } from "@/types";

const getThreatBadge = (threat: string | null) => {
  if (!threat) return null;

  const variants: Record<string, { variant: any; text: string }> = {
    critical: { variant: "destructive", text: "Critical" },
    high: { variant: "destructive", text: "High" },
    medium: { variant: "default", text: "Medium" },
    low: { variant: "secondary", text: "Low" },
    safe: { variant: "outline", text: "Safe" },
  };

  const config = variants[threat] || variants.safe;

  return (
    <Badge variant={config.variant} className="font-medium">
      {config.text}
    </Badge>
  );
};

interface RecentScansProps {
  scans: Scan[];
}

export const RecentScans = ({ scans }: RecentScansProps) => {
  return (
    <Card className="gradient-card shadow-card border-border/50 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Recent Scans
      </h3>

      <div className="space-y-3">
        {scans.map((scan) => (
          <div
            key={scan._id}
            className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                {scan.type === "file" ? (
                  <FileText className="w-5 h-5 text-primary" />
                ) : (
                  <Globe className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{scan.name}</p>
                <p className="text-xs text-muted-foreground">{new Date(scan.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {scan.status === "scanning" ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                  <span className="text-xs text-primary font-medium">Scanning...</span>
                </div>
              ) : (
                getThreatBadge(scan.threatLevel)
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

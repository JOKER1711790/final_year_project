
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { AIAnalysisResult } from "@/lib/scanner/ai-analysis";

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
    case "high":
      return "destructive";
    case "medium":
    case "low":
    default:
      return "default"; // Corrected variant
  }
};

export default function ScanResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const scanResult: AIAnalysisResult | null = location.state?.scanResult;

  if (!scanResult) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <AlertTriangle className="w-8 h-8 text-destructive" />
          <p className="ml-4">No scan results found.</p>
          <Button onClick={() => navigate("/")} className="ml-4">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { anomalies, suggestions, confidence, modelVersion, analyzedAt } = scanResult;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)} // Go back to the previous page
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scan
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Scan Results
            </h1>
          </div>
        </div>

        <Card className="gradient-card shadow-card border-border/50 p-6">
          <div className="flex items-center gap-4">
            <FileText className="w-10 h-10 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Analysis Report</h2>
              <p className="text-sm text-muted-foreground">
                Analyzed on {new Date(analyzedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="gradient-card shadow-card border-border/50 p-6">
          <h3 className="text-xl font-semibold mb-4">Anomalies Detected</h3>
          {anomalies.length > 0 ? (
            <div className="space-y-4">
              {anomalies.map((anomaly) => (
                <Alert key={anomaly.id} variant={getSeverityColor(anomaly.severity)}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="font-semibold">{anomaly.description}</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-semibold">Location:</span> {anomaly.location}</p>
                      <p><span className="font-semibold">Confidence:</span> {anomaly.confidence}%</p>
                      <p><span className="font-semibold">Recommendation:</span> {anomaly.recommendation}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No anomalies were detected.</p>
          )}
        </Card>

        <Card className="gradient-card shadow-card border-border/50 p-6">
          <h3 className="text-xl font-semibold mb-4">Security Suggestions</h3>
          {suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Alert key={suggestion.id} variant="default">
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle className="font-semibold">{suggestion.title}</AlertTitle>
                  <AlertDescription>
                    {suggestion.description}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No security suggestions at this time.</p>
          )}
        </Card>

        <Card className="gradient-card shadow-card border-border/50 p-6 text-sm">
          <div className="flex justify-between">
            <p><strong>Confidence Score:</strong> {confidence}%</p>
            <p><strong>Model Version:</strong> {modelVersion}</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

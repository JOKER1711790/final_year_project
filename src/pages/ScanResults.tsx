import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Shield,
  CheckCircle2,
  Download,
  FileText,
  Code,
  Globe,
  Brain,
  Zap,
  ExternalLink,
  Copy,
  ArrowLeft,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { ScanResult } from "@/lib/scanner/scan-engine";
import { Vulnerability } from "@/lib/scanner/vulnerability-scanner";
import { ExportService } from "@/lib/reporting/export-service";

// Mock scan result data (in production, fetch from API)
const mockScanResult: ScanResult = {
  id: "scan-1234567890",
  target: "https://example.com",
  type: "url",
  status: "completed",
  vulnerabilities: [
    {
      id: "vuln-1",
      type: "SQL_INJECTION",
      severity: "critical",
      title: "Potential SQL Injection Vulnerability",
      description:
        "The input contains patterns commonly used in SQL injection attacks.",
      cwe: "CWE-89",
      owaspCategory: "A03:2021 – Injection",
      location: "https://example.com/search?q=test",
      evidence: "SQL injection patterns detected in input",
      recommendation: "Use parameterized queries and input validation.",
      riskScore: 90,
      detectedAt: new Date(),
    },
    {
      id: "vuln-2",
      type: "XSS",
      severity: "high",
      title: "Cross-Site Scripting (XSS) Vulnerability",
      description:
        "The input contains patterns that could lead to XSS attacks.",
      cwe: "CWE-79",
      owaspCategory: "A03:2021 – Injection",
      location: "https://example.com/comment",
      evidence: "XSS patterns detected in input",
      recommendation:
        "Implement proper output encoding and Content Security Policy (CSP).",
      riskScore: 85,
      detectedAt: new Date(),
    },
  ],
  riskScore: 87,
  severity: "critical",
  startedAt: new Date(Date.now() - 300000),
  completedAt: new Date(),
  duration: 45,
  config: {
    scanDepth: "comprehensive",
    includeVulnerabilities: true,
    includeMalware: true,
    includePhishing: true,
    includePerformance: false,
    enableAIAnalysis: true,
    enablePenetrationTesting: true,
    timeout: 300,
  },
};

export default function ScanResults() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const [scanResult] = useState<ScanResult>(mockScanResult);

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

  const exportReport = (format: "pdf" | "json" | "csv" | "html") => {
    try {
      ExportService.export(scanResult, format);
      toast.success(`Report exported as ${format.toUpperCase()}`, {
        description: "Download started successfully",
      });
    } catch (error) {
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const copyScanId = () => {
    navigator.clipboard.writeText(scanResult.id);
    toast.success("Scan ID copied to clipboard");
  };

  const severityDistribution = {
    critical: scanResult.vulnerabilities.filter(
      (v) => v.severity === "critical"
    ).length,
    high: scanResult.vulnerabilities.filter((v) => v.severity === "high")
      .length,
    medium: scanResult.vulnerabilities.filter((v) => v.severity === "medium")
      .length,
    low: scanResult.vulnerabilities.filter((v) => v.severity === "low").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Scan Results
              </h1>
              <p className="text-muted-foreground">
                Detailed security analysis for {scanResult.target}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportReport("pdf")}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => exportReport("json")}>
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => exportReport("html")}>
              <Download className="w-4 h-4 mr-2" />
              Export HTML
            </Button>
            <Button variant="outline" onClick={() => exportReport("csv")}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Scan Info Card */}
        <Card className="gradient-card shadow-card border-border/50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {getTypeIcon(scanResult.type)}
              <div>
                <h2 className="text-xl font-semibold">{scanResult.target}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getSeverityColor(scanResult.severity)}>
                    {scanResult.severity}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Risk Score: {scanResult.riskScore}/100
                  </span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {scanResult.duration}s
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Scan ID</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm font-mono">{scanResult.id}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyScanId}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Risk Score Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Risk Score</span>
              <span className="text-sm font-bold">
                {scanResult.riskScore}/100
              </span>
            </div>
            <Progress value={scanResult.riskScore} className="h-3" />
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gradient-card shadow-card border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Vulnerabilities
                </p>
                <p className="text-2xl font-bold">
                  {scanResult.vulnerabilities.length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive opacity-50" />
            </div>
          </Card>
          <Card className="gradient-card shadow-card border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">
                  {severityDistribution.critical}
                </p>
              </div>
              <Shield className="w-8 h-8 text-destructive opacity-50" />
            </div>
          </Card>
          <Card className="gradient-card shadow-card border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High</p>
                <p className="text-2xl font-bold">
                  {severityDistribution.high}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
          <Card className="gradient-card shadow-card border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold capitalize">
                  {scanResult.status}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="vulnerabilities" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vulnerabilities">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Vulnerabilities ({scanResult.vulnerabilities.length})
            </TabsTrigger>
            <TabsTrigger value="ai-analysis">
              <Brain className="w-4 h-4 mr-2" />
              AI Analysis
            </TabsTrigger>
            <TabsTrigger value="penetration-test">
              <Zap className="w-4 h-4 mr-2" />
              Penetration Test
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Shield className="w-4 h-4 mr-2" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          {/* Vulnerabilities Tab */}
          <TabsContent value="vulnerabilities" className="space-y-4 mt-6">
            {scanResult.vulnerabilities.length === 0 ? (
              <Card className="gradient-card shadow-card border-border/50 p-12 text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold mb-2">
                  No Vulnerabilities Detected
                </h3>
                <p className="text-muted-foreground">
                  The target appears secure. No security vulnerabilities were
                  found.
                </p>
              </Card>
            ) : (
              scanResult.vulnerabilities.map((vuln) => (
                <Card
                  key={vuln.id}
                  className="gradient-card shadow-card border-border/50 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={getSeverityColor(vuln.severity)}>
                          {vuln.severity}
                        </Badge>
                        <h3 className="text-lg font-semibold">{vuln.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {vuln.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {vuln.cwe && (
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {vuln.cwe}
                          </Badge>
                        )}
                        {vuln.owaspCategory && (
                          <Badge variant="outline" className="text-xs">
                            {vuln.owaspCategory}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          Risk: {vuln.riskScore}/100
                        </Badge>
                      </div>
                      {vuln.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Globe className="w-4 h-4" />
                          <span className="font-mono">{vuln.location}</span>
                        </div>
                      )}
                      {vuln.evidence && (
                        <div className="bg-muted/50 p-3 rounded-lg mb-3">
                          <p className="text-xs font-medium mb-1">Evidence:</p>
                          <p className="text-sm font-mono">{vuln.evidence}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-4">
                    <p className="text-sm font-medium mb-2">Recommendation:</p>
                    <p className="text-sm text-muted-foreground">
                      {vuln.recommendation}
                    </p>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai-analysis" className="space-y-4 mt-6">
            {scanResult.aiAnalysis ? (
              <>
                <Card className="gradient-card shadow-card border-border/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      AI Analysis Summary
                    </h3>
                    <Badge variant="outline">
                      Confidence: {scanResult.aiAnalysis.confidence}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    AI-powered analysis detected{" "}
                    {scanResult.aiAnalysis.anomalies.length} anomalies and
                    generated {scanResult.aiAnalysis.suggestions.length}{" "}
                    security recommendations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Anomalies Detected:
                      </p>
                      <p className="text-2xl font-bold">
                        {scanResult.aiAnalysis.anomalies.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Suggestions Generated:
                      </p>
                      <p className="text-2xl font-bold">
                        {scanResult.aiAnalysis.suggestions.length}
                      </p>
                    </div>
                  </div>
                </Card>

                {scanResult.aiAnalysis.anomalies.length > 0 && (
                  <Card className="gradient-card shadow-card border-border/50 p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Detected Anomalies
                    </h3>
                    <div className="space-y-3">
                      {scanResult.aiAnalysis.anomalies.map((anomaly) => (
                        <div
                          key={anomaly.id}
                          className="p-4 rounded-lg bg-muted/50 border border-border/50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity}
                            </Badge>
                            <span className="text-sm font-medium">
                              {anomaly.type}
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              Confidence: {anomaly.confidence}%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {anomaly.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {anomaly.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card className="gradient-card shadow-card border-border/50 p-12 text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  AI Analysis Not Available
                </h3>
                <p className="text-muted-foreground">
                  AI analysis was not enabled for this scan.
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Penetration Test Tab */}
          <TabsContent value="penetration-test" className="space-y-4 mt-6">
            {scanResult.penetrationTest ? (
              <>
                <Card className="gradient-card shadow-card border-border/50 p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Penetration Test Results
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Exploits
                      </p>
                      <p className="text-2xl font-bold">
                        {scanResult.penetrationTest.exploits.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Validated</p>
                      <p className="text-2xl font-bold text-green-500">
                        {
                          scanResult.penetrationTest.validatedVulnerabilities
                            .length
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        False Positives
                      </p>
                      <p className="text-2xl font-bold">
                        {scanResult.penetrationTest.falsePositives.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Risk Score
                      </p>
                      <p className="text-2xl font-bold">
                        {scanResult.penetrationTest.riskScore}/100
                      </p>
                    </div>
                  </div>
                </Card>

                {scanResult.penetrationTest.exploits.length > 0 && (
                  <Card className="gradient-card shadow-card border-border/50 p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Exploit Details
                    </h3>
                    <div className="space-y-3">
                      {scanResult.penetrationTest.exploits.map((exploit) => (
                        <div
                          key={exploit.id}
                          className="p-4 rounded-lg bg-muted/50 border border-border/50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={
                                exploit.status === "success"
                                  ? "destructive"
                                  : exploit.status === "blocked"
                                  ? "outline"
                                  : "secondary"
                              }
                            >
                              {exploit.status}
                            </Badge>
                            <span className="text-sm font-medium">
                              {exploit.exploitType}
                            </span>
                            {exploit.validated && (
                              <Badge
                                variant="outline"
                                className="text-green-500"
                              >
                                Validated
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {exploit.description}
                          </p>
                          {exploit.payload && (
                            <div className="bg-background p-2 rounded font-mono text-xs mb-2">
                              Payload: {exploit.payload}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Risk Score: {exploit.riskScore}/100
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card className="gradient-card shadow-card border-border/50 p-12 text-center">
                <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  Penetration Test Not Available
                </h3>
                <p className="text-muted-foreground">
                  Penetration testing was not enabled for this scan.
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4 mt-6">
            {scanResult.aiAnalysis?.suggestions &&
            scanResult.aiAnalysis.suggestions.length > 0 ? (
              <div className="space-y-4">
                {scanResult.aiAnalysis.suggestions.map((suggestion) => (
                  <Card
                    key={suggestion.id}
                    className="gradient-card shadow-card border-border/50 p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              suggestion.priority === "high"
                                ? "destructive"
                                : suggestion.priority === "medium"
                                ? "default"
                                : "outline"
                            }
                          >
                            {suggestion.priority} priority
                          </Badge>
                          <h3 className="text-lg font-semibold">
                            {suggestion.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {suggestion.description}
                        </p>
                        {suggestion.codeExample && (
                          <div className="bg-muted/50 p-4 rounded-lg mb-3">
                            <p className="text-xs font-medium mb-2">
                              Code Example:
                            </p>
                            <pre className="text-xs font-mono whitespace-pre-wrap">
                              {suggestion.codeExample}
                            </pre>
                          </div>
                        )}
                        {suggestion.references &&
                          suggestion.references.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium mb-2">
                                References:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {suggestion.references.map((ref, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => window.open(ref, "_blank")}
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Reference {idx + 1}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="gradient-card shadow-card border-border/50 p-12 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  No Recommendations Available
                </h3>
                <p className="text-muted-foreground">
                  Enable AI analysis to get security recommendations.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

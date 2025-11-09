import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Link as LinkIcon,
  File,
  Code,
  Scan,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  Shield,
  FileText,
  Globe,
  Loader2,
  History,
  Sparkles,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  validateUrl,
  validateApiEndpoint,
  validateFile,
  generateSafeFilename,
  type ValidatedInput,
} from "@/lib/validation";
import { useNavigate } from "react-router-dom";
import {
  ScanEngine,
  ScanConfig as ScanEngineConfig,
} from "@/lib/scanner/scan-engine";
import { LocalStorageApiClient } from "@/lib/api/api-client";
import { ScanScheduler } from "@/lib/scheduler/scan-scheduler";
import { WebhookService } from "@/lib/webhooks/webhook-service";
import { useScanProgress } from "@/hooks/use-websocket";

interface ScanConfig {
  scanType: "quick" | "deep" | "custom";
  scanDepth: "basic" | "standard" | "comprehensive";
  includeVulnerabilities: boolean;
  includeMalware: boolean;
  includePhishing: boolean;
  includePerformance: boolean;
  timeout: number; // in seconds
}

interface QueuedScan {
  id: string;
  type: "url" | "file" | "api";
  target: string;
  status: "queued" | "scanning" | "completed" | "failed";
  progress: number;
  config: ScanConfig;
}

export default function NewScan() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"url" | "api" | "file">("url");
  const [url, setUrl] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [queuedScans, setQueuedScans] = useState<QueuedScan[]>([]);

  const [scanConfig, setScanConfig] = useState<ScanConfig>({
    scanType: "quick",
    scanDepth: "standard",
    includeVulnerabilities: true,
    includeMalware: true,
    includePhishing: true,
    includePerformance: false,
    timeout: 300,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize services on mount
  useEffect(() => {
    // Initialize scheduler
    ScanScheduler.initialize().catch(console.error);

    // Initialize webhook service
    WebhookService.initialize().catch(console.error);

    // Cleanup on unmount
    return () => {
      ScanScheduler.stop();
    };
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error("File validation failed", {
        description: validation.error,
      });
      return;
    }
    setSelectedFile(file);
    toast.success("File selected", {
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    });
  };

  const executeRealScan = async (
    scanId: string,
    target: string,
    type: "url" | "api" | "file",
    config: ScanConfig,
    fileContent?: string
  ) => {
    try {
      // Convert UI config to engine config
      const engineConfig: ScanEngineConfig = {
        scanDepth: config.scanDepth,
        includeVulnerabilities: config.includeVulnerabilities,
        includeMalware: config.includeMalware,
        includePhishing: config.includePhishing,
        includePerformance: config.includePerformance,
        enableAIAnalysis: true,
        enablePenetrationTesting: config.scanDepth === "comprehensive",
        timeout: config.timeout,
      };

      // Update status to scanning
      setQueuedScans((prev) =>
        prev.map((scan) =>
          scan.id === scanId ? { ...scan, status: "scanning" } : scan
        )
      );

      // Trigger webhook for scan started
      await WebhookService.triggerWebhooks("scan_started", {
        scanId,
        target,
        type,
      });

      // Execute scan with file content if available
      const result = await ScanEngine.executeScan(
        target,
        type,
        engineConfig,
        fileContent
      );

      // Save scan result to storage
      await LocalStorageApiClient.saveScan(result);

      // Update queue with completed status
      setQueuedScans((prev) =>
        prev.map((scan) =>
          scan.id === scanId
            ? { ...scan, status: "completed", progress: 100 }
            : scan
        )
      );

      // Trigger webhook for scan completed
      await WebhookService.triggerWebhooks("scan_completed", {
        scanId: result.id,
        result,
      });

      // Trigger webhook for critical vulnerabilities
      if (result.severity === "critical" || result.severity === "high") {
        await WebhookService.triggerWebhooks("critical_vulnerability", {
          scanId: result.id,
          result,
        });
      }

      toast.success("Scan completed!", {
        description: `Security scan for ${target} has finished. Found ${result.vulnerabilities.length} vulnerabilities.`,
        action: {
          label: "View Results",
          onClick: () => navigate(`/scan-results/${result.id}`),
        },
      });

      // Navigate to results after a delay
      setTimeout(() => {
        navigate(`/scan-results/${result.id}`);
      }, 2000);
    } catch (error) {
      // Update status to failed
      setQueuedScans((prev) =>
        prev.map((scan) =>
          scan.id === scanId ? { ...scan, status: "failed" } : scan
        )
      );

      // Trigger webhook for scan failed
      await WebhookService.triggerWebhooks("scan_failed", {
        scanId,
        target,
        type,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      toast.error("Scan failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleUrlScan = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setScanProgress(0);

    try {
      const validation = validateUrl(url);
      if (!validation.valid) {
        toast.error("URL validation failed", {
          description: validation.error,
        });
        return;
      }

      const scanId = `scan-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const target = validation.sanitized || url;

      const newScan: QueuedScan = {
        id: scanId,
        type: "url",
        target,
        status: "queued",
        progress: 0,
        config: scanConfig,
      };

      setQueuedScans((prev) => [...prev, newScan]);
      setUrl("");

      toast.success("Scan queued", {
        description: `Starting security scan for ${target}`,
      });

      // Execute real scan
      executeRealScan(scanId, target, "url", scanConfig);
    } catch (error) {
      toast.error("URL processing failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
      setScanProgress(0);
    }
  };

  const handleApiScan = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setScanProgress(0);

    try {
      const validation = validateApiEndpoint(apiEndpoint);
      if (!validation.valid) {
        toast.error("API endpoint validation failed", {
          description: validation.error,
        });
        return;
      }

      const scanId = `scan-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const target = validation.sanitized || apiEndpoint;

      const newScan: QueuedScan = {
        id: scanId,
        type: "api",
        target,
        status: "queued",
        progress: 0,
        config: scanConfig,
      };

      setQueuedScans((prev) => [...prev, newScan]);
      setApiEndpoint("");

      toast.success("API scan queued", {
        description: `Starting security scan for ${target}`,
      });

      // Execute real scan
      executeRealScan(scanId, target, "api", scanConfig);
    } catch (error) {
      toast.error("API endpoint processing failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
      setScanProgress(0);
    }
  };

  const handleFileScan = async () => {
    if (isProcessing || !selectedFile) return;

    setIsProcessing(true);
    setScanProgress(0);

    try {
      const validation = validateFile(selectedFile);
      if (!validation.valid) {
        toast.error("File validation failed", {
          description: validation.error,
        });
        return;
      }

      const safeFilename = await generateSafeFilename(selectedFile);
      const scanId = `scan-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const fileName = selectedFile.name;

      const newScan: QueuedScan = {
        id: scanId,
        type: "file",
        target: fileName,
        status: "queued",
        progress: 0,
        config: scanConfig,
      };

      setQueuedScans((prev) => [...prev, newScan]);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("File scan queued", {
        description: `Starting security scan for ${fileName}`,
      });

      // Read file content for scanning (if text-based file)
      let fileContent: string | undefined;
      try {
        if (
          selectedFile.type.startsWith("text/") ||
          selectedFile.name.endsWith(".js") ||
          selectedFile.name.endsWith(".ts") ||
          selectedFile.name.endsWith(".py") ||
          selectedFile.name.endsWith(".java") ||
          selectedFile.name.endsWith(".cpp") ||
          selectedFile.name.endsWith(".c") ||
          selectedFile.name.endsWith(".html") ||
          selectedFile.name.endsWith(".css") ||
          selectedFile.name.endsWith(".json") ||
          selectedFile.name.endsWith(".xml")
        ) {
          fileContent = await selectedFile.text();
        }
      } catch (error) {
        console.warn("Could not read file content:", error);
      }

      // Execute real scan with file content if available
      executeRealScan(scanId, fileName, "file", scanConfig, fileContent);
    } catch (error) {
      toast.error("File processing failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
      setScanProgress(0);
    }
  };

  const removeQueuedScan = (scanId: string) => {
    setQueuedScans((prev) => prev.filter((scan) => scan.id !== scanId));
    toast.info("Scan removed from queue");
  };

  const recentScans = [
    { type: "url", target: "https://example.com", timestamp: "2 hours ago" },
    { type: "file", target: "app.apk", timestamp: "5 hours ago" },
    {
      type: "api",
      target: "https://api.service.com/v1",
      timestamp: "1 day ago",
    },
  ];

  const quickScanTemplates = [
    {
      name: "Quick Security Check",
      icon: Zap,
      description: "Fast scan for common vulnerabilities",
      config: {
        scanType: "quick" as const,
        scanDepth: "basic" as const,
        includeVulnerabilities: true,
        includeMalware: true,
        includePhishing: false,
        includePerformance: false,
        timeout: 60,
      },
    },
    {
      name: "Deep Security Analysis",
      icon: Shield,
      description: "Comprehensive scan with all checks enabled",
      config: {
        scanType: "deep" as const,
        scanDepth: "comprehensive" as const,
        includeVulnerabilities: true,
        includeMalware: true,
        includePhishing: true,
        includePerformance: true,
        timeout: 600,
      },
    },
    {
      name: "Malware Detection",
      icon: AlertCircle,
      description: "Focus on malware and threat detection",
      config: {
        scanType: "custom" as const,
        scanDepth: "standard" as const,
        includeVulnerabilities: false,
        includeMalware: true,
        includePhishing: false,
        includePerformance: false,
        timeout: 300,
      },
    },
  ];

  const applyTemplate = (template: (typeof quickScanTemplates)[0]) => {
    setScanConfig(template.config);
    toast.success("Scan template applied", {
      description: template.name,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">New Scan</h1>
          <p className="text-muted-foreground">
            Start a security scan for URLs, files, or API endpoints
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Scan Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Scan Templates */}
            <Card className="gradient-card shadow-card border-border/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Quick Scan Templates
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickScanTemplates.map((template, idx) => (
                  <Card
                    key={idx}
                    className="p-4 border-border/50 hover:border-primary/50 cursor-pointer transition-colors"
                    onClick={() => applyTemplate(template)}
                  >
                    <template.icon className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {template.description}
                    </p>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Scan Input Section */}
            <Card className="gradient-card shadow-card border-border/50 p-6">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as any)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="url">
                    <Globe className="w-4 h-4 mr-2" />
                    URL Scan
                  </TabsTrigger>
                  <TabsTrigger value="api">
                    <Code className="w-4 h-4 mr-2" />
                    API Scan
                  </TabsTrigger>
                  <TabsTrigger value="file">
                    <FileText className="w-4 h-4 mr-2" />
                    File Scan
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="url-input">Website URL</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="url-input"
                          type="url"
                          placeholder="https://example.com"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleUrlScan()
                          }
                          className="flex-1"
                          disabled={isProcessing}
                        />
                        <Button
                          onClick={handleUrlScan}
                          className="gradient-primary"
                          disabled={isProcessing || !url.trim()}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Scan className="w-4 h-4 mr-2" />
                          )}
                          Start Scan
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Scan websites for security vulnerabilities, malware, and
                        phishing threats
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="api" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="api-input">API Endpoint</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="api-input"
                          type="url"
                          placeholder="https://api.example.com/v1/endpoint"
                          value={apiEndpoint}
                          onChange={(e) => setApiEndpoint(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleApiScan()
                          }
                          className="flex-1"
                          disabled={isProcessing}
                        />
                        <Button
                          onClick={handleApiScan}
                          className="gradient-primary"
                          disabled={isProcessing || !apiEndpoint.trim()}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Scan className="w-4 h-4 mr-2" />
                          )}
                          Start Scan
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Analyze API endpoints for security vulnerabilities and
                        misconfigurations
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  <div className="space-y-4">
                    {selectedFile ? (
                      <Card className="p-4 border-border/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <File className="w-8 h-8 text-primary" />
                            <div>
                              <p className="font-medium">{selectedFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          onClick={handleFileScan}
                          className="w-full mt-4 gradient-primary"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Scan className="w-4 h-4 mr-2" />
                          )}
                          Start File Scan
                        </Button>
                      </Card>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
                          isDragging
                            ? "border-primary bg-primary/5 scale-[1.02]"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Upload
                          className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                            isDragging
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <p className="text-sm font-medium mb-1">
                          {isDragging
                            ? "Drop file here"
                            : "Drag & drop file here"}
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Max 50MB • Allowed: .apk, .exe, .zip, .js, .py, and
                          more
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".apk,.exe,.zip,.js,.py,.jar,.ipa,.ts,.tsx,.jsx,.java,.cpp,.c,.go,.rb,.php,.html,.css,.json,.xml"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files[0]) {
                              handleFileSelect(files[0]);
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessing}
                        >
                          <File className="w-4 h-4 mr-2" />
                          Select File
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Scan Queue */}
            {queuedScans.length > 0 && (
              <Card className="gradient-card shadow-card border-border/50 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Scan Queue ({queuedScans.length})
                </h2>
                <div className="space-y-4">
                  {queuedScans.map((scan) => (
                    <Card key={scan.id} className="p-4 border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          {scan.type === "url" && (
                            <Globe className="w-5 h-5 text-primary" />
                          )}
                          {scan.type === "api" && (
                            <Code className="w-5 h-5 text-primary" />
                          )}
                          {scan.type === "file" && (
                            <FileText className="w-5 h-5 text-primary" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {scan.target}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={
                                  scan.status === "completed"
                                    ? "outline"
                                    : scan.status === "scanning"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {scan.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {scan.config.scanDepth} scan
                              </span>
                            </div>
                          </div>
                        </div>
                        {scan.status !== "scanning" &&
                          scan.status !== "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQueuedScan(scan.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                      </div>
                      {scan.status === "scanning" && (
                        <div className="mt-3">
                          <Progress value={scan.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {scan.progress}% complete
                          </p>
                        </div>
                      )}
                      {scan.status === "completed" && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-green-500">
                          <CheckCircle2 className="w-4 h-4" />
                          Scan completed
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Advanced Settings Sidebar */}
          <div className="space-y-6">
            <Card className="gradient-card shadow-card border-border/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Scan Configuration
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="scan-depth">Scan Depth</Label>
                  <Select
                    value={scanConfig.scanDepth}
                    onValueChange={(value: any) =>
                      setScanConfig({ ...scanConfig, scanDepth: value })
                    }
                  >
                    <SelectTrigger id="scan-depth" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic - Quick check</SelectItem>
                      <SelectItem value="standard">
                        Standard - Balanced
                      </SelectItem>
                      <SelectItem value="comprehensive">
                        Comprehensive - Deep analysis
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="vulnerabilities">
                        Vulnerability Scan
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Check for security vulnerabilities
                      </p>
                    </div>
                    <Switch
                      id="vulnerabilities"
                      checked={scanConfig.includeVulnerabilities}
                      onCheckedChange={(checked) =>
                        setScanConfig({
                          ...scanConfig,
                          includeVulnerabilities: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="malware">Malware Detection</Label>
                      <p className="text-xs text-muted-foreground">
                        Scan for malware and threats
                      </p>
                    </div>
                    <Switch
                      id="malware"
                      checked={scanConfig.includeMalware}
                      onCheckedChange={(checked) =>
                        setScanConfig({
                          ...scanConfig,
                          includeMalware: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="phishing">Phishing Detection</Label>
                      <p className="text-xs text-muted-foreground">
                        Check for phishing attempts
                      </p>
                    </div>
                    <Switch
                      id="phishing"
                      checked={scanConfig.includePhishing}
                      onCheckedChange={(checked) =>
                        setScanConfig({
                          ...scanConfig,
                          includePhishing: checked,
                        })
                      }
                    />
                  </div>

                  {showAdvanced && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="performance">
                            Performance Analysis
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Analyze performance metrics
                          </p>
                        </div>
                        <Switch
                          id="performance"
                          checked={scanConfig.includePerformance}
                          onCheckedChange={(checked) =>
                            setScanConfig({
                              ...scanConfig,
                              includePerformance: checked,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="timeout">Timeout (seconds)</Label>
                        <Input
                          id="timeout"
                          type="number"
                          value={scanConfig.timeout}
                          onChange={(e) =>
                            setScanConfig({
                              ...scanConfig,
                              timeout: parseInt(e.target.value) || 300,
                            })
                          }
                          className="mt-2"
                          min={60}
                          max={3600}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Recent Scans */}
            <Card className="gradient-card shadow-card border-border/50 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Recent Scans
              </h2>
              <div className="space-y-3">
                {recentScans.map((scan, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (scan.type === "url") {
                        setUrl(scan.target);
                        setActiveTab("url");
                      } else if (scan.type === "api") {
                        setApiEndpoint(scan.target);
                        setActiveTab("api");
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {scan.type === "url" && (
                        <Globe className="w-4 h-4 text-primary" />
                      )}
                      {scan.type === "api" && (
                        <Code className="w-4 h-4 text-primary" />
                      )}
                      {scan.type === "file" && (
                        <FileText className="w-4 h-4 text-primary" />
                      )}
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">
                          {scan.target}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {scan.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/scan-history")}
                >
                  View All Scans
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

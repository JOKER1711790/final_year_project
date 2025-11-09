import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  Eye,
  Filter,
  X,
  FileText,
  Globe,
  Zap,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { LocalStorageApiClient } from "@/lib/api/api-client";
import { ScanResult } from "@/lib/scanner/scan-engine";

interface Scan {
  id: string;
  type: "URL" | "File" | "API";
  target: string;
  status: "completed" | "scanning" | "failed";
  threats: number;
  severity: "critical" | "high" | "medium" | "low" | "clean";
  timestamp: string;
  duration: string;
}

// Generate more realistic and recent mock data
const generateMockScans = (): Scan[] => {
  const now = new Date();
  const scans: Scan[] = [];

  const types: ("URL" | "File" | "API")[] = ["URL", "File", "API"];
  const statuses: ("completed" | "scanning" | "failed")[] = [
    "completed",
    "completed",
    "completed",
    "scanning",
    "failed",
  ];
  const severities: ("critical" | "high" | "medium" | "low" | "clean")[] = [
    "critical",
    "high",
    "medium",
    "low",
    "clean",
  ];

  const targets = {
    URL: [
      "https://example.com",
      "https://malicious-site.com",
      "https://api.service.com/v1",
      "https://test-website.io",
      "https://suspicious-domain.net",
      "https://secure-portal.com",
      "https://phishing-attempt.com",
      "https://trusted-site.org",
    ],
    File: [
      "app_v2.1.apk",
      "installer.exe",
      "document.pdf",
      "archive.zip",
      "suspicious_file.exe",
      "clean_application.apk",
      "malware_sample.exe",
      "safe_document.doc",
    ],
    API: [
      "https://api.service.com/v1",
      "https://api.example.com/endpoint",
      "https://api.test.io/v2",
      "https://api.secure.com/auth",
      "https://api.malicious.com/data",
    ],
  };

  // Generate 25 scans with recent timestamps (most recent first)
  const tempScans: (Scan & { dateTime: number })[] = [];

  for (let i = 0; i < 25; i++) {
    const hoursAgo = Math.floor(i * 2.5); // Spread over ~60 hours
    const scanDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const threatCount =
      severity === "clean"
        ? 0
        : severity === "critical"
        ? Math.floor(Math.random() * 20) + 10
        : severity === "high"
        ? Math.floor(Math.random() * 10) + 3
        : severity === "medium"
        ? Math.floor(Math.random() * 3) + 1
        : 1;

    tempScans.push({
      id: `SCN-${String(i + 1).padStart(3, "0")}`,
      type,
      target: targets[type][Math.floor(Math.random() * targets[type].length)],
      status,
      threats: status === "completed" ? threatCount : 0,
      severity:
        status === "scanning"
          ? "clean"
          : status === "failed"
          ? "clean"
          : severity,
      timestamp: scanDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration: `${(Math.random() * 5 + 0.5).toFixed(1)}s`,
      dateTime: scanDate.getTime(),
    });
  }

  // Sort by date (most recent first) and remove dateTime property
  return tempScans
    .sort((a, b) => b.dateTime - a.dateTime)
    .map(({ dateTime, ...scan }) => scan);
};

// Will be replaced with actual scans from storage
let mockScans = generateMockScans();

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
    case "clean":
      return "outline";
    default:
      return "outline";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "outline";
    case "scanning":
      return "default";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
};

export default function ScanHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [scans, setScans] = useState<Scan[]>(mockScans);
  const itemsPerPage = 10;

  // Load scans from storage
  useEffect(() => {
    const loadScans = async () => {
      try {
        const storedScans = await LocalStorageApiClient.getScans();
        if (storedScans.length > 0) {
          // Convert ScanResult to Scan format
          const convertedScans: Scan[] = storedScans.map(
            (scan: ScanResult) => ({
              id: scan.id,
              type: scan.type.toUpperCase() as "URL" | "FILE" | "API",
              target: scan.target,
              status: scan.status,
              threats: scan.vulnerabilities.length,
              severity: scan.severity,
              timestamp: (scan.completedAt || scan.startedAt).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              ),
              duration: `${scan.duration}s`,
            })
          );
          setScans(convertedScans);
        }
      } catch (error) {
        console.error("Error loading scans:", error);
      }
    };

    loadScans();

    // Refresh scans every 5 seconds
    const interval = setInterval(loadScans, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      const matchesSearch =
        scan.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scan.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || scan.type === filterType;
      const matchesStatus =
        filterStatus === "all" || scan.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, filterType, filterStatus]);

  const paginatedScans = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredScans.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredScans, currentPage]);

  const totalPages = Math.ceil(filteredScans.length / itemsPerPage);

  const hasActiveFilters =
    searchQuery !== "" || filterType !== "all" || filterStatus !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const stats = useMemo(() => {
    return {
      total: scans.length,
      filtered: filteredScans.length,
      critical: filteredScans.filter((s) => s.severity === "critical").length,
      high: filteredScans.filter((s) => s.severity === "high").length,
      scanning: filteredScans.filter((s) => s.status === "scanning").length,
    };
  }, [scans, filteredScans]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "URL":
        return <Globe className="w-4 h-4" />;
      case "File":
        return <FileText className="w-4 h-4" />;
      case "API":
        return <Zap className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Scan History
          </h1>
          <p className="text-muted-foreground">
            View and manage all your security scans ({stats.total} total scans)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gradient-card shadow-card border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">{stats.filtered}</p>
              </div>
              <FileText className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
          <Card className="gradient-card shadow-card border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Critical Threats
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {stats.critical}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-destructive opacity-50" />
            </div>
          </Card>
          <Card className="gradient-card shadow-card border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Severity</p>
                <p className="text-2xl font-bold">{stats.high}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
          <Card className="gradient-card shadow-card border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Scans</p>
                <p className="text-2xl font-bold">{stats.scanning}</p>
              </div>
              <Clock className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
        </div>

        <Card className="gradient-card shadow-card border-border/50 p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by scan ID or target..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={filterType}
              onValueChange={(value) => {
                setFilterType(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Scan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="URL">URL Scans</SelectItem>
                <SelectItem value="File">File Scans</SelectItem>
                <SelectItem value="API">API Scans</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterStatus}
              onValueChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="scanning">Scanning</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          {filteredScans.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No scans found</h3>
                  <p className="text-muted-foreground mb-4">
                    {hasActiveFilters
                      ? "No scans match your current filters. Try adjusting your search criteria."
                      : "You haven't performed any scans yet. Start by uploading a file or scanning a URL."}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear all filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="border rounded-lg border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scan ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Threats</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedScans.map((scan) => (
                      <TableRow
                        key={scan.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">{scan.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {getTypeIcon(scan.type)}
                            {scan.type}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] truncate"
                          title={scan.target}
                        >
                          {scan.target}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(scan.status)}>
                            {scan.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              scan.threats > 0
                                ? "font-semibold text-destructive"
                                : ""
                            }
                          >
                            {scan.threats}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(scan.severity)}>
                            {scan.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {scan.timestamp}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {scan.duration}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              window.location.href = `/scan-results/${scan.id}`;
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredScans.length)}{" "}
                    of {filteredScans.length} scans
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-10"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

/**
 * Reporting & Export Module
 * Handles report generation and export in various formats
 */

import { ScanResult, Vulnerability, AISuggestion } from "../scanner/scan-engine";

export type ExportFormat = "pdf" | "json" | "csv" | "html";

export interface ReportSummary {
    totalVulnerabilities: number;
    severityDistribution: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    duration: number;
}

export interface ReportData {
  scanId: string;
  target: string;
  type: string;
  timestamp: Date;
  riskScore: number;
  severity: string;
  vulnerabilities: Vulnerability[];
  summary: ReportSummary;
  recommendations?: AISuggestion[];
}

export class ExportService {
  /**
   * Export scan report as JSON
   */
  static exportJSON(scanResult: ScanResult): void {
    const reportData: ReportData = {
      scanId: scanResult.id,
      target: scanResult.target,
      type: scanResult.type,
      timestamp: scanResult.completedAt || scanResult.startedAt,
      riskScore: scanResult.riskScore,
      severity: scanResult.severity,
      vulnerabilities: scanResult.vulnerabilities,
      summary: {
        totalVulnerabilities: scanResult.vulnerabilities.length,
        severityDistribution: {
          critical: scanResult.vulnerabilities.filter((v) => v.severity === "critical").length,
          high: scanResult.vulnerabilities.filter((v) => v.severity === "high").length,
          medium: scanResult.vulnerabilities.filter((v) => v.severity === "medium").length,
          low: scanResult.vulnerabilities.filter((v) => v.severity === "low").length,
        },
        duration: scanResult.duration,
      },
      recommendations: scanResult.aiAnalysis?.suggestions || [],
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan-report-${scanResult.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export scan report as CSV
   */
  static exportCSV(scanResult: ScanResult): void {
    const headers = [
      "Vulnerability ID",
      "Type",
      "Severity",
      "Title",
      "CWE",
      "OWASP Category",
      "Risk Score",
      "Location",
      "Description",
      "Recommendation",
    ];

    const rows = scanResult.vulnerabilities.map((vuln) => [
      vuln.id,
      vuln.type,
      vuln.severity,
      `"${vuln.title.replace(/"/g, '""')}"`,
      vuln.cwe || "",
      vuln.owaspCategory || "",
      vuln.riskScore.toString(),
      vuln.location || "",
      `"${vuln.description.replace(/"/g, '""')}"`,
      `"${vuln.recommendation.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan-report-${scanResult.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export scan report as HTML
   */
  static exportHTML(scanResult: ScanResult): void {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Scan Report - ${scanResult.id}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0 0 10px 0;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
        }
        .summary-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #333;
        }
        .vulnerability {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #e74c3c;
        }
        .vulnerability.critical { border-left-color: #e74c3c; }
        .vulnerability.high { border-left-color: #f39c12; }
        .vulnerability.medium { border-left-color: #3498db; }
        .vulnerability.low { border-left-color: #95a5a6; }
        .vulnerability h3 {
            margin: 0 0 10px 0;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-right: 8px;
        }
        .badge.critical { background: #e74c3c; color: white; }
        .badge.high { background: #f39c12; color: white; }
        .badge.medium { background: #3498db; color: white; }
        .badge.low { background: #95a5a6; color: white; }
        .metadata {
            display: flex;
            gap: 20px;
            margin: 10px 0;
            font-size: 14px;
            color: #666;
        }
        .recommendation {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-top: 15px;
        }
        .recommendation h4 {
            margin: 0 0 10px 0;
            font-size: 14px;
            text-transform: uppercase;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Security Scan Report</h1>
        <p><strong>Target:</strong> ${scanResult.target}</p>
        <p><strong>Scan ID:</strong> ${scanResult.id}</p>
        <p><strong>Date:</strong> ${(scanResult.completedAt || scanResult.startedAt).toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Risk Score</h3>
            <div class="value">${scanResult.riskScore}/100</div>
        </div>
        <div class="summary-card">
            <h3>Total Vulnerabilities</h3>
            <div class="value">${scanResult.vulnerabilities.length}</div>
        </div>
        <div class="summary-card">
            <h3>Critical</h3>
            <div class="value">${scanResult.vulnerabilities.filter((v) => v.severity === "critical").length}</div>
        </div>
        <div class="summary-card">
            <h3>High</h3>
            <div class="value">${scanResult.vulnerabilities.filter((v) => v.severity === "high").length}</div>
        </div>
    </div>

    <h2>Vulnerabilities</h2>
    ${scanResult.vulnerabilities
      .map(
        (vuln) => `
        <div class="vulnerability ${vuln.severity}">
            <h3>${vuln.title}</h3>
            <div>
                <span class="badge ${vuln.severity}">${vuln.severity}</span>
                ${vuln.cwe ? `<span class="badge">${vuln.cwe}</span>` : ""}
                ${vuln.owaspCategory ? `<span class="badge">${vuln.owaspCategory}</span>` : ""}
                <span class="badge">Risk: ${vuln.riskScore}/100</span>
            </div>
            <div class="metadata">
                <span><strong>Type:</strong> ${vuln.type}</span>
                ${vuln.location ? `<span><strong>Location:</strong> ${vuln.location}</span>` : ""}
            </div>
            <p>${vuln.description}</p>
            ${vuln.evidence ? `<p><strong>Evidence:</strong> ${vuln.evidence}</p>` : ""}
            <div class="recommendation">
                <h4>Recommendation</h4>
                <p>${vuln.recommendation}</p>
            </div>
        </div>
    `
      )
      .join("")}

    ${scanResult.aiAnalysis && scanResult.aiAnalysis.suggestions.length > 0 ? `
    <h2>Security Recommendations</h2>
    ${scanResult.aiAnalysis.suggestions
      .map(
        (suggestion) => `
        <div class="vulnerability">
            <h3>${suggestion.title}</h3>
            <span class="badge ${suggestion.priority}">${suggestion.priority} priority</span>
            <p>${suggestion.description}</p>
            ${suggestion.codeExample ? `<pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto;">${suggestion.codeExample}</pre>` : ""}
        </div>
    `
      )
      .join("")}
    ` : ""}
</body>
</html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan-report-${scanResult.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export scan report as PDF (placeholder - would need a PDF library)
   */
  static exportPDF(scanResult: ScanResult): void {
    // In production, use a library like jsPDF or pdfmake
    // For now, we'll export as HTML which can be printed to PDF
    this.exportHTML(scanResult);
  }

  /**
   * Export report in specified format
   */
  static export(scanResult: ScanResult, format: ExportFormat): void {
    switch (format) {
      case "json":
        this.exportJSON(scanResult);
        break;
      case "csv":
        this.exportCSV(scanResult);
        break;
      case "html":
        this.exportHTML(scanResult);
        break;
      case "pdf":
        this.exportPDF(scanResult);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}


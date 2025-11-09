/**
 * AI/ML Analysis Module
 * Provides ML-based anomaly detection and security fix suggestions
 */

import { Vulnerability } from "./vulnerability-scanner";

export interface AIAnalysisResult {
  anomalies: Anomaly[];
  suggestions: SecuritySuggestion[];
  confidence: number; // 0-100
  modelVersion: string;
  analyzedAt: Date;
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  location?: string;
  confidence: number;
  pattern?: string;
  recommendation: string;
}

export type AnomalyType =
  | "SUSPICIOUS_PATTERN"
  | "UNUSUAL_BEHAVIOR"
  | "HIDDEN_VULNERABILITY"
  | "ZERO_DAY_INDICATOR"
  | "ANOMALOUS_ACCESS"
  | "DATA_LEAKAGE_RISK";

export interface SecuritySuggestion {
  id: string;
  type: SuggestionType;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  codeExample?: string;
  references?: string[];
}

export type SuggestionType =
  | "CODE_FIX"
  | "CONFIGURATION_CHANGE"
  | "ARCHITECTURE_IMPROVEMENT"
  | "SECURITY_POLICY"
  | "MONITORING_ENHANCEMENT";

export class AIAnalysisEngine {
  private static readonly MODEL_VERSION = "v2.1.0";

  /**
   * Analyze vulnerabilities using AI/ML models
   */
  static async analyzeVulnerabilities(
    vulnerabilities: Vulnerability[],
    context: {
      target: string;
      type: "url" | "api" | "file";
      content?: string;
    }
  ): Promise<AIAnalysisResult> {
    // Simulate AI analysis (in production, this would call ML models)
    const anomalies: Anomaly[] = [];
    const suggestions: SecuritySuggestion[] = [];

    // Detect anomalies based on vulnerability patterns
    if (vulnerabilities.length > 0) {
      // Check for suspicious patterns
      const criticalVulns = vulnerabilities.filter((v) => v.severity === "critical");
      if (criticalVulns.length >= 3) {
        anomalies.push({
          id: `anomaly-${Date.now()}-1`,
          type: "SUSPICIOUS_PATTERN",
          severity: "critical",
          description: "Multiple critical vulnerabilities detected, indicating potential systemic security issues.",
          confidence: 85,
          recommendation: "Conduct comprehensive security audit. Review security architecture and development practices.",
        });
      }

      // Check for hidden vulnerabilities
      const sqlInjectionVulns = vulnerabilities.filter((v) => v.type === "SQL_INJECTION");
      if (sqlInjectionVulns.length > 0) {
        anomalies.push({
          id: `anomaly-${Date.now()}-2`,
          type: "HIDDEN_VULNERABILITY",
          severity: "high",
          description: "SQL injection vulnerabilities often indicate deeper authentication and authorization issues.",
          confidence: 75,
          recommendation: "Review all database access patterns. Implement comprehensive input validation.",
        });
      }

      // Check for zero-day indicators
      const uniquePatterns = new Set(vulnerabilities.map((v) => v.type));
      if (uniquePatterns.size >= 5) {
        anomalies.push({
          id: `anomaly-${Date.now()}-3`,
          type: "ZERO_DAY_INDICATOR",
          severity: "medium",
          description: "Multiple vulnerability types detected, suggesting potential unknown security flaws.",
          confidence: 60,
          recommendation: "Engage security researchers for deeper analysis. Consider bug bounty program.",
        });
      }
    }

    // Generate security suggestions
    vulnerabilities.forEach((vuln) => {
      const suggestion = this.generateSuggestionForVulnerability(vuln, context);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    });

    // Add general suggestions based on context
    if (context.type === "api" && vulnerabilities.length > 0) {
      suggestions.push({
        id: `suggestion-${Date.now()}-1`,
        type: "ARCHITECTURE_IMPROVEMENT",
        priority: "high",
        title: "Implement API Gateway Security",
        description: "Consider implementing an API gateway with rate limiting, authentication, and request validation.",
        references: [
          "https://owasp.org/www-project-api-security/",
          "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html",
        ],
      });
    }

    // Calculate overall confidence
    const confidence = this.calculateConfidence(vulnerabilities, anomalies);

    return {
      anomalies,
      suggestions,
      confidence,
      modelVersion: this.MODEL_VERSION,
      analyzedAt: new Date(),
    };
  }

  /**
   * Generate security fix suggestion for a vulnerability
   */
  private static generateSuggestionForVulnerability(
    vuln: Vulnerability,
    context: { target: string; type: string; content?: string }
  ): SecuritySuggestion | null {
    switch (vuln.type) {
      case "SQL_INJECTION":
        return {
          id: `suggestion-${vuln.id}`,
          type: "CODE_FIX",
          priority: "high",
          title: "Fix SQL Injection Vulnerability",
          description: vuln.recommendation,
          codeExample: context.type === "file"
            ? `// BAD: String query = "SELECT * FROM users WHERE id = " + userId;
// GOOD: String query = "SELECT * FROM users WHERE id = ?";
PreparedStatement stmt = connection.prepareStatement(query);
stmt.setInt(1, userId);`
            : undefined,
          references: ["https://owasp.org/www-community/attacks/SQL_Injection"],
        };

      case "XSS":
        return {
          id: `suggestion-${vuln.id}`,
          type: "CODE_FIX",
          priority: "high",
          title: "Fix XSS Vulnerability",
          description: vuln.recommendation,
          codeExample: context.type === "file"
            ? `// BAD: document.getElementById('output').innerHTML = userInput;
// GOOD: document.getElementById('output').textContent = userInput;
// OR use a library like DOMPurify: document.getElementById('output').innerHTML = DOMPurify.sanitize(userInput);`
            : undefined,
          references: ["https://owasp.org/www-community/attacks/xss/"],
        };

      case "AUTH_BYPASS":
        return {
          id: `suggestion-${vuln.id}`,
          type: "ARCHITECTURE_IMPROVEMENT",
          priority: "critical",
          title: "Implement Proper Authentication",
          description: vuln.recommendation,
          references: [
            "https://owasp.org/www-project-authentication-cheat-sheet/",
            "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
          ],
        };

      case "SENSITIVE_DATA_EXPOSURE":
        return {
          id: `suggestion-${vuln.id}`,
          type: "CONFIGURATION_CHANGE",
          priority: "high",
          title: "Secure Sensitive Data",
          description: vuln.recommendation,
          references: [
            "https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure",
          ],
        };

      case "SECURITY_MISCONFIGURATION":
        return {
          id: `suggestion-${vuln.id}`,
          type: "CONFIGURATION_CHANGE",
          priority: "medium",
          title: "Fix Security Misconfiguration",
          description: vuln.recommendation,
          references: [
            "https://owasp.org/www-project-top-ten/2017/A6_2017-Security_Misconfiguration",
          ],
        };

      default:
        return {
          id: `suggestion-${vuln.id}`,
          type: "CODE_FIX",
          priority: "medium",
          title: `Fix ${vuln.type} Vulnerability`,
          description: vuln.recommendation,
        };
    }
  }

  /**
   * Detect anomalies in scan patterns
   */
  static async detectAnomalies(
    scanHistory: Array<{ vulnerabilities: Vulnerability[]; timestamp: Date }>
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    if (scanHistory.length < 2) return anomalies;

    // Calculate average vulnerability count
    const avgVulns = scanHistory.reduce((sum, scan) => sum + scan.vulnerabilities.length, 0) / scanHistory.length;

    // Check for unusual spike
    const recentScans = scanHistory.slice(-5);
    const recentAvg = recentScans.reduce((sum, scan) => sum + scan.vulnerabilities.length, 0) / recentScans.length;

    if (recentAvg > avgVulns * 1.5) {
      anomalies.push({
        id: `anomaly-${Date.now()}-4`,
        type: "UNUSUAL_BEHAVIOR",
        severity: "medium",
        description: `Unusual spike in vulnerabilities detected. Recent average: ${recentAvg.toFixed(1)}, Overall average: ${avgVulns.toFixed(1)}`,
        confidence: 70,
        recommendation: "Review recent changes in codebase or infrastructure. Check for new attack vectors.",
      });
    }

    return anomalies;
  }

  /**
   * Calculate confidence score for AI analysis
   */
  private static calculateConfidence(
    vulnerabilities: Vulnerability[],
    anomalies: Anomaly[]
  ): number {
    let confidence = 50; // Base confidence

    // Increase confidence based on number of vulnerabilities
    if (vulnerabilities.length > 0) {
      confidence += Math.min(30, vulnerabilities.length * 5);
    }

    // Increase confidence based on anomalies
    if (anomalies.length > 0) {
      confidence += Math.min(20, anomalies.length * 5);
    }

    // Adjust based on severity
    const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length;
    if (criticalCount > 0) {
      confidence += Math.min(10, criticalCount * 2);
    }

    return Math.min(100, confidence);
  }

  /**
   * Generate comprehensive security report with AI insights
   */
  static async generateSecurityReport(
    vulnerabilities: Vulnerability[],
    aiAnalysis: AIAnalysisResult,
    context: { target: string; type: string }
  ): Promise<{
    summary: string;
    riskAssessment: string;
    prioritizedActions: SecuritySuggestion[];
    estimatedFixTime: string;
  }> {
    const riskScore = vulnerabilities.length > 0
      ? vulnerabilities.reduce((sum, v) => sum + v.riskScore, 0) / vulnerabilities.length
      : 0;

    let summary = "";
    let riskAssessment = "";
    let estimatedFixTime = "";

    if (vulnerabilities.length === 0) {
      summary = "No vulnerabilities detected. The target appears secure.";
      riskAssessment = "Low risk. Continue regular security monitoring.";
      estimatedFixTime = "N/A";
    } else {
      const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length;
      const highCount = vulnerabilities.filter((v) => v.severity === "high").length;

      summary = `Detected ${vulnerabilities.length} vulnerability/vulnerabilities: ${criticalCount} critical, ${highCount} high, ${vulnerabilities.length - criticalCount - highCount} medium/low.`;

      if (riskScore >= 80) {
        riskAssessment = "CRITICAL RISK: Immediate action required. System is highly vulnerable to attacks.";
        estimatedFixTime = "1-3 days (critical fixes)";
      } else if (riskScore >= 60) {
        riskAssessment = "HIGH RISK: Significant security issues detected. Address vulnerabilities promptly.";
        estimatedFixTime = "1-2 weeks";
      } else if (riskScore >= 40) {
        riskAssessment = "MEDIUM RISK: Security improvements needed. Plan remediation within next sprint.";
        estimatedFixTime = "2-4 weeks";
      } else {
        riskAssessment = "LOW RISK: Minor security issues. Address during regular maintenance.";
        estimatedFixTime = "1-2 months";
      }
    }

    // Prioritize suggestions
    const prioritizedActions = [...aiAnalysis.suggestions].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return {
      summary,
      riskAssessment,
      prioritizedActions: prioritizedActions.slice(0, 5), // Top 5 actions
      estimatedFixTime,
    };
  }
}


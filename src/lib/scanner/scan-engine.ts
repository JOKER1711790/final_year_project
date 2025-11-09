/**
 * Scan Engine - Orchestrates all scanning modules
 * Coordinates vulnerability scanning, AI analysis, and penetration testing
 */

import { VulnerabilityScanner, Vulnerability } from "./vulnerability-scanner";
import { AIAnalysisEngine, AIAnalysisResult } from "./ai-analysis";
import { PenetrationTester, PenetrationTestResult } from "./penetration-tester";

export interface ScanConfig {
  scanDepth: "basic" | "standard" | "comprehensive";
  includeVulnerabilities: boolean;
  includeMalware: boolean;
  includePhishing: boolean;
  includePerformance: boolean;
  enableAIAnalysis: boolean;
  enablePenetrationTesting: boolean;
  timeout: number; // in seconds
}

export interface ScanResult {
  id: string;
  target: string;
  type: "url" | "api" | "file";
  status: "completed" | "scanning" | "failed";
  vulnerabilities: Vulnerability[];
  aiAnalysis?: AIAnalysisResult;
  penetrationTest?: PenetrationTestResult;
  riskScore: number;
  severity: "critical" | "high" | "medium" | "low" | "clean";
  startedAt: Date;
  completedAt?: Date;
  duration: number; // in seconds
  config: ScanConfig;
}

export class ScanEngine {
  /**
   * Execute a complete security scan
   */
  static async executeScan(
    target: string,
    type: "url" | "api" | "file",
    config: ScanConfig,
    fileContent?: string
  ): Promise<ScanResult> {
    const scanId = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startedAt = new Date();

    try {
      // Step 1: Vulnerability Scanning
      let vulnerabilities: Vulnerability[] = [];

      if (config.includeVulnerabilities) {
        if (type === "url") {
          vulnerabilities = await VulnerabilityScanner.scanUrl(target, fileContent);
        } else if (type === "api") {
          vulnerabilities = await VulnerabilityScanner.scanApi(target);
        } else if (type === "file") {
          vulnerabilities = await VulnerabilityScanner.scanFile(target, fileContent);
        }
      }

      // Step 2: AI/ML Analysis (if enabled)
      let aiAnalysis: AIAnalysisResult | undefined;
      if (config.enableAIAnalysis && vulnerabilities.length > 0) {
        aiAnalysis = await AIAnalysisEngine.analyzeVulnerabilities(vulnerabilities, {
          target,
          type,
          content,
        });
      }

      // Step 3: Penetration Testing (if enabled)
      let penetrationTest: PenetrationTestResult | undefined;
      if (config.enablePenetrationTesting && vulnerabilities.length > 0) {
        penetrationTest = await PenetrationTester.testVulnerabilities(
          vulnerabilities,
          target,
          type
        );
      }

      // Step 4: Calculate overall risk score
      let riskScore = 0;
      if (penetrationTest) {
        riskScore = penetrationTest.riskScore;
      } else if (aiAnalysis) {
        riskScore = VulnerabilityScanner.calculateRiskScore(vulnerabilities);
      } else {
        riskScore = VulnerabilityScanner.calculateRiskScore(vulnerabilities);
      }

      // Step 5: Determine severity
      const severity = this.determineSeverity(riskScore, vulnerabilities);

      const completedAt = new Date();
      const duration = Math.round((completedAt.getTime() - startedAt.getTime()) / 1000);

      return {
        id: scanId,
        target,
        type,
        status: "completed",
        vulnerabilities,
        aiAnalysis,
        penetrationTest,
        riskScore,
        severity,
        startedAt,
        completedAt,
        duration,
        config,
      };
    } catch (error) {
      const completedAt = new Date();
      const duration = Math.round((completedAt.getTime() - startedAt.getTime()) / 1000);

      return {
        id: scanId,
        target,
        type,
        status: "failed",
        vulnerabilities: [],
        riskScore: 0,
        severity: "clean",
        startedAt,
        completedAt,
        duration,
        config,
      };
    }
  }

  /**
   * Determine severity based on risk score and vulnerabilities
   */
  private static determineSeverity(
    riskScore: number,
    vulnerabilities: Vulnerability[]
  ): "critical" | "high" | "medium" | "low" | "clean" {
    if (vulnerabilities.length === 0) return "clean";

    const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length;
    const highCount = vulnerabilities.filter((v) => v.severity === "high").length;

    if (riskScore >= 80 || criticalCount >= 2) return "critical";
    if (riskScore >= 60 || highCount >= 2 || criticalCount >= 1) return "high";
    if (riskScore >= 40 || highCount >= 1) return "medium";
    if (riskScore >= 20) return "low";
    return "clean";
  }

  /**
   * Get scan summary statistics
   */
  static getScanSummary(scanResult: ScanResult) {
    const severityDist = VulnerabilityScanner.getSeverityDistribution(scanResult.vulnerabilities);

    return {
      totalVulnerabilities: scanResult.vulnerabilities.length,
      severityDistribution: severityDist,
      riskScore: scanResult.riskScore,
      severity: scanResult.severity,
      duration: scanResult.duration,
      aiConfidence: scanResult.aiAnalysis?.confidence || 0,
      validatedExploits: scanResult.penetrationTest?.validatedVulnerabilities.length || 0,
      falsePositives: scanResult.penetrationTest?.falsePositives.length || 0,
    };
  }

  /**
   * Generate scan report data
   */
  static generateReportData(scanResult: ScanResult) {
    return {
      scanId: scanResult.id,
      target: scanResult.target,
      type: scanResult.type,
      timestamp: scanResult.completedAt || scanResult.startedAt,
      summary: this.getScanSummary(scanResult),
      vulnerabilities: scanResult.vulnerabilities,
      aiAnalysis: scanResult.aiAnalysis,
      penetrationTest: scanResult.penetrationTest,
      recommendations: scanResult.aiAnalysis?.suggestions || [],
    };
  }
}


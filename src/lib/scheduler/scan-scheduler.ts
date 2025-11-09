/**
 * Scan Scheduler
 * Handles scheduled and recurring scans
 */

import { ScanConfig } from "../scanner/scan-engine";
import { LocalStorageApiClient } from "../api/api-client";

export interface ScheduledScan {
  id: string;
  target: string;
  type: "url" | "api" | "file";
  config: ScanConfig;
  schedule: ScheduleConfig;
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  runCount: number;
  createdAt: Date;
}

export interface ScheduleConfig {
  frequency: "daily" | "weekly" | "monthly" | "custom";
  cron?: string;
  timezone?: string;
  time?: string; // For daily/weekly/monthly (HH:MM format)
  daysOfWeek?: number[]; // For weekly (0-6, Sunday = 0)
  dayOfMonth?: number; // For monthly (1-31)
}

export class ScanScheduler {
  private static scheduledScans: Map<string, ScheduledScan> = new Map();
  private static intervalId: NodeJS.Timeout | null = null;
  private static checkInterval = 60000; // Check every minute

  /**
   * Initialize scheduler
   */
  static async initialize() {
    await this.loadScheduledScans();
    this.start();
  }

  /**
   * Load scheduled scans from storage
   */
  private static async loadScheduledScans() {
    try {
      const schedules = await LocalStorageApiClient.getScheduledScans();
      schedules.forEach((schedule) => {
        this.scheduledScans.set(schedule.id, schedule);
      });
    } catch (error) {
      console.error("Error loading scheduled scans:", error);
    }
  }

  /**
   * Start scheduler
   */
  private static start() {
    if (this.intervalId) {
      return; // Already started
    }

    this.intervalId = setInterval(() => {
      this.checkAndRunScheduledScans();
    }, this.checkInterval);

    // Check immediately
    this.checkAndRunScheduledScans();
  }

  /**
   * Stop scheduler
   */
  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Create a scheduled scan
   */
  static async createScheduledScan(
    target: string,
    type: "url" | "api" | "file",
    config: ScanConfig,
    schedule: ScheduleConfig
  ): Promise<ScheduledScan> {
    const id = `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const nextRun = this.calculateNextRun(schedule);

    const scheduledScan: ScheduledScan = {
      id,
      target,
      type,
      config,
      schedule,
      enabled: true,
      nextRun,
      runCount: 0,
      createdAt: new Date(),
    };

    this.scheduledScans.set(id, scheduledScan);
    await LocalStorageApiClient.saveScheduledScan(scheduledScan);

    return scheduledScan;
  }

  /**
   * Delete a scheduled scan
   */
  static async deleteScheduledScan(id: string): Promise<void> {
    this.scheduledScans.delete(id);
    await LocalStorageApiClient.deleteScheduledScan(id);
  }

  /**
   * Enable/disable a scheduled scan
   */
  static async setEnabled(id: string, enabled: boolean): Promise<void> {
    const scan = this.scheduledScans.get(id);
    if (scan) {
      scan.enabled = enabled;
      this.scheduledScans.set(id, scan);
      await LocalStorageApiClient.saveScheduledScan(scan);
    }
  }

  /**
   * Get all scheduled scans
   */
  static getScheduledScans(): ScheduledScan[] {
    return Array.from(this.scheduledScans.values());
  }

  /**
   * Get a scheduled scan by ID
   */
  static getScheduledScan(id: string): ScheduledScan | undefined {
    return this.scheduledScans.get(id);
  }

  /**
   * Check and run scheduled scans
   */
  private static async checkAndRunScheduledScans() {
    const now = new Date();

    for (const [id, scan] of this.scheduledScans.entries()) {
      if (!scan.enabled) {
        continue;
      }

      if (scan.nextRun <= now) {
        // Time to run the scan
        await this.runScheduledScan(scan);
      }
    }
  }

  /**
   * Run a scheduled scan
   */
  private static async runScheduledScan(scan: ScheduledScan) {
    console.log(`Running scheduled scan: ${scan.id}`);

    // Import scan engine dynamically to avoid circular dependencies
    const { ScanEngine } = await import("../scanner/scan-engine");

    try {
      // Execute the scan
      const result = await ScanEngine.executeScan(scan.target, scan.type, scan.config);

      // Update scheduled scan
      scan.lastRun = new Date();
      scan.runCount++;
      scan.nextRun = this.calculateNextRun(scan.schedule);

      this.scheduledScans.set(scan.id, scan);
      await LocalStorageApiClient.saveScheduledScan(scan);

      // Save scan result
      await LocalStorageApiClient.saveScan(result);

      // Trigger webhooks
      const { WebhookService } = await import("../webhooks/webhook-service");
      await WebhookService.triggerWebhooks("scan_completed", {
        scanId: result.id,
        scheduledScanId: scan.id,
        result,
      });
    } catch (error) {
      console.error(`Error running scheduled scan ${scan.id}:`, error);

      // Trigger webhook for failed scan
      const { WebhookService } = await import("../webhooks/webhook-service");
      await WebhookService.triggerWebhooks("scan_failed", {
        scheduledScanId: scan.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Calculate next run time based on schedule
   */
  private static calculateNextRun(schedule: ScheduleConfig): Date {
    const now = new Date();
    const nextRun = new Date(now);

    switch (schedule.frequency) {
      case "daily":
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(":").map(Number);
          nextRun.setHours(hours, minutes, 0, 0);
          if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1);
          }
        } else {
          nextRun.setDate(nextRun.getDate() + 1);
          nextRun.setHours(0, 0, 0, 0);
        }
        break;

      case "weekly":
        if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
          const currentDay = now.getDay();
          let daysUntilNext = schedule.daysOfWeek
            .map((day) => (day - currentDay + 7) % 7)
            .filter((days) => days > 0)
            .sort((a, b) => a - b)[0];

          if (!daysUntilNext) {
            // Next occurrence is next week
            daysUntilNext = schedule.daysOfWeek[0] + 7 - currentDay;
          }

          nextRun.setDate(nextRun.getDate() + daysUntilNext);
          if (schedule.time) {
            const [hours, minutes] = schedule.time.split(":").map(Number);
            nextRun.setHours(hours, minutes, 0, 0);
          } else {
            nextRun.setHours(0, 0, 0, 0);
          }
        } else {
          nextRun.setDate(nextRun.getDate() + 7);
          nextRun.setHours(0, 0, 0, 0);
        }
        break;

      case "monthly":
        if (schedule.dayOfMonth) {
          nextRun.setDate(schedule.dayOfMonth);
          if (nextRun <= now) {
            nextRun.setMonth(nextRun.getMonth() + 1);
          }
          if (schedule.time) {
            const [hours, minutes] = schedule.time.split(":").map(Number);
            nextRun.setHours(hours, minutes, 0, 0);
          } else {
            nextRun.setHours(0, 0, 0, 0);
          }
        } else {
          nextRun.setMonth(nextRun.getMonth() + 1);
          nextRun.setDate(1);
          nextRun.setHours(0, 0, 0, 0);
        }
        break;

      case "custom":
        // For custom cron expressions, you would use a cron parser library
        // For now, default to daily
        nextRun.setDate(nextRun.getDate() + 1);
        break;

      default:
        nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun;
  }
}


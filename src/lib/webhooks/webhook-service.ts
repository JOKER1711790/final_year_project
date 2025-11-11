/**
 * Webhook Service
 * Handles webhook notifications for scan events
 */

import { ScanResult } from "../scanner/scan-engine";
import { LocalStorageApiClient } from "../api/api-client";

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  enabled: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export type WebhookEvent =
  | "scan_started"
  | "scan_completed"
  | "scan_failed"
  | "vulnerability_detected"
  | "critical_vulnerability"
  | "scan_scheduled";

export interface WebhookPayloadData {
  scan_started: { scanId: string; target: string; type: string };
  scan_completed: ScanResult;
  scan_failed: { scanId: string; error: string };
  vulnerability_detected: { scanId: string; vulnerabilityId: string };
  critical_vulnerability: { scanId: string; vulnerabilityId: string };
  scan_scheduled: { scheduleId: string; target: string; cron: string };
}

export interface WebhookPayload<T extends WebhookEvent> {
  event: T;
  timestamp: string;
  data: WebhookPayloadData[T];
  scanId?: string;
}

export class WebhookService {
  private static webhooks: Map<string, Webhook> = new Map();

  /**
   * Initialize webhook service
   */
  static async initialize() {
    await this.loadWebhooks();
  }

  /**
   * Load webhooks from storage
   */
  private static async loadWebhooks() {
    try {
      const webhooks = await LocalStorageApiClient.getWebhooks();
      webhooks.forEach((webhook) => {
        this.webhooks.set(webhook.id, webhook);
      });
    } catch (error) {
      console.error("Error loading webhooks:", error);
    }
  }

  /**
   * Create a webhook
   */
  static async createWebhook(
    url: string,
    events: WebhookEvent[],
    secret?: string
  ): Promise<Webhook> {
    const id = `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const webhook: Webhook = {
      id,
      url,
      events,
      secret,
      enabled: true,
      createdAt: new Date(),
      triggerCount: 0,
    };

    this.webhooks.set(id, webhook);
    await LocalStorageApiClient.saveWebhook(webhook);

    return webhook;
  }

  /**
   * Delete a webhook
   */
  static async deleteWebhook(id: string): Promise<void> {
    this.webhooks.delete(id);
    await LocalStorageApiClient.deleteWebhook(id);
  }

  /**
   * Enable/disable a webhook
   */
  static async setEnabled(id: string, enabled: boolean): Promise<void> {
    const webhook = this.webhooks.get(id);
    if (webhook) {
      webhook.enabled = enabled;
      this.webhooks.set(id, webhook);
      await LocalStorageApiClient.saveWebhook(webhook);
    }
  }

  /**
   * Get all webhooks
   */
  static getWebhooks(): Webhook[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Get a webhook by ID
   */
  static getWebhook(id: string): Webhook | undefined {
    return this.webhooks.get(id);
  }

  /**
   * Trigger webhooks for an event
   */
  static async triggerWebhooks<T extends WebhookEvent>(
    event: T,
    data: WebhookPayloadData[T]
  ) {
    const webhooksToTrigger = Array.from(this.webhooks.values()).filter(
      (webhook) => webhook.enabled && webhook.events.includes(event)
    );

    if (webhooksToTrigger.length === 0) {
      return;
    }

    const payload: WebhookPayload<T> = {
      event,
      timestamp: new Date().toISOString(),
      data,
      scanId: (data as { scanId?: string }).scanId,
    };

    // Trigger all matching webhooks in parallel
    await Promise.allSettled(
      webhooksToTrigger.map((webhook) => this.sendWebhook(webhook, payload))
    );
  }

  /**
   * Send webhook request
   */
  private static async sendWebhook<T extends WebhookEvent>(
    webhook: Webhook,
    payload: WebhookPayload<T>
  ) {
    try {
      // Create signature if secret is provided
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "X-Webhook-Event": payload.event,
        "X-Webhook-Timestamp": payload.timestamp,
      };

      if (webhook.secret) {
        // In production, create HMAC signature
        const signature = await this.createSignature(
          JSON.stringify(payload),
          webhook.secret
        );
        headers["X-Webhook-Signature"] = signature;
      }

      const response = await fetch(webhook.url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        webhook.lastTriggered = new Date();
        webhook.triggerCount++;
        this.webhooks.set(webhook.id, webhook);
        await LocalStorageApiClient.saveWebhook(webhook);
      } else {
        console.error(`Webhook ${webhook.id} failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error sending webhook ${webhook.id}:`, error);
    }
  }

  /**
   * Create HMAC signature for webhook
   */
  private static async createSignature(
    payload: string,
    secret: string
  ): Promise<string> {
    // In production, use crypto.subtle for HMAC-SHA256
    // For now, return a simple hash
    const encoder = new TextEncoder();
    const data = encoder.encode(payload + secret);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Test a webhook
   */
  static async testWebhook(webhookId: string): Promise<boolean> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      return false;
    }

    const testPayload: WebhookPayload<"scan_started"> = {
      event: "scan_started",
      timestamp: new Date().toISOString(),
      data: {
        scanId: "test-scan",
        target: "test-target",
        type: "test",
      },
    };

    try {
      await this.sendWebhook(webhook, testPayload);
      return true;
    } catch (error) {
      console.error("Webhook test failed:", error);
      return false;
    }
  }
}

/**
 * WebSocket Client for Real-time Updates
 * Handles real-time scan progress and notifications
 */

import { ScanResult } from "../scanner/scan-engine";

export type WebSocketEvent =
  | "scan_started"
  | "scan_progress"
  | "scan_completed"
  | "scan_failed"
  | "alert_created"
  | "vulnerability_detected";

export interface WebSocketMessage {
  event: WebSocketEvent;
  data: any;
  timestamp: Date;
}

export type WebSocketCallback = (message: WebSocketMessage) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private callbacks: Map<WebSocketEvent, Set<WebSocketCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor(url?: string) {
    const wsUrl = url || import.meta.env.VITE_WS_URL || "ws://localhost:3000/ws";
    this.url = wsUrl;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        const token = localStorage.getItem("auth_token");
        const wsUrl = token ? `${this.url}?token=${token}` : this.url;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("WebSocket disconnected");
          this.isConnecting = false;
          this.ws = null;
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.callbacks.clear();
  }

  /**
   * Subscribe to an event
   */
  on(event: WebSocketEvent, callback: WebSocketCallback): () => void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.get(event)?.delete(callback);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(event: WebSocketEvent, callback: WebSocketCallback) {
    this.callbacks.get(event)?.delete(callback);
  }

  /**
   * Send message to server
   */
  send(event: WebSocketEvent, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      console.warn("WebSocket is not connected");
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WebSocketMessage) {
    const callbacks = this.callbacks.get(message.event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          console.error("Error in WebSocket callback:", error);
        }
      });
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, delay);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let wsClientInstance: WebSocketClient | null = null;

export const getWebSocketClient = (): WebSocketClient => {
  if (!wsClientInstance) {
    wsClientInstance = new WebSocketClient();
  }
  return wsClientInstance;
};


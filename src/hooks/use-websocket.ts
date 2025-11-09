/**
 * React Hook for WebSocket Integration
 */

import { useEffect, useState, useCallback } from "react";
import { getWebSocketClient, WebSocketEvent, WebSocketMessage } from "@/lib/realtime/websocket-client";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [wsClient] = useState(() => getWebSocketClient());

  useEffect(() => {
    // Connect on mount
    wsClient
      .connect()
      .then(() => setIsConnected(true))
      .catch((error) => {
        console.error("WebSocket connection failed:", error);
        setIsConnected(false);
      });

    // Cleanup on unmount
    return () => {
      wsClient.disconnect();
    };
  }, [wsClient]);

  const subscribe = useCallback(
    (event: WebSocketEvent, callback: (message: WebSocketMessage) => void) => {
      const unsubscribe = wsClient.on(event, callback);
      return unsubscribe;
    },
    [wsClient]
  );

  const send = useCallback(
    (event: WebSocketEvent, data: any) => {
      wsClient.send(event, data);
    },
    [wsClient]
  );

  return {
    isConnected,
    subscribe,
    send,
  };
}

/**
 * Hook for scan progress updates
 */
export function useScanProgress(scanId?: string) {
  const { isConnected, subscribe } = useWebSocket();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"queued" | "scanning" | "completed" | "failed">("queued");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!scanId || !isConnected) return;

    const unsubscribe = subscribe("scan_progress", (msg) => {
      if (msg.data.scanId === scanId) {
        setProgress(msg.data.progress || 0);
        setStatus(msg.data.status || "scanning");
        setMessage(msg.data.message || "");
      }
    });

    const unsubscribeCompleted = subscribe("scan_completed", (msg) => {
      if (msg.data.scanId === scanId) {
        setProgress(100);
        setStatus("completed");
        setMessage("Scan completed successfully");
      }
    });

    const unsubscribeFailed = subscribe("scan_failed", (msg) => {
      if (msg.data.scanId === scanId) {
        setStatus("failed");
        setMessage(msg.data.error || "Scan failed");
      }
    });

    return () => {
      unsubscribe();
      unsubscribeCompleted();
      unsubscribeFailed();
    };
  }, [scanId, isConnected, subscribe]);

  return {
    progress,
    status,
    message,
    isConnected,
  };
}


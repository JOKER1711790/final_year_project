
import { ReactNode, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Sidebar } from './Sidebar';
import { Scan } from '@/types';
import { getWebSocketClient, WebSocketMessage } from '@/lib/realtime/websocket-client';

interface DashboardLayoutProps {
  children: (props: {
    scans: Scan[];
    setScans: Dispatch<SetStateAction<Scan[]>>;
  }) => ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [scans, setScans] = useState<Scan[]>([]);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/scans');
        const data = await response.json();
        if (data.success) {
          setScans(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch scans:', error);
      }
    };

    fetchScans();

    const wsClient = getWebSocketClient();

    const handleScanStarted = (message: WebSocketMessage) => {
      setScans((prevScans) => [message.data, ...prevScans]);
    };

    const handleScanCompleted = (message: WebSocketMessage) => {
      setScans((prevScans) =>
        prevScans.map((scan) =>
          scan._id === message.data._id ? message.data : scan
        )
      );
    };

    const handleScanFailed = (message: WebSocketMessage) => {
      setScans((prevScans) =>
        prevScans.map((scan) =>
          scan._id === message.data._id ? { ...scan, status: 'failed' } : scan
        )
      );
    };

    wsClient.connect();
    const unsubscribeScanStarted = wsClient.on('scan_started', handleScanStarted);
    const unsubscribeScanCompleted = wsClient.on('scan_completed', handleScanCompleted);
    const unsubscribeScanFailed = wsClient.on('scan_failed', handleScanFailed);

    return () => {
      unsubscribeScanStarted();
      unsubscribeScanCompleted();
      unsubscribeScanFailed();
      wsClient.disconnect();
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="gradient-glow absolute top-0 left-0 right-0 h-64 pointer-events-none" />
        <div className="relative z-10">{children({ scans, setScans })}</div>
      </main>
    </div>
  );
};

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, Info, CheckCircle2, Bell, BellOff, Trash2 } from "lucide-react";
import { useState } from "react";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  scanId?: string;
}

const mockAlerts: Alert[] = [
  {
    id: "ALT-001",
    type: "critical",
    title: "Critical Threat Detected",
    message: "Malware signature found in uploaded file installer.exe - immediate action required",
    timestamp: "2 minutes ago",
    read: false,
    scanId: "SCN-005"
  },
  {
    id: "ALT-002",
    type: "warning",
    title: "High-Risk URL Detected",
    message: "The URL https://suspicious-site.com shows signs of phishing activity",
    timestamp: "15 minutes ago",
    read: false,
    scanId: "SCN-004"
  },
  {
    id: "ALT-003",
    type: "info",
    title: "Scan Quota Warning",
    message: "You have used 80% of your monthly scan credits",
    timestamp: "1 hour ago",
    read: true
  },
  {
    id: "ALT-004",
    type: "success",
    title: "Clean Scan Completed",
    message: "File app_v2.1.apk passed all security checks",
    timestamp: "2 hours ago",
    read: true,
    scanId: "SCN-002"
  },
  {
    id: "ALT-005",
    type: "warning",
    title: "API Endpoint Vulnerability",
    message: "Security headers missing on API endpoint https://api.service.com/v1",
    timestamp: "3 hours ago",
    read: true,
    scanId: "SCN-003"
  },
];

const getAlertIcon = (type: string) => {
  switch (type) {
    case "critical": return <AlertTriangle className="w-5 h-5 text-destructive" />;
    case "warning": return <Shield className="w-5 h-5 text-chart-1" />;
    case "info": return <Info className="w-5 h-5 text-chart-2" />;
    case "success": return <CheckCircle2 className="w-5 h-5 text-chart-3" />;
    default: return <Info className="w-5 h-5" />;
  }
};

const getAlertColor = (type: string) => {
  switch (type) {
    case "critical": return "destructive";
    case "warning": return "default";
    case "info": return "secondary";
    case "success": return "outline";
    default: return "outline";
  }
};

export default function Alerts() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Security Alerts</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Mark All as Read
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="gradient-card shadow-card border-border/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-foreground">
                  {alerts.filter(a => a.type === "critical").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="gradient-card shadow-card border-border/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-foreground">
                  {alerts.filter(a => a.type === "warning").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="gradient-card shadow-card border-border/50 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="warning">Warnings</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {alerts.map((alert) => (
              <Card 
                key={alert.id} 
                className={`gradient-card shadow-card border-border/50 p-6 transition-all hover:shadow-glow ${
                  !alert.read ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{alert.title}</h3>
                        <Badge variant={getAlertColor(alert.type)}>{alert.type}</Badge>
                        {!alert.read && <Badge variant="outline">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{alert.timestamp}</span>
                        {alert.scanId && <span>Scan: {alert.scanId}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!alert.read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {["critical", "warning", "info"].map((type) => (
            <TabsContent key={type} value={type} className="space-y-4 mt-6">
              {alerts
                .filter((alert) => alert.type === type)
                .map((alert) => (
                  <Card 
                    key={alert.id} 
                    className={`gradient-card shadow-card border-border/50 p-6 transition-all hover:shadow-glow ${
                      !alert.read ? 'border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{alert.title}</h3>
                            {!alert.read && <Badge variant="outline">New</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{alert.timestamp}</span>
                            {alert.scanId && <span>Scan: {alert.scanId}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!alert.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsRead(alert.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </TabsContent>
          ))}

          <TabsContent value="settings" className="space-y-4 mt-6">
            <Card className="gradient-card shadow-card border-border/50 p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Notification Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="notifications" className="flex items-center gap-2">
                      {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      Enable Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts for security threats and scan updates
                    </p>
                  </div>
                  <Switch 
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="critical-only">Critical Alerts Only</Label>
                    <p className="text-sm text-muted-foreground">
                      Only show notifications for critical security issues
                    </p>
                  </div>
                  <Switch 
                    id="critical-only"
                    checked={criticalOnly}
                    onCheckedChange={setCriticalOnly}
                    disabled={!notificationsEnabled}
                  />
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Button variant="outline" className="w-full">
                    Configure Email Notifications
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

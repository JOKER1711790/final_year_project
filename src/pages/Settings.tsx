import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Bell, Key, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(true);
  const [autoScan, setAutoScan] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved successfully.",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Security Settings Updated",
      description: "Your security preferences have been saved.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="api">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="gradient-card shadow-card border-border/50 p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" defaultValue="SecureCheck Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="admin">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="analyst">Security Analyst</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </Card>

            <Card className="gradient-card shadow-card border-border/50 p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use dark theme across the application</p>
                  </div>
                  <Switch id="darkMode" checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time</SelectItem>
                      <SelectItem value="pst">Pacific Time</SelectItem>
                      <SelectItem value="cet">Central European Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <Card className="gradient-card shadow-card border-border/50 p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Change Password</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Update Password</Button>
              </div>
            </Card>

            <Card className="gradient-card shadow-card border-border/50 p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Scan Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="autoScan">Auto-scan Uploaded Files</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically start scanning files upon upload
                    </p>
                  </div>
                  <Switch id="autoScan" checked={autoScan} onCheckedChange={setAutoScan} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="scanDepth">Default Scan Depth</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">Quick Scan</SelectItem>
                      <SelectItem value="standard">Standard Scan</SelectItem>
                      <SelectItem value="deep">Deep Scan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveSecurity}>Save Security Settings</Button>
              </div>
            </Card>

            <Card className="gradient-card shadow-card border-border/50 p-6 border-destructive/50">
              <h3 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Delete Account</Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="gradient-card shadow-card border-border/50 p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="emailNotifs">Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about scans and threats via email
                    </p>
                  </div>
                  <Switch 
                    id="emailNotifs" 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="scanComplete">Scan Completion</Label>
                      <Switch id="scanComplete" defaultChecked disabled={!emailNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="threatDetected">Threat Detection</Label>
                      <Switch id="threatDetected" defaultChecked disabled={!emailNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weeklyReport">Weekly Reports</Label>
                      <Switch id="weeklyReport" disabled={!emailNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="quotaWarning">Quota Warnings</Label>
                      <Switch id="quotaWarning" defaultChecked disabled={!emailNotifications} />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="gradient-card shadow-card border-border/50 p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Browser Notifications</h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Enable Browser Notifications
                </Button>
                <p className="text-sm text-muted-foreground">
                  Get real-time alerts in your browser when threats are detected
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6 mt-6">
            <Card className="gradient-card shadow-card border-border/50 p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">API Keys</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use API keys to integrate SecureCheck scanning into your applications
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Production API Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="apiKey" 
                      value="sk_live_••••••••••••••••••••••••••••" 
                      readOnly 
                    />
                    <Button variant="outline">Copy</Button>
                    <Button variant="outline">Regenerate</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testApiKey">Test API Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="testApiKey" 
                      value="sk_test_••••••••••••••••••••••••••••" 
                      readOnly 
                    />
                    <Button variant="outline">Copy</Button>
                  </div>
                </div>
                <Separator />
                <div className="pt-2">
                  <h4 className="font-medium mb-2">API Usage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">This Month:</span>
                      <span className="font-medium">1,247 requests</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Limit:</span>
                      <span className="font-medium">10,000 requests/month</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="gradient-card shadow-card border-border/50 p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Webhooks</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure webhooks to receive real-time updates
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input 
                    id="webhookUrl" 
                    placeholder="https://your-app.com/webhook" 
                  />
                </div>
                <Button>Add Webhook</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

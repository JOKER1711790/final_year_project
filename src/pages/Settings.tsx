
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Bell, Key } from "lucide-react";
import { ProfileSettings, SecuritySettings, NotificationSettings, ApiSettings } from "@/components/settings";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full lg:flex lg:gap-10">
          <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:w-1/5 lg:flex-col lg:items-stretch">
            <TabsTrigger value="profile" className="lg:justify-start">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="lg:justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="lg:justify-start">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="api" className="lg:justify-start">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
          </TabsList>

          <div className="w-full lg:w-4/5">
            <TabsContent value="profile" className="mt-6 lg:mt-0">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="security" className="mt-6 lg:mt-0">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6 lg:mt-0">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="api" className="mt-6 lg:mt-0">
              <ApiSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

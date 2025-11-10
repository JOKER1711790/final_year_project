
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Bell, Key } from "lucide-react";

const PlaceholderCard = ({ title, description }: { title: string; description: string }) => (
    <Card className="gradient-card shadow-card border-border/50 p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <p>{description}</p>
      </div>
    </Card>
  );

export default function Settings() {
  return (
    <DashboardLayout>
      {() => (
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

            <TabsContent value="profile">
              <PlaceholderCard
                title="Profile Settings"
                description="User profile management is not yet implemented."
              />
            </TabsContent>

            <TabsContent value="security">
              <PlaceholderCard
                title="Security Settings"
                description="Security settings are not yet implemented."
              />
            </TabsContent>

            <TabsContent value="notifications">
              <PlaceholderCard
                title="Notification Settings"
                description="Notification settings are not yet implemented."
              />
            </TabsContent>

            <TabsContent value="api">
              <PlaceholderCard
                title="API Key Management"
                description="API key management is not yet implemented."
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DashboardLayout>
  );
}

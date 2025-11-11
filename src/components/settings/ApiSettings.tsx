
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Key, Trash2 } from "lucide-react";

export const ApiSettings = () => {
  // Placeholder data - replace with actual API data
  const apiKeys = [
    {
      id: "1",
      name: "Personal Key",
      lastUsed: "2 hours ago",
      active: true,
    },
    {
      id: "2",
      name: "Staging Key",
      lastUsed: "1 day ago",
      active: false,
    },
  ];

  return (
    <Card className="gradient-card shadow-card border-border/50 overflow-hidden">
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>Manage your API keys for programmatic access.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-foreground">Your API Keys</h4>
          <Button>Generate New Key</Button>
        </div>

        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center space-x-4">
                <Key className="w-6 h-6 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{key.name}</p>
                  <p className="text-sm text-muted-foreground">Last used: {key.lastUsed}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Switch checked={key.active} />
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 px-6 py-4 border-t border-border/50 flex justify-end">
        <p className="text-sm text-muted-foreground">
          API keys provide access to your account. Do not share them.
        </p>
      </CardFooter>
    </Card>
  );
};


import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const notificationSchema = z.object({
  scanUpdates: z.boolean(),
  newVulnerabilities: z.boolean(),
  securityNews: z.boolean(),
  teamInvites: z.boolean(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export const NotificationSettings = () => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      scanUpdates: true,
      newVulnerabilities: true,
      securityNews: false,
      teamInvites: true,
    },
  });

  const onSubmit = (data: NotificationFormValues) => {
    console.log("Notification settings updated:", data);
    // Implement API call to save settings
  };

  return (
    <Card className="gradient-card shadow-card border-border/50 overflow-hidden">
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Choose what you want to be notified about.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Scan Updates</h4>
              <p className="text-sm text-muted-foreground">Receive updates on your security scans.</p>
            </div>
            <Controller
              name="scanUpdates"
              control={control}
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">New Vulnerabilities</h4>
              <p className="text-sm text-muted-foreground">Get notified about newly discovered vulnerabilities.</p>
            </div>
            <Controller
              name="newVulnerabilities"
              control={control}
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Security News</h4>
              <p className="text-sm text-muted-foreground">Receive our newsletter with the latest security news.</p>
            </div>
            <Controller
              name="securityNews"
              control={control}
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Team Invitations</h4>
              <p className="text-sm text-muted-foreground">Get notified when you are invited to a team.</p>
            </div>
            <Controller
              name="teamInvites"
              control={control}
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 px-6 py-4 border-t border-border/50 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

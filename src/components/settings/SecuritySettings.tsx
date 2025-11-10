
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ApiClient } from "@/lib/api/api-client";
import { useState } from "react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export const SecuritySettings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage(null);

    const response = await ApiClient.changePassword(data);

    if (response.success) {
      setSubmitStatus("success");
      setSubmitMessage("Password updated successfully!");
      reset();
    } else {
      setSubmitStatus("error");
      setSubmitMessage(response.error || "An unexpected error occurred.");
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="gradient-card shadow-card border-border/50 p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Security Settings</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-muted-foreground"
          >
            Current Password
          </label>
          <Controller
            name="currentPassword"
            control={control}
            render={({ field }) => (
              <Input id="currentPassword" type="password" {...field} className="mt-1" />
            )}
          />
          {errors.currentPassword && (
            <p className="text-sm text-red-500 mt-1">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-muted-foreground"
          >
            New Password
          </label>
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <Input id="newPassword" type="password" {...field} className="mt-1" />
            )}
          />
          {errors.newPassword && (
            <p className="text-sm text-red-500 mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-muted-foreground"
          >
            Confirm New Password
          </label>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input id="confirmPassword" type="password" {...field} className="mt-1" />
            )}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Change Password"}
        </Button>

        {submitStatus === "success" && (
          <p className="text-sm text-green-500 mt-2">{submitMessage}</p>
        )}
        {submitStatus === "error" && (
          <p className="text-sm text-red-500 mt-2">{submitMessage}</p>
        )}
      </form>
    </Card>
  );
};

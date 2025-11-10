
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ApiClient, ApiResponse } from "@/lib/api/api-client";
import { useState, useEffect } from "react";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileSettings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await ApiClient.getUserProfile();
      if (response.success && response.data) {
        reset(response.data);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage(null);

    const response = await ApiClient.updateUserProfile(data);

    if (response.success) {
      setSubmitStatus("success");
      setSubmitMessage("Profile updated successfully!");
    } else {
      setSubmitStatus("error");
      setSubmitMessage(response.error || "An unexpected error occurred.");
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="gradient-card shadow-card border-border/50 p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Profile Settings</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">
            Name
          </label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input id="name" {...field} className="mt-1" />}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
            Email
          </label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => <Input id="email" type="email" {...field} className="mt-1" />}
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
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

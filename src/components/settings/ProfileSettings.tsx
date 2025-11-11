
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ApiClient } from "@/lib/api/api-client";
import { useState, useEffect } from "react";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  url: z.string().url("Invalid URL").optional(),
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
      bio: "",
      url: "",
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
    <Card className="gradient-card shadow-card border-border/50 overflow-hidden">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">
                Name
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input id="name" {...field} />}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
                Email
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => <Input id="email" type="email" {...field} />}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-medium text-muted-foreground">
              Bio
            </label>
            <Controller
              name="bio"
              control={control}
              render={({ field }) => <Input as="textarea" id="bio" {...field} rows={4} />}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="url" className="block text-sm font-medium text-muted-foreground">
              Website
            </label>
            <Controller
              name="url"
              control={control}
              render={({ field }) => <Input id="url" {...field} placeholder="https://example.com" />}
            />
            {errors.url && <p className="text-sm text-red-500 mt-1">{errors.url.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 px-6 py-4 border-t border-border/50 flex justify-end items-center">
          <div className="flex items-center space-x-4">
            {submitStatus === "success" && (
              <p className="text-sm text-green-500">{submitMessage}</p>
            )}
            {submitStatus === "error" && (
              <p className="text-sm text-red-500">{submitMessage}</p>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

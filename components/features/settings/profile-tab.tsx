"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "@supabase/supabase-js";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileTab() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        form.reset({
          name: user.user_metadata.full_name || "",
          email: user.email || "",
        });
      }
      setLoading(false);
    }
    getUser();
  }, [supabase, form]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      // 1. Update Supabase Auth User Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: data.name },
      });
      if (authError) throw authError;

      // 2. Update public.profiles table (for logs/staff display)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await (supabase.from("profiles") as any)
          .update({ full_name: data.name })
          .eq("id", user.id);

        if (profileError) {
          console.error("Failed to sync profile:", profileError);
          // Don't throw here, as Auth update succeeded
          toast.warning(
            "Profile name updated, but failed to sync across system."
          );
        } else {
          toast.success("Profile updated successfully!");
          router.refresh(); // Refresh server components to update header
        }
      }
    } catch (error: any) {
      toast.error("Failed to update profile: " + error.message);
    }
  }

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile Information</h3>
        <p className="text-sm text-muted-foreground">
          Update your account's profile information and email address.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
                      disabled
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your email address cannot be changed here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

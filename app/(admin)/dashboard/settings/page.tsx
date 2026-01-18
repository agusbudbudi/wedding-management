"use client";

export const runtime = "edge";

import { ProfileTab } from "@/components/features/settings/profile-tab";
import { SubscriptionTab } from "@/components/features/settings/subscription-tab";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function SettingsPage() {
  return (
    <PermissionGuard resource="events" action="edit" redirectTo="/restricted">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Settings
            </h1>
            <p className="text-gray-500 mt-1 hidden md:block">
              Manage your account settings and subscription.
            </p>
          </div>
        </div>

        <Card className="rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] border-none">
          <CardContent>
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full max-w-[300px] grid-cols-2 bg-white border border-gray-100 p-1 rounded-xl h-auto">
                <TabsTrigger
                  value="profile"
                  className="rounded-lg py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all duration-300 text-gray-500 font-medium"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="subscription"
                  className="rounded-lg py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all duration-300 text-gray-500 font-medium"
                >
                  Subscription Plan
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <ProfileTab />
              </TabsContent>
              <TabsContent value="subscription">
                <SubscriptionTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}

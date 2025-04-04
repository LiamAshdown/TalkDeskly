"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsContent from "@/components/protected/settings/settings-content";
import ProfileTab from "@/components/protected/settings/account/profile-tab";
import PasswordTab from "@/components/protected/settings/account/password-tab";
import NotificationsTab from "@/components/protected/settings/account/notifications-tab";

export default function AccountSettings() {
  return (
    <SettingsContent
      title="Account Settings"
      description="Manage your account settings and preferences"
      showBackButton={false}
    >
      <Tabs defaultValue="profile" className="space-y-6">
        <div className="overflow-auto">
          <TabsList className="w-full sm:w-auto inline-flex">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="password">
          <PasswordTab />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </SettingsContent>
  );
}

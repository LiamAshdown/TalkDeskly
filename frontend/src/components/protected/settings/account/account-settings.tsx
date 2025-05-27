"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsContent from "@/components/protected/settings/settings-content";
import ProfileTab from "@/components/protected/settings/account/profile-tab";
import PasswordTab from "@/components/protected/settings/account/password-tab";
import NotificationsTab from "@/components/protected/settings/account/notifications-tab";
import { useState } from "react";
import { useEffect } from "react";
import { Company, Profile } from "@/lib/interfaces";
import { profileService } from "@/lib/api/services/profile";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth";

export default function AccountSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { updateUser, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await profileService.getProfile();
        setProfile(response.data);
        updateUser({
          ...response.data,
          company: user?.company as Company,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Skeleton loading component for tabs
  const TabSkeleton = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-32" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-64" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div>
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

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
          {isLoading ? (
            <TabSkeleton />
          ) : (
            profile && (
              <ProfileTab profile={profile} onProfileUpdated={setProfile} />
            )
          )}
        </TabsContent>

        <TabsContent value="password">
          {isLoading ? (
            <TabSkeleton />
          ) : (
            profile && <PasswordTab profile={profile} />
          )}
        </TabsContent>

        <TabsContent value="notifications">
          {isLoading ? (
            <TabSkeleton />
          ) : (
            profile && (
              <NotificationsTab
                profile={profile}
                onProfileUpdated={setProfile}
              />
            )
          )}
        </TabsContent>
      </Tabs>
    </SettingsContent>
  );
}

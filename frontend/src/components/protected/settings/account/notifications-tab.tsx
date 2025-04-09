import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Profile } from "@/lib/interfaces";
import { notificationSettingsService } from "@/lib/api/services/notification-settings";
import { useToast } from "@/lib/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createZodI18n } from "@/lib/zod-i18n";

interface NotificationsTabProps {
  profile: Profile;
  onProfileUpdated?: (profile: Profile) => void;
}

// Create a schema for notification settings
const createNotificationSettingsSchema = (t: (key: string) => string) => {
  const zod = createZodI18n(t);

  return zod.object({
    newConversation: zod.boolean(),
    newMessage: zod.boolean(),
    mentions: zod.boolean(),
    emailEnabled: zod.boolean(),
    browserEnabled: zod.boolean(),
  });
};

type NotificationSettingsFormData = z.infer<
  ReturnType<typeof createNotificationSettingsSchema>
>;

export default function NotificationsTab({
  profile,
  onProfileUpdated,
}: NotificationsTabProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(createNotificationSettingsSchema(t)),
    defaultValues: {
      newConversation: profile.notificationSettings.newConversation,
      newMessage: profile.notificationSettings.newMessage,
      mentions: profile.notificationSettings.mentions,
      emailEnabled: profile.notificationSettings.emailEnabled,
      browserEnabled: profile.notificationSettings.browserEnabled,
    },
  });

  const handleSubmit = async (data: NotificationSettingsFormData) => {
    try {
      setIsLoading(true);
      const response =
        await notificationSettingsService.updateNotificationSettings(data);

      // Update the profile with the new notification settings
      if (onProfileUpdated) {
        onProfileUpdated({
          ...profile,
          notificationSettings: response.data,
        });
      }

      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.updateSuccessDescription"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile.notifications.title")}</CardTitle>
        <CardDescription>
          {t("profile.notifications.description")}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                {t("profile.notifications.emailNotifications")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {t("profile.notifications.newConversation")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.notifications.newConversationDescription")}
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("newConversation")}
                    onCheckedChange={(checked) =>
                      form.setValue("newConversation", checked)
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {t("profile.notifications.newMessage")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.notifications.newMessageDescription")}
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("newMessage")}
                    onCheckedChange={(checked) =>
                      form.setValue("newMessage", checked)
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {t("profile.notifications.mentions")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.notifications.mentionsDescription")}
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("mentions")}
                    onCheckedChange={(checked) =>
                      form.setValue("mentions", checked)
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                {t("profile.notifications.browserNotifications")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {t("profile.notifications.browserEnabled")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.notifications.browserEnabledDescription")}
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("browserEnabled")}
                    onCheckedChange={(checked) =>
                      form.setValue("browserEnabled", checked)
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              type="button"
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="w-full sm:w-auto"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? t("common.saving") : t("common.saveChanges")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

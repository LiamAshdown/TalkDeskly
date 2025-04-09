import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Profile } from "@/lib/interfaces";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/form-field";
import {
  createProfileUpdateSchema,
  type ProfileUpdateFormData,
} from "@/lib/schemas/profile-schema";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { profileService } from "@/lib/api/services/profile";
import { handleServerValidation } from "@/lib/utils/form-validation";
import { useToast } from "@/lib/hooks/use-toast";
import { UploadAvatarDialog } from "@/components/ui/upload-avatar-dialog";

interface ProfileTabProps {
  profile: Profile;
  onProfileUpdated?: (profile: Profile) => void;
}

export default function ProfileTab({
  profile,
  onProfileUpdated,
}: ProfileTabProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(createProfileUpdateSchema(t)),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: ProfileUpdateFormData) => {
    try {
      setIsLoading(true);
      const response = await profileService.updateProfile(data);

      if (onProfileUpdated) {
        onProfileUpdated(response.data);
      }

      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.updateSuccessDescription"),
      });
    } catch (error) {
      handleServerValidation(form, error, t);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsLoading(true);
      const response = await profileService.updateProfileAvatar(file);
      if (onProfileUpdated) {
        onProfileUpdated(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("profile.title")}</CardTitle>
        <CardDescription>{t("profile.description")}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback>
                  {profile.firstName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <UploadAvatarDialog
                  onUpload={handleAvatarUpload}
                  className="mb-2"
                  maxSize={2}
                  aspectRatio="4:3"
                />
                <p className="text-xs text-muted-foreground">
                  JPG, GIF or PNG. Max size of 2MB
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                name="firstName"
                label={t("profile.form.firstName")}
                control={form.control}
                disabled={isLoading}
              />

              <InputField
                name="lastName"
                label={t("profile.form.lastName")}
                control={form.control}
                disabled={isLoading}
              />

              <InputField
                name="email"
                label={t("profile.form.email")}
                control={form.control}
                disabled={isLoading}
              />

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={profile.role} disabled />
                <p className="text-xs text-muted-foreground">
                  {t("profile.form.roleDescription")}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              type="button"
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

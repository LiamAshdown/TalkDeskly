import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Profile } from "@/lib/interfaces";
import {
  createProfilePasswordUpdateSchema,
  ProfilePasswordUpdateFormData,
} from "@/lib/schemas/profile-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { InputField } from "@/components/ui/form-field";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { profileService } from "@/lib/api/services/profile";
import { toast } from "@/lib/hooks/use-toast";
import { handleServerValidation } from "@/lib/utils/form-validation";

interface PasswordTabProps {
  profile: Profile;
}

export default function PasswordTab({ profile }: PasswordTabProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ProfilePasswordUpdateFormData>({
    resolver: zodResolver(createProfilePasswordUpdateSchema(t)),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: ProfilePasswordUpdateFormData) => {
    try {
      setIsLoading(true);
      await profileService.updateProfilePassword(data);

      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.updateSuccessDescription"),
      });

      form.reset();
    } catch (error) {
      handleServerValidation(form, error, t);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Change your password</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2 mb-2">
              <InputField
                name="oldPassword"
                label="Current Password"
                control={form.control}
                type="password"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <div className="space-y-2">
                <InputField
                  name="newPassword"
                  label="New Password"
                  control={form.control}
                  type="password"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <InputField
                  name="confirmPassword"
                  label="Confirm New Password"
                  control={form.control}
                  type="password"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" disabled={isLoading}>
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

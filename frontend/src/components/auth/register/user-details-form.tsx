"use client";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  createOnboardingUserSchema,
  type OnboardingUser,
} from "@/lib/schemas/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useTranslation } from "react-i18next";
import { InputField } from "@/components/ui/form-field";
import { authService } from "@/lib/api/services/auth";
import { handleServerValidation } from "@/lib/utils/form-validation";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth";

interface UserDetailsFormProps {
  onNextStep: () => void;
}

export function UserDetailsForm({ onNextStep }: UserDetailsFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const authStore = useAuthStore();
  const form = useForm<OnboardingUser>({
    resolver: zodResolver(createOnboardingUserSchema(t)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: OnboardingUser) => {
    try {
      setLoading(true);
      const response = await authService.onboardingUser(data);
      authStore.setToken(response.data.token);
      onNextStep();
    } catch (error) {
      handleServerValidation(form, error, t);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              name="firstName"
              label={t("auth.onboarding.user.firstName")}
              control={form.control}
              placeholder="John"
              disabled={loading}
            />
            <InputField
              name="lastName"
              label={t("auth.onboarding.user.lastName")}
              control={form.control}
              placeholder="Doe"
              disabled={loading}
            />
          </div>

          <InputField
            name="email"
            label={t("auth.onboarding.user.email")}
            control={form.control}
            type="email"
            placeholder="m@example.com"
            disabled={loading}
          />

          <InputField
            name="password"
            label={t("auth.onboarding.user.password")}
            control={form.control}
            type="password"
            disabled={loading}
          />

          <InputField
            name="confirmPassword"
            label={t("auth.onboarding.user.confirmPassword")}
            control={form.control}
            type="password"
            disabled={loading}
          />
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("auth.onboarding.loading") : t("auth.onboarding.next")}
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("auth.onboarding.haveAccount")}{" "}
            <Link
              to="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("auth.onboarding.login")}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Form>
  );
}

"use client";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import {
  createOnboardingCompanySchema,
  type OnboardingCompany,
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

interface CompanyDetailsFormProps {
  onNextStep: () => void;
}

export function CompanyDetailsForm({ onNextStep }: CompanyDetailsFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const form = useForm<OnboardingCompany>({
    resolver: zodResolver(createOnboardingCompanySchema(t)),
    defaultValues: {
      name: "",
      email: "",
      website: "",
      phone: "",
      address: "",
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: OnboardingCompany) => {
    try {
      setLoading(true);
      const response = await authService.onboardingCompany(data);
      authStore.setAuth(response.data);

      navigate("/portal");
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
          <InputField
            name="name"
            label={t("auth.onboarding.company.name")}
            control={form.control}
            placeholder="Acme Inc."
            disabled={loading}
          />

          <InputField
            name="email"
            label={t("auth.onboarding.company.email")}
            control={form.control}
            placeholder="company@example.com"
            disabled={loading}
          />

          <InputField
            name="website"
            label={t("auth.onboarding.company.website")}
            control={form.control}
            placeholder="https://example.com"
            disabled={loading}
          />

          <InputField
            name="phone"
            label={t("auth.onboarding.company.phone")}
            control={form.control}
            placeholder="+1 (555) 123-4567"
            disabled={loading}
          />

          <InputField
            name="address"
            label={t("auth.onboarding.company.address")}
            control={form.control}
            placeholder="123 Main St, City, Country"
            disabled={loading}
          />
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("auth.onboarding.loading") : t("auth.onboarding.next")}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}

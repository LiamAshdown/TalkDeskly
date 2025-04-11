import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Upload, Globe, Mail, Phone, MapPin } from "lucide-react";
import SettingsContent from "@/components/protected/settings/settings-content";
import { Company } from "@/lib/interfaces";
import { companyService } from "@/lib/api/services/company";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputField, TextareaField } from "@/components/ui/form-field";
import { useTranslation } from "react-i18next";
import {
  createCompanyUpdateSchema,
  type CompanyUpdateFormData,
} from "@/lib/schemas/company-schema";
import { handleServerValidation } from "@/lib/utils/form-validation";
import { useToast } from "@/lib/hooks/use-toast";
import { UploadAvatarDialog } from "@/components/ui/upload-avatar-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanySettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CompanyUpdateFormData>({
    resolver: zodResolver(createCompanyUpdateSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      website: "",
      phone: "",
      address: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await companyService.getCompany();
        setCompany(response.data);

        // Set form default values
        form.reset({
          name: response.data.name,
          email: response.data.email,
          website: response.data.website,
          phone: response.data.phone,
          address: response.data.address,
        });
      } catch (error) {
        console.error("Failed to fetch company:", error);
      }
    };
    fetchCompany();
  }, [form]);

  const handleSubmit = async (data: CompanyUpdateFormData) => {
    if (!company) return;

    try {
      setIsLoading(true);
      const response = await companyService.updateCompany({
        ...company,
        ...data,
      });

      setCompany(response.data);

      toast({
        title: t("company.updateSuccess"),
        description: t("company.updateSuccessDescription"),
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
      const response = await companyService.updateCompanyLogo(file);
      setCompany(response.data);
    } finally {
      setIsLoading(false);
    }
  };

  const CompanySkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="pt-4 border-t">
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
        <Skeleton className="h-10 w-full sm:w-24" />
        <Skeleton className="h-10 w-full sm:w-32" />
      </CardFooter>
    </Card>
  );

  if (!company) {
    return (
      <SettingsContent
        title={t("company.title")}
        description={t("company.description")}
        showBackButton={false}
      >
        <CompanySkeleton />
      </SettingsContent>
    );
  }

  return (
    <SettingsContent
      title={t("company.title")}
      description={t("company.description")}
      showBackButton={false}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("company.title")}</CardTitle>
          <CardDescription>{t("company.description")}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={company.logo} alt={company.name} />
                    <AvatarFallback>
                      <Building className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center">
                    <UploadAvatarDialog
                      onUpload={handleAvatarUpload}
                      className="mb-2"
                      maxSize={2}
                      aspectRatio="4:3"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      SVG, PNG, JPG (max. 2MB)
                    </p>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <InputField
                    name="name"
                    label={t("company.form.name")}
                    control={form.control}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-4">
                  {t("company.contactInformation")}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    name="website"
                    label={t("company.form.website")}
                    control={form.control}
                    placeholder="https://example.com"
                    disabled={isLoading}
                  />
                  <InputField
                    name="email"
                    label={t("company.form.email")}
                    control={form.control}
                    placeholder="contact@example.com"
                    disabled={isLoading}
                  />
                  <InputField
                    name="phone"
                    label={t("company.form.phone")}
                    control={form.control}
                    placeholder="+1 (555) 123-4567"
                    disabled={isLoading}
                  />
                  <div className="space-y-2">
                    <TextareaField
                      name="address"
                      label={t("company.form.address")}
                      control={form.control}
                      placeholder="123 Business Ave, Suite 100, San Francisco, CA 94107"
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
    </SettingsContent>
  );
}

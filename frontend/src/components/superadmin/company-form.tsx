import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, AlertCircle } from "lucide-react";
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "@/lib/api/services/superadmin";
import { SuperAdminCompany } from "@/lib/interfaces";
import { useTranslation } from "react-i18next";

interface CompanyFormProps {
  company?: SuperAdminCompany;
  onSubmit: (
    data: CreateCompanyRequest | UpdateCompanyRequest
  ) => Promise<void>;
  loading?: boolean;
  title: string;
  submitLabel: string;
}

export default function CompanyForm({
  company,
  onSubmit,
  loading = false,
  title,
  submitLabel,
}: CompanyFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: company?.name || "",
    email: company?.email || "",
    website: company?.website || "",
    phone: company?.phone || "",
    address: company?.address || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("superadmin.companies.validation.nameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("superadmin.companies.validation.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("superadmin.companies.validation.emailInvalid");
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = t("superadmin.companies.validation.websiteInvalid");
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("superadmin.companies.form.name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={t("superadmin.companies.form.namePlaceholder")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              {t("superadmin.companies.form.email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder={t("superadmin.companies.form.emailPlaceholder")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">
              {t("superadmin.companies.form.website")}
            </Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder={t("superadmin.companies.form.websitePlaceholder")}
              className={errors.website ? "border-red-500" : ""}
            />
            {errors.website && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.website}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              {t("superadmin.companies.form.phone")}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder={t("superadmin.companies.form.phonePlaceholder")}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              {t("superadmin.companies.form.address")}
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder={t("superadmin.companies.form.addressPlaceholder")}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t("superadmin.common.saving")}</span>
                </div>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, AlertCircle } from "lucide-react";
import {
  CreateUserRequest,
  UpdateUserRequest,
} from "@/lib/api/services/superadmin";
import { SuperAdminUser } from "@/lib/interfaces";
import { useTranslation } from "react-i18next";

interface UserFormProps {
  user?: SuperAdminUser;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  loading?: boolean;
  title: string;
  submitLabel: string;
}

export default function UserForm({
  user,
  onSubmit,
  loading = false,
  title,
  submitLabel,
}: UserFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "agent",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const roles = [
    {
      value: "superadmin",
      label: t("superadmin.users.roles.superadmin"),
      icon: Shield,
      description: t("superadmin.users.roles.superadminDescription"),
    },
    {
      value: "admin",
      label: t("superadmin.users.roles.admin"),
      icon: User,
      description: t("superadmin.users.roles.adminDescription"),
    },
    {
      value: "agent",
      label: t("superadmin.users.roles.agent"),
      icon: User,
      description: t("superadmin.users.roles.agentDescription"),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("superadmin.users.validation.firstNameRequired");
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t("superadmin.users.validation.lastNameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("superadmin.users.validation.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("superadmin.users.validation.emailInvalid");
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = t("superadmin.users.validation.passwordRequired");
    } else if (!user && formData.password.length < 6) {
      newErrors.password = t("superadmin.users.validation.passwordMinLength");
    }

    if (!formData.role) {
      newErrors.role = t("superadmin.users.validation.roleRequired");
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
          <User className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {t("superadmin.users.form.firstName")}
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder={t("superadmin.users.form.firstNamePlaceholder")}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                {t("superadmin.users.form.lastName")}
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder={t("superadmin.users.form.lastNamePlaceholder")}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("superadmin.users.form.email")}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder={t("superadmin.users.form.emailPlaceholder")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password (only for new users) */}
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">
                {t("superadmin.users.form.password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder={t("superadmin.users.form.passwordPlaceholder")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-4">
            <Label>{t("superadmin.users.form.role")}</Label>
            <div className="grid gap-3">
              {roles.map((role) => (
                <div
                  key={role.value}
                  className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                    formData.role === role.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                  }`}
                  onClick={() => handleInputChange("role", role.value)}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`mt-1 p-2 rounded-lg ${
                        formData.role === role.value
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      <role.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={(e) =>
                            handleInputChange("role", e.target.value)
                          }
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {role.label}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.role && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.role}
              </p>
            )}
          </div>

          {/* Show current company (read-only) */}
          {user && user.company && (
            <div className="space-y-2">
              <Label>Company</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.company.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Company assignment cannot be changed
                </div>
              </div>
            </div>
          )}

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

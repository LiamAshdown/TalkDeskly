import { useState, useEffect } from "react";
import { Settings, Server, Mail, Globe, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/lib/hooks/use-toast";
import {
  superAdminService,
  SystemConfig,
  UpdateConfigRequest,
} from "@/lib/api/services/superadmin";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

export default function ConfigPage() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateConfigRequest>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getConfig();
      setConfig(data);
      // Initialize form data with current values
      setFormData({
        port: data.port,
        baseUrl: data.baseUrl,
        frontendUrl: data.frontendUrl,
        environment: data.environment,
        logLevel: data.logLevel,
        emailProvider: data.emailProvider,
        emailHost: data.emailHost,
        emailPort: data.emailPort,
        emailUsername: data.emailUsername,
        emailPassword: "", // Don't pre-fill password
        emailFrom: data.emailFrom,
        defaultLanguage: data.defaultLanguage,
        supportedLanguages: data.supportedLanguages,
        applicationName: data.applicationName,
        enableRegistration: data.enableRegistration,
      });
    } catch (error) {
      console.error("Failed to fetch config:", error);
      toast({
        variant: "destructive",
        title: t("superadmin.common.error"),
        description: t("superadmin.config.toast.loadError"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof UpdateConfigRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLanguagesChange = (languages: string) => {
    const languageArray = languages.split(",").map((lang) => lang.trim());
    setFormData((prev) => ({ ...prev, supportedLanguages: languageArray }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Only send fields that have values
      const updateData: UpdateConfigRequest = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          updateData[key as keyof UpdateConfigRequest] = value;
        }
      });

      await superAdminService.updateConfig(updateData);
      toast({
        title: t("superadmin.common.success"),
        description: t("superadmin.config.toast.updateSuccess"),
      });
      // Refresh the config to show updated values
      await fetchConfig();
    } catch (error) {
      console.error("Failed to update config:", error);
      toast({
        variant: "destructive",
        title: t("superadmin.common.error"),
        description: t("superadmin.config.toast.updateError"),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Settings className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("superadmin.config.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("superadmin.config.description")}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t("superadmin.config.notFound.title")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t("superadmin.config.notFound.description")}
            </p>
            <Button onClick={fetchConfig}>
              {t("superadmin.config.notFound.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Settings className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("superadmin.config.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("superadmin.config.description")}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving
            ? t("superadmin.config.savingChanges")
            : t("superadmin.config.saveChanges")}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Server Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              {t("superadmin.config.server.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="port">
                  {t("superadmin.config.server.port")}
                </Label>
                <Input
                  id="port"
                  value={formData.port || ""}
                  onChange={(e) => handleInputChange("port", e.target.value)}
                  placeholder={t("superadmin.config.server.portPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="environment">
                  {t("superadmin.config.server.environment")}
                </Label>
                <Select
                  value={formData.environment || ""}
                  onValueChange={(value) =>
                    handleInputChange("environment", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("superadmin.config.server.environment")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">
                      {t("superadmin.config.server.environments.development")}
                    </SelectItem>
                    <SelectItem value="staging">
                      {t("superadmin.config.server.environments.staging")}
                    </SelectItem>
                    <SelectItem value="production">
                      {t("superadmin.config.server.environments.production")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl">
                  {t("superadmin.config.server.baseUrl")}
                </Label>
                <Input
                  id="baseUrl"
                  value={formData.baseUrl || ""}
                  onChange={(e) => handleInputChange("baseUrl", e.target.value)}
                  placeholder={t("superadmin.config.server.baseUrlPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frontendUrl">
                  {t("superadmin.config.server.frontendUrl")}
                </Label>
                <Input
                  id="frontendUrl"
                  value={formData.frontendUrl || ""}
                  onChange={(e) =>
                    handleInputChange("frontendUrl", e.target.value)
                  }
                  placeholder={t(
                    "superadmin.config.server.frontendUrlPlaceholder"
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logLevel">
                {t("superadmin.config.server.logLevel")}
              </Label>
              <Select
                value={formData.logLevel || ""}
                onValueChange={(value) => handleInputChange("logLevel", value)}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue
                    placeholder={t("superadmin.config.server.logLevel")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">
                    {t("superadmin.config.server.logLevels.debug")}
                  </SelectItem>
                  <SelectItem value="info">
                    {t("superadmin.config.server.logLevels.info")}
                  </SelectItem>
                  <SelectItem value="warn">
                    {t("superadmin.config.server.logLevels.warn")}
                  </SelectItem>
                  <SelectItem value="error">
                    {t("superadmin.config.server.logLevels.error")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Database & Security Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("superadmin.config.database.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t("superadmin.config.database.connection")}
                </span>
                <Badge
                  variant={config.databaseConfigured ? "default" : "secondary"}
                  className={
                    config.databaseConfigured
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }
                >
                  {config.databaseConfigured
                    ? t("superadmin.config.database.configured")
                    : t("superadmin.config.database.notConfigured")}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t("superadmin.config.database.redis")}
                </span>
                <Badge
                  variant={config.redisConfigured ? "default" : "secondary"}
                  className={
                    config.redisConfigured
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }
                >
                  {config.redisConfigured
                    ? t("superadmin.config.database.configured")
                    : t("superadmin.config.database.notConfigured")}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              {t("superadmin.config.database.description")}
            </p>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("superadmin.config.email.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailProvider">
                  {t("superadmin.config.email.provider")}
                </Label>
                <Select
                  value={formData.emailProvider || ""}
                  onValueChange={(value) =>
                    handleInputChange("emailProvider", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("superadmin.config.email.provider")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gomail">
                      {t("superadmin.config.email.providers.gomail")}
                    </SelectItem>
                    <SelectItem value="smtp">
                      {t("superadmin.config.email.providers.smtp")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailFrom">
                  {t("superadmin.config.email.from")}
                </Label>
                <Input
                  id="emailFrom"
                  type="email"
                  value={formData.emailFrom || ""}
                  onChange={(e) =>
                    handleInputChange("emailFrom", e.target.value)
                  }
                  placeholder={t("superadmin.config.email.fromPlaceholder")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailHost">
                  {t("superadmin.config.email.host")}
                </Label>
                <Input
                  id="emailHost"
                  value={formData.emailHost || ""}
                  onChange={(e) =>
                    handleInputChange("emailHost", e.target.value)
                  }
                  placeholder={t("superadmin.config.email.hostPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailPort">
                  {t("superadmin.config.email.port")}
                </Label>
                <Input
                  id="emailPort"
                  value={formData.emailPort || ""}
                  onChange={(e) =>
                    handleInputChange("emailPort", e.target.value)
                  }
                  placeholder={t("superadmin.config.email.portPlaceholder")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailUsername">
                  {t("superadmin.config.email.username")}
                </Label>
                <Input
                  id="emailUsername"
                  value={formData.emailUsername || ""}
                  onChange={(e) =>
                    handleInputChange("emailUsername", e.target.value)
                  }
                  placeholder={t("superadmin.config.email.usernamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailPassword">
                  {t("superadmin.config.email.password")}
                </Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={formData.emailPassword || ""}
                  onChange={(e) =>
                    handleInputChange("emailPassword", e.target.value)
                  }
                  placeholder={t("superadmin.config.email.passwordPlaceholder")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("superadmin.config.application.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="applicationName">
                {t("superadmin.config.application.name")}
              </Label>
              <Input
                id="applicationName"
                value={formData.applicationName || ""}
                onChange={(e) =>
                  handleInputChange("applicationName", e.target.value)
                }
                placeholder={t("superadmin.config.application.namePlaceholder")}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">
                {t("superadmin.config.application.defaultLanguage")}
              </Label>
              <Input
                id="defaultLanguage"
                value={formData.defaultLanguage || ""}
                onChange={(e) =>
                  handleInputChange("defaultLanguage", e.target.value)
                }
                placeholder={t(
                  "superadmin.config.application.defaultLanguagePlaceholder"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportedLanguages">
                {t("superadmin.config.application.supportedLanguages")}
              </Label>
              <Input
                id="supportedLanguages"
                value={formData.supportedLanguages?.join(", ") || ""}
                onChange={(e) => handleLanguagesChange(e.target.value)}
                placeholder={t(
                  "superadmin.config.application.supportedLanguagesPlaceholder"
                )}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t(
                  "superadmin.config.application.supportedLanguagesDescription"
                )}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="enableRegistration">
                  {t("superadmin.config.application.enableRegistration")}
                </Label>
                <Switch
                  id="enableRegistration"
                  checked={formData.enableRegistration === "true"}
                  onCheckedChange={(checked) =>
                    handleInputChange(
                      "enableRegistration",
                      checked ? "true" : "false"
                    )
                  }
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("superadmin.config.application.registrationDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving
            ? t("superadmin.config.savingChanges")
            : t("superadmin.config.saveAllChanges")}
        </Button>
      </div>
    </div>
  );
}

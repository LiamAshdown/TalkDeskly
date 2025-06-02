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

export default function ConfigPage() {
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
      });
    } catch (error) {
      console.error("Failed to fetch config:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load configuration. Please try again.",
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
        title: "Success",
        description: "Configuration updated successfully.",
      });
      // Refresh the config to show updated values
      await fetchConfig();
    } catch (error) {
      console.error("Failed to update config:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update configuration. Please try again.",
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
              System Configuration
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure system-wide settings
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
              Configuration not found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Unable to load system configuration.
            </p>
            <Button onClick={fetchConfig}>Retry</Button>
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
              System Configuration
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure system-wide settings and behavior
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Server Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Server Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="port">Server Port</Label>
                <Input
                  id="port"
                  value={formData.port || ""}
                  onChange={(e) => handleInputChange("port", e.target.value)}
                  placeholder="3000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={formData.environment || ""}
                  onValueChange={(value) =>
                    handleInputChange("environment", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  value={formData.baseUrl || ""}
                  onChange={(e) => handleInputChange("baseUrl", e.target.value)}
                  placeholder="http://localhost:3000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frontendUrl">Frontend URL</Label>
                <Input
                  id="frontendUrl"
                  value={formData.frontendUrl || ""}
                  onChange={(e) =>
                    handleInputChange("frontendUrl", e.target.value)
                  }
                  placeholder="http://localhost:3001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logLevel">Log Level</Label>
              <Select
                value={formData.logLevel || ""}
                onValueChange={(value) => handleInputChange("logLevel", value)}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select log level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
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
              Database & Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Connection</span>
                <Badge
                  variant={config.databaseConfigured ? "default" : "secondary"}
                  className={
                    config.databaseConfigured
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }
                >
                  {config.databaseConfigured ? "Configured" : "Not Configured"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Redis Connection</span>
                <Badge
                  variant={config.redisConfigured ? "default" : "secondary"}
                  className={
                    config.redisConfigured
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }
                >
                  {config.redisConfigured ? "Configured" : "Not Configured"}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Database and security configurations are managed via environment
              variables for security reasons.
            </p>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailProvider">Email Provider</Label>
                <Select
                  value={formData.emailProvider || ""}
                  onValueChange={(value) =>
                    handleInputChange("emailProvider", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gomail">GoMail</SelectItem>
                    <SelectItem value="smtp">SMTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailFrom">From Address</Label>
                <Input
                  id="emailFrom"
                  type="email"
                  value={formData.emailFrom || ""}
                  onChange={(e) =>
                    handleInputChange("emailFrom", e.target.value)
                  }
                  placeholder="noreply@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailHost">SMTP Host</Label>
                <Input
                  id="emailHost"
                  value={formData.emailHost || ""}
                  onChange={(e) =>
                    handleInputChange("emailHost", e.target.value)
                  }
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailPort">SMTP Port</Label>
                <Input
                  id="emailPort"
                  value={formData.emailPort || ""}
                  onChange={(e) =>
                    handleInputChange("emailPort", e.target.value)
                  }
                  placeholder="587"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailUsername">SMTP Username</Label>
                <Input
                  id="emailUsername"
                  value={formData.emailUsername || ""}
                  onChange={(e) =>
                    handleInputChange("emailUsername", e.target.value)
                  }
                  placeholder="username@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailPassword">SMTP Password</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  value={formData.emailPassword || ""}
                  onChange={(e) =>
                    handleInputChange("emailPassword", e.target.value)
                  }
                  placeholder="Enter new password to change"
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
              Application Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="applicationName">Application Name</Label>
              <Input
                id="applicationName"
                value={formData.applicationName || ""}
                onChange={(e) =>
                  handleInputChange("applicationName", e.target.value)
                }
                placeholder="TalkDeskly"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">Default Language</Label>
              <Input
                id="defaultLanguage"
                value={formData.defaultLanguage || ""}
                onChange={(e) =>
                  handleInputChange("defaultLanguage", e.target.value)
                }
                placeholder="en"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportedLanguages">
                Supported Languages (comma-separated)
              </Label>
              <Input
                id="supportedLanguages"
                value={formData.supportedLanguages?.join(", ") || ""}
                onChange={(e) => handleLanguagesChange(e.target.value)}
                placeholder="en, es, fr, de"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter language codes separated by commas (e.g., en, es, fr)
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
          {saving ? "Saving Changes..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}

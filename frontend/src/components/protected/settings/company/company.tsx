import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function CompanySettings() {
  const [company, setCompany] = useState({
    name: "Acme Corporation",
    logo: "/placeholder.svg?height=100&width=100",
    website: "https://example.com",
    email: "contact@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, Suite 100, San Francisco, CA 94107",
    description:
      "A leading provider of customer support solutions for businesses of all sizes.",
    industry: "Software",
    size: "50-100",
    timezone: "America/Los_Angeles",
    founded: "2015",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // In a real app, you would upload the file to your server/cloud storage
      // For now, we'll just create a local URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setCompany({
            ...company,
            logo: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <SettingsContent
      title="Company Settings"
      description="Manage your company profile and business information"
      showBackButton={false}
    >
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>
            Update your company information and contact details
          </CardDescription>
        </CardHeader>
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
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-1 text-sm text-primary">
                    <Upload className="h-3 w-3" />
                    <span>Upload logo</span>
                  </div>
                </Label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  SVG, PNG, JPG (max. 2MB)
                </p>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={company.name}
                  onChange={(e) =>
                    setCompany({ ...company, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-description">Company Description</Label>
                <Textarea
                  id="company-description"
                  value={company.description}
                  onChange={(e) =>
                    setCompany({ ...company, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-4">Contact Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Website
                </Label>
                <Input
                  id="website"
                  value={company.website}
                  onChange={(e) =>
                    setCompany({ ...company, website: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={company.email}
                  onChange={(e) =>
                    setCompany({ ...company, email: e.target.value })
                  }
                  placeholder="contact@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={company.phone}
                  onChange={(e) =>
                    setCompany({ ...company, phone: e.target.value })
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={company.address}
                  onChange={(e) =>
                    setCompany({ ...company, address: e.target.value })
                  }
                  placeholder="123 Business Ave, Suite 100, San Francisco, CA 94107"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button variant="outline" className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </SettingsContent>
  );
}

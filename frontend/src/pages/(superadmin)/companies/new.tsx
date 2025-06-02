import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanyForm from "@/components/superadmin/company-form";
import {
  superAdminService,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "@/lib/api/services/superadmin";
import { useToast } from "@/lib/hooks/use-toast";

export default function NewCompanyPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (
    data: CreateCompanyRequest | UpdateCompanyRequest
  ) => {
    try {
      setSubmitting(true);
      await superAdminService.createCompany(data as CreateCompanyRequest);

      toast({
        title: "Success",
        description: "Company created successfully.",
      });

      navigate("/superadmin/companies");
    } catch (error) {
      console.error("Failed to create company:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create company. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/superadmin/companies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Company
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add a new company to the system
          </p>
        </div>
      </div>

      {/* Form */}
      <CompanyForm
        onSubmit={handleSubmit}
        loading={submitting}
        title="Create New Company"
        submitLabel="Create Company"
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CompanyForm from "@/components/superadmin/company-form";
import {
  superAdminService,
  UpdateCompanyRequest,
} from "@/lib/api/services/superadmin";
import { SuperAdminCompany } from "@/lib/interfaces";
import { useToast } from "@/lib/hooks/use-toast";

export default function EditCompanyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [company, setCompany] = useState<SuperAdminCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/superadmin/companies");
      return;
    }

    const fetchCompany = async () => {
      try {
        setLoading(true);
        const companyData = await superAdminService.getCompany(id);
        setCompany(companyData);
      } catch (error) {
        console.error("Failed to fetch company data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load company data. Please try again.",
        });
        navigate("/superadmin/companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, navigate, toast]);

  const handleSubmit = async (data: UpdateCompanyRequest) => {
    if (!id || !company) return;

    try {
      setSubmitting(true);
      await superAdminService.updateCompany(id, data);

      toast({
        title: "Success",
        description: "Company updated successfully.",
      });

      navigate("/superadmin/companies");
    } catch (error) {
      console.error("Failed to update company:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update company. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>

        {/* Form Skeleton */}
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[70px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[50px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[70px]" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-[120px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Company not found
            </h3>
            <p className="text-gray-600 mb-4">
              The company you're looking for doesn't exist or has been deleted.
            </p>
            <Link to="/superadmin/companies">
              <Button>Back to Companies</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Edit Company
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update {company.name}'s information
          </p>
        </div>
      </div>

      {/* Form */}
      <CompanyForm
        company={company}
        onSubmit={handleSubmit}
        loading={submitting}
        title="Update Company Information"
        submitLabel="Update Company"
      />
    </div>
  );
}

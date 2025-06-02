import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import UserForm from "@/components/superadmin/user-form";
import {
  superAdminService,
  UpdateUserRequest,
} from "@/lib/api/services/superadmin";
import { SuperAdminUser, SuperAdminCompany } from "@/lib/interfaces";
import { useToast } from "@/lib/hooks/use-toast";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<SuperAdminUser | null>(null);
  const [companies, setCompanies] = useState<SuperAdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/superadmin/users");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [userData, companiesData] = await Promise.all([
          superAdminService.getUser(id),
          superAdminService.getAllCompanies(),
        ]);

        setUser(userData);
        setCompanies(companiesData.companies);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data. Please try again.",
        });
        navigate("/superadmin/users");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, toast]);

  const handleSubmit = async (data: UpdateUserRequest) => {
    if (!id || !user) return;

    try {
      setSubmitting(true);
      await superAdminService.updateUser(id, data);

      toast({
        title: "Success",
        description: "User updated successfully.",
      });

      navigate("/superadmin/users");
    } catch (error) {
      console.error("Failed to update user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user. Please try again.",
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[40px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[70px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              User not found
            </h3>
            <p className="text-gray-600 mb-4">
              The user you're looking for doesn't exist or has been deleted.
            </p>
            <Link to="/superadmin/users">
              <Button>Back to Users</Button>
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
        <Link to="/superadmin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit User
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update {user.firstName} {user.lastName}'s information
          </p>
        </div>
      </div>

      {/* Form */}
      <UserForm
        user={user}
        companies={companies}
        onSubmit={handleSubmit}
        loading={submitting}
        title="Update User Information"
        submitLabel="Update User"
      />
    </div>
  );
}

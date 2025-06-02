import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserForm from "@/components/superadmin/user-form";
import {
  superAdminService,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/lib/api/services/superadmin";
import { useToast } from "@/lib/hooks/use-toast";

export default function NewUserPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
    try {
      setSubmitting(true);
      await superAdminService.createUser(data as CreateUserRequest);

      toast({
        title: "Success",
        description: "User created successfully.",
      });

      navigate("/superadmin/users");
    } catch (error) {
      console.error("Failed to create user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create user. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
            Create User
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add a new user to the system
          </p>
        </div>
      </div>

      {/* Form */}
      <UserForm
        onSubmit={handleSubmit}
        loading={submitting}
        title="Create New User"
        submitLabel="Create User"
      />
    </div>
  );
}

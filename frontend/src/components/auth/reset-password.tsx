import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { authService } from "@/lib/api/services/auth";
import { useTranslation } from "react-i18next";
import {
  createResetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/schemas/auth-schema";
import { InputField } from "@/components/ui/form-field";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { toast } from "@/lib/hooks/use-toast";
import { CheckCircle, ArrowLeft, Key } from "lucide-react";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useTranslation();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(createResetPasswordSchema(t)),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const { handleServerValidation } = useFormValidation(form);

  const handleSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast({
        title: t("auth.resetPassword.invalidToken"),
        description: t("auth.resetPassword.invalidTokenDescription"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, data.password);

      setIsSubmitted(true);
      toast({
        title: t("auth.resetPassword.success"),
        description: t("auth.resetPassword.successDescription"),
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      if (!handleServerValidation(error)) {
        // Handle other errors
        toast({
          title: t("auth.resetPassword.error"),
          description: t("auth.resetPassword.errorDescription"),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {t("auth.resetPassword.passwordChanged")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {t("auth.resetPassword.passwordChangedDescription")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("auth.resetPassword.redirectingToLogin")}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button
            type="button"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            {t("auth.resetPassword.goToLogin")}
          </Button>
        </CardFooter>
      </>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t("auth.resetPassword.title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("auth.resetPassword.description")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            name="password"
            label={t("auth.resetPassword.newPassword")}
            control={form.control}
            type="password"
            placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
            disabled={isLoading}
          />

          <InputField
            name="confirmPassword"
            label={t("auth.resetPassword.confirmPassword")}
            control={form.control}
            type="password"
            placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
            disabled={isLoading}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>{t("auth.resetPassword.passwordRequirements")}:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• {t("auth.resetPassword.minLength")}</li>
              <li>• {t("auth.resetPassword.strongPassword")}</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? t("auth.resetPassword.updating")
              : t("auth.resetPassword.submit")}
          </Button>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("auth.resetPassword.backToLogin")}
          </Link>
        </CardFooter>
      </form>
    </Form>
  );
}

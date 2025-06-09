import { useState } from "react";
import { Link } from "react-router-dom";
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
  createForgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/schemas/auth-schema";
import { InputField } from "@/components/ui/form-field";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { toast } from "@/lib/hooks/use-toast";
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useTranslation();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(createForgotPasswordSchema(t)),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });

  const { handleServerValidation } = useFormValidation(form);

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      await authService.forgotPassword(data.email);

      setIsSubmitted(true);
      toast({
        title: t("auth.forgotPassword.success"),
        description: t("auth.forgotPassword.successDescription"),
      });
    } catch (error) {
      if (!handleServerValidation(error)) {
        // Handle other errors
        toast({
          title: t("auth.forgotPassword.error"),
          description: t("auth.forgotPassword.errorDescription"),
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
            {t("auth.forgotPassword.emailSent")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {t("auth.forgotPassword.checkEmail")}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">
                    {t("auth.forgotPassword.emailInstructions")}
                  </p>
                  <ul className="space-y-1 text-left">
                    <li>• {t("auth.forgotPassword.checkSpam")}</li>
                    <li>• {t("auth.forgotPassword.linkExpiry")}</li>
                    <li>• {t("auth.forgotPassword.requestNew")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setIsSubmitted(false)}
          >
            {t("auth.forgotPassword.sendAgain")}
          </Button>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("auth.forgotPassword.backToLogin")}
          </Link>
        </CardFooter>
      </>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardHeader>
          <CardTitle>{t("auth.forgotPassword.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("auth.forgotPassword.description")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            name="email"
            label={t("auth.forgotPassword.emailLabel")}
            control={form.control}
            type="email"
            placeholder={t("auth.forgotPassword.emailPlaceholder")}
            disabled={isLoading}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? t("auth.forgotPassword.sending")
              : t("auth.forgotPassword.submit")}
          </Button>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("auth.forgotPassword.backToLogin")}
          </Link>
        </CardFooter>
      </form>
    </Form>
  );
}

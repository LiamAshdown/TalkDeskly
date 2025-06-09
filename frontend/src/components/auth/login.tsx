import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { authService } from "@/lib/api/services/auth";
import { useAuthStore } from "@/stores/auth";
import { useTranslation } from "react-i18next";
import {
  createLoginFormSchema,
  type LoginFormData,
} from "@/lib/schemas/auth-schema";
import { InputField, CheckboxField } from "@/components/ui/form-field";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { toast } from "@/lib/hooks/use-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(createLoginFormSchema(t)),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
    mode: "onSubmit",
  });

  const { handleServerValidation } = useFormValidation(form);

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
        remember: data.remember,
      });

      console.log(response.data);

      setAuth(response.data);

      toast({
        title: t("auth.login.success"),
        description: t("auth.login.successDescription"),
      });

      navigate("/portal");
    } catch (error) {
      if (!handleServerValidation(error)) {
        // Handle other errors
        toast({
          title: t("auth.login.error"),
          description: t("auth.login.errorDescription"),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardHeader>
          <CardTitle>Login into your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            name="email"
            label={t("auth.login.email")}
            control={form.control}
            type="email"
            disabled={isLoading}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t("auth.login.password")}
              </span>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("auth.login.forgotPassword")}
              </Link>
            </div>
            <InputField
              name="password"
              label=""
              control={form.control}
              type="password"
              disabled={isLoading}
            />
          </div>

          <CheckboxField
            name="remember"
            label={t("auth.login.rememberMe")}
            control={form.control}
            disabled={isLoading}
          />
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("auth.login.loading") : t("auth.login.submit")}
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("auth.login.noAccount")}{" "}
            <Link
              to="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("auth.login.signUp")}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Form>
  );
}

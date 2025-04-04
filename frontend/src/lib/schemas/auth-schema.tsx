import { z } from "zod";
import { createZodI18n } from "@/lib/zod-i18n";

export const createLoginFormSchema = (t: (key: string) => string) => {
  const zod = createZodI18n(t);

  return zod.object({
    email: zod
      .string()
      .min(1)
      .email()
      .transform((val) => val.toLowerCase()),
    password: zod.string().min(1).min(8),
    remember: zod.boolean().optional(),
  });
};

// User details validation schema
export const createOnboardingUserSchema = (t: (key: string) => string) => {
  const zod = createZodI18n(t);

  return zod
    .object({
      firstName: zod
        .string()
        .min(1)
        .min(3)
        .max(255)
        .transform((val) => val.trim()),
      lastName: zod
        .string()
        .min(1)
        .min(3)
        .max(255)
        .transform((val) => val.trim()),
      email: zod
        .string()
        .min(1)
        .email()
        .transform((val) => val.toLowerCase()),
      password: zod.string().min(1).min(8),
      confirmPassword: zod.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.confirmPassword.mismatch"),
      path: ["confirmPassword"],
    });
};

// Company details validation schema
export const createOnboardingCompanySchema = (t: (key: string) => string) => {
  const zod = createZodI18n(t);

  return zod.object({
    name: zod
      .string()
      .min(1, { message: t("validation.required") })
      .min(2)
      .max(255)
      .transform((val) => val.trim()),
    email: zod
      .string()
      .min(1, { message: t("validation.required") })
      .email()
      .transform((val) => val.toLowerCase()),
    website: zod
      .string()
      .url()
      .or(zod.literal(""))
      .transform((val) => val || ""),
    phone: zod
      .string()
      .min(0)
      .max(50)
      .or(zod.literal(""))
      .transform((val) => val || ""),
    address: zod
      .string()
      .min(0)
      .max(255)
      .or(zod.literal(""))
      .transform((val) => val || ""),
  });
};

// Types derived from the schemas
export type OnboardingUser = z.infer<
  ReturnType<typeof createOnboardingUserSchema>
>;
export type OnboardingCompany = z.infer<
  ReturnType<typeof createOnboardingCompanySchema>
>;
export type LoginFormData = z.infer<ReturnType<typeof createLoginFormSchema>>;

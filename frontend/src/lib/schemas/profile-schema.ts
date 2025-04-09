import { z } from "zod";
import { createZodI18n } from "@/lib/zod-i18n";

export const createProfileUpdateSchema = (t: (key: string) => string) => {
  const zod = createZodI18n(t);

  return zod.object({
    firstName: zod
      .string()
      .min(1, { message: t("validation.required") })
      .min(3)
      .max(255)
      .transform((val) => val.trim()),
    lastName: zod
      .string()
      .min(1, { message: t("validation.required") })
      .min(3)
      .max(255)
      .transform((val) => val.trim()),
    email: zod
      .string()
      .min(1, { message: t("validation.required") })
      .email()
      .transform((val) => val.toLowerCase()),
  });
};

export type ProfileUpdateFormData = z.infer<
  ReturnType<typeof createProfileUpdateSchema>
>;

export const createProfilePasswordUpdateSchema = (
  t: (key: string) => string
) => {
  return z
    .object({
      oldPassword: z.string().min(1, { message: t("validation.required") }),
      newPassword: z.string().min(1, { message: t("validation.required") }),
      confirmPassword: z.string().min(1, { message: t("validation.required") }),
    })
    .superRefine(({ newPassword, confirmPassword }, ctx) => {
      if (confirmPassword !== newPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          code: z.ZodIssueCode.custom,
          message: t("validation.passwordMatch"),
        });
      }
    });
};

export type ProfilePasswordUpdateFormData = z.infer<
  ReturnType<typeof createProfilePasswordUpdateSchema>
>;

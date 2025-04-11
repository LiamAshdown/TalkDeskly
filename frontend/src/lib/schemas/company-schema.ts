import { z } from "zod";
import { createZodI18n } from "@/lib/zod-i18n";

export const createCompanyUpdateSchema = (t: (key: string) => string) => {
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

export type CompanyUpdateFormData = z.infer<
  ReturnType<typeof createCompanyUpdateSchema>
>;

import { z } from "zod";
import { createZodI18n } from "@/lib/zod-i18n";

export const createInboxSchema = (t: (key: string) => string) => {
  const zod = createZodI18n(t);

  return zod.object({
    name: zod
      .string()
      .min(1, { message: t("validation.required") })
      .min(3)
      .max(1000)
      .transform((val) => val.trim()),
    description: zod
      .string()
      .min(0)
      .max(1000)
      .optional()
      .transform((val) => val || ""),
    welcomeMessage: zod
      .string()
      .min(1, { message: t("validation.required") })
      .min(3)
      .max(255)
      .transform((val) => val.trim()),
  });
};

export const updateInboxSchema = (t: (key: string) => string) => {
  const zod = createZodI18n(t);

  return zod.object({
    name: zod
      .string()
      .min(1, { message: t("validation.required") })
      .min(3)
      .max(1000)
      .transform((val) => val.trim()),
    description: zod
      .string()
      .min(0)
      .max(1000)
      .optional()
      .transform((val) => val || ""),
    welcomeMessage: zod.string(),
  });
};

export type CreateInboxFormData = z.infer<ReturnType<typeof createInboxSchema>>;
export type UpdateInboxFormData = z.infer<ReturnType<typeof updateInboxSchema>>;

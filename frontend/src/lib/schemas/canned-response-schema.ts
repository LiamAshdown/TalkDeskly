import { z } from "zod";
import { createZodI18n } from "@/lib/zod-i18n";

export const createCannedResponseSchema = (t: (key: string) => string) => {
  const zod = createZodI18n(t);

  return zod.object({
    title: zod
      .string()
      .min(1, { message: t("validation.required") })
      .max(255)
      .transform((val) => val.trim()),
    tag: zod
      .string()
      .min(1, { message: t("validation.required") })
      .max(100)
      .transform((val) => val.trim().toLowerCase()),
    message: zod
      .string()
      .min(1, { message: t("validation.required") })
      .min(10)
      .max(500)
      .transform((val) => val.trim()),
  });
};

export type CannedResponseFormData = z.infer<
  ReturnType<typeof createCannedResponseSchema>
>;

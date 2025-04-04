import { z } from "zod";
import { createZodI18n } from "@/lib/zod-i18n";

const workingHoursSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  enabled: z.boolean(),
});

export const automationSchema = (t: (key: string) => string) => {
  const zod = createZodI18n(t);

  return zod.object({
    autoAssignmentEnabled: zod.boolean(),
    maxAutoAssignments: zod.number().min(1).max(100).optional(),
    autoResponderEnabled: zod.boolean(),
    autoResponderMessage: zod.string().min(1).max(1000).optional(),
    outsideHoursMessage: zod.string().min(1).max(1000).optional(),
    workingHours: zod.object({
      monday: workingHoursSchema,
      tuesday: workingHoursSchema,
      wednesday: workingHoursSchema,
      thursday: workingHoursSchema,
      friday: workingHoursSchema,
      saturday: workingHoursSchema,
      sunday: workingHoursSchema,
    }),
  });
};

export type AutomationFormData = z.infer<ReturnType<typeof automationSchema>>;

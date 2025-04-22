import { z } from "zod";
import { TeamMember } from "@/lib/interfaces";

export const createTeamMemberSchema = (t: any) => {
  return z.object({
    firstName: z
      .string()
      .min(1, t("validation.required", { field: t("team.member.firstName") })),
    lastName: z
      .string()
      .min(1, t("validation.required", { field: t("team.member.lastName") })),
    email: z
      .string()
      .email(t("validation.email"))
      .min(1, t("validation.required", { field: t("team.member.email") })),
    role: z.enum(["admin", "agent"]),
  });
};

export type CreateTeamMember = z.infer<
  ReturnType<typeof createTeamMemberSchema>
>;

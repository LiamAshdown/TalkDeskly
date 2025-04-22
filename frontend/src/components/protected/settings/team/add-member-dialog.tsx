import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamMember } from "@/lib/interfaces";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/form-field";
import { useTranslation } from "react-i18next";
import {
  createTeamMemberSchema,
  CreateTeamMember,
} from "@/lib/schemas/team-schema";
import { handleServerValidation } from "@/lib/utils/form-validation";
import { companyService } from "@/lib/api/services/company";
import { useToast } from "@/lib/hooks/use-toast";

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (member: TeamMember) => Promise<void>;
}

export function AddMemberDialog({
  isOpen,
  onClose,
  onAdd,
}: AddMemberDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateTeamMember>({
    resolver: zodResolver(createTeamMemberSchema(t)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "agent",
    },
    mode: "onBlur",
  });

  const handleAdd = async (data: CreateTeamMember) => {
    try {
      setLoading(true);

      const response = await companyService.createTeamMember(data);
      await onAdd(response.data);

      toast({
        title: t("team.member.added"),
        description: t("team.member.added.description"),
      });

      form.reset({ firstName: "", lastName: "", email: "", role: "agent" });
      onClose();
    } catch (error) {
      handleServerValidation(form, error, t);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("team.addMember.title")}</DialogTitle>
          <DialogDescription>
            {t("team.addMember.description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                name="firstName"
                label={t("team.member.firstName")}
                control={form.control}
                placeholder={t("team.member.firstNamePlaceholder")}
                disabled={loading}
              />
              <InputField
                name="lastName"
                label={t("team.member.lastName")}
                control={form.control}
                placeholder={t("team.member.lastNamePlaceholder")}
                disabled={loading}
              />
            </div>

            <InputField
              name="email"
              label={t("team.member.email")}
              control={form.control}
              type="email"
              placeholder={t("team.member.emailPlaceholder")}
              disabled={loading}
            />

            <div className="space-y-2">
              <Label htmlFor="role">{t("team.member.role")}</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value) =>
                  form.setValue("role", value as "admin" | "agent")
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder={t("team.member.selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t("team.roles.admin")}</SelectItem>
                  <SelectItem value="agent">{t("team.roles.agent")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("team.member.roleDescription")}
              </p>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={onClose}
                type="button"
                disabled={loading}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t("team.member.adding") : t("team.member.add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

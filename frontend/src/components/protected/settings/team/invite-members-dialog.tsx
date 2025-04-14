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
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

interface InviteMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (emails: string[]) => void;
}

export function InviteMembersDialog({
  isOpen,
  onClose,
  onInvite,
}: InviteMembersDialogProps) {
  const [emails, setEmails] = useState("");
  const { t } = useTranslation();

  const handleInvite = () => {
    const emailList = emails
      .split(/[\s,]+/)
      .filter((email) => email.trim() !== "");
    onInvite(emailList);
    setEmails("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("invite.title")}</DialogTitle>
          <DialogDescription>{t("invite.description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="emails">{t("invite.emails")}</Label>
            <Textarea
              id="emails"
              placeholder={t("invite.placeholder")}
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("invite.inviteHelperText")}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("invite.cancel")}
          </Button>
          <Button onClick={handleInvite}>{t("invite.send")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

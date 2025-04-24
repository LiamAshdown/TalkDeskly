"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

interface CannedResponse {
  id: string;
  title: string;
  message: string;
  tag: string;
  createdAt: string;
  updatedAt: string;
}

interface CannedResponseModalProps {
  type: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    response: Omit<CannedResponse, "id" | "createdAt" | "updatedAt">
  ) => void;
  response?: CannedResponse;
}

export function CannedResponseModal({
  type,
  open,
  onOpenChange,
  onSave,
  response,
}: CannedResponseModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    tag: "",
  });

  // Reset form when modal opens or response changes
  useEffect(() => {
    if (type === "edit" && response) {
      setFormData({
        title: response.title,
        message: response.message,
        tag: response.tag,
      });
    } else if (type === "create") {
      setFormData({
        title: "",
        message: "",
        tag: "",
      });
    }
  }, [type, response, open]);

  const handleSave = () => {
    onSave(formData);
  };

  const isCreateMode = type === "create";
  const title = isCreateMode
    ? t("cannedResponses.modal.createTitle")
    : t("cannedResponses.modal.editTitle");
  const description = isCreateMode
    ? t("cannedResponses.modal.createDescription")
    : t("cannedResponses.modal.editDescription");
  const buttonText = isCreateMode
    ? t("cannedResponses.modal.createButton")
    : t("cannedResponses.modal.saveButton");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="response-title">
              {t("cannedResponses.form.title")}
            </Label>
            <Input
              id="response-title"
              placeholder={t("cannedResponses.form.titlePlaceholder")}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="response-message">
              {t("cannedResponses.form.message")}
            </Label>
            <Textarea
              id="response-message"
              placeholder={t("cannedResponses.form.messagePlaceholder")}
              className="min-h-[120px]"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="response-tag">
              {t("cannedResponses.form.tag")}
            </Label>
            <Input
              id="response-tag"
              placeholder={t("cannedResponses.form.tagPlaceholder")}
              value={formData.tag}
              onChange={(e) =>
                setFormData({ ...formData, tag: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave}>{buttonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputField, TextareaField } from "@/components/ui/form-field";
import {
  createCannedResponseSchema,
  type CannedResponseFormData,
} from "@/lib/schemas/canned-response-schema";

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
    response: Omit<
      CannedResponse,
      "id" | "createdAt" | "updatedAt" | "companyId"
    >,
    form: UseFormReturn<CannedResponseFormData>
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

  const form = useForm<CannedResponseFormData>({
    resolver: zodResolver(createCannedResponseSchema(t)),
    defaultValues: {
      title: "",
      message: "",
      tag: "",
    },
    mode: "onBlur",
  });

  // Reset form when modal opens or response changes
  useEffect(() => {
    if (type === "edit" && response) {
      form.reset({
        title: response.title,
        message: response.message,
        tag: response.tag,
      });
    } else if (type === "create") {
      form.reset({
        title: "",
        message: "",
        tag: "",
      });
    }
  }, [type, response, open, form]);

  const handleSave = (data: CannedResponseFormData) => {
    onSave(data, form);
    if (type === "create") {
      form.reset();
    }
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)}>
            <div className="grid gap-4 py-4">
              <InputField
                name="title"
                label={t("cannedResponses.form.title")}
                control={form.control}
                placeholder={t("cannedResponses.form.titlePlaceholder")}
              />

              <TextareaField
                name="message"
                label={t("cannedResponses.form.message")}
                control={form.control}
                placeholder={t("cannedResponses.form.messagePlaceholder")}
                className="min-h-[120px]"
              />

              <InputField
                name="tag"
                label={t("cannedResponses.form.tag")}
                control={form.control}
                placeholder={t("cannedResponses.form.tagPlaceholder")}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit">{buttonText}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

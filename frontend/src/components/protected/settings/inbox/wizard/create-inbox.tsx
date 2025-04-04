import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/form-field";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { inboxService } from "@/lib/api/services/inbox";
import { handleServerValidation } from "@/lib/utils/form-validation";
import { Inbox } from "@/lib/interfaces";
import { createInboxSchema } from "@/lib/schemas/inbox-schema";
import { CreateInboxFormData } from "@/lib/schemas/inbox-schema";

interface CreateInboxProps {
  title: string;
  description: string;
  onCreated: (inbox: Inbox) => void;
}

export function CreateInbox({
  title,
  description,
  onCreated,
}: CreateInboxProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<CreateInboxFormData>({
    resolver: zodResolver(createInboxSchema(t)),
    defaultValues: {
      name: "",
      welcomeMessage: t("inbox.wizard.createInbox.form.welcomeMessageDefault"),
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: CreateInboxFormData) => {
    try {
      setIsLoading(true);
      const response = await inboxService.createInbox(data);
      onCreated(response.data);
    } catch (error) {
      handleServerValidation(form, error, t);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 w-full max-w-md"
        >
          <InputField
            name="name"
            label={t("inbox.wizard.createInbox.form.inboxName")}
            control={form.control}
            placeholder={t(
              "inbox.wizard.createInbox.form.inboxNamePlaceholder"
            )}
          />

          <InputField
            name="welcomeMessage"
            label={t("inbox.wizard.createInbox.form.welcomeMessage")}
            control={form.control}
            placeholder={t(
              "inbox.wizard.createInbox.form.welcomeMessagePlaceholder"
            )}
          />

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
}

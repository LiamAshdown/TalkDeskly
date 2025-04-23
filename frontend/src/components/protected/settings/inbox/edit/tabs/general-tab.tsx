import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEditInbox } from "@/context/edit-inbox-context";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputField, TextareaField } from "@/components/ui/form-field";
import {
  updateInboxSchema,
  type UpdateInboxFormData,
} from "@/lib/schemas/inbox-schema";
import { useEffect, useCallback } from "react";
import { debounce } from "@/lib/utils";

export function GeneralTab() {
  const { inbox, updateInbox, setTabValidation } = useEditInbox();
  const { t } = useTranslation();

  // Keep TS happy
  if (!inbox) return null;

  const form = useForm<UpdateInboxFormData>({
    resolver: zodResolver(updateInboxSchema(t)),
    defaultValues: {
      name: inbox.name,
      description: inbox.description || "",
      welcomeMessage: inbox.welcomeMessage,
    },
    mode: "onChange",
  });

  const debouncedValidateAndUpdate = useCallback(
    debounce((formValues: UpdateInboxFormData) => {
      form.trigger().then((isValid) => {
        setTabValidation("general", isValid);
        if (isValid) {
          updateInbox(formValues);
        }
      });
    }, 300),
    [form, setTabValidation, updateInbox]
  );

  useEffect(() => {
    const subscription = form.watch((value) => {
      // Only run debounced validation when the form has been interacted with
      if (form.formState.isDirty) {
        debouncedValidateAndUpdate(value as UpdateInboxFormData);
      }
    });

    return () => {
      subscription.unsubscribe();
      debouncedValidateAndUpdate.cancel();
    };
  }, [form, debouncedValidateAndUpdate]);

  const onSubmit = (data: UpdateInboxFormData) => {
    form.trigger().then((isValid) => {
      setTabValidation("general", isValid);
      if (isValid) {
        updateInbox(data);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("inbox.edit.tabs.general.title")}</CardTitle>
            <CardDescription>
              {t("inbox.edit.tabs.general.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputField
              control={form.control}
              name="name"
              label={t("inbox.edit.tabs.general.form.inboxName")}
              placeholder={t(
                "inbox.edit.tabs.general.form.inboxNamePlaceholder"
              )}
            />
            <TextareaField
              control={form.control}
              name="description"
              label={t("inbox.edit.tabs.general.form.description")}
              placeholder={t(
                "inbox.edit.tabs.general.form.descriptionPlaceholder"
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t("inbox.edit.tabs.general.form.welcomeMessage")}
            </CardTitle>
            <CardDescription>
              {t("inbox.edit.tabs.general.form.welcomeMessageDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextareaField
              control={form.control}
              name="welcomeMessage"
              label={t("inbox.edit.tabs.general.form.welcomeMessage")}
              placeholder={t(
                "inbox.edit.tabs.general.form.welcomeMessagePlaceholder"
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

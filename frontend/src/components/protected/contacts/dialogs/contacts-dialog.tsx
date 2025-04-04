import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/form-field";
import {
  createContactFormSchema,
  type ContactFormData,
} from "@/lib/schemas/contact-schema";
import { useState, useEffect } from "react";
import { handleServerValidation } from "@/lib/utils/form-validation";
import { contactsService } from "@/lib/api/services/contacts";

interface CreateContactDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onCreate: (data: ContactFormData) => void;
}

interface EditContactDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ContactFormData;
  onCancel: () => void;
  onUpdate: () => void;
  currentContactId?: string;
}

export function CreateContactDialog({
  isOpen,
  onOpenChange,
  onCancel,
  onCreate,
}: CreateContactDialogProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ContactFormData>({
    resolver: zodResolver(createContactFormSchema(t)),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: ContactFormData) => {
    try {
      setIsLoading(true);
      const response = await contactsService.createContact(data);
      onCreate(response.data);
      form.reset();
    } catch (error) {
      handleServerValidation(form, error, t);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>{t("contacts.create.title")}</DialogTitle>
              <DialogDescription>
                {t("contacts.create.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  name="name"
                  label={t("contacts.name")}
                  control={form.control}
                  placeholder="John Doe"
                />
                <InputField
                  name="email"
                  label={t("contacts.email")}
                  control={form.control}
                  type="email"
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  name="phone"
                  label={t("contacts.phone")}
                  control={form.control}
                  placeholder="+1 (555) 123-4567"
                />
                <InputField
                  name="company"
                  label={t("contacts.company")}
                  control={form.control}
                  placeholder="Acme Inc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {t("contacts.create.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function EditContactDialog({
  isOpen,
  onOpenChange,
  initialData,
  onCancel,
  onUpdate,
  currentContactId,
}: EditContactDialogProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ContactFormData>({
    resolver: zodResolver(createContactFormSchema(t)),
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
      company: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [form, initialData]);

  const handleSubmit = async (data: ContactFormData) => {
    if (!currentContactId) return;

    try {
      setIsLoading(true);
      await contactsService.updateContact(currentContactId, data);
      onUpdate();
    } catch (error) {
      handleServerValidation(form, error, t);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
              <DialogDescription>
                Update contact information. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField name="name" label="Name" control={form.control} />
                <InputField
                  name="email"
                  label="Email"
                  type="email"
                  control={form.control}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField name="phone" label="Phone" control={form.control} />
                <InputField
                  name="company"
                  label="Company"
                  control={form.control}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

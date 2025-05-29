import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ChevronLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useChatStateContext } from "~/contexts/chat-state-context";
import { useWebSocket } from "~/contexts/websocket-context";
import { useContactStore } from "~/stores/contact-store";
import type { PreChatForm, PreChatFormField } from "~/types/inbox";

interface PreChatFormProps {
  formData: PreChatForm;
  onBack?: () => void;
}

export function PreChatForm({ formData, onBack }: PreChatFormProps) {
  const { dispatch } = useChatStateContext();
  const { wsService } = useWebSocket();
  const { contactId } = useContactStore();

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error when user types
    if (formErrors[fieldId]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    formData.fields.forEach((field) => {
      if (
        field.required &&
        (!formValues[field.id] || formValues[field.id].trim() === "")
      ) {
        errors[field.id] = "This field is required";
      }

      if (field.type === "email" && formValues[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formValues[field.id])) {
          errors[field.id] = "Please enter a valid email";
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data to send to backend
      const formSubmission = {
        formData: formValues,
        contactId,
      };

      // Start conversation with form data
      await wsService.startConversation(formSubmission);

      // Update chat state
      dispatch({ type: "START_CONVERSATION" });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the appropriate input field based on type
  const renderField = (field: PreChatFormField) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            placeholder={field.placeholder}
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={formErrors[field.id] ? "border-red-500" : ""}
          />
        );

      case "email":
        return (
          <Input
            id={field.id}
            type="email"
            placeholder={field.placeholder}
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={formErrors[field.id] ? "border-red-500" : ""}
          />
        );

      case "phone":
        return (
          <Input
            id={field.id}
            type="tel"
            placeholder={field.placeholder}
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={formErrors[field.id] ? "border-red-500" : ""}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={formErrors[field.id] ? "border-red-500" : ""}
            rows={4}
          />
        );

      case "select":
        return (
          <Select
            value={formValues[field.id] || ""}
            onValueChange={(value) => handleInputChange(field.id, value)}
          >
            <SelectTrigger
              className={formErrors[field.id] ? "border-red-500" : ""}
            >
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            id={field.id}
            placeholder={field.placeholder}
            value={formValues[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={formErrors[field.id] ? "border-red-500" : ""}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Form header with title & description */}
      <div className="mb-6">
        <h3 className="text-xl font-medium mb-2">{formData.title}</h3>
        <p className="text-muted-foreground text-sm">{formData.description}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1"
        autoComplete="off"
      >
        <div className="space-y-5 overflow-y-auto">
          {formData.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="font-medium">
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <div className="mt-1">{renderField(field)}</div>
              {formErrors[field.id] && (
                <p className="text-destructive text-xs">
                  {formErrors[field.id]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground rounded-md font-medium"
          >
            {isSubmitting ? "Starting..." : "Start Chat"}
          </Button>
        </div>
      </form>
    </div>
  );
}

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
import type { PreChatForm, PreChatFormField } from "~/types/inbox";

interface PreChatFormProps {
  formData: PreChatForm;
  onBack?: () => void;
}

export function PreChatForm({ formData, onBack }: PreChatFormProps) {
  const chatState = useChatStateContext();
  const { wsService } = useWebSocket();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Start the conversation with form data
      chatState.startConversation();
      wsService.startConversation({ formData: formValues });
    } catch (error) {
      console.error("Failed to submit pre-chat form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field: PreChatFormField) => {
    const isRequired = field.required;
    const commonProps = {
      required: isRequired,
      value: formValues[field.id] || "",
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => handleInputChange(field.id, e.target.value),
    };

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            {...commonProps}
          />
        );

      case "textarea":
        return (
          <Textarea placeholder={field.placeholder} rows={3} {...commonProps} />
        );

      case "select":
        return (
          <Select
            required={isRequired}
            value={formValues[field.id] || ""}
            onValueChange={(value) => handleInputChange(field.id, value)}
          >
            <SelectTrigger>
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
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center mb-6">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mr-2"
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <h2 className="text-lg font-semibold">
          {formData.title || "Let's get started"}
        </h2>
      </div>

      {formData.description && (
        <p className="text-muted-foreground mb-6">{formData.description}</p>
      )}

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          {formData.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Starting conversation..." : "Start Conversation"}
          </Button>
        </div>
      </form>
    </div>
  );
}

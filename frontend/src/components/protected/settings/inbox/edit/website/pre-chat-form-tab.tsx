import { useState, useEffect } from "react";
import { useEditInbox } from "@/context/edit-inbox-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  GripVertical,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  PreChatFormField,
  PreChatFieldType,
  WebChatInbox,
} from "@/lib/interfaces";

// Define the form field types
type FieldType = "text" | "email" | "phone" | "select" | "textarea";

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[]; // For select fields
  contactField?: string; // Optional contact field mapping
}

export function PreChatFormTab() {
  const { inbox, updateInbox } = useEditInbox();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form fields from inbox or with defaults
  const [formEnabled, setFormEnabled] = useState(
    (inbox as WebChatInbox)?.preChatForm?.enabled || false
  );
  const [formTitle, setFormTitle] = useState(
    (inbox as WebChatInbox)?.preChatForm?.title || "Before we chat..."
  );
  const [formDescription, setFormDescription] = useState(
    (inbox as WebChatInbox)?.preChatForm?.description ||
      "Please fill out this short form to help us serve you better."
  );
  const [formFields, setFormFields] = useState<PreChatFormField[]>(
    (inbox as WebChatInbox)?.preChatForm?.fields || [
      {
        id: "field-" + Date.now(),
        type: "text",
        label: "Name",
        placeholder: "Enter your name",
        required: true,
      },
    ]
  );

  // Reset success indicator after a delay
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Handle form enabled toggle
  const handleFormEnabledChange = (checked: boolean) => {
    setFormEnabled(checked);
    updateInbox({
      ...(inbox as WebChatInbox),
      preChatForm: {
        ...((inbox as WebChatInbox)?.preChatForm || {}),
        enabled: checked,
        title: formTitle,
        description: formDescription,
        fields: formFields,
      },
    });
  };

  // Save form title and description
  const saveFormSettings = () => {
    updateInbox({
      ...(inbox as WebChatInbox),
      preChatForm: {
        ...((inbox as WebChatInbox)?.preChatForm || {}),
        enabled: formEnabled,
        title: formTitle,
        description: formDescription,
        fields: formFields,
      },
    });

    // Show success indicator
    setSaveSuccess(true);
  };

  // Add a new field
  const addField = () => {
    const newField: PreChatFormField = {
      id: "field-" + Date.now(),
      type: "text",
      label: "New Field",
      placeholder: "Enter value",
      required: false,
      contactField: "",
    };

    setFormFields([...formFields, newField]);
  };

  // Update a field
  const updateField = (id: string, updates: Partial<PreChatFormField>) => {
    setFormFields(
      formFields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  // Delete a field
  const deleteField = (id: string) => {
    setFormFields(formFields.filter((field) => field.id !== id));
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(formFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormFields(items);
  };

  // Add option to select field
  const addOption = (fieldId: string) => {
    const field = formFields.find((f) => f.id === fieldId);
    if (!field) return;

    const options = [...(field.options || []), "New Option"];
    updateField(fieldId, { options });
  };

  // Update option in select field
  const updateOption = (fieldId: string, index: number, value: string) => {
    const field = formFields.find((f) => f.id === fieldId);
    if (!field || !field.options) return;

    const options = [...field.options];
    options[index] = value;
    updateField(fieldId, { options });
  };

  // Delete option from select field
  const deleteOption = (fieldId: string, index: number) => {
    const field = formFields.find((f) => f.id === fieldId);
    if (!field || !field.options) return;

    const options = field.options.filter((_, i) => i !== index);
    updateField(fieldId, { options });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pre-Chat Form</CardTitle>
          <CardDescription>
            Configure a form for visitors to fill out before starting a chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Switch
              id="form-enabled"
              checked={formEnabled}
              onCheckedChange={handleFormEnabledChange}
            />
            <Label htmlFor="form-enabled">Enable pre-chat form</Label>
          </div>

          {formEnabled && (
            <>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="form-title">Form Title</Label>
                  <Input
                    id="form-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Enter form title"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="form-description">Form Description</Label>
                  <Textarea
                    id="form-description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Enter form description"
                    rows={2}
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Form Fields</h3>
                  <Button onClick={addField} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>

                {formFields.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No fields added</AlertTitle>
                    <AlertDescription>
                      Add at least one field to your pre-chat form.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="form-fields">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4"
                        >
                          {formFields.map((field, index) => (
                            <Draggable
                              key={field.id}
                              draggableId={field.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="border rounded-md p-4 bg-background"
                                >
                                  <div className="flex items-start mb-4">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mr-2 mt-2 cursor-grab"
                                    >
                                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 grid gap-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                          <Label
                                            htmlFor={`field-${field.id}-type`}
                                          >
                                            Field Type
                                          </Label>
                                          <Select
                                            value={field.type}
                                            onValueChange={(
                                              value: PreChatFieldType
                                            ) =>
                                              updateField(field.id, {
                                                type: value,
                                              })
                                            }
                                          >
                                            <SelectTrigger
                                              id={`field-${field.id}-type`}
                                            >
                                              <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="text">
                                                Text
                                              </SelectItem>
                                              <SelectItem value="email">
                                                Email
                                              </SelectItem>
                                              <SelectItem value="phone">
                                                Phone
                                              </SelectItem>
                                              <SelectItem value="select">
                                                Dropdown
                                              </SelectItem>
                                              <SelectItem value="textarea">
                                                Text Area
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="grid gap-2">
                                          <Label
                                            htmlFor={`field-${field.id}-label`}
                                          >
                                            Label
                                          </Label>
                                          <Input
                                            id={`field-${field.id}-label`}
                                            value={field.label}
                                            onChange={(e) =>
                                              updateField(field.id, {
                                                label: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div className="grid gap-2">
                                        <Label
                                          htmlFor={`field-${field.id}-placeholder`}
                                        >
                                          Placeholder
                                        </Label>
                                        <Input
                                          id={`field-${field.id}-placeholder`}
                                          value={field.placeholder}
                                          onChange={(e) =>
                                            updateField(field.id, {
                                              placeholder: e.target.value,
                                            })
                                          }
                                        />
                                      </div>

                                      <div className="grid gap-2">
                                        <Label
                                          htmlFor={`field-${field.id}-contact-field`}
                                        >
                                          Maps to Contact Property
                                        </Label>
                                        <Select
                                          value={field.contactField || "none"}
                                          onValueChange={(value) =>
                                            updateField(field.id, {
                                              contactField:
                                                value === "none"
                                                  ? undefined
                                                  : value,
                                            })
                                          }
                                        >
                                          <SelectTrigger
                                            id={`field-${field.id}-contact-field`}
                                          >
                                            <SelectValue placeholder="Select contact property" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="none">
                                              None
                                            </SelectItem>
                                            <SelectItem value="name">
                                              Name
                                            </SelectItem>
                                            <SelectItem value="email">
                                              Email
                                            </SelectItem>
                                            <SelectItem value="phone">
                                              Phone
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <p className="text-sm text-muted-foreground">
                                          This field will be used to populate
                                          the contact property when the form is
                                          submitted.
                                        </p>
                                      </div>

                                      {field.type === "select" && (
                                        <div className="mt-2 space-y-3">
                                          <Label>Options</Label>

                                          {(field.options || []).map(
                                            (option, i) => (
                                              <div
                                                key={i}
                                                className="flex items-center gap-2"
                                              >
                                                <Input
                                                  value={option}
                                                  onChange={(e) =>
                                                    updateOption(
                                                      field.id,
                                                      i,
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder={`Option ${
                                                    i + 1
                                                  }`}
                                                />
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() =>
                                                    deleteOption(field.id, i)
                                                  }
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            )
                                          )}

                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addOption(field.id)}
                                          >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Option
                                          </Button>
                                        </div>
                                      )}

                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id={`field-${field.id}-required`}
                                          checked={field.required}
                                          onCheckedChange={(checked) =>
                                            updateField(field.id, {
                                              required: checked,
                                            })
                                          }
                                        />
                                        <Label
                                          htmlFor={`field-${field.id}-required`}
                                        >
                                          Required field
                                        </Label>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteField(field.id)}
                                      className="ml-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>

              <div className="mt-6 flex items-center gap-2">
                <Button onClick={saveFormSettings}>Save Form Settings</Button>
                {saveSuccess && (
                  <div className="flex items-center text-green-600 gap-1 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Saved</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form Preview</CardTitle>
          <CardDescription>
            This is how your pre-chat form will appear to visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formEnabled ? (
            <div className="border rounded-lg p-4 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium">{formTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formDescription}
                  </p>
                </div>

                <div className="space-y-4 mt-4">
                  {formFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label>
                        {field.label}
                        {field.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>

                      {field.type === "text" && (
                        <Input placeholder={field.placeholder} />
                      )}

                      {field.type === "email" && (
                        <Input type="email" placeholder={field.placeholder} />
                      )}

                      {field.type === "phone" && (
                        <Input type="tel" placeholder={field.placeholder} />
                      )}

                      {field.type === "textarea" && (
                        <Textarea placeholder={field.placeholder} />
                      )}

                      {field.type === "select" && (
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {(field.options || []).map((option, i) => (
                              <SelectItem key={i} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>

                <Button className="w-full" disabled>
                  Start Chat
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Enable the pre-chat form to see a preview
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

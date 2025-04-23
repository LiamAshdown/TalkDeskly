import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditInbox } from "@/context/edit-inbox-context";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputField, TextareaField } from "@/components/ui/form-field";
import {
  automationSchema,
  type AutomationFormData,
} from "@/lib/schemas/automation-schema";
import { useEffect, useCallback } from "react";
import { debounce } from "@/lib/utils";

// Generate time options for the dropdown
const generateTimeOptions = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      times.push(timeString);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

// Helper function to convert time string to minutes for comparison
const timeToMinutes = (time: string | undefined): number => {
  if (!time) return 0;
  if (time === "23:59") return 24 * 60; // Convert 23:59 to 1440 minutes
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Get time options for end time selection
const getEndTimeOptions = (startTime: string | undefined) => {
  if (!startTime) return timeOptions;
  const options = timeOptions.filter(
    (time) => timeToMinutes(time) > timeToMinutes(startTime)
  );
  // Add 23:59 as the last option for end time
  options.push("23:59");
  return options;
};

export function AutomationTab() {
  const { inbox, updateInbox, setTabValidation } = useEditInbox();
  const { t } = useTranslation();

  // Keep TS happy
  if (!inbox) return null;

  const form = useForm<AutomationFormData>({
    resolver: zodResolver(automationSchema(t)),
    defaultValues: {
      autoAssignmentEnabled: inbox.autoAssignmentEnabled,
      maxAutoAssignments: inbox.maxAutoAssignments,
      autoResponderEnabled: inbox.autoResponderEnabled,
      autoResponderMessage: inbox.autoResponderMessage,
      outsideHoursMessage: inbox.outsideHoursMessage,
      workingHours: inbox.workingHours,
    },
    mode: "onChange",
  });

  const debouncedValidateAndUpdate = useCallback(
    debounce((formValues: AutomationFormData) => {
      form.trigger().then((isValid) => {
        setTabValidation("automation", isValid);
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
        debouncedValidateAndUpdate(value as AutomationFormData);
      }
    });

    return () => {
      subscription.unsubscribe();
      debouncedValidateAndUpdate.cancel();
    };
  }, [form, debouncedValidateAndUpdate]);

  const onSubmit = (data: AutomationFormData) => {
    form.trigger().then((isValid) => {
      setTabValidation("automation", isValid);
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
            <CardTitle>{t("inbox.edit.tabs.automation.title")}</CardTitle>
            <CardDescription>
              {t("inbox.edit.tabs.automation.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>
                  {t(
                    "inbox.edit.tabs.automation.form.autoAssignmentEnabled.label"
                  )}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "inbox.edit.tabs.automation.form.autoAssignmentEnabled.description"
                  )}
                </p>
              </div>
              <Switch
                checked={form.watch("autoAssignmentEnabled")}
                onCheckedChange={(checked) =>
                  form.setValue("autoAssignmentEnabled", checked)
                }
              />
            </div>

            {form.watch("autoAssignmentEnabled") && (
              <div className="space-y-2">
                <InputField
                  control={form.control}
                  name="maxAutoAssignments"
                  label={t(
                    "inbox.edit.tabs.automation.form.maxAutoAssignments.label"
                  )}
                  placeholder={t(
                    "inbox.edit.tabs.automation.form.maxAutoAssignments.placeholder"
                  )}
                  type="number"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>
                  {t(
                    "inbox.edit.tabs.automation.form.autoResponderEnabled.label"
                  )}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "inbox.edit.tabs.automation.form.autoResponderEnabled.description"
                  )}
                </p>
              </div>
              <Switch
                checked={form.watch("autoResponderEnabled")}
                onCheckedChange={(checked) =>
                  form.setValue("autoResponderEnabled", checked)
                }
              />
            </div>

            {form.watch("autoResponderEnabled") && (
              <div className="space-y-2">
                <TextareaField
                  control={form.control}
                  name="autoResponderMessage"
                  label={t(
                    "inbox.edit.tabs.automation.form.autoResponderMessage.label"
                  )}
                  placeholder={t(
                    "inbox.edit.tabs.automation.form.autoResponderMessage.placeholder"
                  )}
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>
                    {t("inbox.edit.tabs.automation.form.workingHours.label")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "inbox.edit.tabs.automation.form.workingHours.description"
                    )}
                  </p>
                </div>
                <Switch
                  checked={Object.values(form.watch("workingHours")).some(
                    (day) => day.enabled
                  )}
                  onCheckedChange={(checked) => {
                    const newWorkingHours = {
                      ...form.getValues("workingHours"),
                    };
                    Object.keys(newWorkingHours).forEach((day) => {
                      newWorkingHours[day] = {
                        ...newWorkingHours[day],
                        enabled: checked,
                      };
                    });
                    form.setValue("workingHours", newWorkingHours);
                  }}
                />
              </div>

              <div className="space-y-2">
                <TextareaField
                  control={form.control}
                  name="outsideHoursMessage"
                  label={t(
                    "inbox.edit.tabs.automation.form.outsideHoursMessage.label"
                  )}
                  placeholder={t(
                    "inbox.edit.tabs.automation.form.outsideHoursMessage.placeholder"
                  )}
                />
              </div>

              <div className="space-y-3">
                {Object.entries(form.watch("workingHours")).map(
                  ([day, config]) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-28">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={config.enabled}
                            onCheckedChange={(checked) => {
                              const newWorkingHours = {
                                ...form.getValues("workingHours"),
                                [day]: {
                                  ...config,
                                  enabled: checked,
                                },
                              };
                              form.setValue("workingHours", newWorkingHours);
                            }}
                          />
                          <span className="capitalize">{day}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={config.startTime}
                          onValueChange={(value) => {
                            const newWorkingHours = {
                              ...form.getValues("workingHours"),
                              [day]: {
                                ...config,
                                startTime: value,
                                endTime:
                                  timeToMinutes(value) >=
                                  timeToMinutes(config.endTime)
                                    ? timeOptions[
                                        timeOptions.indexOf(value) + 1
                                      ] ?? timeOptions[0]
                                    : config.endTime,
                              },
                            };
                            form.setValue("workingHours", newWorkingHours);
                          }}
                          disabled={!config.enabled}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue
                              placeholder={t(
                                "inbox.edit.tabs.automation.form.workingHours.startTime"
                              )}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>to</span>
                        <Select
                          value={config.endTime}
                          onValueChange={(value) => {
                            const newWorkingHours = {
                              ...form.getValues("workingHours"),
                              [day]: {
                                ...config,
                                endTime:
                                  timeToMinutes(value) <=
                                  timeToMinutes(config.startTime)
                                    ? timeOptions[
                                        timeOptions.indexOf(config.startTime) +
                                          1
                                      ] ?? timeOptions[0]
                                    : value,
                              },
                            };
                            form.setValue("workingHours", newWorkingHours);
                          }}
                          disabled={!config.enabled}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue
                              placeholder={t(
                                "inbox.edit.tabs.automation.form.workingHours.endTime"
                              )}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {getEndTimeOptions(config.startTime).map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

import * as React from "react";
import {
  FormField as FormFieldBase,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control } from "react-hook-form";

type BaseFieldProps = {
  name: string;
  label: string;
  control: Control<any>;
  disabled?: boolean;
  placeholder?: string;
};

type InputFieldProps = BaseFieldProps & {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
};

type TextareaFieldProps = BaseFieldProps;

type CheckboxFieldProps = BaseFieldProps & {
  description?: string;
};

type SelectFieldProps = BaseFieldProps & {
  options: { value: string; label: string }[];
};

export function InputField({
  name,
  label,
  control,
  type = "text",
  disabled,
  placeholder,
}: InputFieldProps) {
  return (
    <FormFieldBase
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              onChange={(e) => {
                if (type === "number") {
                  const value = e.target.value;
                  field.onChange(value ? Number(value) : undefined);
                } else {
                  field.onChange(e);
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function TextareaField({
  name,
  label,
  control,
  disabled,
  placeholder,
}: TextareaFieldProps) {
  return (
    <FormFieldBase
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function CheckboxField({
  name,
  label,
  control,
  disabled,
  description,
}: CheckboxFieldProps) {
  return (
    <FormFieldBase
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </FormItem>
      )}
    />
  );
}

export function SelectField({
  name,
  label,
  control,
  disabled,
  options,
  placeholder,
}: SelectFieldProps) {
  return (
    <FormFieldBase
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            disabled={disabled}
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue
                  placeholder={placeholder || `Select ${label.toLowerCase()}`}
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

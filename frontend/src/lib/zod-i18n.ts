import { z } from "zod";

type TranslationFunction = (
  key: string,
  params?: Record<string, string>
) => string;

// Default password validation options
const DEFAULT_PASSWORD_OPTIONS = {
  minLength: 8,
  maxLength: 100,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
} as const;

interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  email?: boolean;
  url?: boolean;
  oneof?: string[];
}

// Parse Go validator tags into Zod schema
const parseValidatorTag = (tag: string): ValidationRules => {
  const rules: ValidationRules = {};
  const parts = tag.split(",");

  for (const part of parts) {
    const [key, value] = part.split("=");
    switch (key) {
      case "required":
        rules.required = true;
        break;
      case "min":
        rules.min = parseInt(value);
        break;
      case "max":
        rules.max = parseInt(value);
        break;
      case "email":
        rules.email = true;
        break;
      case "url":
        rules.url = true;
        break;
      case "oneof":
        rules.oneof = value.split(" ");
        break;
    }
  }

  return rules;
};

// Create a wrapper around Zod that automatically includes translations
export const createZodI18n = (t: TranslationFunction) => {
  // Override Zod's default error messages
  z.setErrorMap((issue, ctx) => {
    const { code, message, path } = issue;

    switch (code) {
      case z.ZodIssueCode.invalid_type:
        if (issue.received === "undefined" || issue.received === "null") {
          return { message: t("validation.required") };
        }
        return { message: t("validation.invalidType") };

      case z.ZodIssueCode.too_small:
        if (issue.type === "string") {
          if (issue.minimum === 1) {
            return { message: t("validation.required") };
          }
          return {
            message: t("validation.min", { param: issue.minimum.toString() }),
          };
        }
        return {
          message: t("validation.min", { param: issue.minimum.toString() }),
        };

      case z.ZodIssueCode.too_big:
        if (issue.type === "string") {
          return {
            message: t("validation.max", { param: issue.maximum.toString() }),
          };
        }
        return {
          message: t("validation.max", { param: issue.maximum.toString() }),
        };

      case z.ZodIssueCode.invalid_string:
        if (issue.validation === "email") {
          return { message: t("validation.email") };
        }
        if (issue.validation === "url") {
          return { message: t("validation.url") };
        }
        return { message: t("validation.invalidString") };

      case z.ZodIssueCode.custom:
        return { message: message || t("validation.invalid") };

      default:
        return { message: t("validation.invalid") };
    }
  });

  // Create a wrapper that extends Zod's functionality
  const zod = {
    ...z,
    string: () => z.string(),
    number: () => z.number(),
    boolean: () => z.boolean(),
    object: <T extends z.ZodRawShape>(shape: T) => z.object(shape),
    array: <T extends z.ZodTypeAny>(type: T) => z.array(type),
    union: <T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>(
      types: T
    ) => z.union(types),
    literal: <T extends z.Primitive>(value: T) => z.literal(value),
    email: () =>
      z
        .string()
        .email({ message: t("validation.email.invalid") })
        .transform((val) => val.toLowerCase()),
    password: (options?: Partial<typeof DEFAULT_PASSWORD_OPTIONS>) => {
      const finalOptions = { ...DEFAULT_PASSWORD_OPTIONS, ...options };
      let schema = z.string();

      if (finalOptions.minLength) {
        schema = schema.min(finalOptions.minLength, {
          message: t("validation.password.min"),
        });
      }

      if (finalOptions.maxLength) {
        schema = schema.max(finalOptions.maxLength, {
          message: t("validation.password.max"),
        });
      }

      if (finalOptions.requireUppercase) {
        schema = schema.regex(/[A-Z]/, {
          message: t("validation.password.uppercase"),
        });
      }

      if (finalOptions.requireLowercase) {
        schema = schema.regex(/[a-z]/, {
          message: t("validation.password.lowercase"),
        });
      }

      if (finalOptions.requireNumber) {
        schema = schema.regex(/[0-9]/, {
          message: t("validation.password.number"),
        });
      }

      return schema;
    },
    required: () => z.string().min(1, { message: t("validation.required") }),
    url: () => z.string().url({ message: t("validation.website.invalid") }),
    refine: (schema: any, predicate: any, message: string) =>
      schema.refine(predicate, { message: t(message) }),
    min: (schema: any, length: number, message: string) =>
      schema.min(length, { message: t(message) }),
    max: (schema: any, length: number, message: string) =>
      schema.max(length, { message: t(message) }),
    regex: (schema: any, pattern: RegExp, message: string) =>
      schema.regex(pattern, { message: t(message) }),
    // Add Go validator tag support
    fromGoTag: (tag: string) => parseValidatorTag(tag),
  };

  return zod;
};

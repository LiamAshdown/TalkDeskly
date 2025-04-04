import { UseFormReturn, Path } from "react-hook-form";
import {
  getValidationErrors,
  isValidationError,
} from "@/lib/api/error-handler";

export function handleServerValidation<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  error: any,
  t: (key: string, options?: any) => string
): boolean {
  if (isValidationError(error)) {
    const validationErrors = getValidationErrors(error, t);
    validationErrors.forEach((err) => {
      form.setError(err.field as Path<T>, {
        type: "server",
        message: err.message,
      });
    });
    return true;
  }
  return false;
}

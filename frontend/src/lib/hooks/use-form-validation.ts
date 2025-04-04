import { UseFormReturn, Path } from "react-hook-form";

interface ValidationError {
  field: string;
  message: string;
}

export const useFormValidation = <T extends Record<string, any>>(
  form: UseFormReturn<T>
) => {
  const handleServerValidation = (error: any) => {
    if (error?.validationErrors) {
      (error.validationErrors as ValidationError[]).forEach((err) => {
        form.setError(err.field as Path<T>, {
          type: "manual",
          message: err.message,
        });
      });
      return true;
    }
    return false;
  };

  return {
    handleServerValidation,
  };
};

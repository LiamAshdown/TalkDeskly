import { AxiosError } from "axios";

export interface ValidationError {
  field: string;
  tag: string;
  param?: string;
  message: string;
}

export interface ApiError {
  status_code: number;
  error: string;
  message: string;
  data?: ValidationError[];
}

const fieldNameMap: Record<string, string> = {
  first_name: "firstName",
  last_name: "lastName",
  // Add more field mappings as needed
};

export const mapFieldName = (field: string): string => {
  return fieldNameMap[field] || field;
};

export const isValidationError = (
  error: unknown
): error is AxiosError<ApiError> => {
  return (
    (error as AxiosError<ApiError>)?.response?.status === 422 &&
    (error as AxiosError<ApiError>)?.response?.data?.data !== undefined
  );
};

export const getValidationErrors = (
  error: AxiosError<ApiError>,
  t: (key: string, options?: any) => string
) => {
  const validationErrors = error.response?.data?.data || [];

  return validationErrors.map((err) => ({
    field: mapFieldName(err.field),
    message: t(err.message, { param: err.param }),
  }));
};

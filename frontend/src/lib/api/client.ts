import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { isValidationError } from "./error-handler";
import {
  convertKeysToSnakeCase,
  convertKeysToCamelCase,
  toCamelCase,
} from "@/lib/utils/string-transforms";
import { toast } from "@/lib/hooks/use-toast";
import i18n from "@/lib/i18n";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:6721/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token and converting data to snake_case
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Skip snake_case conversion for FormData objects
    if (config.data && !(config.data instanceof FormData)) {
      config.data = convertKeysToSnakeCase(config.data);
    }

    // Convert query params to snake_case if they exist
    if (config.params) {
      config.params = convertKeysToSnakeCase(config.params);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and converting snake_case to camelCase
apiClient.interceptors.response.use(
  (response) => {
    // Convert response data from snake_case to camelCase if it exists
    if (response.data) {
      response.data = convertKeysToCamelCase(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      useAuthStore.getState().logout();
      window.location.href = "/login";
    } else if (isValidationError(error)) {
      // Convert validation error data to camelCase before passing it through
      if (error.response?.data) {
        error.response.data = convertKeysToCamelCase(error.response.data);
      }
      return Promise.reject(error);
    } else {
      // Don't know what the error is. So just show the error message
      const errorMessage = error.response?.data?.message || "errors.unknown";
      toast({
        title: i18n.t("errors.toast.error.title"),
        description: i18n.t(toCamelCase(errorMessage)),
        variant: "destructive",
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;

import axios from "axios";
import {
  convertKeysToSnakeCase,
  convertKeysToCamelCase,
} from "~/lib/utils/string-transforms";

const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? "http://localhost:6721/api" : "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Skip snake_case conversion for FormData objects
    if (config.data && !(config.data instanceof FormData)) {
      config.data = convertKeysToSnakeCase(config.data);
    }

    if (config.params) {
      config.params = convertKeysToSnakeCase(config.params);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use((response) => {
  if (response.data) {
    response.data = convertKeysToCamelCase(response.data);
  }
  return response;
});

export default apiClient;

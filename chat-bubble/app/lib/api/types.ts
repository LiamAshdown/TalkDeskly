export interface APIResponse<T> {
  status_code: number;
  status: string;
  message: string;
  data: T;
}

export interface APIError {
  status_code: number;
  error: string;
  message: string;
  data: any;
}

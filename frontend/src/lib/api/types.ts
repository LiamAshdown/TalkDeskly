export interface APIResponse<T> {
  status_code: number;
  status: string;
  message: string;
  data: T;
}

export type Money = string;
export type IsoDate = string;

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiFieldError {
  path: string;
  message?: string;
}

export interface ApiFailureBody {
  success: false;
  message: string;
  code?: string;
  errors?: ApiFieldError[];
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
  meta?: Partial<PageMeta> & Record<string, unknown>;
}
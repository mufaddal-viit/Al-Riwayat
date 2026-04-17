import type { AxiosError } from "axios";
import type { ApiError } from "@/types/api";

export class AppError extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string[]>;

  constructor({ message, status, code, errors }: ApiError) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export function normalizeError(error: AxiosError<ApiError>): AppError {
  if (error.response) {
    // Server responded with error status
    return new AppError({
      message: error.response.data?.message ?? "An unexpected error occurred",
      status: error.response.status,
      code: error.response.data?.code,
      errors: error.response.data?.errors,
    });
  }

  if (error.request) {
    // Request was made but no response received
    return new AppError({
      message: "Network error — please check your connection",
      status: 0,
    });
  }

  return new AppError({ message: error.message, status: 0 });
}

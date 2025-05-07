import type { AxiosError } from "axios"
import type { ApiResponse } from "@/lib/api/client"

// Error handling utilities
type ErrorWithMessage = {
  message: string
}

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  )
}

export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}

export function getErrorMessage(error: unknown): string {
  // Check if it's an Axios error with our API response format
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<ApiResponse>
    if (axiosError.response?.data) {
      // If it has our API response format
      if ("message" in axiosError.response.data) {
        return axiosError.response.data.message
      }
    }
  }

  return toErrorWithMessage(error).message
}

// Log errors to monitoring service in production
export function logError(error: unknown, context?: string): void {
  const errorMessage = getErrorMessage(error)

  if (process.env.NODE_ENV === "production") {
    // Here you would integrate with error monitoring services like Sentry
    console.error(`[${context || "ERROR"}]`, errorMessage)

    // Example Sentry integration:
    // Sentry.captureException(error, { extra: { context } });
  } else {
    console.error(`[${context || "ERROR"}]`, error)
  }
}

// Helper to handle API errors in components
export function handleApiError(error: unknown): { message: string; status?: number } {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<ApiResponse>
    if (axiosError.response?.data) {
      // If it has our API response format
      if ("message" in axiosError.response.data) {
        return {
          message: axiosError.response.data.message,
          status: axiosError.response.status,
        }
      }
    }

    // Handle standard Axios errors
    if (axiosError.response) {
      return {
        message: axiosError.message,
        status: axiosError.response.status,
      }
    }
  }

  // Fallback for unknown errors
  return { message: getErrorMessage(error) }
}

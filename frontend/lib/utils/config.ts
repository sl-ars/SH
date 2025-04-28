// Configuration utility functions

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  // Use NEXT_PUBLIC_API_URL for consistency with .env.example
  return process.env.NEXT_PUBLIC_API_URL || "https://api.studenthunter.example.com"
}

// Export API URL as a constant for easier usage in services
export const API_URL = getApiBaseUrl();

/**
 * Get application environment
 */
export function getEnvironment(): "development" | "production" | "test" {
  return (process.env.NODE_ENV as "development" | "production" | "test") || "development"
}

/**
 * Check if mock data should be enabled
 * We now always return false since we're using real API data
 */
export function isMockEnabled(): boolean {
  return false;
}

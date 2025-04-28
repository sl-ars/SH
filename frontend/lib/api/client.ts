import axios, { InternalAxiosRequestConfig } from "axios"
import Cookies from "js-cookie"

// Define the standard API response format
export interface ApiResponse<T = any> {
  data: T
  status: string
  message: string
  errors?: Record<string, string[]>
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
})

// Add a request interceptor to include the JWT token in requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Get token from localStorage or cookie
      const token = localStorage.getItem("access_token") || Cookies.get("access_token")

      // If token exists, add it to the headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Flag to prevent multiple token refresh attempts at once
let isRefreshing = false
// Store pending requests that should be retried after token refresh
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: any) => void
  config: any
}> = []

// Process the queue of failed requests
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.config.headers.Authorization = `Bearer ${token}`
      prom.resolve(axios(prom.config))
    }
  })
  
  failedQueue = []
}

// Add a response interceptor to handle common errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If we're not in a browser environment, just reject
    if (typeof window === "undefined") {
      return Promise.reject(error)
    }

    // Handle token expiration (401 Unauthorized)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // If we're already refreshing a token, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Get the refresh token
        const refreshToken = localStorage.getItem("refresh_token")
        
        if (!refreshToken) {
          // No refresh token available, redirect to login
          localStorage.removeItem("access_token")
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login"
          }
          return Promise.reject(error)
        }

        // Try to refresh the token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/token/refresh/`,
          { refresh: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        )

        // Check if the response is successful and contains new access token
        if (response.data && response.data.data && response.data.data.access) {
          const newAccessToken = response.data.data.access
          
          // Store the new access token
          localStorage.setItem("access_token", newAccessToken)
          
          // Update the current request's authorization header
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          
          // Process any queued requests with the new token
          processQueue(null, newAccessToken)
          
          // Retry the original request
          return axios(originalRequest)
        } else {
          // Token refresh failed, redirect to login
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login"
          }
        }
      } catch (refreshError) {
        // Process queued requests with the error
        processQueue(refreshError, null)
        
        // Token refresh failed, redirect to login
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login"
        }
      } finally {
        isRefreshing = false
      }
      
      return Promise.reject(error)
    }

    // For other errors, just reject
    return Promise.reject(error)
  }
)

export default apiClient

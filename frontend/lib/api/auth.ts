import type { AxiosResponse } from "axios"
import apiClient from "./client"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  password2: string
  name: string
  role: string
}

export interface ApiResponse<T = any> {
  data: T
  status: string
  message: string
  errors?: Record<string, string[]>
}

export interface AuthResponse {
  access: string
  refresh: string
  user: {
    id: string
    email: string
    name?: string
    first_name?: string
    last_name?: string
    role: string
    avatar?: string
    company?: string
    company_id?: string
    is_active?: boolean
    created_at?: string
    date_joined?: string
  }
}

export interface CsrfResponse {
  csrf_token: string
}

export interface VerifyResponse {
  is_valid: boolean
  user: {
    id: string
    email: string
    name?: string
    first_name?: string
    last_name?: string
    role: string
    avatar?: string
    company?: string
    company_id?: string
    is_active?: boolean
    created_at?: string
    date_joined?: string
  }
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login/", credentials)

    const { access, refresh, user } = response.data.data

    localStorage.setItem("access_token", access)
    localStorage.setItem("refresh_token", refresh)

    return { access, refresh, user }
  },

  register: async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>("/auth/register/", data)
    return response.data.data
  },

  logout: async (): Promise<{ success: boolean }> => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    return { success: true }
  },

  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await apiClient.post<ApiResponse<{ access: string }>>("/auth/token/refresh/", {
      refresh: refreshToken,
    })

    const { access } = response.data.data
    localStorage.setItem("access_token", access)

    return { access }
  },

  verifyToken: async (token: string): Promise<ApiResponse<VerifyResponse>> => {
    const response = await apiClient.post<ApiResponse<VerifyResponse>>("/auth/token/verify/", {
      token,
    })

    return response.data
  },

  getCsrfToken: async (): Promise<CsrfResponse> => {
    const response = await apiClient.get<ApiResponse<CsrfResponse>>("/auth/csrf/")
    return response.data.data
  },

  requestPasswordReset: async (
    email: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      "/auth/password-reset/",
      { email },
    )
    return response.data.data
  },

  resetPassword: async (
    token: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      "/auth/password-reset/confirm/",
      {
        token,
        password,
      },
    )
    return response.data.data
  },
}

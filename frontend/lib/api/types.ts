// Add this new file for API-specific types
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface LoginResponse {
  access: string
  refresh: string
  user: {
    id: string
    email: string
    name: string
    role: string
    avatar?: string
  }
}

export interface TokenRefreshResponse {
  access: string
}

export interface ApiError {
  detail: string
  code?: string
  errors?: Record<string, string[]>
}

export interface JobApplicationRequest {
  resume?: File
  resume_id?: string
  answers?: Record<string, string | string[]>
}

export interface JobApplicationResponse {
  id: string
  job: string
  status: string
  applied_at: string
  updated_at: string
}

export interface ProfileUpdateRequest {
  name?: string
  email?: string
  bio?: string
  location?: string
  skills?: string[]
  education?: {
    university: string
    degree: string
    field: string
    start_date: string
    end_date?: string
  }[]
  experience?: {
    company: string
    position: string
    description: string
    start_date: string
    end_date?: string
  }[]
}


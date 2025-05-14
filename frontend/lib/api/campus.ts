import apiClient from "./client"
import type { ApiResponse } from "./client"

export interface Student {
  id: string
  name: string
  email: string
  major: string
  graduationYear: string
  status: string
}

export interface CampusEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  attendees: number
  companies: string[]
  type: string
}

export interface CampusReport {
  id: string
  name: string
  description: string
  lastUpdated: string
  url: string
}

export interface StudentListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Student[]
}

export interface EventListResponse {
  count: number
  next: string | null
  previous: string | null
  results: CampusEvent[]
}

export interface ReportListResponse {
  count: number
  next: string | null
  previous: string | null
  results: CampusReport[]
}

export interface CompanyListResponse {
  count: number
  next: string | null
  previous: string | null
  results: any[] // Replace 'any' with a more specific type if available
}

export const campusApi = {
  // Student management
  getStudents: async (params: any = {}) => {
    const response = await apiClient.get<ApiResponse<StudentListResponse>>("/campus/students/", { params })
    return response.data
  },

  getStudent: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Student>>(`/campus/students/${id}/`)
    return response.data
  },

  createStudent: async (data: {
    email: string
    name: string
    password: string
    major?: string
    graduationYear?: string
  }) => {
    const response = await apiClient.post<ApiResponse<Student>>("/campus/students/", data)
    return response.data
  },

  updateStudent: async (id: string, data: Partial<Student>) => {
    const response = await apiClient.patch<ApiResponse<Student>>(`/campus/students/${id}/`, data)
    return response.data
  },

  // Event management
  getEvents: async (params: any = {}) => {
    const response = await apiClient.get<ApiResponse<EventListResponse>>("/campus/events/", { params })
    return response.data
  },

  getEvent: async (id: string) => {
    const response = await apiClient.get<ApiResponse<CampusEvent>>(`/campus/events/${id}/`)
    return response.data
  },

  createEvent: async (data: Partial<CampusEvent>) => {
    const response = await apiClient.post<ApiResponse<CampusEvent>>("/campus/events/", data)
    return response.data
  },

  updateEvent: async (id: string, data: Partial<CampusEvent>) => {
    const response = await apiClient.patch<ApiResponse<CampusEvent>>(`/campus/events/${id}/`, data)
    return response.data
  },

  deleteEvent: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/campus/events/${id}/`)
    return response.data
  },

  // Reports
  getReports: async () => {
    const response = await apiClient.get<ApiResponse<ReportListResponse>>("/campus/reports/")
    return response.data
  },

  getReport: async (id: string) => {
    const response = await apiClient.get<ApiResponse<CampusReport>>(`/campus/reports/${id}/`)
    return response.data
  },

  generateReport: async (type: string, params: any = {}) => {
    const response = await apiClient.post<ApiResponse<{ report_id: string; url: string }>>(
      "/campus/reports/generate/",
      {
        type,
        ...params,
      },
    )
    return response.data
  },

  // Company relationships
  getCompanies: async (params: any = {}) => {
    const response = await apiClient.get<ApiResponse<CompanyListResponse>>("/campus/companies/", { params })
    return response.data
  },

  addCompany: async (data: { name: string; email: string; website?: string; notes?: string }) => {
    const response = await apiClient.post<ApiResponse<{ success: boolean; company_id: string }>>(
      "/campus/companies/",
      data,
    )
    return response.data
  },

  // Analytics
  getAnalytics: async (year?: number) => {
    const response = await apiClient.get<ApiResponse<any>>("/campus/analytics/", { params: { year } })
    return response.data
  },

  getPlacementStats: async (year?: number) => {
    const response = await apiClient.get<ApiResponse<any>>("/campus/analytics/placement/", { params: { year } })
    return response.data
  },

  getIndustryDistribution: async (year?: number) => {
    const response = await apiClient.get<ApiResponse<any>>("/campus/analytics/industry/", { params: { year } })
    return response.data
  },

  getSalaryDistribution: async (year?: number) => {
    const response = await apiClient.get<ApiResponse<any>>("/campus/analytics/salary/", { params: { year } })
    return response.data
  },
}

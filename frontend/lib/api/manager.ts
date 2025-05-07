import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { Job, JobApplication } from "@/lib/types"

export interface ApplicationFilters {
  status?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}

export interface ApplicationListResponse {
  count: number
  next: string | null
  previous: string | null
  results: JobApplication[]
}

export const managerApi = {
  // Job management
  getJobs: async () => {
    const response = await apiClient.get<ApiResponse<Job[]>>("/manager/jobs/")
    return response.data
  },

  getJob: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Job>>(`/manager/jobs/${id}/`)
    return response.data
  },

  createJob: async (jobData: Partial<Job>) => {
    const response = await apiClient.post<ApiResponse<Job>>("/manager/jobs/", jobData)
    return response.data
  },

  updateJob: async (id: string, jobData: Partial<Job>) => {
    const response = await apiClient.put<ApiResponse<Job>>(`/manager/jobs/${id}/`, jobData)
    return response.data
  },

  deleteJob: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/manager/jobs/${id}/`)
    return response.data
  },

  // Application management
  getApplications: async (filters: ApplicationFilters = {}) => {
    const response = await apiClient.get<ApiResponse<ApplicationListResponse>>("/manager/applications/", {
      params: filters,
    })
    return response.data
  },

  getApplication: async (id: string) => {
    const response = await apiClient.get<ApiResponse<JobApplication>>(`/manager/applications/${id}/`)
    return response.data
  },

  updateApplicationStatus: async (id: string, status: string, comments?: string) => {
    const response = await apiClient.patch<ApiResponse<{ success: boolean }>>(`/manager/applications/${id}/`, {
      status,
      comments,
    })
    return response.data
  },

  // Student management (for company-specific students)
  createStudent: async (data: {
    email: string
    name: string
    password: string
    companyId?: string
  }) => {
    const response = await apiClient.post<ApiResponse<{ success: boolean; student_id: string }>>(
      "/manager/students/",
      data,
    )
    return response.data
  },

  // Company profile management
  getCompanyProfile: async () => {
    const response = await apiClient.get<ApiResponse<any>>("/manager/company/")
    return response.data
  },

  updateCompanyProfile: async (data: any) => {
    const response = await apiClient.put<ApiResponse<any>>("/manager/company/", data)
    return response.data
  },

  // Analytics
  getAnalytics: async (period = "month") => {
    const response = await apiClient.get<ApiResponse<any>>("/analytics/manager/", { params: { period } })
    return response.data
  },

  // Interview management
  getInterviews: async (filters: any = {}) => {
    const response = await apiClient.get<ApiResponse<any>>("/manager/interviews/", { params: filters })
    return response.data
  },

  scheduleInterview: async (applicationId: string, data: any) => {
    const response = await apiClient.post<ApiResponse<any>>(`/manager/applications/${applicationId}/interview/`, data)
    return response.data
  },

  // Settings management
  getSettings: async () => {
    const response = await apiClient.get<ApiResponse<any>>("/manager/settings/")
    return response.data
  },

  updateSettings: async (data: any) => {
    const response = await apiClient.put<ApiResponse<any>>("/manager/settings/", data)
    return response.data
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>("/manager/change-password/", data)
    return response.data
  },
}

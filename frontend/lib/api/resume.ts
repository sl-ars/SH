import apiClient from "./client"
import type { ApiResponse } from "./client"

export interface Resume {
  id: string
  userId: string
  name: string
  url: string
  createdAt: string
  updatedAt?: string
  isDefault?: boolean
  applicationCount?: number
}

export const resumeApi = {

 getUserResumes: async (): Promise<ApiResponse<{ id: string; name: string; url: string; created_at: string }[]>> => {
    try {
      console.log("Attempting to fetch resumes from /user/resumes/")
      const response = await apiClient.get<ApiResponse<{ id: string; name: string; url: string; created_at: string }[]>>("/user/resumes/")
      return response.data
    } catch (error: any) {
      console.error("Failed to get resumes:", error)
      return {
        status: "error",
        message: error.message || "Failed to get resumes",
        data: [],
      }
    }
  },

  // Add new function to get specific resume details
  getResumeDetails: async (resumeId: string): Promise<ApiResponse<{ id: string; name: string; url: string; created_at: string; file: string }>> => {
    try {
      const response = await apiClient.get<ApiResponse<{ id: string; name: string; url: string; created_at: string; file: string }>>(`/user/resumes/${resumeId}/`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to get resume details for ID ${resumeId}:`, error);
      return {
        status: "error",
        message: error.message || `Failed to get details for resume ${resumeId}`,
        data: null as any, // Or a more specific default error structure
      };
    }
  },


  // Upload a new resume
  uploadResume: async (file: File): Promise<ApiResponse<{ id: string; url: string }>> => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await apiClient.post<ApiResponse<{ id: string; url: string }>>("/user/resumes/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to upload resume",
        data: { id: "", url: "" },
      }
    }
  },


  // Delete a resume
  deleteResume: async (resumeId: string): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/user/resumes/${resumeId}/`)
    return response.data
  },

  // Set a resume as default
  setDefaultResume: async (resumeId: string): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.put<ApiResponse<{ success: boolean }>>(`/resumes/${resumeId}/default`)
    return response.data
  },

  // Rename a resume
  renameResume: async (resumeId: string, newName: string): Promise<ApiResponse<Resume>> => {
    const response = await apiClient.put<ApiResponse<Resume>>(`/resumes/${resumeId}/rename`, { name: newName })
    return response.data
  },


}

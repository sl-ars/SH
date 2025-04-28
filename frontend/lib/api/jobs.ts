import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { Job } from "@/lib/types"
import { isMockEnabled } from "@/lib/utils/config"
import { mockJobs } from "@/lib/mock-data/jobs"
import axios from 'axios'
import { toast } from "sonner";

// Combine all interfaces from both files
export interface JobFilters {
  keyword?: string
  location?: string
  type?: string
  industry?: string
  is_active?: boolean
  scope?: string
  page?: number
  page_size?: number
  sortBy?: string
  salary_min?: number
  salary_max?: number
}

export interface JobsResponse {
  jobs: Job[]
  totalCount: number
  currentPage: number
  totalPages: number
}

// Old JobApplicationData (to be replaced or commented out)
// export interface JobApplicationData {
//   resumeId?: string
//   newResume?: File
//   answers: Record<string, string | string[]>
// }

// New payload structure for client-side application data
export interface JobApplicationClientPayload {
  cover_letter: string;
  resume_id: string; // ID of an existing resume, will be sent as 'resume' to backend
  notes?: string;     // Optional notes from the student
}

// Define the structure of the data payload within the backend response for jobs
interface BackendJobsDataPayload {
  count: number;
  next: string | null;
  previous: string | null;
  results: Job[]; // Assuming Job type from @/lib/types is compatible
}

// Define the overall structure of the response from the backend API
interface FullBackendApiResponse {
  status: "success" | "error";
  message: string;
  data: BackendJobsDataPayload;
  error?: any;
}

// Get jobs with optional filters
export const getJobs = async (
  filters: JobFilters = {},
  isAuthenticated = false,
): Promise<ApiResponse<JobsResponse>> => {
  try {
    // Build query parameters
    const params = new URLSearchParams()
    if (filters.keyword) params.append("keyword", filters.keyword)
    if (filters.location) params.append("location", filters.location)
    if (filters.type) params.append("type", filters.type)
    if (filters.industry) params.append("industry", filters.industry)
    if (filters.is_active !== undefined) params.append("is_active", String(filters.is_active))
    if (filters.scope) params.append("scope", filters.scope)
    if (filters.page) params.append("page", filters.page.toString())
    if (filters.page_size) params.append("page_size", filters.page_size.toString())
    if (filters.sortBy) params.append("sort", filters.sortBy)
    if (filters.salary_min !== undefined) params.append("salary_min", filters.salary_min.toString())
    if (filters.salary_max !== undefined) params.append("salary_max", filters.salary_max.toString())

    // Add authentication status for API
    params.append("authenticated", isAuthenticated ? "true" : "false")

    // Assuming apiClient.get returns an Axios-like response where the actual data is in a 'data' property
    const axiosResponse = await apiClient.get<FullBackendApiResponse>(`/job/?${params.toString()}`)
    const backendResponse = axiosResponse.data; // This is our FullBackendApiResponse

    if (backendResponse.status === "success") {
      const backendData = backendResponse.data; // This is BackendJobsDataPayload
      const pageSize = filters.page_size || 10;

      const jobsResponseData: JobsResponse = {
        jobs: backendData.results,
        totalCount: backendData.count,
        currentPage: filters.page || 1,
        totalPages: Math.ceil(backendData.count / pageSize),
      };

      return {
        status: "success",
        message: backendResponse.message,
        data: jobsResponseData,
      };
    } else {
      return {
        status: "error",
        message: backendResponse.message || "Failed to retrieve jobs from backend",
        data: {
          jobs: [],
          totalCount: 0,
          currentPage: filters.page || 1,
          totalPages: 0,
        },
      };
    }
  } catch (error: any) {
    console.error("Error fetching jobs:", error)
    // Attempt to extract a message if it's an Axios error with a response
    const errorMessage = error.response?.data?.message || error.message || "Failed to retrieve jobs due to a client-side or network error";
    return {
      status: "error",
      message: errorMessage,
      data: {
        jobs: [],
        totalCount: 0,
        currentPage: filters.page || 1,
        totalPages: 0,
      },
    }
  }
}

// Get job by ID
export const getJobById = async (id: string): Promise<Job | null> => {
  try {
    console.log("getJobById called with ID:", id, "Type:", typeof id)
    const response = await apiClient.get(`/job/${id}/`)
    console.log("API response:", response)
    
    // Check if response has the expected structure
    if (response.data && response.data.data) {
      return response.data.data
    }
    
    return response.data
  } catch (error) {
    console.error("Error in getJobById:", error)
    return null
  }
}

// Get similar jobs
export const getSimilarJobs = async (jobId: string): Promise<Job[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Job[]>>(`/job/${jobId}/similar/`)
    return response.data.data
  } catch (error: any) {
    console.error(`Error fetching similar jobs for job ID ${jobId}:`, error)

    return []
  }
}



// Add this method if it doesn't exist or fix it if it does
export const getAll = async (filters: any) => {
  try {
    const response = await apiClient.get("/job/", { params: filters })
    return response
  } catch (error) {
    console.error("Error fetching jobs:", error)
    throw error
  }
}

// Unified jobApi object combining all methods from both files
export const jobApi = {
  getAll,
  getJobs,
  getJob: async (id: string): Promise<ApiResponse<Job>> => {
    try {
      const response = await apiClient.get<ApiResponse<Job>>(`/job/${id}/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve job",
        data: null as any,
      }
    }
  },

  checkApplicationStatus: async (jobId: string, userId: string): Promise<ApiResponse<{ hasApplied: boolean }>> => {
    try {
      const response = await apiClient.get<ApiResponse<{ hasApplied: boolean }>>(
        `/job/${jobId}/application-status/${userId}/`,
      )
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to check application status",
        data: { hasApplied: false },
      }
    }
  },

  applyToJob: async (
    jobId: string, 
    data: JobApplicationClientPayload, 
  ): Promise<ApiResponse<{ success: boolean; application_id: string }>> => {
    try {
      const payload: { job: string; cover_letter: string; resume: string; notes?: string } = {
        job: jobId, 
        cover_letter: data.cover_letter,
        resume: data.resume_id, 
      };
      if (data.notes && data.notes.trim() !== "") { 
        payload.notes = data.notes;
      }
      const response = await apiClient.post<ApiResponse<{ success: boolean; application_id: string }>>(
        `/application/`, 
        payload, 
      );
      if (response.data.status === "success") {
        toast.success(response.data.message || "Application submitted successfully!");
      } else {
        toast.error(response.data.message || "Application submission failed.");
      }
      return response.data;
    } catch (error: any) {
      let errorMessage = "Failed to apply to job. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        const responseData = error.response.data;
        const statusCode = error.response.status;
        if (statusCode === 403) {
          errorMessage = responseData?.message || responseData?.error?.details?.detail || "You do not have permission to perform this action.";
        } else if (statusCode === 400) {
          if (responseData?.error?.details) {
            const details = responseData.error.details;
            if (details.non_field_errors && details.non_field_errors.length > 0) {
              errorMessage = details.non_field_errors.join(" ");
            } else if (details.resume && details.resume.length > 0) {
              errorMessage = `Resume error: ${details.resume.join(" ")}`;
            } else { errorMessage = responseData.message || "Validation failed. Please check your input."; }
          } else { errorMessage = responseData.message || "Validation error."; }
        } else { errorMessage = responseData.message || "An API error occurred."; }
      } else { errorMessage = error.message || "A network error occurred."; }
      toast.error(errorMessage);
      return { status: "error", message: errorMessage, data: { success: false, application_id: "" } };
    }
  },

  createJob: async (data: Partial<Job>): Promise<ApiResponse<Job>> => {
    try {
      const response = await apiClient.post<ApiResponse<Job>>("/job/", data)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to create job",
        data: null as any,
      }
    }
  },

  updateJob: async (id: string, data: Partial<Job>): Promise<ApiResponse<Job>> => {
    try {
      const response = await apiClient.patch<ApiResponse<Job>>(`/job/${id}/`, data)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to update job",
        data: null as any,
      }
    }
  },

  deleteJob: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/job/${id}/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to delete job",
        data: { success: false },
      }
    }
  },

  // Application questions
  getApplicationQuestions: async (jobId: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`/job/${jobId}/questions/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve application questions",
        data: [],
      }
    }
  },

  updateApplicationQuestions: async (jobId: string, questions: any[]): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.put<ApiResponse<{ success: boolean }>>(`/job/${jobId}/questions/`, {
        questions,
      })
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to update application questions",
        data: { success: false },
      }
    }
  },

  // Job applications
  getApplications: async (jobId: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`/job/${jobId}/applications/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve applications",
        data: [],
      }
    }
  },

  getApplication: async (jobId: string, applicationId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/job/${jobId}/applications/${applicationId}/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve application",
        data: null,
      }
    }
  },

  updateApplicationStatus: async (
    jobId: string,
    applicationId: string,
    status: string,
    comments?: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.patch<ApiResponse<{ success: boolean }>>(
        `/job/${jobId}/applications/${applicationId}/`,
        {
          status,
          comments,
        },
      )
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to update application status",
        data: { success: false },
      }
    }
  },

  // Recommendations and matches
  getRecommendedJobs: async (): Promise<ApiResponse<Job[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Job[]>>("/job/recommended/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve recommended jobs",
        data: [],
      }
    }
  },

  getJobMatches: async (): Promise<ApiResponse<{ jobs: Job[]; matches: { jobId: string; score: number }[] }>> => {
    try {
      const response =
        await apiClient.get<ApiResponse<{ jobs: Job[]; matches: { jobId: string; score: number }[] }>>("/job/matches/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve job matches",
        data: { jobs: [], matches: [] },
      }
    }
  },


  // Save a job
  saveJob: async (jobId: string): Promise<ApiResponse<void>> => {
    try {
      await apiClient.post(`/job/${jobId}/save/`);
      toast.success("Job saved successfully!");
      return { status: "success", message: "Job saved!", data: undefined };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to save job";
      toast.error(errorMessage);
      return { status: "error", message: errorMessage, data: undefined };
    }
  },

  unsaveJob: async (jobId: string): Promise<ApiResponse<void>> => {
    try {
      await apiClient.delete(`/job/${jobId}/save/`); // Correct method for unsaving is typically DELETE
      toast.success("Job unsaved successfully!");
      return { status: "success", message: "Job unsaved!", data: undefined };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to unsave job";
      toast.error(errorMessage);
      return { status: "error", message: errorMessage, data: undefined };
    }
  },


  // Get saved jobs for the current user
  getSavedJobs: async (): Promise<ApiResponse<Job[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Job[]>>("/user/profile/saved-jobs/");
      
      if (response.data.status === "success") {
        return { 
            status: "success", 
            message: response.data.message,
            data: response.data.data || []
        };
      } else {
        toast.error(response.data.message || "Failed to retrieve saved jobs");
        return { 
            status: "error", 
            message: response.data.message || "Failed to retrieve saved jobs", 
            data: []
        };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to retrieve saved jobs";
      toast.error(errorMessage);
      return { 
          status: "error", 
          message: errorMessage, 
          data: []
      };
    }
  },
}

export interface JobsQueryParams {
  page?: number
  limit?: number
  search?: string
  type?: string
  industry?: string
  location?: string
  is_active?: boolean
  featured?: boolean
  ordering?: string
}

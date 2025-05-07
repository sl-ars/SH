import apiClient from "./client"
import type { Job, Application, Company, EmployerDashboardAnalytics, BackendAnalyticsPayload } from "@/lib/types"

interface ApiResponse<T> {
  data: T
  status: string
  message: string
  errors?: Record<string, string[]>
}

// Helper function to ensure a value is an array
const ensureArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split('\n').filter(Boolean);
  return [];
};

export const employerApi = {
  // Jobs
  getJobs: async (params?: any): Promise<Job[]> => {
    try {
      console.log("Fetching employer jobs with personal scope");
      const requestParams = {
        ...params,
        scope: "personal",
      };
      // The backend response is FullBackendApiResponse
      // where FullBackendApiResponse.data contains { count, next, previous, results: Job[] }
      const response = await apiClient.get<any>("/job/", { params: requestParams })

      // Check if the response structure is as expected and contains the jobs array
      if (response.data && response.data.status === "success" && response.data.data && Array.isArray(response.data.data.results)) {
        console.log("Successfully fetched and processed employer jobs:", response.data.data.results);
        return response.data.data.results; // Return just the array of jobs
      } else {
        console.warn("Unexpected response format or error in jobs API response:", response.data);
        return []; // Return empty array if data is not in expected format
      }
    } catch (error: any) {
      console.error("Error fetching employer jobs:", error)
      // Optionally, re-throw or handle as per application's error handling strategy
      // For now, returning empty array to prevent UI breakage
      return []; 
    }
  },

  getJob: async (jobId: string) => {
    try {
      const response = await apiClient.get<ApiResponse<Job>>(`/job/${jobId}/`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching job ${jobId}:`, error)
      throw error
    }
  },

  createJob: async (jobData: Partial<Job>) => {
    try {
      // Format the job data to match backend expectations
      const formattedData = {
        ...jobData,
        // Ensure these fields are arrays as expected by the backend
        requirements: ensureArray(jobData.requirements),
        responsibilities: ensureArray(jobData.responsibilities),
        benefits: ensureArray(jobData.benefits),
        is_active: true,
        status: 'active'
      };
      
      console.log("Creating job with data:", formattedData);
      const response = await apiClient.post<ApiResponse<Job>>("/job/", formattedData);
      return response.data;
    } catch (error: any) {
      console.error("Error creating job:", error);
      throw error;
    }
  },

  updateJob: async (jobId: string, jobData: Partial<Job>) => {
    try {
      // Use PATCH and the /job/:id/ endpoint
      const response = await apiClient.patch<ApiResponse<Job>>(`/job/${jobId}/`, jobData)
      return response.data
    } catch (error: any) {
      console.error(`Error updating job ${jobId}:`, error)
      throw error
    }
  },

  deleteJob: async (jobId: string) => {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/job/${jobId}/`)
      return response.data
    } catch (error: any) {
      console.error(`Error deleting job ${jobId}:`, error)
      throw error
    }
  },

  // Applications
  getApplications: async (params?: any): Promise<Application[]> => {
    try {
      console.log("Fetching employer applications with params:", params);
      const response = await apiClient.get<ApiResponse<{ count: number; next: string | null; previous: string | null; results: Application[] }>>("/application/", { params })
      
      if (response.data && response.data.status === "success" && response.data.data && Array.isArray(response.data.data.results)) {
        console.log("Successfully fetched and processed employer applications:", response.data.data.results);
        return response.data.data.results;
      } else {
        console.warn("Unexpected response format or error in applications API response:", response.data);
        return [];
      }
    } catch (error: any) {
      console.error("Error fetching applications:", error)
      return [];
    }
  },

  getApplication: async (id: string): Promise<ApiResponse<Application>> => {
    const response = await apiClient.get<ApiResponse<Application>>(`/application/${id}/`)
    return response.data
  },

  updateApplicationStatus: async (applicationId: string, status: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.patch<ApiResponse<{ success: boolean }>>(`/application/${applicationId}/update_status/`, {
        status,
      })
      return response.data
    } catch (error: any) {
      console.error(`Error updating application ${applicationId}:`, error)
      throw error
    }
  },

  // Students
  createStudent: async (data: any) => {
    const response = await apiClient.post<ApiResponse<any>>("/students/", data)
    return response.data
  },

  // Company Profile
  getCompanyProfile: async () => {
    // Try company profile endpoint
    try {
      console.log("Fetching company profile from /company/employer/company/");
      const response = await apiClient.get<ApiResponse<Company>>("/company/employer/company/");
      
      if (response?.data) {
        console.log("Successfully fetched company profile");
        return response.data;
      }
    } catch (error: any) {
      console.error("Error fetching company profile:", error.message);
    }
    
    // Return empty profile as fallback
    console.warn("Could not fetch company profile, returning default empty profile");
    return {
      status: "success",
      message: "Default profile",
      data: {
        company_name: "",
        industry: "",
        website: "",
        description: "",
        company: "",
        company_id: ""
      }
    };
  },

  updateCompanyProfile: async (profileData: any) => {
    try {
      console.log("Updating company profile via POST to /company/employer/update/");
      console.log("Profile data being sent:", JSON.stringify(profileData, null, 2));
      
      // Используем метод POST к новому эндпоинту
      const response = await apiClient.post<ApiResponse<Company>>("/company/employer/update/", profileData);
      
      console.log("Company profile updated successfully!");
      console.log("Response data:", JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error("Error updating company profile:", error.message);
      // Логирование деталей ошибки
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
      throw error;
    }
  },

  // Analytics
  getAnalytics: async (params?: { period?: string }): Promise<ApiResponse<BackendAnalyticsPayload>> => {
    try {
      console.log("Calling analytics API at /analytics/employer/");
      const response = await apiClient.get<ApiResponse<BackendAnalyticsPayload>>("/analytics/employer/", { params });
      console.log("Analytics API raw response object from apiClient.get:", response);

      // response.data is already ApiResponse<BackendAnalyticsPayload>
      // We should return this directly if the call was successful and data seems valid.
      if (response.data && response.data.status === "success" && response.data.data?.data?.summary) { // Check deep validity
        return response.data; // Return the full ApiResponse<BackendAnalyticsPayload>
      } else {
        const errorMessage = response.data?.message || response.data?.data?.message || "Analytics data is not in the expected format or an API error occurred.";
        console.warn("Analytics API response error or unexpected structure:", response.data);
        return {
          status: "error",
          message: errorMessage,
          data: {} as BackendAnalyticsPayload, // Ensure data field exists and is typed
        } as ApiResponse<BackendAnalyticsPayload>; // Cast for type consistency
      }
    } catch (error: any) {
      console.error("Error fetching employer analytics:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to fetch analytics data";
      return {
        status: "error",
        message: errorMessage,
        data: {} as BackendAnalyticsPayload,
      } as ApiResponse<BackendAnalyticsPayload>; // Cast for type consistency
    }
  },

  // Interviews
  getInterviews: async (filters?: any): Promise<Application[]> => {
    console.log("Fetching all applications with scheduled interviews, filters:", filters);
    // To get all applications with an interview_date, we need a backend filter.
    // Assuming backend supports `interview_scheduled=true` or `interview_date__isnull=false`.
    // Using a hypothetical `interview_scheduled=true` for now.
    // If backend uses `interview_date__isnull=false`, change param name accordingly.
    const interviewFilters = { ...filters, interview_scheduled: 'true' }; 
    return employerApi.getApplications(interviewFilters);
  },

  scheduleInterview: async (applicationId: string, data: { interview_date: string; notes?: string }): Promise<ApiResponse<Application>> => {
    const response = await apiClient.post<ApiResponse<Application>>(`/application/${applicationId}/schedule_interview/`, data)
    return response.data
  },

  // Settings
  getSettings: async () => {
    const response = await apiClient.get<ApiResponse<any>>("/settings/")
    return response.data
  },

  updateSettings: async (data: any) => {
    const response = await apiClient.put<ApiResponse<any>>("/settings/", data)
    return response.data
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>("/change-password/", data)
    return response.data
  },
} 
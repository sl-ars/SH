import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { User, UserProfile, Education, Experience, AnyFullProfile, PublicProfile } from "@/lib/types"
import { USER_ROLES, UserRole } from "@/lib/constants/roles"

interface AuthResponse {
  user: User
  token: string
}

export const userApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; access: string; refresh: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ user: User; access: string; refresh: string }>>("/auth/login/", {
        email,
        password,
      })
      
      // If login is successful and tokens are present, store them
      if (response.data && response.data.status === "success" && response.data.data) {
        const { access, refresh } = response.data.data;
        if (typeof access === 'string' && access) {
          localStorage.setItem("access_token", access);
        }
        if (typeof refresh === 'string' && refresh) {
          localStorage.setItem("refresh_token", refresh);
        }
      }
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Login failed",
        data: { user: null as any, access: "", refresh: "" }, // Adjusted to match new type
      }
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")

      return {
        status: "success",
        message: "Logged out successfully",
        data: null,
      }
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Logout failed",
        data: null,
      }
    }
  },

  register: async (userData: any): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
        "/auth/register/",
        userData,
      )
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Registration failed",
        data: { success: false, message: error.message },
      }
    }
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ access: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ access: string }>>("/auth/token/refresh/", {
        refresh: refreshToken,
      })

      // Corrected access based on ApiResponse structure which typically wraps data
      if (response.data && response.data.data && typeof response.data.data.access === 'string') {
        localStorage.setItem("access_token", response.data.data.access)
      } else if (response.data && typeof (response.data as any).access === 'string') {
        // Fallback if structure is flatter, though less likely given other examples
        localStorage.setItem("access_token", (response.data as any).access);
      }

      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to refresh token",
        data: { access: "" },
      }
    }
  },

  verifyToken: async (token: string): Promise<ApiResponse<{ detail: string }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ detail: string }>>("/auth/token/verify/", {
        token,
      })

      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to verify token",
        data: { detail: "" },
      }
    }
  },

  getMyProfile: async (): Promise<ApiResponse<AnyFullProfile>> => {
      try {
        const response = await apiClient.get<ApiResponse<AnyFullProfile>>("/user/profile/me/")
        return response.data
      } catch (error: any) {
        return {
          status: "error",
          message: error.message || "Failed to get your profile",
          data: null as any,
        }
      }
    },

  getPublicUserProfile: async (userId: string | number): Promise<ApiResponse<PublicProfile>> => {
    try {
      const response = await apiClient.get<ApiResponse<PublicProfile>>(`/user/profile/${userId}/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get public user profile",
        data: null as any,
      }
    }
  },

  updateProfile: async (
      data: Partial<AnyFullProfile> & { avatar?: File | string | null }
    ): Promise<ApiResponse<AnyFullProfile>> => {
      try {
        let response;
        const avatarAsAny = data.avatar as any;

        if (avatarAsAny && avatarAsAny instanceof File) {
      
          const formData = new FormData();

          Object.entries(data).forEach(([key, value]) => {
     
            if (value === undefined || value === null) {
       
              if (key === 'avatar' && value instanceof File) {
       
              } else {
                return;
              }
            }

            if (key === 'avatar') {
              if (value instanceof File) {
                formData.append(key, value);
              } else if (typeof value === 'string') {

                formData.append(key, value);
              }
              return;
            }

            const arrayFieldsMulti = ['skills', 'achievements', 'company_skills_tags'];
            if (arrayFieldsMulti.includes(key) && Array.isArray(value)) {
              value.forEach(item => {
                if (item !== null && item !== undefined) {
                  formData.append(key, String(item)); 
                }
              });
              return;
            }

            const arrayFieldsJson = ['education', 'experience', 'programs_offered'];
            if (arrayFieldsJson.includes(key) && Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
              return;
            }

            if (typeof value === 'object' && !(value instanceof File)) {
              formData.append(key, JSON.stringify(value));
              return;
            }

  
            if (typeof value !== 'object') {
              formData.append(key, String(value));
            }
          });

          response = await apiClient.patch<ApiResponse<AnyFullProfile>>("/user/profile/me/", formData);

        } else {

          const jsonDataPayload: { [key: string]: any } = {};
          Object.entries(data).forEach(([k, v]) => {
            if (v !== undefined) {
              jsonDataPayload[k] = v;
            }
          });
          response = await apiClient.patch<ApiResponse<AnyFullProfile>>("/user/profile/me/", jsonDataPayload);
        }

        return response.data;
      } catch (error: any) {
        let nicelyFormattedMessage = "Failed to update profile. Please try again."; // Default message

        const errorResponse = error.response?.data;

        if (errorResponse && errorResponse.error && typeof errorResponse.error.details === 'object' && errorResponse.error.details !== null) {
            const details = errorResponse.error.details;
            const detailedMessages: string[] = [];

            // Use the main message from API if available, otherwise a default
            const mainApiMessage = typeof errorResponse.message === 'string' && errorResponse.message ? errorResponse.message : "Validation error";
            detailedMessages.push(mainApiMessage + ". Please check the following issues:");

            for (const fieldName in details) {
                if (!Object.prototype.hasOwnProperty.call(details, fieldName)) continue;

                const errorsForField = details[fieldName];
                const capitalizedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/_/g, ' ');

                if (Array.isArray(errorsForField)) {
                    // Check if it's an array of simple string errors
                    const allStrings = errorsForField.every(e => typeof e === 'string');

                    if (allStrings && errorsForField.length > 0) {
                        detailedMessages.push(`\n- ${capitalizedFieldName}:`);
                        errorsForField.forEach(msg => {
                            if (typeof msg === 'string') detailedMessages.push(`  - ${msg}`);
                        });
                    } else { // Otherwise, assume it's an array of objects (like education items)
                        errorsForField.forEach((item, index) => {
                            // Process only if item is an object with keys (skips empty {} like in education[0])
                            if (typeof item === 'object' && item !== null && Object.keys(item).length > 0) {
                                detailedMessages.push(`\n- ${capitalizedFieldName} (Entry ${index + 1}):`);
                                for (const subFieldName in item) {
                                     if (!Object.prototype.hasOwnProperty.call(item, subFieldName)) continue;
                                    const subFieldErrArray = item[subFieldName]; // This should be an array of error strings
                                    const capitalizedSubFieldName = subFieldName.charAt(0).toUpperCase() + subFieldName.slice(1).replace(/_/g, ' ');
                                    if (Array.isArray(subFieldErrArray)) {
                                        subFieldErrArray.forEach(msg => {
                                           if (typeof msg === 'string') detailedMessages.push(`  - ${capitalizedSubFieldName}: ${msg}`);
                                        });
                                    }
                                }
                            }
                        });
                    }
                } else if (typeof errorsForField === 'object' && errorsForField !== null) {
                    // Handles cases where errorsForField is an object mapping sub-fields to error message arrays
                    detailedMessages.push(`\n- ${capitalizedFieldName}:`);
                    for (const subFieldName in errorsForField) {
                         if (!Object.prototype.hasOwnProperty.call(errorsForField, subFieldName)) continue;
                         const subFieldErrArray = (errorsForField as any)[subFieldName];
                         const capitalizedSubFieldName = subFieldName.charAt(0).toUpperCase() + subFieldName.slice(1).replace(/_/g, ' ');
                         if (Array.isArray(subFieldErrArray)) {
                            subFieldErrArray.forEach(msg => {
                                if (typeof msg === 'string') detailedMessages.push(`  - ${capitalizedSubFieldName}: ${msg}`);
                            });
                         }
                    }
                }
            }

            // Use the detailed messages if any were generated
            if (detailedMessages.length > 1) { // More than just the initial header
                nicelyFormattedMessage = detailedMessages.join('\n');
            } else if (typeof errorResponse.message === 'string' && errorResponse.message) {
                // Fallback to API's main error message if no details parsed but message exists
                nicelyFormattedMessage = errorResponse.message;
            }
            // If no specific details and no main API message, the default "Failed to update..." remains

        } else if (error.message && typeof error.message === 'string') {
            // Fallback for errors that don't fit the detailed structure but have a message
            nicelyFormattedMessage = error.message;
        }

        return {
          status: errorResponse?.status === "fail" ? "fail" : "error", // Reflect "fail" status from API if present
          message: nicelyFormattedMessage,
          data: null as any,
        };
      }
    },

  getResumes: async (): Promise<ApiResponse<{ id: string; name: string; url: string; created_at: string }[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<{ id: string; name: string; url: string; created_at: string }[]>>("/user/resumes/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get resumes",
        data: [],
      }
    }
  },

  deleteResume: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/user/resumes/${id}/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to delete resume",
        data: { success: false },
      }
    }
  },

  saveJob: async (jobId: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(`/user/saved-jobs/${jobId}/`, {})
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to save job",
        data: { success: false },
      }
    }
  },

  unsaveJob: async (jobId: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/user/saved-jobs/${jobId}/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to unsave job",
        data: { success: false },
      }
    }
  },

  getSavedJobs: async (): Promise<ApiResponse<{ jobs: string[] }>> => {
    try {
      const response = await apiClient.get<ApiResponse<{ jobs: string[] }>>("/user/saved-jobs/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get saved jobs",
        data: { jobs: [] },
      }
    }
  },

  followCompany: async (companyId: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
        `/user/followed-companies/${companyId}/`,
        {},
      )
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to follow company",
        data: { success: false },
      }
    }
  },

  unfollowCompany: async (companyId: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
        `/user/followed-companies/${companyId}/`,
      )
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to unfollow company",
        data: { success: false },
      }
    }
  },

  getFollowedCompanies: async (): Promise<ApiResponse<{ companies: string[] }>> => {
    try {
      const response = await apiClient.get<ApiResponse<{ companies: string[] }>>("/user/followed-companies/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get followed companies",
        data: { companies: [] },
      }
    }
  },

  // Education operations
  addEducation: async (role: UserRole, education: Omit<Education, "id">) => {
    const response = await apiClient.post<ApiResponse<UserProfile>>(
      `/api/${role}/profile/education/`,
      education
    )
    return response.data.data
  },

  removeEducation: async (role: UserRole, educationId: string) => {
    const response = await apiClient.delete<ApiResponse<UserProfile>>(
      `/api/${role}/profile/education/${educationId}/`
    )
    return response.data.data
  },

  // Experience operations
  addExperience: async (role: UserRole, experience: Omit<Experience, "id">) => {
    const response = await apiClient.post<ApiResponse<UserProfile>>(
      `/api/${role}/profile/experience/`,
      experience
    )
    return response.data.data
  },

  removeExperience: async (role: UserRole, experienceId: string) => {
    const response = await apiClient.delete<ApiResponse<UserProfile>>(
      `/api/${role}/profile/experience/${experienceId}/`
    )
    return response.data.data
  },

  uploadAvatar: async (

    formData: FormData
  ): Promise<ApiResponse<{ avatar: string }>> => {
    try {
      const response = await apiClient.patch<ApiResponse<{ avatar: string }>>(
        "/user/profile/me/", 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data; 
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to upload avatar",
        data: { avatar: "" }, 
      };
    }
  },
}

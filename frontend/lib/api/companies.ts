import axios from "axios"
import type { AxiosResponse } from "axios"
import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { Company } from "@/lib/types"
import { isMockEnabled } from "@/lib/utils/config"

export interface AxiosApiResponse<T = any> {
  data: T
  status: string
  message: string
  errors?: Record<string, string[]>
}

export interface CompanyFilters {
  search?: string
  industry?: string
  location?: string
  size?: string
  page?: number
  page_size?: number
  limit?: number
}

export interface CompanyListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Company[]
}

export interface CompaniesResponse {
  companies: Company[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export const companiesApi = {
  getCompanies: async (filters: CompanyFilters = {}) => {
    try {
      const response = await apiClient.get('/company/', { params: filters });
      const companyList = response.data && response.data.data && Array.isArray(response.data.data.results) 
                          ? response.data.data.results 
                          : [];
      return {
        status: 'success',
        message: 'Companies retrieved successfully',
        data: companyList
      };
    } catch (error) {
      console.error('Error fetching companies:', error);
      if (isMockEnabled()) {
        return {
          status: 'success',
          message: 'Companies retrieved successfully (mock)',
          data: [
            { id: '1', name: 'Google', industry: 'Technology' },
            { id: '2', name: 'Microsoft', industry: 'Technology' },
            { id: '3', name: 'Apple', industry: 'Technology' },
            { id: '4', name: 'Amazon', industry: 'E-Commerce' },
            { id: '5', name: 'Facebook', industry: 'Social Media' }
          ]
        };
      }
      return {
        status: 'error',
        message: 'Failed to retrieve companies',
        data: []
      };
    }
  },

  getCompany: async (id: string) => {
    try {
      const response = await apiClient.get(`/company/${id}/`);
      return {
        status: 'success',
        message: 'Company retrieved successfully',
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error);
      return {
        status: 'error',
        message: 'Failed to retrieve company',
        data: null
      };
    }
  },

  createCompany: async (companyData: Partial<Company>) => {
    try {
      const response = await apiClient.post('/company/', companyData);
      return {
        status: 'success',
        message: 'Company created successfully',
        data: response.data
      };
    } catch (error) {
      console.error('Error creating company:', error);
      return {
        status: 'error',
        message: 'Failed to create company',
        data: null
      };
    }
  },

  updateCompany: async (id: string, companyData: Partial<Company>) => {
    try {
      const response = await apiClient.put(`/company/${id}/`, companyData);
      return {
        status: 'success',
        message: 'Company updated successfully',
        data: response.data
      };
    } catch (error) {
      console.error(`Error updating company ${id}:`, error);
      return {
        status: 'error',
        message: 'Failed to update company',
        data: null
      };
    }
  },

  deleteCompany: async (id: string) => {
    try {
      const response = await apiClient.delete(`/company/${id}/`);
      return {
        status: 'success',
        message: 'Company deleted successfully',
        data: { success: true }
      };
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error);
      return {
        status: 'error',
        message: 'Failed to delete company',
        data: { success: false }
      };
    }
  },

  uploadLogo: async (id: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await apiClient.post(`/company/${id}/logo/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return {
        status: 'success',
        message: 'Logo uploaded successfully',
        data: response.data
      };
    } catch (error) {
      console.error(`Error uploading logo for company ${id}:`, error);
      return {
        status: 'error',
        message: 'Failed to upload logo',
        data: null
      };
    }
  },

  verifyCompany: async (id: string) => {
    try {
      const response = await apiClient.post(`/company/${id}/verify/`, {});
      return {
        status: 'success',
        message: 'Company verified successfully',
        data: { success: true }
      };
    } catch (error) {
      console.error(`Error verifying company ${id}:`, error);
      return {
        status: 'error',
        message: 'Failed to verify company',
        data: { success: false }
      };
    }
  },

  getCompanyStats: async (id: string) => {
    try {
      const response = await apiClient.get(`/company/${id}/stats/`);
      return {
        status: 'success',
        message: 'Company stats retrieved successfully',
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching stats for company ${id}:`, error);
      return {
        status: 'error',
        message: 'Failed to retrieve company stats',
        data: {
          views: 0,
          applications: 0,
          followers: 0,
          hires: 0
        }
      };
    }
  },
}

export const companyApi = {
  getAll: async (filters: CompanyFilters = {}): Promise<ApiResponse<CompaniesResponse>> => {
    try {
      const pageSize = filters.page_size ?? 20;
      const response = await apiClient.get<ApiResponse<CompanyListResponse>>("/company", { params: filters })

      if (response.data && response.data.data && Array.isArray(response.data.data.results)) {
        const { count, next, previous, results } = response.data.data

        return {
          status: "success",
          message: "Companies retrieved successfully",
          data: {
            companies: results,
            currentPage: filters.page || 1,
            totalPages: Math.ceil(count / pageSize),
            totalCount: count,
          },
        }
      } else if (response.data && typeof response.data === 'object' && 'results' in response.data) {
        const directResponse = response.data as unknown as CompanyListResponse
        const { count, next, previous, results } = directResponse

        return {
          status: "success",
          message: "Companies retrieved successfully",
          data: {
            companies: results,
            currentPage: filters.page || 1,
            totalPages: Math.ceil(count / pageSize),
            totalCount: count,
          },
        }
      } else {
        console.error("Unexpected API response structure:", response)
        return {
          status: "error",
          message: "Invalid response format from server",
          data: {
            companies: [],
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
          },
        }
      }
    } catch (error: any) {
      console.error("Error fetching companies:", error)
      return {
        status: "error",
        message: error.message || "Failed to retrieve companies",
        data: {
          companies: [],
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
        },
      }
    }
  },

  getById: async (id: string): Promise<ApiResponse<Company>> => {
    try {
      const response = await apiClient.get<ApiResponse<Company>>(`/company/${id}`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve company",
        data: null as any,
      }
    }
  },

  create: async (data: Partial<Company>): Promise<ApiResponse<Company>> => {
    try {
      const response = await apiClient.post<ApiResponse<Company>>("/company", data)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to create company",
        data: null as any,
      }
    }
  },

  update: async (id: string, data: Partial<Company>): Promise<ApiResponse<Company>> => {
    try {
      const response = await apiClient.put<ApiResponse<Company>>(`/company/${id}`, data)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to update company",
        data: null as any,
      }
    }
  },

  delete: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/company/${id}`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to delete company",
        data: { success: false },
      }
    }
  },

  uploadLogo: async (id: string, file: File): Promise<ApiResponse<{ url: string }>> => {
    try {
      const formData = new FormData()
      formData.append("logo", file)

      const response = await apiClient.post<ApiResponse<{ url: string }>>(`/company/${id}/logo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to upload company logo",
        data: { url: "" },
      }
    }
  },

  verifyCompany: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(`/company/${id}/verify`, {})
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to verify company",
        data: { success: false },
      }
    }
  },

  getCompanyStats: async (
    id: string,
  ): Promise<
    ApiResponse<{
      views: number
      applications: number
      followers: number
      hires: number
    }>
  > => {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          views: number
          applications: number
          followers: number
          hires: number
        }>
      >(`/company/${id}/stats/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to retrieve company stats",
        data: {
          views: 0,
          applications: 0,
          followers: 0,
          hires: 0,
        },
      }
    }
  },
}
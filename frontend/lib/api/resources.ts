import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { Resource, ResourceFile, ResourceListResponse, ResourceDownloadResponse } from "@/lib/types"
import { mockResources } from "@/lib/mock-data/resources"
import { isMockEnabled } from "@/lib/utils/config"

export interface ResourceFilters {
  category?: string
  type?: string
  search?: string
  page?: number
  page_size?: number
  ordering?: string
}

export const resourcesApi = {
  getResources: async (
    filters: ResourceFilters = {},
    isAuthenticated = true,
  ): Promise<ApiResponse<ResourceListResponse | null>> => {
    if (isMockEnabled()) {
      const filteredResources = Object.values(mockResources).filter((resource) => {
        if (!isAuthenticated && !(resource.is_demo === true)) {
          return false
        }

        if (filters.category && filters.category !== "All" && resource.category !== filters.category) {
          return false
        }
        if (filters.type && resource.type !== filters.type) {
          return false
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          return (
            resource.title.toLowerCase() === searchLower
          )
        }
        return true
      })

      const page = filters.page || 1
      const pageSize = filters.page_size || 10
      const start = (page - 1) * pageSize
      const end = start + pageSize
      let paginatedResources = filteredResources

      if (filters.ordering) {
        paginatedResources.sort((a, b) => {
          if (filters.ordering === 'title') {
            return a.title.localeCompare(b.title);
          } else if (filters.ordering === '-title') {
            return b.title.localeCompare(a.title);
          }
          return 0;
        });
      }
      
      paginatedResources = paginatedResources.slice(start, end)

      return {
        status: "success",
        data: {
          count: filteredResources.length,
          next: end < filteredResources.length ? `/api/resources/?page=${page + 1}` : null,
          previous: page > 1 ? `/api/resources/?page=${page - 1}` : null,
          results: paginatedResources,
        },
        message: "Resources retrieved successfully",
      }
    }

    try {
      const response = await apiClient.get<ApiResponse<ResourceListResponse>>("/resources/", { params: filters })
      return response.data
    } catch (error) {
      console.error("Error fetching resources:", error)
      return { 
        status: "error", 
        message: error instanceof Error ? error.message : "Unknown error fetching resources", 
        data: null 
      } as ApiResponse<any>;
    }
  },

  getResource: async (id: string): Promise<ApiResponse<Resource | null>> => {
    if (isMockEnabled()) {
      const resource = mockResources[id]
      if (resource) {
        return {
          status: "success",
          data: resource,
          message: "Resource retrieved successfully",
        }
      }
      return {
        status: "error",
        message: "Resource not found",
        data: null,
      }
    }

    try {
      const response = await apiClient.get<ApiResponse<Resource>>(`/resources/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Error fetching resource ${id}:`, error)
      return { 
        status: "error", 
        message: error instanceof Error ? error.message : `Unknown error fetching resource ${id}`, 
        data: null 
      } as ApiResponse<any>;
    }
  },

  getCategories: async (): Promise<ApiResponse<string[] | null>> => {
    if (isMockEnabled()) {
      const categories = [...new Set(Object.values(mockResources).map((r) => r.category))].filter(Boolean) as string[]
      return {
        status: "success",
        data: categories,
        message: "Categories retrieved successfully",
      }
    }

    try {
      const response = await apiClient.get<ApiResponse<string[]>>("/resources/categories/")
      return response.data
    } catch (error) {
      console.error("Error fetching categories:", error)
      return { 
        status: "error", 
        message: error instanceof Error ? error.message : "Unknown error fetching categories", 
        data: null 
      } as ApiResponse<any>;
    }
  },

  getTypes: async (): Promise<ApiResponse<string[] | null>> => {
    if (isMockEnabled()) {
      const types = [...new Set(Object.values(mockResources).map((r) => r.type))].filter(Boolean) as string[]
      return {
        status: "success",
        data: types,
        message: "Types retrieved successfully",
      }
    }

    try {
      const response = await apiClient.get<ApiResponse<string[]>>("/resources/types/")
      return response.data
    } catch (error) {
      console.error("Error fetching types:", error)
      return { 
        status: "error", 
        message: error instanceof Error ? error.message : "Unknown error fetching types", 
        data: null 
      } as ApiResponse<any>;
    }
  },

  createResource: async (resourceData: Partial<Resource>): Promise<ApiResponse<Resource | null>> => {
    if (isMockEnabled()) {
      const ids = Object.keys(mockResources).map(id => parseInt(id, 10));
      const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
      const newResource: Resource = {
        id: newId.toString(),
        title: resourceData.title || "New Mock Resource",
        description: resourceData.description || "",
        type: resourceData.type || "Article",
        category: resourceData.category || "General",
        tags: resourceData.tags || [],
        is_demo: resourceData.is_demo || false,
        content: resourceData.content || "Mock content",
        author: resourceData.author || { id: "mock-author-id-str", name: "Mock Author Default", email: "mock_author_default@example.com" },
        author_details: resourceData.author_details || { id: "mock-author-id-str", name: "Mock Author Default", email: "mock_author_default@example.com" },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        estimated_time: resourceData.estimated_time || "N/A",
      };
      mockResources[newResource.id] = newResource;
      return { status: "success", data: newResource, message: "Resource created (mock)" };
    }
    try {
      const response = await apiClient.post<ApiResponse<Resource>>("/resources/", resourceData)
      return response.data
    } catch (error) {
      console.error("Error creating resource:", error)
      return { 
        status: "error", 
        message: error instanceof Error ? error.message : "Unknown error creating resource", 
        data: null 
      } as ApiResponse<any>;
    }
  },

  updateResource: async (id: string, resourceData: Partial<Resource>): Promise<ApiResponse<Resource | null>> => {
     if (isMockEnabled()) {
      if (mockResources[id]) {
        mockResources[id] = { ...mockResources[id], ...resourceData, updated_at: new Date().toISOString() };
        return { status: "success", data: mockResources[id], message: "Resource updated (mock)" };
      }
      return { status: "error", message: "Resource not found (mock)", data: null };
    }
    try {
      const response = await apiClient.put<ApiResponse<Resource>>(`/resources/${id}/`, resourceData)
      return response.data
    } catch (error) {
      console.error(`Error updating resource ${id}:`, error)
      return { 
        status: "error", 
        message: error instanceof Error ? error.message : `Unknown error updating resource ${id}`, 
        data: null 
      } as ApiResponse<any>;
    }
  },

  deleteResource: async (id: string): Promise<ApiResponse<{ success: boolean } | null>> => {
    if (isMockEnabled()) {
      if (mockResources[id]) {
        delete mockResources[id];
        return { status: "success", data: { success: true }, message: "Resource deleted (mock)" };
      }
      return { status: "error", message: "Resource not found (mock)", data: { success: false } };
    }
    try {
      await apiClient.delete<ApiResponse<void>>(`/resources/${id}/`)
      return { status: "success", data: { success: true }, message: "Resource deleted successfully" }
    } catch (error) {
      console.error(`Error deleting resource ${id}:`, error)
      return { 
        status: "error", 
        message: error instanceof Error ? error.message : `Unknown error deleting resource ${id}`, 
        data: null
      } as ApiResponse<any>;
    }
  },

  downloadResource: async (id: string): Promise<ApiResponse<ResourceDownloadResponse | null>> => {
    if (isMockEnabled()) {
      const resource = mockResources[id];
      if (resource) {
        const mockFileUrl = resource.fileUrl || "https://example.com/mock-downloadable-file.pdf";
        return {
          status: "success",
          data: { file_url: mockFileUrl, filename: resource.title },
          message: "Resource ready for download (mock)",
        };
      }
      return { status: "error", message: "Resource not found for download (mock)", data: null };
    }
    try {
      const response = await apiClient.get<ApiResponse<ResourceDownloadResponse>>(`/resources/${id}/download/`)
      return response.data
    } catch (error) {
      console.error(`Error downloading resource ${id}:`, error)
      return { 
        status: "error", 
        message: error instanceof Error ? error.message : `Unknown error downloading resource ${id}`, 
        data: null 
      };
    }
  },

  getResourceFiles: async (resourceId: string): Promise<ApiResponse<ResourceFile[] | null>> => {
    if (isMockEnabled()) {
      if (mockResources[resourceId] && mockResources[resourceId].files) {
        return { status: "success", data: mockResources[resourceId].files as ResourceFile[], message: "Resource files fetched (mock)" };
      }
      return { status: "success", data: [], message: "No files found (mock)" };
    }
    try {
      const response = await apiClient.get<ApiResponse<ResourceFile[]>>(`/resource-files/?resource=${resourceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching files for resource ${resourceId}:`, error);
      return { 
        status: "error", 
        message: error instanceof Error ? error.message : `Unknown error fetching files for resource ${resourceId}`, 
        data: null 
      };
    }
  },

  uploadResourceFile: async (resourceId: string, fileData: FormData): Promise<ApiResponse<ResourceFile | null>> => {
    if (isMockEnabled()) {
      const mockFile: ResourceFile = { 
        id: Math.random().toString(36).substring(2), 
        resource: resourceId,
        title: (fileData.get('title') as string) || (fileData.get('file') as File)?.name || 'mockfile.pdf',
        file: 'https://example.com/mock-uploaded-file.pdf',
        file_url: 'https://example.com/mock-uploaded-file.pdf',
        created_at: new Date().toISOString(),
      };
      if (mockResources[resourceId]) {
        if (!mockResources[resourceId].files) {
          mockResources[resourceId].files = [];
        }
        (mockResources[resourceId].files as ResourceFile[]).push(mockFile);
      }
      return { status: "success", data: mockFile, message: "File uploaded (mock)" };
    }
    try {
      if (!fileData.has('resource')) {
        fileData.append('resource', resourceId);
      }
      const response = await apiClient.post<ApiResponse<ResourceFile>>(`/resource-files/`, fileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error uploading file for resource ${resourceId}:`, error);
      return { 
        status: "error", 
        message: error instanceof Error ? error.message : `Unknown error uploading file for resource ${resourceId}`, 
        data: null 
      };
    }
  },

  deleteResourceFile: async (resourceId: string, fileId: string): Promise<ApiResponse<{ success: boolean } | null>> => {
    if (isMockEnabled()) {
      if (mockResources[resourceId] && mockResources[resourceId].files) {
        const initialLength = (mockResources[resourceId].files as ResourceFile[]).length;
        mockResources[resourceId].files = (mockResources[resourceId].files as ResourceFile[]).filter((f: ResourceFile) => f.id !== fileId);
        if ((mockResources[resourceId].files as ResourceFile[]).length < initialLength) {
          return { status: "success", data: { success: true }, message: "File deleted (mock)" };
        }
      }
      return { status: "error", message: "File not found (mock)", data: { success: false } };
    }
    try {
      await apiClient.delete(`/resource-files/${fileId}/`);
      return { status: "success", data: { success: true }, message: "File deleted successfully" };
    } catch (error) {
      console.error(`Error deleting file ${fileId} for resource ${resourceId}:`, error);
      return { 
        status: "error", 
        message: error instanceof Error ? error.message : `Unknown error deleting file ${fileId}`, 
        data: null
      };
    }
  },

  downloadResourceFile: async (resourceId: string, fileId: string): Promise<ApiResponse<ResourceDownloadResponse | null>> => {
    if (isMockEnabled()) {
      const resource = mockResources[resourceId];
      if (resource && resource.files) {
        const file = (resource.files as ResourceFile[]).find((f: ResourceFile) => f.id === fileId);
        if (file && file.file_url) {
          return { status: "success", data: { file_url: file.file_url, filename: file.title || file.file }, message: "File download URL ready (mock)" };
        }
      }
      return { status: "error", message: "File not found for download (mock)", data: null };
    }
    try {
      const response = await apiClient.get<ApiResponse<ResourceDownloadResponse>>(`/resource-files/${fileId}/download/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching download URL for file ${fileId}:`, error);
      return { 
        status: "error", 
        message: error instanceof Error ? error.message : `Unknown error fetching download URL for file ${fileId}`, 
        data: null 
      };
    }
  },

  getAll: async (filters: ResourceFilters = {}) => {
    return resourcesApi.getResources(filters)
  },

  getById: async (id: string) => {
    return resourcesApi.getResource(id)
  },

  create: async (data: Partial<Resource>) => {
    return resourcesApi.createResource(data)
  },

  update: async (id: string, data: Partial<Resource>) => {
    return resourcesApi.updateResource(id, data)
  },

  delete: async (id: string) => {
    return resourcesApi.deleteResource(id)
  },
}

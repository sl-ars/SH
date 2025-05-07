import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { User, UserProfile } from "@/lib/types"
import { isMockEnabled } from "@/lib/utils/config"

/**
 * Admin API for user management
 * This file contains functions for admin operations on users
 * Regular user operations should use lib/api/user.ts instead
 */
export const adminUsersApi = {
  // Get all users (admin only)
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    try {
      if (isMockEnabled()) {
        const { mockAdminUsers } = await import("@/lib/mock-data/admin")
        return {
          status: "success",
          message: "Users retrieved successfully",
          data: mockAdminUsers,
        }
      }

      const response = await apiClient.get<ApiResponse<User[]>>("/admin/users/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get users",
        data: [],
      }
    }
  },

  // Get a specific user by ID (admin only)
  getUser: async (id: string): Promise<ApiResponse<User>> => {
    try {
      if (isMockEnabled()) {
        const { mockAdminUsers } = await import("@/lib/mock-data/admin")
        const user = mockAdminUsers.find((user) => user.id === id)
        return {
          status: "success",
          message: "User retrieved successfully",
          data: user as User,
        }
      }

      const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get user",
        data: null as any,
      }
    }
  },

  // Create a new user (admin only)
  createUser: async (userData: Omit<User, "id">): Promise<ApiResponse<User>> => {
    try {
      if (isMockEnabled()) {
        return {
          status: "success",
          message: "User created successfully",
          data: {
            id: `user-${Math.random().toString(36).substr(2, 9)}`,
            ...userData,
          } as User,
        }
      }

      const response = await apiClient.post<ApiResponse<User>>("/admin/users/", userData)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to create user",
        data: null as any,
      }
    }
  },

  // Update an existing user (admin only)
  updateUser: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      if (isMockEnabled()) {
        return {
          status: "success",
          message: "User updated successfully",
          data: { id, ...userData } as User,
        }
      }

      const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}/`, userData)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to update user",
        data: null as any,
      }
    }
  },

  // Delete a user (admin only)
  deleteUser: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      if (isMockEnabled()) {
        return {
          status: "success",
          message: "User deleted successfully",
          data: { success: true },
        }
      }

      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/admin/users/${id}/`)
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to delete user",
        data: { success: false },
      }
    }
  },

  // Bulk import users (admin only)
  bulkImportUsers: async (
    users: Array<Omit<User, "id">>,
  ): Promise<ApiResponse<{ success: number; failed: number }>> => {
    try {
      if (isMockEnabled()) {
        return {
          status: "success",
          message: "Users imported successfully",
          data: { success: users.length, failed: 0 },
        }
      }

      const response = await apiClient.post<ApiResponse<{ success: number; failed: number }>>("/admin/users/bulk/", {
        users,
      })
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to import users",
        data: { success: 0, failed: users.length },
      }
    }
  },

  // Get user profiles (admin only)
  getUserProfiles: async (): Promise<ApiResponse<UserProfile[]>> => {
    try {
      if (isMockEnabled()) {
        // Mock implementation
        return {
          status: "success",
          message: "User profiles retrieved successfully",
          data: [],
        }
      }

      const response = await apiClient.get<ApiResponse<UserProfile[]>>("/admin/user-profiles/")
      return response.data
    } catch (error: any) {
      return {
        status: "error",
        message: error.message || "Failed to get user profiles",
        data: [],
      }
    }
  },
}

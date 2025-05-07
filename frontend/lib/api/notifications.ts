import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { Notification } from "../types"

export interface NotificationFilters {
  read?: boolean
  type?: string
  page?: number
  page_size?: number
}

export interface NotificationListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Notification[]
}

// Change the export name from notificationsApi to notificationApi to match the import in index.ts
export const notificationApi = {
  getNotifications: async (filters: NotificationFilters = {}) => {
    const response = await apiClient.get<ApiResponse<NotificationListResponse>>("/notifications/", { params: filters })
    return response.data
  },

  getNotification: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Notification>>(`/notifications/${id}/`)
    return response.data
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.put<ApiResponse<{ success: boolean }>>(`/notifications/${id}/read/`, {})
    return response.data
  },

  markAllAsRead: async () => {
    const response = await apiClient.put<ApiResponse<{ success: boolean }>>("/notifications/read-all/", {})
    return response.data
  },

  // Notification preferences
  getPreferences: async () => {
    const response =
      await apiClient.get<
        ApiResponse<{
          email: boolean
          push: boolean
          sms: boolean
        }>
      >("/notifications/preferences/")
    return response.data
  },

  updatePreferences: async (preferences: {
    email?: boolean
    push?: boolean
    sms?: boolean
  }) => {
    const response = await apiClient.put<ApiResponse<{ success: boolean }>>("/notifications/preferences/", preferences)
    return response.data
  },
}

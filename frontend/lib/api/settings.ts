import apiClient from "./client"
import type { ApiResponse } from "./client"
import { z } from "zod"
import { toast } from "sonner"

// Validation schemas
const userSettingsSchema = z.object({
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  two_factor_auth: z.boolean(),
  dark_mode: z.boolean(),
  language: z.string().min(2).max(5)
})

const passwordChangeSchema = z.object({
  old_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(8, "Password must be at least 8 characters long"),
  confirm_password: z.string().min(1, "Please confirm your new password")
}).refine((data) => data.new_password === data.confirm_password, {
  message: "New passwords do not match",
  path: ["confirm_password"]
})

export interface UserSettings extends z.infer<typeof userSettingsSchema> {}
export interface PasswordChangeData extends z.infer<typeof passwordChangeSchema> {}

export const settingsApi = {
  getUserSettings: async (): Promise<ApiResponse<UserSettings>> => {
    try {
      const response = await apiClient.get("/core/settings/user/me/")
      if (response.data.status === "error") {
        const errorMessage = response.data.message || "Failed to fetch user settings"
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch user settings"
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  },

  updateUserSettings: async (settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> => {
    try {
      // Validate the settings before sending
      userSettingsSchema.partial().parse(settings)
      
      const response = await apiClient.patch("/core/settings/user/me/", settings)
      if (response.data.status === "error") {
        const errorMessage = response.data.message || "Failed to update user settings"
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
      const successMessage = response.data.message || "User settings updated successfully"
      toast.success(successMessage)
      return response.data
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || "Invalid settings data"
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
      const errorMessage = error.response?.data?.message || error.message || "Failed to update user settings"
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  },

  changePassword: async (data: PasswordChangeData): Promise<ApiResponse<void>> => {
    try {
      // Validate the password data
      passwordChangeSchema.parse(data)
      
      const response = await apiClient.post("/core/settings/user/change-password/", data)
      if (response.data.status === "error") {
        const errorMessage = response.data.message || "Failed to update password"
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
      const successMessage = response.data.message || "Password updated successfully"
      toast.success(successMessage)
      return response.data
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || "Invalid password data"
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }
      const errorMessage = error.response?.data?.message || error.message || "Failed to update password"
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }
} 
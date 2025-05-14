import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { Achievement } from "@/lib/types"
import { mockAchievements } from "@/lib/mock-data/achievements"
import { isMockEnabled } from "@/lib/utils/config"

export const achievementsApi = {
  getAchievements: async (): Promise<ApiResponse<Achievement[]>> => {
    if (isMockEnabled()) {
      return {
        status: "success",
        data: mockAchievements,
        message: "Achievements retrieved successfully",
      }
    }

    const response = await apiClient.get<ApiResponse<Achievement[]>>("/achievements/")
    return response.data
  },

  getUserAchievements: async (userId: string): Promise<ApiResponse<Achievement[]>> => {
    if (isMockEnabled()) {
      // For mock data, just return a subset of achievements as "unlocked"
      const unlockedAchievements = mockAchievements.filter((_, index) => index < 2)
      return {
        status: "success",
        data: unlockedAchievements,
        message: "User achievements retrieved successfully",
      }
    }

    const response = await apiClient.get<ApiResponse<Achievement[]>>(`/users/${userId}/achievements/`)
    return response.data
  },
}

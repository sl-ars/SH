import apiClient from "./client"
import type { ApiResponse } from "./client"
import type { GamificationProgress } from "@/lib/types"
import { isMockEnabled } from "@/lib/utils/config"

// Mock data for gamification
const mockGamificationProgress: GamificationProgress = {
  level: 3,
  currentPoints: 2450,
  pointsToNextLevel: 3000,
  totalPoints: 2450,
  recentActivity: [
    {
      type: "application",
      description: "Applied to Software Engineer Intern at TechCorp Inc.",
      date: "2 days ago",
      points: 50,
    },
    {
      type: "profile",
      description: "Updated your resume",
      date: "3 days ago",
      points: 25,
    },
    {
      type: "interview",
      description: "Completed mock interview",
      date: "1 week ago",
      points: 100,
    },
    {
      type: "application",
      description: "Applied to Data Analyst at DataDrive",
      date: "1 week ago",
      points: 50,
    },
  ],
  achievements: [
    {
      id: "1",
      title: "Profile Perfectionist",
      description: "Complete your profile to 100%",
      unlockedAt: "2023-12-15T10:30:00Z",
    },
    {
      id: "2",
      title: "Application Master",
      description: "Submit 10 job applications",
      unlockedAt: "2024-01-20T14:45:00Z",
    },
    {
      id: "3",
      title: "Interview Ready",
      description: "Complete 5 mock interviews",
      unlockedAt: null,
    },
    {
      id: "4",
      title: "Networking Pro",
      description: "Connect with 20 employers",
      unlockedAt: null,
    },
  ],
}

export const gamificationApi = {
  getUserProgress: async (userId: string): Promise<ApiResponse<GamificationProgress>> => {
    if (isMockEnabled()) {
      // Mock implementation
      return {
        status: "success",
        data: mockGamificationProgress,
        message: "Gamification progress retrieved successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.get<ApiResponse<GamificationProgress>>(`/users/${userId}/gamification/`)
    return response.data
  },

  awardPoints: async (
    userId: string,
    activityType: string,
    points: number,
    description: string,
  ): Promise<ApiResponse<{ success: boolean }>> => {
    if (isMockEnabled()) {
      // Mock implementation
      return {
        status: "success",
        data: { success: true },
        message: "Points awarded successfully",
      }
    }

    // Real API implementation
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      `/users/${userId}/gamification/award-points/`,
      {
        activityType,
        points,
        description,
      },
    )
    return response.data
  },
}

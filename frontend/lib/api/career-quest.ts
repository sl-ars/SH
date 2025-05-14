import apiClient from "./client"
import type { ApiResponse } from "./client"
import type {
  Quest,
  QuestProgress,
  GamificationStats,
  Achievement,
  CareerActivity,
  LeaderboardEntry,
  CareerStats,
} from "../types/career-quest"
import { mockCareerQuest } from "../mock-data/career-quest"
import { isMockEnabled } from "../utils/config"

export const careerQuestApi = {
  // Quests
  getQuests: async () => {
    if (isMockEnabled()) {
      return {
        success: true,
        data: mockCareerQuest.quests,
        message: "Quests retrieved successfully",
      }
    }

    const response = await apiClient.get<ApiResponse<Quest[]>>("/career-quest/quests/")
    return response.data
  },

  getQuestProgress: async (questId: string) => {
    if (isMockEnabled()) {
      const progress = mockCareerQuest.questProgress[questId]
      return {
        success: true,
        data: progress || {
          quest_id: questId,
          progress: 0,
          total: mockCareerQuest.quests.find((q) => q.id === questId)?.requirements[0]?.value || 1,
          completed: false,
        },
        message: "Quest progress retrieved successfully",
      }
    }

    const response = await apiClient.get<ApiResponse<QuestProgress>>(`/career-quest/quests/${questId}/progress/`)
    return response.data
  },

  startQuest: async (questId: string) => {
    if (isMockEnabled()) {
      // In mock mode, we'll simulate starting a quest by updating our mock data
      if (!mockCareerQuest.questProgress[questId]) {
        mockCareerQuest.questProgress[questId] = {
          quest_id: questId,
          progress: 0,
          total: mockCareerQuest.quests.find((q) => q.id === questId)?.requirements[0]?.value || 1,
          completed: false,
          started_at: new Date().toISOString(),
        }
      } else if (!mockCareerQuest.questProgress[questId].started_at) {
        mockCareerQuest.questProgress[questId].started_at = new Date().toISOString()
      }

      return {
        success: true,
        data: { success: true },
        message: "Quest started successfully",
      }
    }

    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      `/career-quest/quests/${questId}/start/`,
      {},
    )
    return response.data
  },

  updateQuestProgress: async (questId: string, progress: number) => {
    if (isMockEnabled()) {
      // In mock mode, we'll simulate updating quest progress
      if (mockCareerQuest.questProgress[questId]) {
        const quest = mockCareerQuest.quests.find((q) => q.id === questId)
        const requirement = quest?.requirements[0]
        const total = requirement?.value || 1

        mockCareerQuest.questProgress[questId].progress = progress
        const completed = progress >= total

        if (completed && !mockCareerQuest.questProgress[questId].completed) {
          mockCareerQuest.questProgress[questId].completed = true
          mockCareerQuest.questProgress[questId].completed_at = new Date().toISOString()

          // Also update the quest itself
          const questIndex = mockCareerQuest.quests.findIndex((q) => q.id === questId)
          if (questIndex !== -1) {
            mockCareerQuest.quests[questIndex].completed = true
          }

          // Add points to user's progress
          if (quest) {
            mockCareerQuest.progress.points += quest.points

            // Check if user leveled up
            if (mockCareerQuest.progress.points >= mockCareerQuest.progress.next_level_points) {
              mockCareerQuest.progress.level += 1
              mockCareerQuest.progress.next_level_points = Math.floor(mockCareerQuest.progress.next_level_points * 1.5)
            }
          }
        }

        return {
          success: true,
          data: {
            success: true,
            completed,
          },
          message: "Quest progress updated successfully",
        }
      }

      return {
        success: false,
        data: {
          success: false,
          completed: false,
        },
        message: "Quest not found",
      }
    }

    const response = await apiClient.post<ApiResponse<{ success: boolean; completed: boolean }>>(
      `/career-quest/quests/${questId}/progress/`,
      { progress },
    )
    return response.data
  },

  completeQuest: async (questId: string) => {
    if (isMockEnabled()) {
      // In mock mode, we'll simulate completing a quest
      const quest = mockCareerQuest.quests.find((q) => q.id === questId)
      if (quest) {
        quest.completed = true

        if (mockCareerQuest.questProgress[questId]) {
          const requirement = quest.requirements[0]
          mockCareerQuest.questProgress[questId].progress = requirement.value
          mockCareerQuest.questProgress[questId].completed = true
          mockCareerQuest.questProgress[questId].completed_at = new Date().toISOString()
        }

        return {
          success: true,
          data: {
            success: true,
            points: quest.points,
          },
          message: "Quest completed successfully",
        }
      }

      return {
        success: false,
        data: {
          success: false,
          points: 0,
        },
        message: "Quest not found",
      }
    }

    const response = await apiClient.post<ApiResponse<{ success: boolean; points: number }>>(
      `/career-quest/quests/${questId}/complete/`,
      {},
    )
    return response.data
  },

  // Achievements
  getAchievements: async () => {
    if (isMockEnabled()) {
      return {
        success: true,
        data: mockCareerQuest.achievements,
        message: "Achievements retrieved successfully",
      }
    }

    const response = await apiClient.get<ApiResponse<Achievement[]>>("/career-quest/achievements/")
    return response.data
  },

  // User progress
  getUserProgress: async () => {
    if (isMockEnabled()) {
      return {
        success: true,
        data: mockCareerQuest.progress,
        message: "User progress retrieved successfully",
      }
    }

    const response = await apiClient.get<ApiResponse<GamificationStats>>("/career-quest/progress/")
    return response.data
  },

  // Career stats
  getCareerStats: async () => {
    if (isMockEnabled()) {
      return {
        success: true,
        data: mockCareerQuest.careerStats,
        message: "Career stats retrieved successfully",
      }
    }

    const response = await apiClient.get<ApiResponse<CareerStats>>("/career-quest/stats/")
    return response.data
  },

  // Activity
  getRecentActivity: async (limit = 5) => {
    if (isMockEnabled()) {
      return {
        success: true,
        data: mockCareerQuest.recentActivity.slice(0, limit),
        message: "Recent activity retrieved successfully",
      }
    }

    const response = await apiClient.get<ApiResponse<CareerActivity[]>>("/career-quest/activity/", {
      params: { limit },
    })
    return response.data
  },

  // Leaderboard
  getLeaderboard: async (limit = 10) => {
    if (isMockEnabled()) {
      return {
        success: true,
        data: mockCareerQuest.leaderboard.slice(0, limit),
        message: "Leaderboard retrieved successfully",
      }
    }

    const response = await apiClient.get<ApiResponse<LeaderboardEntry[]>>("/career-quest/leaderboard/", {
      params: { limit },
    })
    return response.data
  },
}

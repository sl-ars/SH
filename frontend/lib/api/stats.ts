import { isMockEnabled } from "@/lib/utils/config"

// Define the stats data structure
export interface PlatformStats {
  students: {
    total: number
    active: number
    new: number
  }
  companies: {
    total: number
    active: number
    new: number
  }
  placements: {
    total: number
    thisMonth: number
    thisYear: number
  }
  successRate: {
    percentage: number
    improvement: number
  }
}

// Stats API service
export const statsApi = {
  getPlatformStats: async (): Promise<{ data: PlatformStats }> => {
    // If mock mode is enabled, return mock data
    if (isMockEnabled()) {
      console.log("Using mock stats data")
      return {
        data: {
          students: {
            total: 10000,
            active: 8500,
            new: 350,
          },
          companies: {
            total: 500,
            active: 450,
            new: 25,
          },
          placements: {
            total: 2000,
            thisMonth: 120,
            thisYear: 850,
          },
          successRate: {
            percentage: 95,
            improvement: 5,
          },
        },
      }
    }

    // In a real app, this would be an API call
    try {
      // For now, we'll simulate an API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Return simulated real data
      return {
        data: {
          students: {
            total: 10523,
            active: 8742,
            new: 387,
          },
          companies: {
            total: 532,
            active: 478,
            new: 31,
          },
          placements: {
            total: 2156,
            thisMonth: 134,
            thisYear: 912,
          },
          successRate: {
            percentage: 96,
            improvement: 6,
          },
        },
      }
    } catch (error) {
      console.error("Error fetching platform stats:", error)
      throw error
    }
  },
}

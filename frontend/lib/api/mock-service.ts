import type { AxiosRequestConfig } from "axios"
import { mockUsers } from "@/lib/mock-data/users"
import { mockCompanies } from "@/lib/mock-data/companies"
import { mockApplications } from "@/lib/mock-data/applications"
import { mockJobs } from "@/lib/mock-data/jobs"
import { mockResources } from "@/lib/mock-data/resources"
import { mockAchievements } from "@/lib/mock-data/achievements"
import { mockCareerQuest } from "@/lib/mock-data/career-quest"

const mockService = {
  get: (url: string, config?: AxiosRequestConfig) => {
    const mockResponse = getMockResponse({ url, method: "get", ...config })
    return Promise.resolve({ data: mockResponse })
  },
  post: (url: string, data?: any, config?: AxiosRequestConfig) => {
    const mockResponse = getMockResponse({ url, method: "post", data, ...config })
    return Promise.resolve({ data: mockResponse })
  },
  put: (url: string, data?: any, config?: AxiosRequestConfig) => {
    const mockResponse = getMockResponse({ url, method: "put", data, ...config })
    return Promise.resolve({ data: mockResponse })
  },
  delete: (url: string, config?: AxiosRequestConfig) => {
    const mockResponse = getMockResponse({ url, method: "delete", ...config })
    return Promise.resolve({ data: mockResponse })
  },
}

const apiClient = {
  get: (url: string, config?: AxiosRequestConfig) => mockService.get(url, config),
  post: (url: string, data?: any, config?: AxiosRequestConfig) => mockService.post(url, data, config),
  put: (url: string, data?: any, config?: AxiosRequestConfig) => mockService.put(url, data, config),
  delete: (url: string, config?: AxiosRequestConfig) => mockService.delete(url, config),
}

// Helper function to get mock data based on the request
export function getMockResponse(config: AxiosRequestConfig): any {
  const { url, method, data } = config

  // Default response structure
  const defaultResponse = {
    status: "success",
    message: "Operation successful",
    data: null,
  }

  // Parse the URL to determine what data to return
  if (!url) return defaultResponse

  // Users endpoints
  if (url.includes("/users")) {
    if (url.includes("/me")) {
      return {
        ...defaultResponse,
        data: mockUsers[0],
      }
    }

    if (url.includes("/saved-jobs")) {
      return {
        ...defaultResponse,
        data: {
          jobs: ["job-1", "job-2", "job-3"],
        },
      }
    }

    return {
      ...defaultResponse,
      data: mockUsers,
    }
  }

  // Companies endpoints
  if (url.includes("/companies")) {
    const companyId = url.match(/\/companies\/([^/]+)/)?.[1]

    if (companyId) {
      const company = mockCompanies.find((c) => c.id === companyId)
      return {
        ...defaultResponse,
        data: company || null,
        message: company ? "Company found" : "Company not found",
      }
    }

    return {
      ...defaultResponse,
      data: {
        results: mockCompanies,
        count: mockCompanies.length,
        next: null,
        previous: null,
      },
    }
  }

  // Jobs endpoints
  if (url.includes("/jobs")) {
    const jobId = url.match(/\/jobs\/([^/]+)/)?.[1]

    if (url.includes("/employer/jobs")) {
      if (method === "post") {
        // Generate a new job ID
        const newJobId = `job-${mockJobs.length + 1}`
        const newJob = {
          id: newJobId,
          ...data,
          postedDate: new Date().toISOString(),
          status: "active",
          views: 0,
          applications: 0,
        }
        mockJobs.push(newJob)
        return {
          ...defaultResponse,
          data: newJob,
          message: "Job created successfully",
        }
      }

      return {
        ...defaultResponse,
        data: mockJobs.filter(job => job.companyId === "current-company"),
      }
    }

    if (jobId) {
      const job = mockJobs.find((j) => j.id === jobId)
      return {
        ...defaultResponse,
        data: job || null,
        message: job ? "Job found" : "Job not found",
      }
    }

    return {
      ...defaultResponse,
      data: {
        results: mockJobs,
        count: mockJobs.length,
        next: null,
        previous: null,
      },
    }
  }

  // Applications endpoints
  if (url.includes("/applications")) {
    const applicationId = url.match(/\/applications\/([^/]+)/)?.[1]

    if (applicationId) {
      const application = mockApplications.find((a) => a.id === applicationId)
      return {
        ...defaultResponse,
        data: application || null,
        message: application ? "Application found" : "Application not found",
      }
    }

    return {
      ...defaultResponse,
      data: {
        results: mockApplications,
        count: mockApplications.length,
        next: null,
        previous: null,
      },
    }
  }

  // Resources endpoints
  if (url.includes("/resources")) {
    const resourceId = url.match(/\/resources\/([^/]+)/)?.[1]

    if (resourceId) {
      const resource = mockResources.find((r) => r.id === resourceId)
      return {
        ...defaultResponse,
        data: resource || null,
        message: resource ? "Resource found" : "Resource not found",
      }
    }

    return {
      ...defaultResponse,
      data: {
        results: mockResources,
        count: mockResources.length,
        next: null,
        previous: null,
      },
    }
  }

  // Career Quest endpoints
  if (url.includes("/career-quest")) {
    if (url.includes("/achievements")) {
      return {
        ...defaultResponse,
        data: mockAchievements,
      }
    }

    if (url.includes("/progress")) {
      return {
        ...defaultResponse,
        data: {
          level: 3,
          points: 750,
          next_level_points: 1000,
          achievements_unlocked: 5,
          total_achievements: 20,
        },
      }
    }

    if (url.includes("/activity")) {
      return {
        ...defaultResponse,
        data: mockCareerQuest.recentActivity,
      }
    }

    if (url.includes("/leaderboard")) {
      return {
        ...defaultResponse,
        data: mockCareerQuest.leaderboard,
      }
    }

    if (url.includes("/quests")) {
      return {
        ...defaultResponse,
        data: mockCareerQuest.quests,
      }
    }
  }

  // Notifications endpoints
  if (url.includes("/notifications")) {
    if (url.includes("/preferences")) {
      return {
        ...defaultResponse,
        data: {
          email: true,
          push: true,
          sms: false,
        },
      }
    }

    return {
      ...defaultResponse,
      data: {
        results: [
          {
            id: "notif-1",
            title: "New job match",
            message: "We found a new job that matches your profile",
            read: false,
            createdAt: new Date().toISOString(),
            type: "job_match",
          },
          {
            id: "notif-2",
            title: "Application update",
            message: "Your application for Software Engineer at Google has been viewed",
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            type: "application_update",
          },
        ],
        count: 2,
        next: null,
        previous: null,
      },
    }
  }

  // Default fallback
  return defaultResponse
}

export { mockService, apiClient }

"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { platformStats } from "@/lib/mock-data/homepage"
import { statsApi } from "@/lib/api/stats"

export function PlatformStatsComponent() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Fetch from API
        const response = await statsApi.getPlatformStats()

        if (!response || !response.data) {
          throw new Error("Invalid stats data received")
        }

        setStats(response.data)
      } catch (err) {
        console.error("Error fetching platform stats:", err)
        setError("Failed to load platform statistics")
        // Fallback to mock data from the homepage
        setStats({
          students: { total: 10000 },
          companies: { total: 500 },
          placements: { total: 2000 },
          successRate: { percentage: 95 },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <div className="text-center bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 transform transition-all hover:bg-white/20 dark:hover:bg-white/10 shadow-sm">
        <div className="flex justify-center mb-3">
          {platformStats[0].icon && React.createElement(platformStats[0].icon, { className: "w-8 h-8 text-white" })}
        </div>
        <div className="text-2xl md:text-3xl font-bold text-white mb-1">
          {loading ? (
            <Skeleton className="h-8 w-24 bg-white/20" />
          ) : (
            `${stats?.students?.total?.toLocaleString() || "10,000"}+`
          )}
        </div>
        <div className="text-sm md:text-base text-white/80">Active Students</div>
      </div>

      <div className="text-center bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 transform transition-all hover:bg-white/20 dark:hover:bg-white/10 shadow-sm">
        <div className="flex justify-center mb-3">
          {platformStats[1].icon && React.createElement(platformStats[1].icon, { className: "w-8 h-8 text-white" })}
        </div>
        <div className="text-2xl md:text-3xl font-bold text-white mb-1">
          {loading ? (
            <Skeleton className="h-8 w-24 bg-white/20" />
          ) : (
            `${stats?.companies?.total?.toLocaleString() || "500"}+`
          )}
        </div>
        <div className="text-sm md:text-base text-white/80">Partner Companies</div>
      </div>

      <div className="text-center bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 transform transition-all hover:bg-white/20 dark:hover:bg-white/10 shadow-sm">
        <div className="flex justify-center mb-3">
          {platformStats[2].icon && React.createElement(platformStats[2].icon, { className: "w-8 h-8 text-white" })}
        </div>
        <div className="text-2xl md:text-3xl font-bold text-white mb-1">
          {loading ? (
            <Skeleton className="h-8 w-24 bg-white/20" />
          ) : (
            `${stats?.placements?.total?.toLocaleString() || "2,000"}+`
          )}
        </div>
        <div className="text-sm md:text-base text-white/80">Job Placements</div>
      </div>

      <div className="text-center bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 transform transition-all hover:bg-white/20 dark:hover:bg-white/10 shadow-sm">
        <div className="flex justify-center mb-3">
          {platformStats[3].icon && React.createElement(platformStats[3].icon, { className: "w-8 h-8 text-white" })}
        </div>
        <div className="text-2xl md:text-3xl font-bold text-white mb-1">
          {loading ? <Skeleton className="h-8 w-24 bg-white/20" /> : `${stats?.successRate?.percentage || "95"}%`}
        </div>
        <div className="text-sm md:text-base text-white/80">Success Rate</div>
      </div>
    </div>
  )
}

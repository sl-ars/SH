"use client"

import { Trophy, User, Send, Video, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Achievement } from "@/lib/types"
import { achievementsApi } from "@/lib/api/achievements"
import { useState, useEffect } from "react"
import { isMockEnabled } from "@/lib/utils/config"
import { mockAchievements } from "@/lib/mock-data/achievements"

export function AchievementsCard({ userAchievements }: { userAchievements: Achievement[] }) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        if (isMockEnabled()) {
          // Use mock data
          setAchievements(mockAchievements)
        } else {
          // Use real API
          const response = await achievementsApi.getAchievements()
          if (response.status === "success" && response.data) {
            setAchievements(response.data)
          }
        }
      } catch (error) {
        console.error("Error fetching achievements:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [])

  const totalPoints = userAchievements.reduce((sum, a) => sum + a.points, 0)
  const level = Math.floor(totalPoints / 1000) + 1
  const progress = (totalPoints % 1000) / 10 // Convert to percentage

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Level {level}</span>
            <span className="text-sm text-muted-foreground">{totalPoints} points</span>
          </div>
          <Progress value={progress} className="mt-2" />
        </div>
        <div className="grid gap-4">
          {loading
            ? // Loading skeleton
              [...Array(4)].map((_, index) => (
                <div key={index} className="flex items-start gap-4 rounded-lg border p-4 animate-pulse">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 p-2 h-8 w-8"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                </div>
              ))
            : achievements.map((achievement) => {
                const isUnlocked = userAchievements.some((a) => a.id === achievement.id)
                return (
                  <div
                    key={achievement.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 ${isUnlocked ? "bg-primary/5" : "opacity-50"}`}
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      {achievement.icon === "user" && <User className="h-4 w-4 text-primary" />}
                      {achievement.icon === "send" && <Send className="h-4 w-4 text-primary" />}
                      {achievement.icon === "video" && <Video className="h-4 w-4 text-primary" />}
                      {achievement.icon === "users" && <Users className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{achievement.points} pts</div>
                  </div>
                )
              })}
        </div>
      </CardContent>
    </Card>
  )
}

// Add a simplified version that accepts a limit prop
export function Achievements({ limit }: { limit?: number }) {
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserAchievements = async () => {
      try {
        if (isMockEnabled()) {
          // Use mock data - just take a few random achievements as "unlocked"
          const unlocked = mockAchievements
            .slice(0, 5)
            .map((achievement) => ({ ...achievement, unlockedAt: new Date().toISOString() }))
          setUserAchievements(unlocked)
        } else {
          // Use real API
          const response = await achievementsApi.getUserAchievements()
          if (response.status === "success" && response.data) {
            setUserAchievements(response.data)
          }
        }
      } catch (error) {
        console.error("Error fetching user achievements:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAchievements()
  }, [])

  return <AchievementsCard userAchievements={userAchievements.slice(0, limit || userAchievements.length)} />
}

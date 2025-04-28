"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { gamificationApi } from "@/lib/api/gamification"
import { achievementsApi } from "@/lib/api/achievements"

interface GamificationDashboardProps {
  userId?: string
}

export function GamificationDashboard({ userId }: GamificationDashboardProps) {
  const [stats, setStats] = useState<any>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch gamification stats
        const statsResponse = await gamificationApi.getUserStats(userId)
        setStats(statsResponse.data)

        // Fetch achievements
        const achievementsResponse = await achievementsApi.getUserAchievements(userId)
        setAchievements(achievementsResponse.data || [])
      } catch (error) {
        console.error("Error fetching gamification data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (loading) {
    return <div>Loading gamification data...</div>
  }

  if (!stats) {
    return <div>No gamification data available</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Career Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="progress">
          <TabsList className="mb-4">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Career Level: {stats.level}</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.xp}/{stats.nextLevelXp} XP
                  </span>
                </div>
                <Progress value={(stats.xp / stats.nextLevelXp) * 100} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.applicationsSubmitted}</div>
                  <div className="text-sm text-muted-foreground">Applications</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold">{stats.interviewsCompleted}</div>
                  <div className="text-sm text-muted-foreground">Interviews</div>
                </div>
              </div>

              <Button className="w-full">View Career Path</Button>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="space-y-4">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-4 border rounded-lg p-4">
                    <div className={`p-2 rounded-full ${achievement.unlocked ? "bg-green-100" : "bg-gray-100"}`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-6 w-6 ${achievement.unlocked ? "text-green-600" : "text-gray-400"}`}
                      >
                        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11" />
                        <path d="M15 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{achievement.name}</div>
                      <div className="text-sm text-muted-foreground">{achievement.description}</div>
                    </div>
                    {achievement.unlocked ? (
                      <Badge className="bg-green-100 text-green-800">Unlocked</Badge>
                    ) : (
                      <Badge variant="outline">Locked</Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No achievements yet. Start applying to jobs to earn achievements!
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="challenges">
            <div className="space-y-4">
              {stats.challenges?.map((challenge: any) => (
                <div key={challenge.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{challenge.name}</div>
                    <Badge variant="outline">{challenge.xpReward} XP</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">{challenge.description}</div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      Progress: {challenge.progress}/{challenge.target}
                    </div>
                    <Progress value={(challenge.progress / challenge.target) * 100} className="w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

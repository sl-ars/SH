"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Target, Award, TrendingUp, Book, Briefcase, GraduationCap, Users, Clock } from "lucide-react"
import Link from "next/link"
import { careerQuestApi } from "@/lib/api/career-quest"
import { useToast } from "@/components/ui/use-toast"
import type { QuestWithIcon, UserQuestProgress, AchievementWithIcon, CareerStats } from "@/lib/types/career-quest"

export default function CareerQuestPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [level, setLevel] = useState(1)
  const [experience, setExperience] = useState(0)
  const [nextLevelExp, setNextLevelExp] = useState(100)
  const [quests, setQuests] = useState<QuestWithIcon[]>([])
  const [questProgress, setQuestProgress] = useState<Record<string, UserQuestProgress>>({})
  const [achievements, setAchievements] = useState<AchievementWithIcon[]>([])
  const [careerStats, setCareerStats] = useState<CareerStats>({
    jobs_applied: 0,
    interviews_completed: 0,
    skills_mastered: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [careerPathProgress, setCareerPathProgress] = useState(0)
  const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({})

  // Calculate progress percentage
  const progressPercentage = (experience / nextLevelExp) * 100

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      // Clear all intervals when component unmounts
      Object.values(intervalRefs.current).forEach((interval) => {
        clearInterval(interval)
      })
    }
  }, [])

  // Fetch user's career quest data
  useEffect(() => {
    const fetchCareerQuestData = async () => {
      setIsLoading(true)
      try {
        // Fetch user progress
        const userProgressResponse = await careerQuestApi.getUserProgress()
        if (userProgressResponse.success) {
          const progressData = userProgressResponse.data
          setLevel(progressData.level)
          setExperience(progressData.points)
          setNextLevelExp(progressData.next_level_points)
          if (progressData.career_path_progress) {
            setCareerPathProgress(progressData.career_path_progress)
          }
        }

        // Fetch career stats
        const careerStatsResponse = await careerQuestApi.getCareerStats()
        if (careerStatsResponse.success) {
          setCareerStats(careerStatsResponse.data)
        }

        // Fetch quests
        const questsResponse = await careerQuestApi.getQuests()
        if (questsResponse.success) {
          const questsData = questsResponse.data

          // Transform API quests to our format with icons
          const transformedQuests = questsData.map((quest) => ({
            ...quest,
            icon: getQuestIcon(quest.title),
          }))

          setQuests(transformedQuests)

          // Initialize quest progress
          const initialProgress: Record<string, UserQuestProgress> = {}
          for (const quest of questsData) {
            const progressResponse = await careerQuestApi.getQuestProgress(quest.id)
            if (progressResponse.success) {
              const progress = progressResponse.data
              initialProgress[quest.id] = {
                questId: quest.id,
                currentValue: progress.progress,
                targetValue: progress.total,
                isStarted: !!progress.started_at || progress.progress > 0,
                isCompleted: progress.completed,
                startedAt: progress.started_at,
                completedAt: progress.completed_at,
              }

              // If quest is in progress but not completed, start simulation
              if (initialProgress[quest.id].isStarted && !initialProgress[quest.id].isCompleted) {
                startQuestProgressSimulation(quest.id, initialProgress[quest.id])
              }
            }
          }
          setQuestProgress(initialProgress)
        }

        // Fetch achievements
        const achievementsResponse = await careerQuestApi.getAchievements()
        if (achievementsResponse.success) {
          setAchievements(
            achievementsResponse.data.map((achievement) => ({
              ...achievement,
              icon: getAchievementIcon(achievement.title),
            })),
          )
        }
      } catch (error) {
        console.error("Error fetching career quest data:", error)
        toast({
          title: "Error",
          description: "Failed to load career quest data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCareerQuestData()
  }, [toast])

  // Function to handle starting a quest
  const handleStartQuest = async (questId: string) => {
    try {
      // Update local state first for immediate feedback
      setQuestProgress((prev) => ({
        ...prev,
        [questId]: {
          ...prev[questId],
          isStarted: true,
          startedAt: new Date().toISOString(),
        },
      }))

      // Show toast notification
      toast({
        title: "Quest Started",
        description: `You've started a new quest: ${quests.find((q) => q.id === questId)?.title}`,
        variant: "default",
      })

      // Call API to start quest
      const response = await careerQuestApi.startQuest(questId)
      if (!response.success) {
        throw new Error("Failed to start quest")
      }

      // Start quest progress simulation
      const currentProgress = questProgress[questId]
      startQuestProgressSimulation(questId, currentProgress)
    } catch (error) {
      console.error("Error starting quest:", error)
      toast({
        title: "Error",
        description: "Failed to start quest. Please try again.",
        variant: "destructive",
      })

      // Revert the state change if there was an error
      setQuestProgress((prev) => ({
        ...prev,
        [questId]: {
          ...prev[questId],
          isStarted: false,
          startedAt: undefined,
        },
      }))
    }
  }

  // Function to simulate quest progress over time
  const startQuestProgressSimulation = (questId: string, currentProgress?: UserQuestProgress) => {
    const quest = quests.find((q) => q.id === questId)
    if (!quest) return

    const progress = currentProgress || questProgress[questId]
    if (!progress || progress.isCompleted) return

    // Clear any existing interval for this quest
    if (intervalRefs.current[questId]) {
      clearInterval(intervalRefs.current[questId])
    }

    // For demo purposes, we'll simulate progress by updating every few seconds
    intervalRefs.current[questId] = setInterval(async () => {
      // Get the latest progress
      const latestProgress = questProgress[questId]
      if (!latestProgress || latestProgress.isCompleted) {
        clearInterval(intervalRefs.current[questId])
        return
      }

      // Calculate new progress value
      const newValue = Math.min(latestProgress.currentValue + 1, latestProgress.targetValue)
      const isCompleted = newValue >= latestProgress.targetValue

      // Update local state
      setQuestProgress((prev) => ({
        ...prev,
        [questId]: {
          ...prev[questId],
          currentValue: newValue,
          isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : undefined,
        },
      }))

      // Update API
      try {
        const updateResponse = await careerQuestApi.updateQuestProgress(questId, newValue)

        // If quest is completed, show a toast and clear the interval
        if (isCompleted && !latestProgress.isCompleted) {
          clearInterval(intervalRefs.current[questId])

          // Call complete quest API
          const completeResponse = await careerQuestApi.completeQuest(questId)
          if (completeResponse.success) {
            const pointsEarned = completeResponse.data.points

            // Add experience points
            setExperience((exp) => {
              const newExp = exp + pointsEarned
              return newExp
            })

            // Fetch updated user progress to check for level up
            const userProgressResponse = await careerQuestApi.getUserProgress()
            if (userProgressResponse.success) {
              const progressData = userProgressResponse.data

              // Check if user leveled up
              if (progressData.level > level) {
                setLevel(progressData.level)
                setNextLevelExp(progressData.next_level_points)

                toast({
                  title: "Level Up!",
                  description: `Congratulations! You've reached level ${progressData.level}!`,
                  variant: "default",
                })
              } else {
                // Just update the experience and next level threshold
                setExperience(progressData.points)
                setNextLevelExp(progressData.next_level_points)
              }
            }

            toast({
              title: "Quest Completed!",
              description: `You've completed the quest: ${quest.title} and earned ${pointsEarned} XP!`,
              variant: "default",
            })

            // Update quest in the quests array
            setQuests((prev) => prev.map((q) => (q.id === questId ? { ...q, completed: true } : q)))

            // Refresh career stats
            const careerStatsResponse = await careerQuestApi.getCareerStats()
            if (careerStatsResponse.success) {
              setCareerStats(careerStatsResponse.data)
            }
          }
        }
      } catch (error) {
        console.error("Error updating quest progress:", error)
      }
    }, 3000) // Update every 3 seconds
  }

  // Helper function to get icon component based on quest title
  function getQuestIcon(title: string) {
    if (title.toLowerCase().includes("profile")) return Book
    if (title.toLowerCase().includes("job") || title.toLowerCase().includes("apply")) return Briefcase
    if (title.toLowerCase().includes("network") || title.toLowerCase().includes("event")) return Users
    if (title.toLowerCase().includes("skill") || title.toLowerCase().includes("assessment")) return GraduationCap
    return Target // Default icon
  }

  // Helper function to get icon component based on achievement title
  function getAchievementIcon(title: string) {
    if (title.toLowerCase().includes("profile")) return Trophy
    if (title.toLowerCase().includes("job") || title.toLowerCase().includes("extraordinaire")) return Star
    if (title.toLowerCase().includes("interview") || title.toLowerCase().includes("ace")) return Target
    if (title.toLowerCase().includes("network") || title.toLowerCase().includes("guru")) return Award
    return Trophy // Default icon
  }

  // Helper function to render quest status
  const renderQuestStatus = (quest: QuestWithIcon) => {
    const progress = questProgress[quest.id]

    if (!progress) {
      return (
        <Button variant="outline" size="sm" onClick={() => handleStartQuest(quest.id)}>
          Start Quest
        </Button>
      )
    }

    if (progress.isCompleted) {
      return <Badge variant="success">Completed</Badge>
    }

    if (progress.isStarted) {
      return (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">In Progress</span>
          </div>
          <Progress value={(progress.currentValue / progress.targetValue) * 100} className="h-2 w-24" />
          <span className="text-xs text-muted-foreground">
            {progress.currentValue}/{progress.targetValue}
          </span>
        </div>
      )
    }

    return (
      <Button variant="outline" size="sm" onClick={() => handleStartQuest(quest.id)}>
        Start Quest
      </Button>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
        Career Quest
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Progress */}
        <Card className="md:col-span-1 border-none shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-vibrant-blue to-vibrant-purple w-full"></div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-2xl">Level {level}</span>
              <Trophy className="w-6 h-6 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-2 mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              {experience} / {nextLevelExp} XP to next level
            </p>
            <div className="space-y-2">
              <p className="font-semibold">Career Stats:</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">Jobs Applied</span>
                <Badge variant="secondary">{careerStats.jobs_applied}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Interviews Completed</span>
                <Badge variant="secondary">{careerStats.interviews_completed}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Skills Mastered</span>
                <Badge variant="secondary">{careerStats.skills_mastered}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quests */}
        <Card className="md:col-span-2 border-none shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-vibrant-green to-vibrant-blue w-full"></div>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-6 h-6 mr-2 text-vibrant-green" />
              Active Quests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading
                ? // Loading state
                  Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg animate-pulse"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 mr-4 bg-muted-foreground/20 rounded-full"></div>
                          <div>
                            <div className="h-4 w-32 bg-muted-foreground/20 rounded mb-2"></div>
                            <div className="h-3 w-24 bg-muted-foreground/20 rounded"></div>
                          </div>
                        </div>
                        <div className="h-8 w-24 bg-muted-foreground/20 rounded"></div>
                      </div>
                    ))
                : quests.map((quest, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center">
                        <quest.icon className="w-8 h-8 mr-4 text-vibrant-blue" />
                        <div>
                          <h3 className="font-semibold">{quest.title}</h3>
                          <p className="text-sm text-muted-foreground">Reward: {quest.points} XP</p>
                          {quest.description && (
                            <p className="text-xs text-muted-foreground mt-1">{quest.description}</p>
                          )}
                        </div>
                      </div>
                      {renderQuestStatus(quest)}
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="md:col-span-3 border-none shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full"></div>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-6 h-6 mr-2 text-vibrant-orange" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading
                ? // Loading state
                  Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-muted/20 animate-pulse">
                        <div className="w-8 h-8 mb-2 bg-muted-foreground/20 rounded-full"></div>
                        <div className="h-4 w-32 bg-muted-foreground/20 rounded mb-2"></div>
                        <div className="h-3 w-40 bg-muted-foreground/20 rounded mb-2"></div>
                        <div className="h-6 w-20 bg-muted-foreground/20 rounded mt-2"></div>
                      </div>
                    ))
                : achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${achievement.unlocked ? "bg-muted/50" : "bg-muted/20 opacity-50"}`}
                    >
                      <achievement.icon
                        className={`w-8 h-8 mb-2 ${achievement.unlocked ? "text-vibrant-yellow" : "text-muted-foreground"}`}
                      />
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked && (
                        <Badge variant="success" className="mt-2">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        {/* Career Path */}
        <Card className="md:col-span-3 border-none shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-vibrant-purple to-vibrant-blue w-full"></div>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-vibrant-purple" />
              Your Career Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-vibrant-blue/20 flex items-center justify-center mb-2">
                  <GraduationCap className="w-8 h-8 text-vibrant-blue" />
                </div>
                <p className="text-sm font-semibold">Student</p>
              </div>
              <div className="flex-1 h-1 bg-muted mx-4">
                <div className="h-full bg-vibrant-green" style={{ width: `${careerPathProgress}%` }}></div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-vibrant-green/20 flex items-center justify-center mb-2">
                  <Briefcase className="w-8 h-8 text-vibrant-green" />
                </div>
                <p className="text-sm font-semibold">Intern</p>
              </div>
              <div className="flex-1 h-1 bg-muted mx-4"></div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-vibrant-orange/20 flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-vibrant-orange" />
                </div>
                <p className="text-sm font-semibold">Professional</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Link href="/jobs">
          <Button className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300">
            Explore Job Opportunities
          </Button>
        </Link>
      </div>
    </div>
  )
}

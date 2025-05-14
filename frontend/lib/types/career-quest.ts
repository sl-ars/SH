import type { LucideIcon } from "lucide-react"

export interface QuestRequirement {
  type: string
  value: number
}

export interface Quest {
  id: string
  title: string
  description: string
  points: number
  completed: boolean
  requirements: QuestRequirement[]
}

export interface QuestWithIcon extends Quest {
  icon: LucideIcon
}

export interface QuestProgress {
  quest_id: string
  progress: number
  total: number
  completed: boolean
  started_at?: string
  completed_at?: string
}

export interface UserQuestProgress {
  questId: string
  currentValue: number
  targetValue: number
  isStarted: boolean
  isCompleted: boolean
  startedAt?: string
  completedAt?: string
}

export interface GamificationStats {
  level: number
  points: number
  next_level_points: number
  achievements_unlocked: number
  total_achievements: number
  career_path_progress?: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  points: number
  icon: string | LucideIcon
  unlocked: boolean
  unlocked_at?: string
}

export interface AchievementWithIcon extends Achievement {
  icon: LucideIcon
}

export interface CareerActivity {
  type: string
  description: string
  points: number
  date: string
}

export interface LeaderboardEntry {
  user_id: string
  name: string
  level: number
  points: number
}

export interface CareerStats {
  jobs_applied: number
  interviews_completed: number
  skills_mastered: number
}

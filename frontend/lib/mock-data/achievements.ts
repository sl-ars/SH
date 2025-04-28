import type { Achievement } from "@/lib/types"

export const mockAchievements: Achievement[] = [
  {
    id: "1",
    title: "Profile Perfectionist",
    description: "Complete your profile to 100%",
    points: 100,
    icon: "user",
  },
  {
    id: "2",
    title: "Application Master",
    description: "Submit 10 job applications",
    points: 200,
    icon: "send",
  },
  {
    id: "3",
    title: "Interview Ready",
    description: "Complete 5 mock interviews",
    points: 300,
    icon: "video",
  },
  {
    id: "4",
    title: "Networking Pro",
    description: "Connect with 20 employers",
    points: 400,
    icon: "users",
  },
]

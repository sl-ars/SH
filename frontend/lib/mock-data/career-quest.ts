export const mockCareerQuest = {
  quests: [
    {
      id: "1",
      title: "Complete Profile",
      description: "Fill out all sections of your profile",
      points: 50,
      completed: true,
      requirements: [
        {
          type: "profile_completion",
          value: 100,
        },
      ],
    },
    {
      id: "2",
      title: "Apply to 5 Jobs",
      description: "Submit applications to 5 different positions",
      points: 100,
      completed: false,
      requirements: [
        {
          type: "applications",
          value: 5,
        },
      ],
    },
    {
      id: "3",
      title: "Attend Networking Event",
      description: "Participate in a campus networking event",
      points: 75,
      completed: false,
      requirements: [
        {
          type: "event_attendance",
          value: 1,
        },
      ],
    },
    {
      id: "4",
      title: "Complete Skills Assessment",
      description: "Take and pass a skills assessment test",
      points: 150,
      completed: false,
      requirements: [
        {
          type: "assessment",
          value: 1,
        },
      ],
    },
  ],
  questProgress: {
    "1": {
      quest_id: "1",
      progress: 100,
      total: 100,
      completed: true,
      started_at: "2024-02-20T10:30:00Z",
      completed_at: "2024-02-20T11:45:00Z",
    },
    "2": {
      quest_id: "2",
      progress: 2,
      total: 5,
      completed: false,
      started_at: "2024-02-25T14:20:00Z",
    },
    "3": {
      quest_id: "3",
      progress: 0,
      total: 1,
      completed: false,
    },
    "4": {
      quest_id: "4",
      progress: 0,
      total: 1,
      completed: false,
    },
  },
  progress: {
    level: 3,
    points: 275,
    next_level_points: 400,
    achievements_unlocked: 2,
    total_achievements: 4,
    career_path_progress: 30, // percentage progress on career path
  },
  achievements: [
    {
      id: "1",
      title: "Profile Perfectionist",
      description: "Complete your profile to 100%",
      points: 100,
      icon: "user",
      unlocked: true,
      unlocked_at: "2024-02-20T10:30:00Z",
    },
    {
      id: "2",
      title: "Application Master",
      description: "Submit 10 job applications",
      points: 200,
      icon: "send",
      unlocked: false,
    },
    {
      id: "3",
      title: "Interview Ace",
      description: "Successfully complete 5 interviews",
      points: 300,
      icon: "video",
      unlocked: false,
    },
    {
      id: "4",
      title: "Networking Guru",
      description: "Attend 3 career fairs",
      points: 400,
      icon: "users",
      unlocked: true,
      unlocked_at: "2024-02-15T16:45:00Z",
    },
  ],
  recentActivity: [
    {
      type: "application",
      description: "Applied to Frontend Developer at TechCorp",
      points: 50,
      date: "2024-02-28T09:15:00Z",
    },
    {
      type: "profile",
      description: "Updated your resume",
      points: 25,
      date: "2024-02-27T14:30:00Z",
    },
    {
      type: "interview",
      description: "Completed mock interview",
      points: 75,
      date: "2024-02-26T11:00:00Z",
    },
  ],
  leaderboard: [
    {
      user_id: "3",
      name: "John Student",
      level: 5,
      points: 1250,
    },
    {
      user_id: "5",
      name: "Alice Johnson",
      level: 4,
      points: 980,
    },
    {
      user_id: "6",
      name: "Bob Smith",
      level: 3,
      points: 720,
    },
  ],
  careerStats: {
    jobs_applied: 15,
    interviews_completed: 3,
    skills_mastered: 7,
  },
}

import type { User } from "../types"

export const mockUsers: Record<string, User> = {
  "1": {
    id: "1",
    email: "admin@studenthunter.com",
    password: "password123", // In a real app, this would be hashed
    name: "Admin User",
    role: "admin",
    avatar: "/placeholder.svg",
    savedJobs: [],
    appliedJobs: [],
    followedCompanies: [],
  },
  "2": {
    id: "2",
    email: "campus@university.edu",
    password: "password123",
    name: "Campus Coordinator",
    role: "campus",
    avatar: "/placeholder.svg",
    savedJobs: [],
    appliedJobs: [],
    followedCompanies: [],
  },
  "3": {
    id: "3",
    email: "student@university.edu",
    password: "password123",
    name: "John Student",
    role: "student",
    avatar: "/placeholder.svg",
    savedJobs: ["1"],
    appliedJobs: [],
    followedCompanies: ["1"],
  },
  "4": {
    id: "4",
    email: "manager@company.com",
    password: "password123",
    name: "Jane Manager",
    role: "manager",
    avatar: "/placeholder.svg",
    savedJobs: [],
    appliedJobs: [],
    followedCompanies: [],
  },
}

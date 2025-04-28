import type { Student } from "@/lib/api/campus"

export const mockStudents: Record<string, Student> = {
  "1": {
    id: "1",
    name: "John Doe",
    email: "john.doe@university.edu",
    major: "Computer Science",
    graduationYear: "2025",
    status: "Active",
  },
  "2": {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@university.edu",
    major: "Business Administration",
    graduationYear: "2024",
    status: "Placed",
  },
  "3": {
    id: "3",
    name: "Alex Johnson",
    email: "alex.johnson@university.edu",
    major: "Electrical Engineering",
    graduationYear: "2026",
    status: "Active",
  },
  "4": {
    id: "4",
    name: "Emily Brown",
    email: "emily.brown@university.edu",
    major: "Psychology",
    graduationYear: "2025",
    status: "Active",
  },
}

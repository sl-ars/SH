import type React from "react"
// User and Authentication Types
export type UserRole = "admin" | "employer" | "campus" | "student"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole | string
  avatar?: string
  university?: string
  company?: string
  company_id?: string
  createdAt: string
  lastLogin?: string
  isActive: boolean
  profile?: UserProfile
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
  error: string | null
}

// Profile Types
export interface Education {
  id?: string
  university: string
  field: string
  degree?: string
  start_date?: string
  end_date?: string
  gpa?: string
  description?: string
}

export interface Experience {
  id?: string
  company: string
  position: string
  start_date?: string
  end_date?: string
  current?: boolean
  description?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  points: number
  icon: string
}

export interface Resume {
  id: string
  name: string
  url: string
  createdAt: string
  updatedAt?: string
  isDefault?: boolean
  applicationCount?: number
}

export interface UserProfile {
  id?: string
  name?: string
  email?: string
  phone?: string
  location?: string
  bio?: string
  avatar?: string
  skills?: string[]
  education?: Education[]
  experience?: Experience[]
  achievements?: Achievement[]
  resumes?: Resume[]
  [key: string]: any
}

// Job and Application Types
export interface Job {
  id: string
  title: string
  company: string
  companyId: string
  company_id?: string
  location: string
  type: string
  salary: string
  description?: string
  requirements?: string[]
  responsibilities?: string[]
  benefits?: string[]
  postedDate: string
  deadline?: string
  featured?: boolean
  logo?: string
  industry?: string
  views?: number
  applications?: number
  status?: string
  isSaved?: boolean
}

export interface JobApplication {
  id: string
  jobId: string
  userId: string
  resumeUrl?: string
  answers?: {
    questionId: string
    answer: string
  }[]
  status: string
  appliedAt: string
  updatedAt: string
  interviewDate?: string
  interviewTime?: string
  interviewType?: string
  comments?: string
  job?: Job
}

export interface ApplicationQuestion {
  id: string
  question: string
  type: string
  required: boolean
  options?: string[]
}

// Company Types
export interface Company {
  id: string
  name: string
  description: string
  website?: string
  location: string
  industry: string
  size?: string
  founded?: string
  logo?: string
  coverImage?: string
  verified?: boolean
  featured?: boolean
  rating?: number
  employees?: number
  openPositions?: number
  socialLinks?: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  benefits?: string[]
  culture?: string
  jobs?: Job[]
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  link?: string
  icon?: string
}

// Resource Types
export interface Resource {
  id: string
  title: string
  description: string
  type: string
  url?: string
  thumbnail?: string
  createdAt: string
  updatedAt?: string
  author?: string
  tags?: string[]
  featured?: boolean
  views?: number
  downloads?: number
  category?: string
}

// Analytics Types
export interface AnalyticsData {
  users: {
    total: number
    active: number
    new: number
    growth: number
  }
  jobs: {
    total: number
    active: number
    new: number
    growth: number
  }
  applications: {
    total: number
    pending: number
    accepted: number
    rejected: number
    growth: number
  }
  companies: {
    total: number
    active: number
    new: number
    growth: number
  }
  pageViews: {
    total: number
    unique: number
    growth: number
  }
  chartData: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string
      borderColor?: string
      borderWidth?: number
    }[]
  }[]
}

// Campus Types
export interface Student {
  id: string
  name: string
  email: string
  major: string
  graduationYear: string
  status: string
  university?: string
  gpa?: string
  skills?: string[]
  resumeUrl?: string
  profileCompleted?: boolean
  applications?: number
  interviews?: number
  offers?: number
}

export interface CampusEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  description?: string
  attendees: number
  companies: string[]
  type: string
  registrationUrl?: string
  image?: string
}

export interface CampusReport {
  id: string
  name: string
  description: string
  lastUpdated: string
  url: string
  type?: string
  size?: string
  downloads?: number
}

// Manager Types
export interface Manager {
  id: string
  name: string
  email: string
  company: string
  position: string
  phone?: string
  avatar?: string
  department?: string
  hireDate?: string
}

export interface Interview {
  id: string
  applicationId: string
  jobId: string
  candidateId: string
  date: string
  time: string
  type: string
  location?: string
  interviewers?: string[]
  status: string
  feedback?: string
  rating?: number
  notes?: string
}

// Settings Types
export interface UserSettings {
  id: string
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  jobAlerts: boolean
  applicationUpdates: boolean
  marketingEmails: boolean
  theme: string
  language: string
  timezone: string
  twoFactorEnabled: boolean
}

export interface AdminSettings {
  siteName: string
  supportEmail: string
  maintenanceMode: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  twoFactorAuth: boolean
  passwordExpiry: boolean
  smtpServer: string
  smtpPort: string
  smtpUsername?: string
  smtpPassword?: string
  smtpSecure: boolean
  logoUrl: string
  faviconUrl: string
  primaryColor: string
  primaryAccentColor: string
  secondaryColor: string
  allowOpenRegistration: boolean
  requireEmailVerification: boolean
  allowStudentRegistration: boolean
  allowEmployerRegistration: boolean
  jobApprovalRequired: boolean
  companyVerificationRequired: boolean
  maxFileSizeInMb: number
  allowedFileTypes: string[]
  cookieConsentRequired: boolean
}

// API Response Types
export interface ApiResponse<T = any> {
  status: "success" | "error"
  message: string
  data: T
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Search and Filter Types
export interface JobFilters {
  search?: string
  location?: string
  type?: string
  salary?: string
  company?: string
  industry?: string
  experience?: string
  posted?: string
  page?: number
  limit?: number
}

export interface CompanyFilters {
  search?: string
  industry?: string
  location?: string
  size?: string
  page?: number
  limit?: number
}

export interface StudentFilters {
  search?: string
  major?: string
  graduationYear?: string
  skills?: string
  status?: string
  page?: number
  limit?: number
}

// Gamification Types
export interface GamificationStats {
  level: number
  points: number
  next_level_points: number
  achievements_unlocked: number
  total_achievements: number
  career_path_progress?: number
}

export interface LeaderboardEntry {
  user_id: string
  name: string
  level: number
  points: number
  avatar?: string
  achievements?: number
}

// Chart and Visualization Types
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
  }[]
}

export interface StatCard {
  title: string
  value: number | string
  change?: number
  changeType?: "increase" | "decrease" | "neutral"
  icon?: string
  description?: string
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: string
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  validation?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    message?: string
  }
}

export interface FormData {
  [key: string]: any
}

// Error Types
export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}

// Utility Types
export type SortDirection = "asc" | "desc"

export interface SortOption {
  field: string
  direction: SortDirection
}

export interface TableColumn {
  id: string
  label: string
  accessor: string
  sortable?: boolean
  cell?: (row: any) => React.ReactNode
}

// Export all types from career-quest.ts
export * from "./career-quest"

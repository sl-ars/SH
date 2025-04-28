export type UserRole = "student" | "employer" | "admin" | "campus";

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
  avatar?: string;
  company?: string;
  company_id?: string;
  location?: string;
  university?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  company_id: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[] | null;
  responsibilities: string[] | null;
  benefits: string[] | null;
  posted_date: string;
  deadline: string | null;
  featured: boolean;
  logo: string | null;
  industry: string | null;
  view_count: number;
  application_count: number;
  status: string;
  created_by: string | null;
  is_active: boolean;
  company_name?: string;
  created_by_name?: string;
  application_stats?: Record<string, number>;
  is_applied?: boolean;
  is_saved?: boolean;
}

// Define a new interface for the nested applicant data
export interface ApplicantData {
  id: string;
  avatar?: string;
  name: string;
  email: string;
  phone?: string; // Assuming phone can be optional
}

// Define the Resume interface based on ResumeSerializer
export interface Resume {
  id: string;
  name: string;
  created_at: string;
  file: string; // Path/name of the uploaded file
  url: string | null; // URL to access the file
}

export interface Application {
  id: string;
  job: Job | string;
  job_title?: string;
  job_company?: string;
  job_location?: string;
  job_type?: string;
  job_details?: Partial<Job>;
  applicant: ApplicantData | string; 
  status: "pending" | "reviewing" | "interviewed" | "accepted" | "rejected";
  status_history?: {
    status: string;
    timestamp: string;
    notes: string;
  }[];
  cover_letter: string;
  resume: Resume; // Changed from string to Resume interface
  resume_id?: string; // Added for write operations
  created_at: string;
  updated_at: string;
  interview_date: string | null;
  notes: string;
}

export interface ModerationLog {
  id: string;
  admin: string;
  admin_email: string;
  action: string;
  timestamp: string;
  notes: string;
  content_type: string;
  content_type_name: string;
  object_id: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  is_read: boolean;
  content_type: string | null;
  object_id: string | null;
}

export interface AdminDashboardStats {
  total_users: number;
  new_users_today: number;
  total_jobs: number;
  new_jobs_today: number;
  total_applications: number;
  new_applications_today: number;
  total_companies: number;
  new_companies_today: number;
  pending_verifications: number;
  active_jobs: number;
  total_students: number;
  total_employers: number;
}

export interface Company {
  id: string;
  name: string;
  company_name?: string;
  description: string;
  website: string | null;
  location: string;
  industry: string;
  size: string | null;
  founded: string | null;
  logo: string | null;
  cover_image: string | null;
  verified: boolean;
  featured: boolean;
  culture: string | null;
  benefits: Record<string, any> | null;
  social_links: Record<string, string> | null;
  company?: string;
  company_id?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points?: number;
  icon?: string;
}

export interface Education {
  id: string;
  university: string;
  field: string;
  degree: string;
  start_date: string;
  end_date: string;
  gpa?: string;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description?: string;
  current?: boolean;
}

export interface BaseProfileData {
  phone?: string;
  location?: string;
  description?: string;
}

export interface StudentProfile extends User, BaseProfileData {
  skills?: string[]; 
  achievements?: string[];
  education?: Education[];
  experience?: Experience[];
}

export interface EmployerProfile extends User, BaseProfileData {
  company_name?: string;
  company_website?: string;

  company_skills_tags?: string[];
  totalJobsPosted?: number;
  activeApplications?: number;
  totalHires?: number;
}


export interface CampusProfile extends User, BaseProfileData {
  programs_offered?: string[];
  totalStudents?: number;
  activePrograms?: number;
  partnerCompanies?: number;
}

export interface AdminProfile extends User, BaseProfileData {
  system_name?: string;
  system_description?: string;
  totalUsers?: number;
  activeCampuses?: number;
  totalJobs?: number;
}

export type AnyFullProfile = StudentProfile | EmployerProfile | CampusProfile | AdminProfile;

export interface UserProfile extends User { 
  bio?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
  achievements?: Achievement[]
}

export interface AuthorDetails {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface ResourceFile {
  id: string;
  resource: string;
  title?: string;
  file: string;
  file_url?: string;
  file_type?: string;
  created_at: string;
  created_by?: string;
  created_by_name?: string;
  open_in_new_tab?: boolean;
  size?: number;
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: string;
  type_display?: string;
  category: string;
  category_display?: string;
  tags?: string[];
  content?: string;
  author?: AuthorDetails;
  author_details?: AuthorDetails;
  created_by?: AuthorDetails;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
  is_featured?: boolean;
  estimated_time?: string;
  estimated_time_display?: string;
  files?: ResourceFile[];
  file_count?: number;
  is_demo?: boolean;
  fileUrl?: string;
}

export interface ResourceListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Resource[];
}

export interface ResourceDownloadResponse {
  file_url: string;
  filename?: string;
  open_in_new_tab?: boolean;
  bio?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
  achievements?: Achievement[];

}

// Types for Public Profile Page
export interface PublicProfileEducation {
  university: string;
  degree: string;
  field: string;
  start_date: string; // Consider using Date type after fetching
  end_date: string;   // Consider using Date type after fetching
  gpa: number | null;
}

export interface PublicProfileExperience { // Assuming structure, was empty in example
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface StudentPublicInfo {
  bio: string | null;
  skills: string[];
  achievements: string[];
  education: PublicProfileEducation[];
  experience: PublicProfileExperience[];
}

export interface PublicProfile {
  id: number;
  name: string;
  role: UserRole;
  avatar: string | null;
  location: string | null;
  university: string | null; // Or specific university details if available
  student_info: StudentPublicInfo | null; // Null if role is not 'student'
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  total_pages?: number;
  current_page?: number;
}

export interface ApiResponse<T = any> {
  status: "success" | "error" | "fail"; // 'fail' often for validation errors
  message: string;
  data?: T;
  error?: any; // For detailed error messages or codes
  errors?: Record<string, string[]>; // For form validation errors
}

// Analytics types
// EmployerDashboardAnalytics represents the content of the 'summary' object from the backend
export interface EmployerDashboardAnalytics {
  total_jobs?: number;
  active_jobs?: number;
  total_applications?: number;
  application_status_counts?: Record<string, number>; 
  total_job_views?: number;
}

// BackendAnalyticsPayload represents the structure nested inside the primary 'data' field
export interface BackendAnalyticsPayload {
  status?: string; // The inner status
  data?: { // This data contains summary, time_series, popular_jobs
    summary: EmployerDashboardAnalytics;
    time_series: {
      applications_over_time: Array<{date: string, applications: number}>;
      job_views_over_time: Array<{date: string, views: number}>;
    };
    popular_jobs: Array<{id: any, title: string, view_count: number, num_applications: number}>;
  };
  message?: string; // Inner message if present
}

// This type represents the entire JSON object returned by the /analytics/employer/ endpoint
// if your apiClient.get<T> gives you T as the direct JSON body.
// However, our employerApi.getAnalytics is expected to return ApiResponse<EmployerDashboardAnalytics>.
// The apiClient itself might be wrapping the actual server response into an ApiResponse structure.

// Let's assume apiClient.get<T> returns T as the direct http response body.
// The direct body is: { status, message, data: BackendAnalyticsPayload, error }
// So T for apiClient.get would be our standard ApiResponse<BackendAnalyticsPayload>.
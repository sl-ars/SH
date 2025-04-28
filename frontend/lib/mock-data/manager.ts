// Mock data for manager dashboard
export const mockManagerDashboard = {
  activeJobs: { value: 12, change: "+3 this month" },
  totalApplications: { value: 156, change: "+45 this week" },
  interviewsScheduled: { value: 8, change: "Next 7 days" },
  responseRate: { value: "92%", change: "+5% this month" },
}

// Mock data for manager applications
export const mockManagerApplications = [
  { id: "1", name: "John Doe", position: "Frontend Developer", date: "2025-03-01", status: "New" },
  { id: "2", name: "Jane Smith", position: "UX Designer", date: "2025-02-28", status: "In Review" },
  { id: "3", name: "Bob Johnson", position: "Data Analyst", date: "2025-02-27", status: "Interviewed" },
]

// Mock data for manager interviews
export const mockManagerInterviews = [
  { id: "1", name: "Alice Johnson", position: "Frontend Developer", date: "2025-03-05", time: "10:00 AM" },
  { id: "2", name: "Bob Smith", position: "UX Designer", date: "2025-03-06", time: "2:00 PM" },
  { id: "3", name: "Carol Davis", position: "Data Analyst", date: "2025-03-07", time: "11:30 AM" },
]

// Mock data for manager company profile
export const mockManagerCompanyProfile = {
  name: "TechCorp Inc.",
  industry: "Technology",
  location: "San Francisco, CA",
  website: "https://techcorp.com",
  description: "TechCorp is a leading technology company...",
}

// Mock data for manager settings
export const mockManagerSettings = {
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false,
}

// Mock data for manager analytics
export const mockManagerAnalytics = {
  applicationTrend: [],
  applicationSources: [],
  hiringFunnel: [],
}

export const mockAdminSettings = {
  siteName: "StudentHunter",
  supportEmail: "support@studenthunter.com",
  maintenanceMode: false,
  emailNotifications: true,
  pushNotifications: false,
  twoFactorAuth: false,
  passwordExpiry: true,
  smtpServer: "smtp.example.com",
  smtpPort: "587",
}

export const mockAdminStats = {
  users: {
    total: 1234,
    students: 1000,
    employers: 150,
    campus: 50,
    admins: 34,
  },
  jobs: {
    total: 567,
    active: 350,
    filled: 217,
  },
  applications: {
    total: 2500,
    pending: 500,
    reviewing: 300,
    accepted: 1200,
    rejected: 500,
  },
  companies: {
    total: 200,
    verified: 150,
  },
}

export const mockAdminUsers = [
  { id: "1", name: "John Doe", email: "john.doe@example.com", role: "Student", status: "Active" },
  { id: "2", name: "Jane Smith", email: "jane.smith@example.com", role: "Employer", status: "Active" },
  { id: "3", name: "Bob Johnson", email: "bob.johnson@example.com", role: "Admin", status: "Active" },
  { id: "4", name: "Alice Brown", email: "alice.brown@example.com", role: "Student", status: "Inactive" },
  { id: "5", name: "Charlie Davis", email: "charlie.davis@example.com", role: "Employer", status: "Pending" },
]

export const mockAdminJobs = [
  { id: "1", title: "Frontend Developer", company: "TechCorp", location: "San Francisco, CA", status: "Active" },
  { id: "2", title: "UX Designer", company: "DesignPro", location: "New York, NY", status: "Pending" },
  { id: "3", title: "Data Scientist", company: "DataTech", location: "Boston, MA", status: "Active" },
  { id: "4", title: "Product Manager", company: "InnovateCo", location: "Austin, TX", status: "Closed" },
  { id: "5", title: "Marketing Specialist", company: "GrowthHub", location: "Chicago, IL", status: "Active" },
]

export const mockAdminCompanies = [
  { id: "1", name: "TechCorp Inc.", industry: "Technology", location: "San Francisco, CA", verified: true },
  { id: "2", name: "GreenEnergy Solutions", industry: "Energy", location: "Austin, TX", verified: false },
  { id: "3", name: "HealthTech Innovations", industry: "Healthcare", location: "Boston, MA", verified: true },
  { id: "4", name: "FinTech Frontier", industry: "Finance", location: "New York, NY", verified: false },
  { id: "5", name: "EduLearn Systems", industry: "Education", location: "Chicago, IL", verified: true },
]
export const mockAdminAnalytics = {
  userGrowth: [
    { date: "Jan", count: 100 },
    { date: "Feb", count: 150 },
    { date: "Mar", count: 200 },
    { date: "Apr", count: 300 },
    { date: "May", count: 400 },
    { date: "Jun", count: 500 },
  ],
  jobStats: [
    { date: "Jan", posted: 20, filled: 5 },
    { date: "Feb", posted: 30, filled: 10 },
    { date: "Mar", posted: 40, filled: 15 },
    { date: "Apr", posted: 50, filled: 20 },
    { date: "May", posted: 60, filled: 25 },
    { date: "Jun", posted: 70, filled: 30 },
  ],
  userDistribution: [
    { name: "Students", value: 1000 },
    { name: "Employers", value: 150 },
    { name: "Campus", value: 50 },
    { name: "Admins", value: 34 },
  ],
}


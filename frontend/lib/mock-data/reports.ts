import type { CampusReport } from "@/lib/api/campus"

export const mockReports: Record<string, CampusReport> = {
  "1": {
    id: "1",
    name: "Annual Placement Report",
    description: "Overview of student placements for the year",
    lastUpdated: "2024-02-28",
    url: "/reports/annual-placement-2024.pdf",
  },
  "2": {
    id: "2",
    name: "Company Engagement Report",
    description: "Analysis of company participation in campus events",
    lastUpdated: "2024-02-25",
    url: "/reports/company-engagement-2024.pdf",
  },
  "3": {
    id: "3",
    name: "Student Performance Report",
    description: "Aggregated data on student academic and placement performance",
    lastUpdated: "2024-02-20",
    url: "/reports/student-performance-2024.pdf",
  },
}

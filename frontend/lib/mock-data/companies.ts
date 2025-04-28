import type { Company } from "../types"
import { mockJobs } from "./jobs"

export const mockCompanies: Record<string, Company> = {
  "1": {
    id: "1",
    name: "TechCorp Inc.",
    logo: "/placeholder.svg",
    description: "Leading technology company specializing in innovative solutions...",
    industry: "Technology",
    location: "San Francisco, CA",
    size: "1000-5000",
    founded: "2010",
    website: "https://techcorp-example.com",
    culture: "We foster a culture of innovation and collaboration...",
    benefits: [
      "Competitive salary",
      "Health insurance",
      "401(k) matching",
      "Remote work options",
      "Professional development",
    ],
    jobs: [mockJobs["1"]],
  },
  // Add more mock companies here...
}

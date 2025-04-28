import type { CampusEvent } from "@/lib/api/campus"

export const mockEvents: Record<string, CampusEvent> = {
  "1": {
    id: "1",
    title: "Tech Career Fair 2024",
    date: "2024-03-15",
    time: "10:00 AM - 4:00 PM",
    location: "Main Campus Hall",
    attendees: 500,
    companies: ["TechCorp", "DesignPro", "DataDrive"],
    type: "Career Fair",
  },
  "2": {
    id: "2",
    title: "Interview Skills Workshop",
    date: "2024-03-20",
    time: "2:00 PM - 4:00 PM",
    location: "Virtual",
    attendees: 100,
    companies: ["HR Experts Inc."],
    type: "Workshop",
  },
  "3": {
    id: "3",
    title: "Resume Building Seminar",
    date: "2024-03-25",
    time: "1:00 PM - 3:00 PM",
    location: "Student Center",
    attendees: 150,
    companies: ["Career Services"],
    type: "Seminar",
  },
}

export interface Resume {
  id: string
  userId: string
  name: string
  url: string
  createdAt: string
  updatedAt?: string
  isDefault?: boolean
  applicationCount?: number
}

export const mockResumes: Resume[] = [
  {
    id: "1",
    userId: "user-1",
    name: "Software Engineer Resume",
    url: "/resumes/resume1.pdf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true,
    applicationCount: 5,
  },
  {
    id: "2",
    userId: "user-1",
    name: "Frontend Developer Resume",
    url: "/resumes/resume2.pdf",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isDefault: false,
    applicationCount: 2,
  },
  {
    id: "3",
    userId: "user-2",
    name: "UX Designer Resume",
    url: "/resumes/resume3.pdf",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    isDefault: true,
    applicationCount: 0,
  },
  {
    id: "4",
    userId: "user-1",
    name: "Project Manager Resume",
    url: "/resumes/resume4.pdf",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    isDefault: false,
    applicationCount: 1,
  },
]

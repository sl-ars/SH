import type { Job, Company, UserProfile } from "./types"

export const mockJobs: Record<string, Job> = {
  "1": {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    companyId: "1",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120,000 - $160,000",
    description: "We are seeking a Senior Frontend Developer to join our team...",
    requirements: [
      "5+ years of experience with React",
      "Strong TypeScript skills",
      "Experience with Next.js",
      "Understanding of web performance optimization",
    ],
    responsibilities: [
      "Lead frontend development initiatives",
      "Mentor junior developers",
      "Architect scalable solutions",
      "Collaborate with design team",
    ],
    benefits: [
      "Competitive salary",
      "Health insurance",
      "401(k) matching",
      "Remote work options",
      "Professional development budget",
    ],
    postedAt: "2024-02-20",
  },
  "2": {
    id: "2",
    title: "UX Designer",
    company: "DesignPro",
    companyId: "2",
    location: "New York, NY",
    type: "Full-time",
    salary: "$90,000 - $120,000",
    description: "Join our creative team as a UX Designer...",
    requirements: [
      "3+ years of UX design experience",
      "Proficiency in Figma",
      "Strong portfolio",
      "Experience with user research",
    ],
    responsibilities: [
      "Create user-centered designs",
      "Conduct user research",
      "Develop prototypes",
      "Collaborate with developers",
    ],
    benefits: ["Competitive salary", "Health benefits", "Flexible hours", "Design conference budget"],
    postedAt: "2024-02-21",
  },
  // Add more mock jobs...
}

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
  "2": {
    id: "2",
    name: "DesignPro",
    logo: "/placeholder.svg",
    description: "Award-winning design agency creating beautiful digital experiences...",
    industry: "Design",
    location: "New York, NY",
    size: "100-500",
    founded: "2015",
    website: "https://designpro-example.com",
    culture: "We believe in creativity, collaboration, and continuous learning...",
    benefits: [
      "Competitive salary",
      "Health benefits",
      "Flexible hours",
      "Design conference budget",
      "Creative workspace",
    ],
    jobs: [mockJobs["2"]],
  },
  // Add more mock companies...
}

export const mockResources = {
  "1": {
    id: "1",
    title: "Complete Guide to Modern Web Development",
    type: "Course",
    description:
      "A comprehensive guide covering all aspects of modern web development, from frontend frameworks to backend technologies and deployment strategies.",
    content: `
# Introduction to Modern Web Development

This comprehensive guide will take you through everything you need to know about modern web development.

## Topics Covered

1. Frontend Development
   - HTML5, CSS3, and Modern JavaScript
   - React and Next.js
   - State Management
   - Performance Optimization

2. Backend Development
   - Node.js and Express
   - Database Design
   - API Development
   - Authentication and Authorization

3. DevOps and Deployment
   - Git and Version Control
   - CI/CD Pipelines
   - Cloud Deployment
   - Monitoring and Analytics

## Getting Started

Begin your journey by setting up your development environment...
    `,
    author: "Sarah Johnson",
    publishedAt: "2024-02-01",
    estimatedTime: "10 hours",
    category: "Web Development",
    tags: ["JavaScript", "React", "Node.js", "Web Development", "Frontend", "Backend"],
  },
  "2": {
    id: "2",
    title: "UX Design Principles and Best Practices",
    type: "Guide",
    description:
      "Learn the fundamental principles of UX design and how to apply them in your projects. This guide covers everything from user research to prototyping.",
    content: `
# UX Design Principles

Understanding user experience design is crucial for creating successful digital products.

## Core Principles

1. User Research
   - Understanding your users
   - Research methodologies
   - Data analysis

2. Information Architecture
   - Content organization
   - Navigation design
   - User flows

3. Prototyping
   - Low-fidelity wireframes
   - High-fidelity prototypes
   - User testing

## Best Practices

Learn how to implement these principles in real-world projects...
    `,
    author: "Michael Chen",
    publishedAt: "2024-02-15",
    estimatedTime: "6 hours",
    category: "Design",
    tags: ["UX Design", "UI Design", "Prototyping", "User Research", "Design Thinking"],
  },
}

export const mockUserProfiles: Record<string, UserProfile> = {
  "1": {
    id: "1",
    email: "john.doe@example.com",
    name: "John Doe",
    role: "student",
    avatar: "/placeholder.svg",
    achievements: [
      {
        id: "1",
        title: "Profile Perfectionist",
        description: "Completed profile to 100%",
        points: 100,
        icon: "user",
        unlockedAt: "2024-02-20",
      },
    ],
    points: 100,
    level: 1,
    applications: [
      {
        id: "1",
        jobId: "1",
        status: "pending",
        appliedAt: "2024-02-20",
        lastUpdated: "2024-02-20",
      },
    ],
    savedJobs: ["1"],
    appliedJobs: ["1"],
    followedCompanies: ["1"],
  },
  // Add more mock user profiles...
}

import type { Resource } from "@/lib/types"

// Mock resources data
export const mockResources: Record<string, Resource> = {
  "1": {
    id: "1",
    title: "Resume Writing Guide",
    type: "Guide",
    description: "Learn how to create a professional resume that stands out to employers.",
    content:
      "<p>A well-crafted resume is your first opportunity to make a strong impression on potential employers. This comprehensive guide will walk you through the process of creating a professional resume that effectively showcases your skills, experience, and qualifications.</p><h2>Key Sections to Include</h2><ul><li>Contact Information</li><li>Professional Summary</li><li>Work Experience</li><li>Education</li><li>Skills</li><li>Achievements</li></ul>",
    author: "Career Services Team",
    publishedAt: "2023-01-15",
    estimatedTime: "15 min read",
    category: "Guides",
    tags: ["resume", "job search", "career"],
    isDemo: true, // Available for non-logged in users
    links: [
      {
        id: "1-1",
        title: "Resume Writing Guide PDF",
        url: "https://example.com/resources/resume-guide.pdf",
        type: "pdf",
        openInNewTab: true,
        size: "2.4 MB",
      },
      {
        id: "1-2",
        title: "Resume Templates",
        url: "https://example.com/resources/resume-templates.zip",
        type: "zip",
        openInNewTab: false,
        size: "5.1 MB",
      },
    ],
  },
  "2": {
    id: "2",
    title: "Interview Preparation",
    type: "Video Course",
    description: "Comprehensive video course on preparing for job interviews.",
    content:
      "<p>Preparing for job interviews can be stressful, but with the right preparation, you can approach them with confidence. This video course covers everything from researching the company to answering common interview questions and following up after the interview.</p><h2>Course Modules</h2><ol><li>Pre-Interview Research</li><li>Common Interview Questions</li><li>Behavioral Interview Techniques</li><li>Technical Interview Preparation</li><li>Questions to Ask the Interviewer</li><li>Post-Interview Follow-up</li></ol>",
    author: "Dr. Emily Johnson",
    publishedAt: "2023-02-20",
    estimatedTime: "2 hours",
    category: "Videos",
    tags: ["interview", "job search", "career"],
    isDemo: true, // Available for non-logged in users
    links: [
      {
        id: "2-1",
        title: "Interview Preparation Course",
        url: "https://example.com/resources/interview-course.mp4",
        type: "video",
        openInNewTab: true,
        size: "450 MB",
      },
    ],
  },
  "3": {
    id: "3",
    title: "Networking Strategies",
    type: "Webinar",
    description: "Learn effective networking strategies for career advancement.",
    content:
      "<p>Networking is one of the most powerful tools for career advancement. This webinar explores effective networking strategies that can help you build meaningful professional relationships and open doors to new opportunities.</p><h2>Topics Covered</h2><ul><li>Building Your Professional Brand</li><li>In-Person Networking Events</li><li>Digital Networking Platforms</li><li>Following Up and Maintaining Connections</li><li>Leveraging Your Network for Job Opportunities</li></ul>",
    author: "Michael Chang",
    publishedAt: "2023-03-10",
    estimatedTime: "45 min",
    category: "Webinars",
    tags: ["networking", "career development", "professional relationships"],
    isDemo: false, // Not available for non-logged in users
    links: [
      {
        id: "3-1",
        title: "Networking Strategies Webinar",
        url: "https://example.com/resources/networking-webinar.mp4",
        type: "video",
        openInNewTab: true,
        size: "320 MB",
      },
      {
        id: "3-2",
        title: "Networking Worksheet",
        url: "https://example.com/resources/networking-worksheet.pdf",
        type: "pdf",
        openInNewTab: false,
        size: "1.2 MB",
      },
    ],
  },
  "4": {
    id: "4",
    title: "Industry Insights",
    type: "E-book",
    description: "Comprehensive analysis of current trends across various industries.",
    content:
      "<p>Stay ahead of the curve with our comprehensive e-book on industry trends. This resource provides in-depth analysis of current developments, emerging technologies, and future projections across various sectors.</p><h2>Industries Covered</h2><ul><li>Technology</li><li>Healthcare</li><li>Finance</li><li>Manufacturing</li><li>Retail</li><li>Energy</li></ul>",
    author: "Industry Research Team",
    publishedAt: "2023-04-05",
    estimatedTime: "3 hours",
    category: "E-books",
    tags: ["industry trends", "market analysis", "career planning"],
    isDemo: false, // Not available for non-logged in users
    links: [
      {
        id: "4-1",
        title: "Industry Insights E-book",
        url: "https://example.com/resources/industry-insights.epub",
        type: "epub",
        openInNewTab: true,
        size: "8.5 MB",
      },
    ],
  },
  "5": {
    id: "5",
    title: "Career Fair Tips",
    type: "Article",
    description: "Maximize your career fair experience with these essential tips.",
    content:
      "<p>Career fairs offer valuable opportunities to connect with potential employers and learn about job openings. This article provides practical tips to help you make the most of your career fair experience, from preparation to follow-up.</p><h2>Before the Fair</h2><ul><li>Research participating companies</li><li>Prepare your elevator pitch</li><li>Update your resume</li><li>Plan your attire</li></ul><h2>During the Fair</h2><ul><li>Prioritize your time</li><li>Ask thoughtful questions</li><li>Collect business cards</li><li>Take notes</li></ul><h2>After the Fair</h2><ul><li>Send follow-up emails</li><li>Connect on LinkedIn</li><li>Apply for positions</li><li>Reflect on the experience</li></ul>",
    author: "Career Services Team",
    publishedAt: "2023-05-12",
    estimatedTime: "10 min read",
    category: "Articles",
    tags: ["career fair", "job search", "networking"],
    isDemo: true, // Available for non-logged in users
    links: [
      {
        id: "5-1",
        title: "Career Fair Tips PDF",
        url: "https://example.com/resources/career-fair-tips.pdf",
        type: "pdf",
        openInNewTab: false,
        size: "1.8 MB",
      },
    ],
  },
  "6": {
    id: "6",
    title: "Job Search Strategies",
    type: "Workshop",
    description: "Learn effective strategies to find and secure your ideal job.",
    content:
      "<p>Finding the right job requires a strategic approach. This workshop covers proven job search strategies to help you identify opportunities, tailor your applications, and stand out from other candidates.</p><h2>Workshop Modules</h2><ol><li>Defining Your Career Goals</li><li>Identifying Target Companies</li><li>Leveraging Job Boards and Company Websites</li><li>Networking for Job Opportunities</li><li>Customizing Applications</li><li>Following Up on Applications</li><li>Evaluating Job Offers</li></ol>",
    author: "Sarah Williams",
    publishedAt: "2023-06-18",
    estimatedTime: "1.5 hours",
    category: "Workshops",
    tags: ["job search", "career planning", "applications"],
    isDemo: false, // Not available for non-logged in users
    links: [
      {
        id: "6-1",
        title: "Job Search Workshop Recording",
        url: "https://example.com/resources/job-search-workshop.mp4",
        type: "video",
        openInNewTab: true,
        size: "380 MB",
      },
      {
        id: "6-2",
        title: "Job Search Workbook",
        url: "https://example.com/resources/job-search-workbook.pdf",
        type: "pdf",
        openInNewTab: false,
        size: "3.2 MB",
      },
    ],
  },
}

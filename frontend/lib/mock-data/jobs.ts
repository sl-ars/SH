export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  description?: string
  requirements?: string[]
  responsibilities?: string[]
  benefits?: string[]
  postedDate: string
  deadline?: string
  companyId: string
  featured?: boolean
}

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Software Engineer Intern",
    company: "TechCorp Inc.",
    location: "New York, NY",
    type: "Internship",
    salary: "$25/hour",
    description:
      "Join our engineering team as an intern and work on real-world projects that impact millions of users. You'll gain hands-on experience with our tech stack and receive mentorship from senior engineers.",
    requirements: [
      "Currently pursuing a degree in Computer Science or related field",
      "Knowledge of at least one programming language (Java, Python, JavaScript)",
      "Basic understanding of data structures and algorithms",
      "Strong problem-solving skills",
    ],
    responsibilities: [
      "Develop and maintain software applications",
      "Collaborate with cross-functional teams",
      "Debug and fix issues in existing codebase",
      "Participate in code reviews and team meetings",
    ],
    benefits: [
      "Competitive salary",
      "Flexible work hours",
      "Professional development opportunities",
      "Networking events",
    ],
    postedDate: "2023-04-05",
    deadline: "2023-05-15",
    companyId: "tech-corp-inc",
    featured: true,
  },
  {
    id: "2",
    title: "Marketing Specialist",
    company: "BrandBoost",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$60,000/year",
    description:
      "BrandBoost is looking for a creative and data-driven Marketing Specialist to join our growing team. You'll help develop and execute marketing campaigns across various channels to drive brand awareness and customer acquisition.",
    requirements: [
      "Bachelor's degree in Marketing, Communications, or related field",
      "1-3 years of experience in digital marketing",
      "Proficiency with marketing analytics tools",
      "Excellent written and verbal communication skills",
    ],
    responsibilities: [
      "Plan and execute marketing campaigns",
      "Analyze campaign performance and provide insights",
      "Create compelling content for various platforms",
      "Collaborate with design and sales teams",
    ],
    benefits: ["Comprehensive health insurance", "401(k) matching", "Unlimited PTO", "Remote work options"],
    postedDate: "2023-04-02",
    deadline: "2023-05-10",
    companyId: "brand-boost",
  },
  {
    id: "3",
    title: "Data Analyst",
    company: "DataDrive",
    location: "Chicago, IL",
    type: "Part-time",
    salary: "$30/hour",
    description:
      "DataDrive is seeking a detail-oriented Data Analyst to help us extract insights from our vast datasets. This part-time role offers flexibility and the opportunity to work on challenging data problems.",
    requirements: [
      "Bachelor's degree in Statistics, Mathematics, Computer Science, or related field",
      "Experience with SQL and data visualization tools",
      "Strong analytical and problem-solving skills",
      "Ability to communicate complex findings clearly",
    ],
    responsibilities: [
      "Analyze large datasets to identify trends and patterns",
      "Create reports and dashboards to visualize data",
      "Collaborate with product and engineering teams",
      "Make data-driven recommendations to improve business processes",
    ],
    benefits: [
      "Flexible schedule",
      "Professional development stipend",
      "Opportunity for full-time conversion",
      "Collaborative work environment",
    ],
    postedDate: "2023-04-01",
    deadline: "2023-05-01",
    companyId: "data-drive",
  },
  {
    id: "4",
    title: "UX Designer",
    company: "DesignPro",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$75,000/year",
    description:
      "DesignPro is looking for a talented UX Designer to create intuitive and engaging user experiences for our digital products. You'll work closely with product managers, developers, and other designers to bring ideas to life.",
    requirements: [
      "Bachelor's degree in Design, HCI, or related field",
      "2+ years of experience in UX/UI design",
      "Proficiency with design tools (Figma, Sketch, Adobe XD)",
      "Strong portfolio demonstrating your design process",
    ],
    responsibilities: [
      "Create wireframes, prototypes, and user flows",
      "Conduct user research and usability testing",
      "Collaborate with cross-functional teams",
      "Iterate on designs based on user feedback",
    ],
    benefits: [
      "Competitive salary and equity options",
      "Health, dental, and vision insurance",
      "Flexible work arrangements",
      "Professional development budget",
    ],
    postedDate: "2023-03-28",
    deadline: "2023-05-15",
    companyId: "design-pro",
  },
  {
    id: "5",
    title: "Content Writer",
    company: "ContentKing",
    location: "Remote",
    type: "Freelance",
    salary: "Based on project",
    description:
      "ContentKing is seeking creative Content Writers to produce high-quality articles, blog posts, and marketing copy for our clients across various industries. This is a flexible, project-based role ideal for writers looking for diverse writing opportunities.",
    requirements: [
      "Bachelor's degree in English, Journalism, Communications, or related field",
      "Strong portfolio of writing samples",
      "Excellent grammar and proofreading skills",
      "Ability to adapt writing style to different audiences and brands",
    ],
    responsibilities: [
      "Create engaging content for various platforms",
      "Research industry topics and trends",
      "Adhere to content guidelines and brand voice",
      "Meet deadlines and revise content based on feedback",
    ],
    benefits: [
      "Competitive per-project rates",
      "Flexible work schedule",
      "Opportunity for long-term relationships",
      "Diverse writing assignments",
    ],
    postedDate: "2023-03-25",
    deadline: "2023-04-25",
    companyId: "content-king",
  },
  {
    id: "6",
    title: "Frontend Developer",
    company: "WebWizards",
    location: "Boston, MA",
    type: "Full-time",
    salary: "$85,000/year",
    description:
      "WebWizards is looking for a skilled Frontend Developer to join our team. You'll be responsible for building responsive and interactive user interfaces for our web applications using modern JavaScript frameworks.",
    requirements: [
      "3+ years of experience with React, Vue, or Angular",
      "Strong proficiency in HTML, CSS, and JavaScript",
      "Experience with responsive design and cross-browser compatibility",
      "Knowledge of frontend build tools and package managers",
    ],
    responsibilities: [
      "Develop and maintain frontend components",
      "Collaborate with backend developers and designers",
      "Optimize applications for maximum speed and scalability",
      "Ensure code quality through testing and code reviews",
    ],
    benefits: [
      "Competitive salary and bonuses",
      "Comprehensive benefits package",
      "Remote work options",
      "Continuous learning opportunities",
    ],
    postedDate: "2023-03-20",
    deadline: "2023-04-30",
    companyId: "web-wizards",
  },
  {
    id: "7",
    title: "Product Manager",
    company: "InnovateCo",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$95,000/year",
    description:
      "InnovateCo is seeking an experienced Product Manager to lead the development of our SaaS platform. You'll work closely with engineering, design, and marketing teams to define product strategy and roadmap.",
    requirements: [
      "Bachelor's degree in Business, Computer Science, or related field",
      "3+ years of experience in product management",
      "Strong analytical and problem-solving skills",
      "Excellent communication and leadership abilities",
    ],
    responsibilities: [
      "Define product vision, strategy, and roadmap",
      "Gather and prioritize product requirements",
      "Work with engineering teams to deliver features",
      "Analyze market trends and competitive landscape",
    ],
    benefits: [
      "Competitive salary and equity",
      "Health, dental, and vision insurance",
      "401(k) with company match",
      "Professional development budget",
    ],
    postedDate: "2023-03-18",
    deadline: "2023-04-20",
    companyId: "innovate-co",
  },
  {
    id: "8",
    title: "DevOps Engineer",
    company: "CloudNine",
    location: "Denver, CO",
    type: "Full-time",
    salary: "$90,000/year",
    description:
      "CloudNine is looking for a DevOps Engineer to help us build and maintain our cloud infrastructure. You'll work on automating deployment processes, improving system reliability, and optimizing performance.",
    requirements: [
      "3+ years of experience in DevOps or SRE roles",
      "Strong knowledge of cloud platforms (AWS, Azure, or GCP)",
      "Experience with containerization and orchestration tools",
      "Proficiency in scripting languages (Python, Bash)",
    ],
    responsibilities: [
      "Design and implement CI/CD pipelines",
      "Manage cloud infrastructure using IaC tools",
      "Monitor system performance and troubleshoot issues",
      "Collaborate with development teams to improve deployment processes",
    ],
    benefits: [
      "Competitive salary",
      "Comprehensive benefits package",
      "Flexible work arrangements",
      "Professional development opportunities",
    ],
    postedDate: "2023-03-15",
    deadline: "2023-04-15",
    companyId: "cloud-nine",
  },
]

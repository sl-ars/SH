"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Filter, X } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import type { Job as ApiJob } from "@/lib/types"
import type { JobFilters } from "@/lib/api/jobs"
import { JobCard } from "@/components/job-card"
import { getJobs } from "@/lib/api/jobs"

export function JobSearch() {
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [jobsData, setJobsData] = useState<{
    jobs: ApiJob[]
    currentPage: number
    totalPages: number
    totalJobs: number
  } | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState("")
  const [industry, setIndustry] = useState("")
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [salaryMin, setSalaryMin] = useState<string>("")
  const [salaryMax, setSalaryMax] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>("recent")

  // Active filters tracking
  const [activeFilters, setActiveFilters] = useState<{
    search: string
    location: string
    jobType: string
    industry: string
    is_active?: boolean
    salary_min?: number
    salary_max?: number
  }>({
    search: "",
    location: "",
    jobType: "",
    industry: "",
    is_active: undefined,
    salary_min: undefined,
    salary_max: undefined,
  })

  // Load jobs on initial render and when filters change
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true)
      try {
        const apiFilters: JobFilters = {
          keyword: activeFilters.search,
          location: activeFilters.location,
          type: activeFilters.jobType,
          industry: activeFilters.industry,
          is_active: activeFilters.is_active,
          salary_min: activeFilters.salary_min,
          salary_max: activeFilters.salary_max,
          page: currentPage,
          page_size: 10,
          sortBy: sortBy,
        }

        const response = await getJobs(apiFilters, isAuthenticated)
        console.log("API Response:", response)
        
        if (response && response.status === "success" && response.data) {
          setJobsData({
            jobs: response.data.jobs,
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages,
            totalJobs: response.data.totalCount,
          })
        } else {
          console.error("Failed to load jobs:", response?.message)
          toast({
            title: "Error",
            description: response?.message || "Failed to load jobs. Please try again later.",
            variant: "destructive",
          })
          setJobsData({
            jobs: [],
            currentPage: 1,
            totalPages: 0,
            totalJobs: 0,
          })
        }
      } catch (error) {
        console.error("Error loading jobs:", error)
        toast({
          title: "Error",
          description: "Failed to load jobs. Please try again later.",
          variant: "destructive",
        })
        setJobsData({
          jobs: [],
          currentPage: 1,
          totalPages: 0,
          totalJobs: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadJobs()
  }, [activeFilters, currentPage, toast, isAuthenticated, sortBy])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveFilters({
      ...activeFilters,
      search: searchQuery,
      location: location,
      jobType: jobType,
      industry: industry,
      is_active: isActive,
      salary_min: salaryMin ? parseInt(salaryMin, 10) : undefined,
      salary_max: salaryMax ? parseInt(salaryMax, 10) : undefined,
    })
    setSalaryMin("")
    setSalaryMax("")
    setCurrentPage(1)
    setSortBy("recent")
  }

  const clearFilter = (filterName: keyof typeof activeFilters) => {
    setActiveFilters({
      ...activeFilters,
      [filterName]: filterName === 'is_active' || filterName === 'salary_min' || filterName === 'salary_max' ? undefined : "",
    })
    if (filterName === 'search') setSearchQuery("")
    if (filterName === 'location') setLocation("")
    if (filterName === 'jobType') setJobType("")
    if (filterName === 'industry') setIndustry("")
    if (filterName === 'is_active') setIsActive(undefined)
    if (filterName === 'salary_min') setSalaryMin("")
    if (filterName === 'salary_max') setSalaryMax("")
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setActiveFilters({
      search: "",
      location: "",
      jobType: "",
      industry: "",
      is_active: undefined,
      salary_min: undefined,
      salary_max: undefined,
    })
    setSearchQuery("")
    setLocation("")
    setJobType("")
    setIndustry("")
    setIsActive(undefined)
    setSalaryMin("")
    setSalaryMax("")
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search jobs..."
              className="pl-10 h-12 rounded-xl w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Location"
              className="pl-10 h-12 rounded-xl w-full"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:flex-1">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <select
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div className="relative w-full sm:flex-1">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <select
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="">All Industries</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="retail">Retail</option>
              <option value="marketing">Marketing</option>
              <option value="media">Media & Entertainment</option>
              <option value="construction">Construction</option>
              <option value="transportation">Transportation</option>
              <option value="energy">Energy</option>
              <option value="telecommunications">Telecommunications</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="relative w-full sm:flex-1">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <select
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background"
              value={isActive === undefined ? "" : String(isActive)}
              onChange={(e) => setIsActive(e.target.value === "" ? undefined : e.target.value === "true")}
            >
              <option value="">Any Activity Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="relative w-full sm:flex-1">
            <Input
              type="number"
              placeholder="Min Salary"
              className="h-12 rounded-xl pl-3 w-full"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              min="0"
            />
          </div>
          <div className="relative w-full sm:flex-1">
            <Input
              type="number"
              placeholder="Max Salary"
              className="h-12 rounded-xl pl-3 w-full"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              min="0"
            />
          </div>
          <div className="relative w-full sm:flex-1">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <select
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="recent">Recent</option>
              <option value="popular">Popular</option>
              <option value="featured">Featured</option>
              <option value="salary_high">Salary (High to Low)</option>
              <option value="salary_low">Salary (Low to High)</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
          <Button type="submit" className="w-full sm:w-auto h-12 px-6 rounded-xl">
            Search
          </Button>
        </div>
      </form>

      {/* Active Filters */}
      {(activeFilters.search || activeFilters.location || activeFilters.jobType || activeFilters.industry || activeFilters.is_active !== undefined || activeFilters.salary_min !== undefined || activeFilters.salary_max !== undefined) && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.search && (
            <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <span className="mr-2">Search: {activeFilters.search}</span>
              <button
                onClick={() => clearFilter("search")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {activeFilters.location && (
            <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <span className="mr-2">Location: {activeFilters.location}</span>
              <button
                onClick={() => clearFilter("location")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {activeFilters.jobType && (
            <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <span className="mr-2">Type: {activeFilters.jobType}</span>
              <button
                onClick={() => clearFilter("jobType")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {activeFilters.industry && (
            <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <span className="mr-2">Industry: {activeFilters.industry}</span>
              <button
                onClick={() => clearFilter("industry")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {activeFilters.salary_min !== undefined && (
            <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <span className="mr-2">Min Salary: {activeFilters.salary_min}</span>
              <button
                onClick={() => clearFilter("salary_min")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {activeFilters.salary_max !== undefined && (
            <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <span className="mr-2">Max Salary: {activeFilters.salary_max}</span>
              <button
                onClick={() => clearFilter("salary_max")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {activeFilters.is_active !== undefined && (
            <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <span className="mr-2">Status: {activeFilters.is_active ? "Active" : "Inactive"}</span>
              <button
                onClick={() => clearFilter("is_active")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="h-12 w-12 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-full w-3/4 mb-2"></div>
                    <div className="h-4 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-full w-1/2"></div>
                  </div>
                  <div className="h-8 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-full w-24"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && jobsData && jobsData.jobs && jobsData.jobs.length === 0 && (
          <div className="bg-white dark:bg-[#2C2C2E] rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold text-[#1C1C1E] dark:text-white mb-2">No jobs found</h3>
            <p className="text-[#8E8E93] mb-4">Try adjusting your search filters or try a different search term.</p>
            <Button
              onClick={clearAllFilters}
              className="bg-[#007AFF] dark:bg-[#0A84FF] hover:bg-[#0071E3] dark:hover:bg-[#0A84FF]/90 text-white rounded-xl"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Job List */}
        {!isLoading && jobsData && jobsData.jobs && jobsData.jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsData.jobs.map((job: ApiJob) => {
              const jobCardPropsJob = {
                id: job.id,
                title: job.title,
                company: {
                  id: job.company_id || job.id,
                  name: job.company,
                  logo: job.logo === null ? undefined : job.logo,
                },
                location: job.location,
                type: job.type,
                salary: job.salary,
                description: job.description,
                requirements: job.requirements === null ? undefined : job.requirements,
                postedDate: job.posted_date,
                deadline: job.deadline === null ? undefined : job.deadline,
                is_saved: job.is_saved,
                industry: job.industry === null ? undefined : job.industry,
                salary_min: job.salary_min,
                salary_max: job.salary_max,
              };
              return <JobCard key={job.id} job={jobCardPropsJob} />;
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && jobsData && jobsData.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              variant="outline"
            >
              Previous
            </Button>
            <span>
              Page {jobsData.currentPage} of {jobsData.totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={jobsData.currentPage === jobsData.totalPages || isLoading}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

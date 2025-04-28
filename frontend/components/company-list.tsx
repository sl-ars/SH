"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Users, Star, Building2, Briefcase, Globe, Filter, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import type { CompanyFilters, CompanyListResponse } from "@/lib/api/companies"
import { companyApi } from "@/lib/api/companies"
import type { Company } from "@/lib/types"

export function CompanyList() {
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [companiesData, setCompaniesData] = useState<{
    companies: Company[]
    currentPage: number
    totalPages: number
    totalCompanies: number
  } | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [industry, setIndustry] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Active filters tracking
  const [activeFilters, setActiveFilters] = useState<{
    search: string
    location: string
    industry: string
  }>({
    search: "",
    location: "",
    industry: "",
  })

  // Load companies on initial render and when filters change
  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoading(true)
      try {
        const filters: CompanyFilters = {
          search: activeFilters.search,
          location: activeFilters.location,
          industry: activeFilters.industry,
          page: currentPage,
          page_size: 10, // Set a consistent page size
        }

        console.log("Fetching companies with filters:", filters)

        // Check if mock data is enabled
        const mockEnabled = process.env.NEXT_PUBLIC_MOCK_ENABLED === "true"

        let data
        if (mockEnabled) {
          // Use mock data
          const response = await import("@/lib/mock-data/companies").then((module) => {
            // Convert mockCompanies object to array
            const companiesArray = Object.values(module.mockCompanies)

            // Simulate API response format
            return {
              companies: companiesArray,
              currentPage: currentPage,
              totalPages: Math.ceil(companiesArray.length / 10),
              totalCompanies: companiesArray.length,
            }
          })
          data = response
        } else {
          // Use real API
          const response = await companyApi.getAll(filters)
          console.log("API response:", response)
          
          if (response.status === "error") {
            throw new Error(response.message)
          }
          
          // Check if we have data in the response
          if (response.data && response.data.companies) {
            data = {
              companies: response.data.companies,
              currentPage: response.data.currentPage,
              totalPages: response.data.totalPages,
              totalCompanies: response.data.totalCount,
            }
          } else {
            // Handle direct API response format (from backend)
            console.log("Direct API response format:", response)
            // Type assertion for direct API response
            const directResponse = response.data as unknown as { results: Company[], count: number }
            if (directResponse && directResponse.results) {
              data = {
                companies: directResponse.results,
                currentPage: currentPage,
                totalPages: Math.ceil(directResponse.count / 10),
                totalCompanies: directResponse.count,
              }
            } else {
              throw new Error("Invalid response format from server")
            }
          }
        }

        console.log("Processed data:", data)
        setCompaniesData(data)
      } catch (error) {
        console.error("Failed to load companies:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load companies. Please try again.",
          variant: "destructive",
        })
        // Set empty data on error
        setCompaniesData({
          companies: [],
          currentPage: 1,
          totalPages: 0,
          totalCompanies: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCompanies()
  }, [activeFilters, currentPage, isAuthenticated, toast])

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveFilters({
      ...activeFilters,
      search: searchQuery,
      location,
    })
    setCurrentPage(1)
  }

  // Clear a specific filter
  const clearFilter = (filterName: keyof typeof activeFilters) => {
    setActiveFilters({
      ...activeFilters,
      [filterName]: "",
    })

    // Also reset the corresponding input
    if (filterName === "search") setSearchQuery("")
    if (filterName === "location") setLocation("")
    if (filterName === "industry") setIndustry("")

    setCurrentPage(1)
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      search: "",
      location: "",
      industry: "",
    })
    setSearchQuery("")
    setLocation("")
    setIndustry("")
    setCurrentPage(1)
  }

  // Get color for company card accent
  const getCompanyAccentColor = (index: number) => {
    const colors = [
      "bg-primary",
      "bg-green-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-purple-500",
      "bg-yellow-500",
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-3 text-primary">Explore Top Companies</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Discover innovative companies looking for talented students like you
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search companies..."
                className="pl-10 h-12 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Location"
                className="pl-10 h-12 rounded-xl"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button type="submit" className="h-12 px-6 rounded-xl">
              Search
            </Button>
          </div>
        </form>

        {/* Active Filters */}
        {(activeFilters.search || activeFilters.location || activeFilters.industry) && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
              <Filter size={14} className="mr-1" /> Filters:
            </div>

            {activeFilters.search && (
              <div className="bg-muted px-3 py-1 rounded-full text-sm flex items-center text-foreground">
                Search: {activeFilters.search}
                <button
                  onClick={() => clearFilter("search")}
                  className="ml-1 text-muted-foreground hover:text-destructive"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {activeFilters.location && (
              <div className="bg-muted px-3 py-1 rounded-full text-sm flex items-center text-foreground">
                Location: {activeFilters.location}
                <button
                  onClick={() => clearFilter("location")}
                  className="ml-1 text-muted-foreground hover:text-destructive"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {activeFilters.industry && (
              <div className="bg-muted px-3 py-1 rounded-full text-sm flex items-center text-foreground">
                Industry: {activeFilters.industry}
                <button
                  onClick={() => clearFilter("industry")}
                  className="ml-1 text-muted-foreground hover:text-destructive"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <button onClick={clearAllFilters} className="text-destructive text-sm hover:underline">
              Clear All
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md animate-pulse overflow-hidden border border-border">
                <div className="h-2 w-full bg-muted"></div>
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-muted mr-3"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-muted rounded w-32"></div>
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div className="h-9 bg-muted rounded-xl w-28"></div>
                    <div className="h-9 bg-muted rounded-full w-9"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && companiesData?.companies.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-2">No companies found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search filters or try a different search term.</p>
            <Button
              onClick={clearAllFilters}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Company Cards */}
        {!isLoading && companiesData && companiesData.companies && companiesData.companies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companiesData.companies.map((company, index) => (
              <div
                key={company.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-border"
              >
                <div className={`h-2 w-full ${getCompanyAccentColor(index)}`}></div>
                <div className="p-5">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 mr-3 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <Image
                        src={company.logo || "/placeholder.svg"}
                        alt={company.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{company.name}</h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" />
                        <span className="text-sm font-medium text-foreground">{company.rating || 0}</span>
                        <span className="text-xs text-muted-foreground ml-1">rating</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-muted-foreground">
                      <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{company.industry || "Not specified"}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{company.location || "Not specified"}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{company.employees || 0} employees</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{company.openPositions || 0} open positions</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/companies/${company.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                      >
                        View Profile
                      </Button>
                    </Link>
                    {company.website && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={() => window.open(company.website, "_blank")}
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Login Prompt for Unregistered Users */}
        {!isAuthenticated && (
          <div className="bg-primary/10 rounded-xl p-5 mt-6 border border-border">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Want to see more companies?
            </h3>
            <p className="text-foreground mb-4">
              Sign in or create an account to access all available companies and job opportunities.
            </p>
            <div className="flex gap-3">
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-xl"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Pagination - Only show for authenticated users */}
        {!isLoading && isAuthenticated && companiesData && companiesData.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              className="mr-2 rounded-xl border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center mx-2">
              <span className="text-muted-foreground">
                Page {companiesData.currentPage} of {companiesData.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              className="rounded-xl border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, companiesData.totalPages))}
              disabled={currentPage === companiesData.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

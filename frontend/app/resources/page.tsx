"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Book, Video, FileText, Users, Download, Search, Loader2, Lock, MoveRight, Clock, Tag as TagIcon, PlusCircle } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { resourcesApi, type ResourceFilters } from "@/lib/api/resources"
import type { Resource } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

// Resource type icons mapping
const resourceIcons = {
  Guide: FileText,
  "Video Course": Video,
  Webinar: Users,
  "E-book": Book,
  Article: FileText,
  Workshop: Video,
}

// Resource style variations
const resourceStyles = [
  { color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
  { color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
  { color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950" },
  { color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950" },
  { color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
]

export default function ResourcesPage() {
  const { isAuthenticated, user } = useAuth()
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Fetch resources and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch categories first
        const categoriesResponse = await resourcesApi.getCategories()
        if (categoriesResponse.status === "success" && categoriesResponse.data) {
          setCategories(["All", ...categoriesResponse.data])
        }

        // Prepare filters based on active category and search query
        const filters: ResourceFilters = {}
        if (activeCategory !== "All") {
          filters.category = activeCategory
        }
        if (searchQuery) {
          filters.search = searchQuery
        }

        // Fetch resources with filters, passing authentication status
        const resourcesResponse = await resourcesApi.getResources(filters, isAuthenticated)
        if (resourcesResponse.status === "success" && resourcesResponse.data) {
          setResources(resourcesResponse.data.results)
        } else {
          setError("Failed to load resources")
        }
      } catch (err) {
        console.error("Error fetching resources:", err)
        setError("An error occurred while fetching resources")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeCategory, searchQuery, isAuthenticated])

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  // Get icon for resource type
  const getResourceIcon = (type: string) => {
    return resourceIcons[type as keyof typeof resourceIcons] || FileText
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Resources</h1>
          <p className="text-muted-foreground">Discover tools and guides to boost your career journey.</p>
        </div>

        {/* Actions: Create Button (conditionally rendered) and Search/Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search and Filters on one side */}
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
            <div className="relative flex-grow w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search resources..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto pb-2 w-full sm:w-auto">
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Create Resource Button on the other side */}
          {isAuthenticated && user && ['admin', 'campus', 'employer'].includes(user.role) && (
            <Button onClick={() => router.push('/resources/create')} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Resource
            </Button>
          )}
        </div>

        {/* Login notice for non-authenticated users */}
        {!isAuthenticated && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-center gap-3">
            <div className="bg-primary/20 rounded-full p-2">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground">
                You are currently viewing demo resources.{" "}
                <Link href="/login" className="font-semibold underline text-primary hover:text-primary/90">
                  Log in
                </Link>{" "}
                to access all available resources.
              </p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-destructive/10 text-destructive-foreground p-4 rounded-lg mb-6">
            <p className="font-medium">Oops! Something went wrong.</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && resources.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Resources Found</h3>
            <p className="text-muted-foreground">Try adjusting your search query or selected category.</p>
            {!isAuthenticated && (
              <p className="mt-4 text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>{" "}
                to see more resources.
              </p>
            )}
          </div>
        )}

        {/* Resources Grid */}
        {!loading && !error && resources.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const ResourceIcon = getResourceIcon(resource.type_display || resource.type) 

              return (
                <Link key={resource.id} href={`/resources/${resource.id}`} className="block group h-full">
                  <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 ease-in-out group-hover:shadow-xl group-hover:border-primary/50 bg-card text-card-foreground border rounded-lg">
                    <CardContent className="p-4 flex flex-col flex-grow">
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0`}
                          >
                            <ResourceIcon className="w-5 h-5" />
                          </div>
                          {resource.is_demo && (
                              <Badge
                                variant="outline"
                                className="text-xs h-fit border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700"
                              >
                                Demo
                              </Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-lg leading-snug mb-2 group-hover:text-primary transition-colors truncate" title={resource.title}>{resource.title}</h3>
                        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="flex items-center" title={resource.category_display || resource.category || "Uncategorized"}>
                                <TagIcon className="w-3 h-3 mr-1 flex-shrink-0" /> 
                                <span className="truncate">{resource.category_display || resource.category || "Uncategorized"}</span>
                            </span>
                            <span className="text-muted-foreground/50">•</span>
                            <span className="flex items-center" title={resource.type_display || resource.type || "General"}>
                                <ResourceIcon className="w-3 h-3 mr-1 flex-shrink-0" /> 
                                <span className="truncate">{resource.type_display || resource.type || "General"}</span>
                            </span>
                            {resource.created_by && (
                                <>
                                    <span className="text-muted-foreground/50">•</span>
                                    <span className="flex items-center" title={`Author: ${resource.created_by.name || resource.created_by.email}`}>
                                        <span className="truncate">{resource.created_by.name || resource.created_by.email}</span>
                                    </span>
                                </> 
                            )}
                             {(resource.estimated_time_display || resource.estimated_time) && (
                                <>
                                    <span className="text-muted-foreground/50">•</span>
                                    <span className="flex items-center" title={resource.estimated_time_display || resource.estimated_time || "N/A"}>
                                        <Clock className="w-3 h-3 mr-1 flex-shrink-0" /> 
                                        <span className="truncate">{resource.estimated_time_display || resource.estimated_time || "N/A"}</span>
                                    </span>
                                </> 
                            )}
                        </div>
                      </div>
                      {/* View Details Affordance - shown on group hover */}
                      <div className="mt-3 pt-3 border-t border-dashed border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out flex items-center justify-end text-xs text-primary">
                        View Details <MoveRight className="w-3 h-3 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {/* Featured Section - Themed */}
        <div className="mt-16 bg-primary/90 text-primary-foreground rounded-xl p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Need Personalized Guidance?</h2>
            <p className="mb-6 opacity-90">Book a session with our career advisors for tailored advice and support.</p>
            <Button
              size="lg"
              variant="secondary" // Using secondary for contrast on primary background
              className="rounded-full px-8 shadow-md hover:shadow-lg transition-shadow"
              onClick={() => router.push('/consultations')} // Assuming a route like /consultations
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


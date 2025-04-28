"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { jobsApi } from "@/lib/api/jobs"
import { JobCard } from "@/components/job-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function JobMatchesPage() {
  const [matches, setMatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would call a specific endpoint for job matches
        const response = await jobsApi.getJobs({
          match: true,
          search: searchQuery,
          type: activeTab !== "all" ? activeTab : undefined,
        })

        // Add a delay to simulate loading for demonstration purposes
        setTimeout(() => {
          setMatches(response.data.results)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching job matches:", error)
        setIsLoading(false)
      }
    }

    fetchMatches()
  }, [activeTab, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The search is triggered by the useEffect when searchQuery changes
  }

  const filteredMatches = matches.filter(
    (match) =>
      match.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.company.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Matches</h1>
          <p className="text-muted-foreground">Jobs that match your skills and preferences</p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full md:w-auto">
          <Input
            placeholder="Search matches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mr-2 w-full md:w-[300px]"
          />
          <Button type="submit">Search</Button>
        </form>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Matches</TabsTrigger>
          <TabsTrigger value="fulltime">Full-time</TabsTrigger>
          <TabsTrigger value="parttime">Part-time</TabsTrigger>
          <TabsTrigger value="internship">Internship</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Job Matches</CardTitle>
              <CardDescription>
                Jobs that match your profile based on your skills, experience, and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMatches.length > 0 ? (
                <div className="space-y-4">
                  {filteredMatches.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No matches found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or updating your profile to get more matches
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fulltime" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Full-time Job Matches</CardTitle>
              <CardDescription>Full-time positions that match your profile</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar content structure as the "all" tab */}
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMatches
                    .filter((job) => job.type === "Full-time")
                    .map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similar structure for other tabs */}
        <TabsContent value="parttime" className="mt-6">
          {/* Part-time jobs content */}
        </TabsContent>

        <TabsContent value="internship" className="mt-6">
          {/* Internship content */}
        </TabsContent>
      </Tabs>
    </div>
  )
}

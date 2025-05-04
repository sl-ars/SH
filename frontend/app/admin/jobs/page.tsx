"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { jobApi } from "@/lib/api/jobs"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Plus, Search, RefreshCw } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchJobs = async (page = 1, search = "") => {
    setIsLoading(true)
    try {
      const response = await jobApi.getJobs({
        page,
        page_size: 10,
        keyword: search,
      })
      
      if (response && response.data && response.data.jobs) {
        setJobs(response.data.jobs);
        setTotalPages(Math.ceil(response.data.totalCount / 10));
      } else {
        setJobs([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      })
      setJobs([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs(currentPage, searchQuery)
  }, [currentPage, toast])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchJobs(1, searchQuery)
  }

  const handleRefresh = () => {
    fetchJobs(currentPage, searchQuery)
  }

  const handleDeleteClick = (jobId: string) => {
    setJobToDelete(jobId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteJob = async () => {
    if (!jobToDelete) return
    
    try {
      await jobApi.deleteJob(jobToDelete)
      toast({
        title: "Success",
        description: "Job deleted successfully",
      })
      fetchJobs(currentPage, searchQuery)
    } catch (error) {
      console.error("Error deleting job:", error)
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setJobToDelete(null)
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Jobs</h1>
          <p className="text-muted-foreground">View and manage all job postings</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <Link href="/admin/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Job
            </Link>
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Jobs</CardTitle>
              <CardDescription>Manage job postings across all companies</CardDescription>
            </div>

            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mr-2"
              />
              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[200px]" />
              </div>
              <div className="border rounded-lg">
                <div className="h-12 px-4 border-b flex items-center">
                  <Skeleton className="h-4 w-full" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 px-4 border-b flex items-center">
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Skeleton className="h-10 w-[100px]" />
                <Skeleton className="h-10 w-[100px]" />
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.length > 0 ? (
                      jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title || 'Untitled'}</TableCell>
                          <TableCell>{job.company_name || job.company || 'Unknown Company'}</TableCell>
                          <TableCell>{job.location || 'Remote'}</TableCell>
                          <TableCell>{job.type || 'Not specified'}</TableCell>
                          <TableCell>
                            <Badge variant={(job.status && job.status === "Active") ? "secondary" : "outline"}>
                              {job.status || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Unknown date'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/jobs/${job.id}`}>View</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/jobs/edit/${job.id}`}>Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteClick(job.id)} className="text-red-600">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          No jobs found. Try adjusting your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteJob}
        title="Delete Job Posting"
        description="Are you sure you want to delete this job posting? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { employerApi } from "@/lib/api"
import { Job } from "@/lib/types"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { MoreVertical, Edit, Trash2, Eye, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const router = useRouter()

  const fetchJobs = async () => {
    try {
      const response = await employerApi.getJobs()
      setJobs(response || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Failed to fetch jobs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleEdit = (jobId: string) => {
    router.push(`/employer/jobs/${jobId}/edit`)
  }

  const handleView = (jobId: string) => {
    router.push(`/jobs/${jobId}`)
  }

  const handleDeleteClick = (jobId: string) => {
    setJobToDelete(jobId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return

    try {
      await employerApi.deleteJob(jobToDelete)
      toast.success("Job posting deleted successfully")
      fetchJobs()
    } catch (error) {
      console.error("Error deleting job:", error)
      toast.error("Failed to delete job posting")
    } finally {
      setDeleteDialogOpen(false)
      setJobToDelete(null)
    }
  }

  const columns = [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      id: "salary",
      header: "Salary",
      cell: ({ row }: any) => {
        const { salary_min, salary_max } = row.original
        if (salary_min && salary_max) {
          return `$${salary_min} - $${salary_max}`
        } else if (salary_min) {
          return `$${salary_min}`
        } else if (salary_max) {
          return `$${salary_max}`
        }
        return "N/A"
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: any) => (
        <span className={row.original.is_active ? "text-green-600" : "text-red-600"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(row.original.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteClick(row.original.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-muted-foreground">Manage your job postings</p>
        </div>
        <Button onClick={() => router.push("/employer/jobs/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Job
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={jobs}
            isLoading={isLoading}
            noDataMessage="No job postings found"
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Job Posting"
        description="Are you sure you want to delete this job posting? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
} 
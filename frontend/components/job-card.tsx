"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, MapPin, Building, Calendar, Clock, Briefcase } from "lucide-react"
import { jobApi, saveJob, unsaveJob } from "@/lib/api/jobs"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { QuickApplyButton } from "./quick-apply-button"

interface JobCardProps {
  job: {
    id: string
    title: string
    company: {
      id: string
      name: string
      logo?: string
    }
    location: string
    type: string
    salary?: string
    description: string
    requirements?: string[]
    postedAt?: string
    postedDate?: string
    deadline?: string
    is_saved?: boolean
    isQuickApply?: boolean
    tags?: string[]
    industry?: string
    salary_min?: number
    salary_max?: number
  }
  showActions?: boolean
  showDescription?: boolean
  showCompanyLink?: boolean
  className?: string
}

export function JobCard({
  job,
  showActions = true,
  showDescription = true,
  showCompanyLink = true,
  className = "",
}: JobCardProps) {
  const [isSavedState, setIsSavedState] = useState(job.is_saved || false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSaveToggle = async () => {
    setIsLoading(true)
    try {
      let response;
      if (isSavedState) {
        response = await jobApi.unsaveJob(job.id)
        if (response.status === "success") {
          setIsSavedState(false)
          toast({ title: "Success", description: "Job unsaved." })
        } else {
          toast({ title: "Error", description: response.message || "Failed to unsave job.", variant: "destructive" })
        }
      } else {
        response = await jobApi.saveJob(job.id)
        if (response.status === "success") {
          setIsSavedState(true)
          toast({ title: "Success", description: "Job saved!" })
        } else {
          toast({ title: "Error", description: response.message || "Failed to save job.", variant: "destructive" })
        }
      }
    } catch (error: any) {
      console.error("Error toggling save status:", error)
      toast({ title: "Error", description: error.message || "An unexpected error occurred.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const getPostedTimeAgo = () => {
    try {
      const dateString = job.postedAt || job.postedDate
      if (!dateString) return "Recently posted"
      
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Recently posted"
      
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Recently posted"
    }
  }

  const postedTimeAgo = getPostedTimeAgo()

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">
              <Link href={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
                {job.title}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              {showCompanyLink ? (
                <Link
                  href={`/companies/${job.company.id}`}
                  className="flex items-center hover:text-primary transition-colors"
                >
                  <Building className="h-4 w-4 mr-1" />
                  {job.company.name}
                </Link>
              ) : (
                <span className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {job.company.name}
                </span>
              )}
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </span>
            </CardDescription>
          </div>
          {showActions && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveToggle}
              disabled={isLoading}
              className="text-muted-foreground hover:text-primary"
            >
              {isSavedState ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="flex items-center">
            <Briefcase className="h-3 w-3 mr-1" />
            {job.type}
          </Badge>
          {(job.salary_min !== undefined || job.salary_max !== undefined || job.salary) && (
            <Badge variant="outline" className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {job.salary_min !== undefined && job.salary_max !== undefined
                ? `${job.salary_min} - ${job.salary_max}`
                : job.salary_min !== undefined
                  ? `From ${job.salary_min}`
                  : job.salary_max !== undefined
                    ? `Up to ${job.salary_max}`
                    : job.salary}
            </Badge>
          )}
          {job.industry && (
            <Badge variant="outline" className="flex items-center">
              <Briefcase className="h-3 w-3 mr-1" />
              {job.industry}
            </Badge>
          )}
          <Badge variant="outline" className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {postedTimeAgo}
          </Badge>
        </div>
        {showDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex flex-wrap gap-1">
          {job.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          {job.isQuickApply && <QuickApplyButton jobId={job.id} />}
          <Button asChild variant="default" size="sm">
            <Link href={`/jobs/${job.id}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}


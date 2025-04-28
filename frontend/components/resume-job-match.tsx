"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { jobApi } from "@/lib/api/jobs"
import { useToast } from "@/hooks/use-toast"

interface ResumeJobMatchProps {
  resumeId: string
  jobId?: string
}

export function ResumeJobMatch({ resumeId, jobId }: ResumeJobMatchProps) {
  const [matchData, setMatchData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobId || null)
  const [jobs, setJobs] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobApi.getJobs({ page_size: 5 })
        setJobs(response.data.jobs)
        if (!selectedJobId && response.data.jobs.length > 0) {
          setSelectedJobId(response.data.jobs[0].id)
        }
      } catch (error) {
        console.error("Error fetching jobs:", error)
        toast({
          title: "Error",
          description: "Failed to load jobs for comparison",
          variant: "destructive",
        })
      }
    }

    if (!jobId) {
      fetchJobs()
    }
  }, [jobId, toast])

  useEffect(() => {
    const fetchMatchData = async () => {
      if (!resumeId || !selectedJobId) return

      setIsLoading(true)
      try {
        // This would be a real API call in a production app
        // const response = await resumeApi.getJobMatch(resumeId, selectedJobId)

        // Mock data for demonstration
        setTimeout(() => {
          const mockData = {
            overallMatch: 78,
            skillsMatch: 82,
            experienceMatch: 65,
            educationMatch: 90,
            missingSkills: ["Docker", "Kubernetes", "GraphQL"],
            matchingSkills: ["React", "TypeScript", "Node.js", "Express", "MongoDB"],
            recommendations: [
              "Add Docker experience to your resume",
              "Highlight any GraphQL knowledge you may have",
              "Consider taking a Kubernetes course to improve your profile",
            ],
          }
          setMatchData(mockData)
          setIsLoading(false)
        }, 1500)
      } catch (error) {
        console.error("Error fetching match data:", error)
        toast({
          title: "Error",
          description: "Failed to analyze resume match",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchMatchData()
  }, [resumeId, selectedJobId, toast])

  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId)
  }

  if (!resumeId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resume Job Match</CardTitle>
          <CardDescription>Upload a resume to see how well it matches with job listings</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Job Match</CardTitle>
        <CardDescription>See how well your resume matches with this job</CardDescription>
      </CardHeader>
      <CardContent>
        {!jobId && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Select a job to compare:</div>
            <div className="flex flex-wrap gap-2">
              {jobs.map((job) => (
                <Button
                  key={job.id}
                  variant={selectedJobId === job.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleJobChange(job.id)}
                >
                  {job.title}
                </Button>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ) : matchData ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Overall Match</span>
                <span className="text-sm font-medium">{matchData.overallMatch}%</span>
              </div>
              <Progress value={matchData.overallMatch} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Skills</span>
                  <span className="text-sm font-medium">{matchData.skillsMatch}%</span>
                </div>
                <Progress value={matchData.skillsMatch} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Experience</span>
                  <span className="text-sm font-medium">{matchData.experienceMatch}%</span>
                </div>
                <Progress value={matchData.experienceMatch} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Education</span>
                  <span className="text-sm font-medium">{matchData.educationMatch}%</span>
                </div>
                <Progress value={matchData.educationMatch} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Matching Skills</div>
              <div className="flex flex-wrap gap-2">
                {matchData.matchingSkills.map((skill: string) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Missing Skills</div>
              <div className="flex flex-wrap gap-2">
                {matchData.missingSkills.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="border-destructive text-destructive">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Recommendations</div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {matchData.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p>Failed to load match data. Please try again.</p>
            <Button variant="outline" className="mt-2" onClick={() => setIsLoading(true)}>
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

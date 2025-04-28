"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Trash2 } from "lucide-react"
import { userApi } from "@/lib/api/user"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface Resume {
  id: string
  name: string
  url: string
  created_at: string
}

interface ResumeListProps {
  resumes: Resume[]
  onDelete?: (id: string) => void
}

export function ResumeList({ resumes, onDelete }: ResumeListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      const response = await userApi.deleteResume(id)
      if (response.status === "success") {
        toast({
          title: "Success",
          description: "Resume deleted successfully",
        })
        onDelete?.(id)
      } else {
        throw new Error(response.message)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete resume",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (resumes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No resumes uploaded yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {resumes.map((resume) => (
        <Card key={resume.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{resume.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Uploaded {format(new Date(resume.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(resume.url, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(resume.id)}
                  disabled={deletingId === resume.id}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deletingId === resume.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 
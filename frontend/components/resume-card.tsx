"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FileText, Download, Trash2, MoreHorizontal, CheckCircle, Edit, Eye, X, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Resume } from "@/lib/types"

interface ResumeCardProps {
  resume: Resume
  onSelect: () => void
  onDelete: () => void
  onSetDefault: () => void
  onRename: (newName: string) => void
}

export function ResumeCard({ resume, onSelect, onDelete, onSetDefault, onRename }: ResumeCardProps) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(resume.name)

  const handleRename = () => {
    if (newName.trim() && newName !== resume.name) {
      onRename(newName.trim())
    }
    setIsRenaming(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className={`h-2 w-full ${resume.isDefault ? "bg-green-500" : "bg-vibrant-blue"}`}></div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-vibrant-blue mr-2" />
            {isRenaming ? (
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-7 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename()
                  if (e.key === "Escape") setIsRenaming(false)
                }}
              />
            ) : (
              <h3 className="font-medium truncate max-w-[180px]" title={resume.name}>
                {resume.name}
              </h3>
            )}
          </div>

          {isRenaming ? (
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" onClick={() => setIsRenaming(false)} className="h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleRename} className="h-7 w-7">
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onSelect}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={resume.url} download={resume.name}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </DropdownMenuItem>
                {!resume.isDefault && (
                  <DropdownMenuItem onClick={onSetDefault}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Set as Default
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this resume?")) {
                      onDelete()
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="space-y-2 mt-3">
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Uploaded: {formatDate(resume.createdAt)}</span>
          </div>

          {resume.updatedAt && resume.updatedAt !== resume.createdAt && (
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Updated: {formatDate(resume.updatedAt)}</span>
            </div>
          )}

          {resume.applicationCount > 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <span>
                Used in {resume.applicationCount} application{resume.applicationCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {resume.isDefault && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Default Resume
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="ghost" size="sm" onClick={onSelect}>
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>

        <Button variant="ghost" size="sm" asChild>
          <a href={resume.url} target="_blank" rel="noopener noreferrer">
            <FileText className="w-4 h-4 mr-2" />
            Preview
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle } from "lucide-react"

interface ProfileItem {
  name: string
  completed: boolean
  required: boolean
}

interface ProfileCompletionProps {
  items: ProfileItem[]
}

export function ProfileCompletion({ items }: ProfileCompletionProps) {
  const completedCount = items.filter((item) => item.completed).length
  const totalCount = items.length
  const percentage = Math.round((completedCount / totalCount) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{percentage}% Complete</span>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} Items
              </span>
            </div>
            <Progress value={percentage} />
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                <div className="flex items-center gap-2">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className={item.completed ? "line-through text-muted-foreground" : ""}>{item.name}</span>
                </div>
                {item.required && !item.completed && <span className="text-xs text-red-500">Required</span>}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

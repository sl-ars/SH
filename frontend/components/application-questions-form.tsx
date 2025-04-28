"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from "lucide-react"
import type { ApplicationQuestion } from "@/lib/types"

interface ApplicationQuestionsFormProps {
  questions: ApplicationQuestion[]
  onChange: (questions: ApplicationQuestion[]) => void
}

export function ApplicationQuestionsForm({ questions, onChange }: ApplicationQuestionsFormProps) {
  const addQuestion = () => {
    const newQuestion: ApplicationQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      type: "text",
      question: "",
      required: false,
      options: [],
    }
    onChange([...questions, newQuestion])
  }

  const removeQuestion = (id: string) => {
    onChange(questions.filter((q) => q.id !== id))
  }

  const updateQuestion = (id: string, updates: Partial<ApplicationQuestion>) => {
    onChange(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Application Questions</h3>
        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.map((question) => (
        <div key={question.id} className="p-4 border rounded-lg space-y-4 relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => removeQuestion(question.id)}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              value={question.question}
              onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
              placeholder="Enter your question"
            />
          </div>

          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={question.type}
              onValueChange={(value) =>
                updateQuestion(question.id, {
                  type: value as ApplicationQuestion["type"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Answer</SelectItem>
                <SelectItem value="singleChoice">Single Choice</SelectItem>
                <SelectItem value="multipleChoice">Multiple Choice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(question.type === "singleChoice" || question.type === "multipleChoice") && (
            <div className="space-y-2">
              <Label>Options</Label>
              {question.options?.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])]
                      newOptions[index] = e.target.value
                      updateQuestion(question.id, { options: newOptions })
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newOptions = question.options?.filter((_, i) => i !== index)
                      updateQuestion(question.id, { options: newOptions })
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(question.options || []), ""]
                  updateQuestion(question.id, { options: newOptions })
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`required-${question.id}`}
              checked={question.required}
              onCheckedChange={(checked) => updateQuestion(question.id, { required: !!checked })}
            />
            <Label htmlFor={`required-${question.id}`}>Required question</Label>
          </div>
        </div>
      ))}
    </div>
  )
}

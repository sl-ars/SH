"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { adminApi } from "@/lib/api/admin"
import { isMockEnabled } from "@/lib/utils/config"
import { mockAdminCompanies } from "@/lib/mock-data/admin"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function EditCompanyPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState({
    name: "",
    industry: "",
    location: "",
    website: "",
    description: "",
    verified: false,
    contactEmail: "",
    contactPhone: "",
  })

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true)
        let data
        if (isMockEnabled()) {
          // Use mock data
          const mockCompany = mockAdminCompanies.find((c) => c.id === id)
          if (!mockCompany) throw new Error("Company not found")

          // Add additional fields that might not be in the mock data
          data = {
            data: {
              ...mockCompany,
              website: mockCompany.website || "https://example.com",
              description: mockCompany.description || "Company description",
              contactEmail: mockCompany.contactEmail || "contact@example.com",
              contactPhone: mockCompany.contactPhone || "+1 (555) 123-4567",
            },
            status: "success",
          }
        } else {
          // Use real API
          data = await adminApi.getCompanyById(id as string)
        }
        setCompany(data.data)
      } catch (err) {
        console.error("Error fetching company:", err)
        setError("Failed to load company details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCompany()
    }
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCompany((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setCompany((prev) => ({ ...prev, verified: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isMockEnabled()) {
        // Mock update
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay
        toast({
          title: "Company updated",
          description: "The company has been successfully updated.",
        })
        router.push("/admin/companies")
        return
      }

      // Real API update
      await adminApi.updateCompany(id as string, company)
      toast({
        title: "Company updated",
        description: "The company has been successfully updated.",
      })
      router.push("/admin/companies")
    } catch (err) {
      console.error("Error updating company:", err)
      setError("Failed to update company. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we load the company details.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-4 flex items-center gap-1" onClick={() => router.push("/admin/companies")}>
        <ArrowLeft className="w-4 h-4" /> Back to Companies
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Company</CardTitle>
          <CardDescription>Update company information</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" name="name" value={company.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" name="industry" value={company.industry} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" value={company.location} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={company.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={company.contactEmail}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={company.contactPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                name="description"
                value={company.description}
                onChange={handleChange}
                rows={5}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="verified" checked={company.verified} onCheckedChange={handleCheckboxChange} />
              <Label htmlFor="verified" className="cursor-pointer">
                Verified Company
              </Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/companies")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex items-center gap-1">
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

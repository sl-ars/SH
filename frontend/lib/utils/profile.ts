import type { UserProfile } from "@/lib/types"

export function calculateProfileCompletion(profile: UserProfile): {
  percentage: number
  missingFields: string[]
} {
  const requiredFields = [
    { name: "name", label: "Full Name" },
    { name: "email", label: "Email" },
    { name: "education", label: "Education Details" },
    { name: "skills", label: "Skills" },
    { name: "resume", label: "Resume" },
    { name: "bio", label: "Professional Summary" },
  ]

  const completedFields = requiredFields.filter((field) => Boolean(profile[field.name as keyof UserProfile]))

  const percentage = Math.round((completedFields.length / requiredFields.length) * 100)
  const missingFields = requiredFields
    .filter((field) => !profile[field.name as keyof UserProfile])
    .map((field) => field.label)

  return { percentage, missingFields }
}

/**
 * Compares original and updated profile data to find changed fields
 * @param original Original profile data
 * @param updated Updated profile data
 * @returns Object containing only the changed fields
 */
export function getChangedFields(original: UserProfile, updated: UserProfile): Partial<UserProfile> {
  const changes: Partial<UserProfile> = {}

  // Helper to compare arrays
  const arraysEqual = (a: any[] | undefined, b: any[] | undefined) => {
    if (!a && !b) return true
    if (!a || !b) return false
    if (a.length !== b.length) return false
    return a.every((val, i) => val === b[i])
  }

  // Helper to compare objects
  const objectsEqual = (a: any, b: any) => {
    if (!a && !b) return true
    if (!a || !b) return false
    return JSON.stringify(a) === JSON.stringify(b)
  }

  // Check each field
  for (const key in updated) {
    const originalValue = original[key]
    const updatedValue = updated[key]

    // Skip if values are equal
    if (originalValue === updatedValue) continue

    // Handle arrays (skills, education, experience)
    if (Array.isArray(updatedValue)) {
      if (!arraysEqual(originalValue as any[], updatedValue)) {
        changes[key] = updatedValue
      }
      continue
    }

    // Handle objects (education, experience items)
    if (typeof updatedValue === 'object' && updatedValue !== null) {
      if (!objectsEqual(originalValue, updatedValue)) {
        changes[key] = updatedValue
      }
      continue
    }

    // Handle primitive values
    if (updatedValue !== originalValue) {
      changes[key] = updatedValue
    }
  }

  return changes
}

/**
 * Example usage:
 * 
 * const originalProfile = {
 *   name: "John Doe",
 *   email: "john@example.com",
 *   skills: ["Python", "JavaScript"],
 *   education: [
 *     { university: "MIT", degree: "BS", field: "CS" }
 *   ]
 * }
 * 
 * const updatedProfile = {
 *   name: "John Doe",
 *   email: "john@example.com",
 *   skills: ["Python", "JavaScript", "React"],
 *   education: [
 *     { university: "MIT", degree: "BS", field: "CS" }
 *   ]
 * }
 * 
 * const changes = getChangedFields(originalProfile, updatedProfile)
 * // Result: { skills: ["Python", "JavaScript", "React"] }
 * 
 * // Then use in API call:
 * const response = await api.patch(`/api/user/profile/student/`, changes)
 */

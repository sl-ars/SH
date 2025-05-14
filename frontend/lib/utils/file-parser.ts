// import * as XLSX from "xlsx"

// /**
//  * Parses a CSV file and returns an array of user objects
//  * @param file The CSV file to parse
//  * @returns An array of user objects
//  */
// export async function parseCSV(file: File): Promise<any[]> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()

//     reader.onload = (event) => {
//       try {
//         const csv = event.target?.result as string
//         if (!csv) {
//           reject(new Error("Failed to read CSV file"))
//           return
//         }

//         // Parse CSV
//         const lines = csv.split("\n")
//         const headers = lines[0].split(",").map((header) => header.trim().toLowerCase())

//         // Validate required headers - either name or first_name should be present
//         const hasNameField = headers.includes("name")
//         const hasFirstNameField = headers.includes("first_name")
        
//         if ((!hasNameField && !hasFirstNameField) || !headers.includes("email")) {
//           reject(new Error('CSV file must include either "name" or "first_name", and "email" columns'))
//           return
//         }

//         const users = []

//         // Start from line 1 (skip headers)
//         for (let i = 1; i < lines.length; i++) {
//           if (!lines[i].trim()) continue // Skip empty lines

//           const values = lines[i].split(",").map((value) => value.trim())
//           const user: Record<string, any> = {}

//           // Map values to user object
//           headers.forEach((header, index) => {
//             if (index < values.length) {
//               user[header] = values[index]
//             }
//           })

//           // Handle name vs first_name/last_name
//           if (hasNameField && !hasFirstNameField) {
//             // Если есть только name, сохраняем его как есть
//             // Бэкенд ожидает поле name
//           } else if (!hasNameField && hasFirstNameField) {
//             // Если есть first_name, но нет name - создаем name
//             const firstName = user.first_name || ""
//             const lastName = user.last_name || ""
//             user.name = `${firstName} ${lastName}`.trim()
//           }

//           // Set default values
//           if (!user.role) user.role = "student"
//           if (!user.password) user.password = generateRandomPassword(10)

//           users.push(user)
//         }

//         resolve(users)
//       } catch (error) {
//         reject(error)
//       }
//     }

//     reader.onerror = () => {
//       reject(new Error("Failed to read CSV file"))
//     }

//     reader.readAsText(file)
//   })
// }

// /**
//  * Parses an Excel file and returns an array of user objects
//  * @param file The Excel file to parse
//  * @returns An array of user objects
//  */
// export async function parseExcel(file: File): Promise<any[]> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()

//     reader.onload = (event) => {
//       try {
//         const data = event.target?.result
//         if (!data) {
//           reject(new Error("Failed to read Excel file"))
//           return
//         }

//         // Parse Excel
//         const workbook = XLSX.read(data, { type: "array" })
//         const sheetName = workbook.SheetNames[0]
//         const worksheet = workbook.Sheets[sheetName]

//         // Convert to JSON
//         const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
//         if (jsonData.length === 0) {
//           reject(new Error("Excel file is empty or contains no valid data"))
//           return
//         }

//         // Check for required fields
//         const firstRow = jsonData[0] as Record<string, any>
//         const hasNameField = "name" in firstRow || "Name" in firstRow
//         const hasFirstNameField = "first_name" in firstRow || "First Name" in firstRow
//         const hasEmailField = "email" in firstRow || "Email" in firstRow
        
//         if ((!hasNameField && !hasFirstNameField) || !hasEmailField) {
//           reject(new Error('Excel file must include either "name" or "first_name", and "email" columns'))
//           return
//         }

//         // Process users
//         const users = jsonData.map((row: any) => {
//           // Convert all keys to lowercase
//           const user: Record<string, any> = {}
//           Object.keys(row).forEach((key) => {
//             user[key.toLowerCase().replace(/\s/g, '_')] = row[key]
//           })

//           // Handle name vs first_name/last_name
//           if (!user.name && (user.first_name || user.last_name)) {
//             // Если есть first_name/last_name, но нет name - создаем name
//             const firstName = user.first_name || ""
//             const lastName = user.last_name || ""
//             user.name = `${firstName} ${lastName}`.trim()
//           }
          
//           // Set default values
//           if (!user.role) user.role = "student"
//           if (!user.password) user.password = generateRandomPassword(10)

//           return user
//         })

//         resolve(users)
//       } catch (error) {
//         reject(error)
//       }
//     }

//     reader.onerror = () => {
//       reject(new Error("Failed to read Excel file"))
//     }

//     reader.readAsArrayBuffer(file)
//   })
// }

// // Import the password generator
// import { generateRandomPassword } from "./password"

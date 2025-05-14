/**
 * Generates a random password with the specified length
 * @param length The length of the password to generate
 * @returns A random password string
 */
export function generateRandomPassword(length = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+"
  let password = ""

  // Ensure at least one character from each category
  password += getRandomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ") // Uppercase
  password += getRandomChar("abcdefghijklmnopqrstuvwxyz") // Lowercase
  password += getRandomChar("0123456789") // Number
  password += getRandomChar("!@#$%^&*()-_=+") // Special character

  // Fill the rest of the password
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }

  // Shuffle the password characters
  return shuffleString(password)
}

/**
 * Gets a random character from the provided character set
 */
function getRandomChar(charset: string): string {
  const randomIndex = Math.floor(Math.random() * charset.length)
  return charset[randomIndex]
}

/**
 * Shuffles the characters in a string
 */
function shuffleString(str: string): string {
  const array = str.split("")
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array.join("")
}

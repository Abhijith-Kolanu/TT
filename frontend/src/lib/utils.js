import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const readFileAsDataURL = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
    }
    reader.readAsDataURL(file);
  })
}

export const getUserInitials = (username) => {
  if (!username) return 'U';
  
  // Split username by spaces, underscores, or dots and take first letter of each part
  const parts = username.split(/[\s._-]+/).filter(part => part.length > 0);
  
  if (parts.length >= 2) {
    // If we have multiple parts, take first letter of first two parts
    return (parts[0][0] + parts[1][0]).toUpperCase();
  } else {
    // If only one part, take first two letters or just first letter
    const firstPart = parts[0];
    return firstPart.length >= 2 
      ? (firstPart[0] + firstPart[1]).toUpperCase()
      : firstPart[0].toUpperCase();
  }
}

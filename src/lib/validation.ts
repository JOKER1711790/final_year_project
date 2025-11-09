import { z } from "zod";

// Suspicious patterns for XSS, SQLi, and other injection attacks
const SUSPICIOUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /('|")\s*(or|and)\s*\1\s*=\s*\1/gi,
  /union\s+select/gi,
  /drop\s+table/gi,
  /insert\s+into/gi,
  /delete\s+from/gi,
  /../gi, // Path traversal
  /%00/gi, // Null byte injection
];

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
  ".js", ".py", ".apk", ".exe", ".zip", ".jar", ".ipa",
  ".ts", ".tsx", ".jsx", ".java", ".cpp", ".c", ".go",
  ".rb", ".php", ".html", ".css", ".json", ".xml"
];

// URL validation schema
export const urlSchema = z.string()
  .trim()
  .min(1, "URL cannot be empty")
  .max(2048, "URL too long")
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Invalid URL format. Must start with http:// or https://");

// API endpoint validation schema
export const apiSchema = z.string()
  .trim()
  .min(1, "API endpoint cannot be empty")
  .max(2048, "API endpoint too long")
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return (parsed.protocol === "http:" || parsed.protocol === "https:") &&
             (url.includes("/api/") || url.includes("/v1/") || url.includes("/graphql"));
    } catch {
      return false;
    }
  }, "Invalid API endpoint. Must be a valid HTTP(S) URL with API path");

// File validation schema
export const fileSchema = z.object({
  name: z.string().min(1, "Filename cannot be empty").max(255, "Filename too long"),
  size: z.number().max(MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`),
  type: z.string(),
});

/**
 * Sanitize input by removing suspicious patterns
 */
export function sanitizeInput(input: string): string {
  let sanitized = input.trim();
  
  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(sanitized)) {
      throw new Error("Input contains suspicious patterns");
    }
  }
  
  // HTML encode special characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
  
  return sanitized;
}

/**
 * Validate file extension
 */
export function validateFileExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Generate safe filename with hash
 */
export async function generateSafeFilename(file: File): Promise<string> {
  const ext = file.name.substring(file.name.lastIndexOf("."));
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  
  // Create a simple hash from file content
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8);
  
  return `${timestamp}-${random}-${hashHex}${ext}`;
}

/**
 * Validate URL input
 */
export function validateUrl(url: string): { valid: boolean; sanitized?: string; error?: string } {
  try {
    const result = urlSchema.parse(url);
    return { valid: true, sanitized: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: "Invalid URL" };
  }
}

/**
 * Validate API endpoint input
 */
export function validateApiEndpoint(endpoint: string): { valid: boolean; sanitized?: string; error?: string } {
  try {
    const result = apiSchema.parse(endpoint);
    return { valid: true, sanitized: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: "Invalid API endpoint" };
  }
}

/**
 * Validate file input
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Validate file schema
  try {
    fileSchema.parse({
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: "Invalid file" };
  }
  
  // Validate extension
  if (!validateFileExtension(file.name)) {
    return { 
      valid: false, 
      error: `File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` 
    };
  }
  
  return { valid: true };
}

export interface ValidatedInput {
  type: "url" | "api" | "file";
  original: string | File;
  sanitized?: string;
  safeFilename?: string;
  timestamp: number;
}

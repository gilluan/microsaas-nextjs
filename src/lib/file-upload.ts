import { uploadData, getUrl, remove } from 'aws-amplify/storage'
import { client, handleGraphQLError } from '@/lib/amplify'

/**
 * File upload configuration
 */
export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'text/plain', 'application/msword'],
  maxImageDimensions: {
    width: 2048,
    height: 2048
  },
  imageQuality: 0.85,
  thumbnailSize: {
    width: 200,
    height: 200
  }
} as const

/**
 * File validation result
 */
export interface FileValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

/**
 * Upload progress callback
 */
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * Upload options
 */
export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void
  contentType?: string
  metadata?: Record<string, string>
  generateThumbnail?: boolean
  optimizeImage?: boolean
}

/**
 * Upload result
 */
export interface UploadResult {
  key: string
  url?: string
  thumbnailKey?: string
  thumbnailUrl?: string
  size: number
  contentType: string
  metadata?: Record<string, string>
}

/**
 * Image dimensions interface
 */
interface ImageDimensions {
  width: number
  height: number
}

/**
 * Validate file for upload
 */
export function validateFile(
  file: File,
  allowedTypes: string[] = UPLOAD_CONFIG.allowedImageTypes
): FileValidationResult {
  const warnings: string[] = []

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  // Check file size
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    return {
      isValid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(UPLOAD_CONFIG.maxFileSize)})`
    }
  }

  // Add warnings for large files
  if (file.size > UPLOAD_CONFIG.maxFileSize * 0.8) {
    warnings.push('File is quite large and may take longer to upload')
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'))
      return
    }

    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Resize image to specified dimensions
 */
export function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = UPLOAD_CONFIG.imageQuality
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'))
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to resize image'))
            return
          }

          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })

          resolve(resizedFile)
        },
        file.type,
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Generate thumbnail for image
 */
export async function generateThumbnail(file: File): Promise<File> {
  const { width, height } = UPLOAD_CONFIG.thumbnailSize
  return resizeImage(file, width, height, 0.9)
}

/**
 * Generate unique S3 key for file
 */
export function generateS3Key(fileName: string, prefix: string = 'uploads'): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')

  return `${prefix}/${timestamp}_${randomString}_${sanitizedFileName}`
}

/**
 * Upload file to S3 with progress tracking
 */
export async function uploadFileToS3(
  file: File,
  s3Key: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    // Optimize image if requested
    let fileToUpload = file
    if (options.optimizeImage && file.type.startsWith('image/')) {
      const dimensions = await getImageDimensions(file)
      const { width: maxWidth, height: maxHeight } = UPLOAD_CONFIG.maxImageDimensions

      if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
        fileToUpload = await resizeImage(file, maxWidth, maxHeight)
      }
    }

    // Upload main file
    const uploadTask = uploadData({
      key: s3Key,
      data: fileToUpload,
      options: {
        contentType: options.contentType || file.type,
        metadata: options.metadata,
        onProgress: options.onProgress ? (progress) => {
          const percentage = Math.round((progress.transferredBytes / progress.totalBytes) * 100)
          options.onProgress!({
            loaded: progress.transferredBytes,
            total: progress.totalBytes,
            percentage
          })
        } : undefined
      }
    })

    const result = await uploadTask.result

    // Generate thumbnail if requested
    let thumbnailKey: string | undefined
    let thumbnailUrl: string | undefined

    if (options.generateThumbnail && file.type.startsWith('image/')) {
      try {
        const thumbnail = await generateThumbnail(fileToUpload)
        thumbnailKey = generateS3Key(`thumb_${file.name}`, 'thumbnails')

        await uploadData({
          key: thumbnailKey,
          data: thumbnail,
          options: {
            contentType: thumbnail.type
          }
        }).result

        // Get thumbnail URL
        const thumbnailUrlResult = await getUrl({
          key: thumbnailKey,
          options: {
            expiresIn: 3600 // 1 hour
          }
        })
        thumbnailUrl = thumbnailUrlResult.url.toString()
      } catch (error) {
        console.warn('Failed to generate thumbnail:', error)
        // Continue without thumbnail
      }
    }

    // Get main file URL
    const urlResult = await getUrl({
      key: s3Key,
      options: {
        expiresIn: 3600 // 1 hour
      }
    })

    return {
      key: s3Key,
      url: urlResult.url.toString(),
      thumbnailKey,
      thumbnailUrl,
      size: fileToUpload.size,
      contentType: fileToUpload.type,
      metadata: options.metadata
    }
  } catch (error) {
    console.error('File upload failed:', error)
    throw error
  }
}

/**
 * Delete file from S3
 */
export async function deleteFileFromS3(s3Key: string): Promise<void> {
  try {
    await remove({
      key: s3Key
    })
  } catch (error) {
    console.error('File deletion failed:', error)
    throw error
  }
}

/**
 * Get pre-signed URL for file access
 */
export async function getFileUrl(
  s3Key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const result = await getUrl({
      key: s3Key,
      options: {
        expiresIn
      }
    })
    return result.url.toString()
  } catch (error) {
    console.error('Failed to get file URL:', error)
    throw error
  }
}

/**
 * Enhanced avatar upload with retries and validation
 */
export async function uploadAvatar(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validate file specifically for avatars
  const validation = validateFile(file, UPLOAD_CONFIG.allowedImageTypes)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  // Check image dimensions
  const dimensions = await getImageDimensions(file)
  const warnings: string[] = []

  if (dimensions.width < 100 || dimensions.height < 100) {
    warnings.push('Image is quite small and may appear blurry')
  }

  if (dimensions.width > 2048 || dimensions.height > 2048) {
    warnings.push('Image will be resized to fit maximum dimensions')
  }

  // Generate unique S3 key for avatar
  const s3Key = generateS3Key(file.name, 'avatars')

  // Upload with optimization and thumbnail generation
  const result = await uploadFileToS3(file, s3Key, {
    onProgress,
    optimizeImage: true,
    generateThumbnail: true,
    metadata: {
      uploadType: 'avatar',
      originalFileName: file.name,
      uploadTimestamp: new Date().toISOString()
    }
  })

  return result
}

/**
 * Upload document with validation
 */
export async function uploadDocument(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validate file for documents
  const validation = validateFile(file, UPLOAD_CONFIG.allowedDocumentTypes)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  // Generate unique S3 key for document
  const s3Key = generateS3Key(file.name, 'documents')

  // Upload without optimization
  const result = await uploadFileToS3(file, s3Key, {
    onProgress,
    metadata: {
      uploadType: 'document',
      originalFileName: file.name,
      uploadTimestamp: new Date().toISOString()
    }
  })

  return result
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Check if file is a document
 */
export function isDocumentFile(file: File): boolean {
  return UPLOAD_CONFIG.allowedDocumentTypes.includes(file.type)
}

/**
 * Retry upload with exponential backoff
 */
export async function uploadWithRetry(
  uploadFn: () => Promise<UploadResult>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<UploadResult> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await uploadFn()
    } catch (error) {
      lastError = error as Error

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt)
        console.warn(`Upload attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Upload failed after all retry attempts')
}
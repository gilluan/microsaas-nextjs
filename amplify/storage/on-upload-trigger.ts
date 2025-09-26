import type { S3Handler } from 'aws-lambda';
import { S3Client, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({});

export const handler: S3Handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    try {
      // Get object metadata to check size and content type
      const headCommand = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const headResult = await s3Client.send(headCommand);
      const fileSize = headResult.ContentLength || 0;
      const contentType = headResult.ContentType || '';

      // Check if this is an avatar upload
      if (key.startsWith('avatars/')) {
        // Enforce 2MB limit for avatars
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes

        if (fileSize > maxSize) {
          console.error(`File ${key} exceeds size limit: ${fileSize} bytes > ${maxSize} bytes`);

          // Delete the file that exceeds the limit
          await s3Client.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          }));

          throw new Error(`File size ${fileSize} bytes exceeds maximum allowed size of ${maxSize} bytes`);
        }

        // Validate content type for images
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif'
        ];

        if (!allowedTypes.includes(contentType.toLowerCase())) {
          console.error(`Invalid content type for avatar: ${contentType}`);

          // Delete the file with invalid type
          await s3Client.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          }));

          throw new Error(`Invalid file type ${contentType}. Allowed types: ${allowedTypes.join(', ')}`);
        }
      }

      console.log(`File upload validated successfully: ${key}, Size: ${fileSize} bytes, Type: ${contentType}`);

    } catch (error) {
      console.error(`Error processing upload for ${key}:`, error);
      throw error;
    }
  }
};
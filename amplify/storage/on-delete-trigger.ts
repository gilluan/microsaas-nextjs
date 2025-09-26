import type { S3Handler } from 'aws-lambda';

export const handler: S3Handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    try {
      // Log the deletion for audit purposes
      console.log(`File deleted: ${key} from bucket: ${bucket}`);

      // You can add additional cleanup logic here if needed
      // For example, updating database records, clearing CDN cache, etc.

      if (key.startsWith('avatars/')) {
        console.log(`Avatar deleted: ${key}`);
        // Could trigger a database update to clear avatar URL references
      }

    } catch (error) {
      console.error(`Error processing deletion for ${key}:`, error);
      // Don't throw error here as it would prevent the actual deletion
      // Just log the error for monitoring
    }
  }
};
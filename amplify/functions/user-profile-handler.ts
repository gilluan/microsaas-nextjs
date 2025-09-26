import { type AppSyncResolverEvent, type Context } from 'aws-lambda';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  UpdateUserProfileInputSchema,
  AvatarUploadSchema,
  ConfirmAvatarUploadSchema,
  CreateUserActivityInputSchema,
  type UpdateUserProfileInput,
  type AvatarUpload,
  type ConfirmAvatarUpload,
} from '../../lib/validations';

// Create S3 client for avatar uploads
const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Initialize Amplify client for this function
let client: any;

async function initializeClient() {
  if (!client) {
    const amplifyConfig = await getAmplifyDataClientConfig();
    Amplify.configure(amplifyConfig, { ssr: true });
    client = generateClient();
  }
  return client;
}

/**
 * Get current user profile
 */
export async function getUserProfile(event: AppSyncResolverEvent<{}, any>, context: Context) {
  const graphqlClient = await initializeClient();
  try {
    const userId = event.identity?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Query user from the database
    const response = await graphqlClient.graphql({
      query: `
        query GetUser($id: ID!) {
          getUser(id: $id) {
            id
            email
            name
            avatar
            emailVerified
            createdAt
            updatedAt
            lastLoginAt
          }
        }
      `,
      variables: { id: userId }
    });

    const user = response.data?.getUser;
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to get user profile');
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(event: AppSyncResolverEvent<{ input: UpdateUserProfileInput }, any>, context: Context) {
  const graphqlClient = await initializeClient();
  try {
    const userId = event.identity?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Validate input
    const validatedInput = UpdateUserProfileInputSchema.parse(event.arguments.input);

    // Update user in database
    const response = await graphqlClient.graphql({
      query: `
        mutation UpdateUser($input: UpdateUserInput!) {
          updateUser(input: $input) {
            id
            name
            email
            avatar
            updatedAt
          }
        }
      `,
      variables: {
        input: {
          id: userId,
          ...validatedInput
        }
      }
    });

    const updatedUser = response.data?.updateUser;
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    // Create activity log for profile update
    await client.graphql({
      query: `
        mutation CreateUserActivity($input: CreateUserActivityInput!) {
          createUserActivity(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          userId,
          activityType: 'PROFILE_UPDATE',
          description: 'Profile information updated',
          metadata: JSON.stringify({
            updatedFields: Object.keys(validatedInput),
            timestamp: new Date().toISOString()
          })
        }
      }
    });

    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      throw error;
    }
    throw new Error('Failed to update user profile');
  }
}

/**
 * Get pre-signed URL for avatar upload
 */
export async function getAvatarUploadUrl(event: AppSyncResolverEvent<AvatarUpload, any>, context: Context) {
  const graphqlClient = await initializeClient();
  try {
    const userId = event.identity?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Validate input
    const validatedInput = AvatarUploadSchema.parse(event.arguments);

    // Generate unique S3 key for the avatar
    const timestamp = Date.now();
    const fileExtension = validatedInput.fileName.split('.').pop();
    const s3Key = `avatars/${userId}/${timestamp}.${fileExtension}`;

    // Generate pre-signed URL for upload
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET_NAME,
      Key: s3Key,
      ContentType: validatedInput.contentType,
      Metadata: {
        userId,
        originalFileName: validatedInput.fileName
      }
    });

    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 3600 }); // 1 hour
    const downloadUrl = `https://${process.env.STORAGE_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return {
      uploadUrl,
      downloadUrl,
      expiresIn: 3600
    };
  } catch (error) {
    console.error('Error generating avatar upload URL:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      throw error;
    }
    throw new Error('Failed to generate upload URL');
  }
}

/**
 * Confirm avatar upload and update user profile
 */
export async function confirmAvatarUpload(event: AppSyncResolverEvent<ConfirmAvatarUpload, any>, context: Context) {
  const graphqlClient = await initializeClient();
  try {
    const userId = event.identity?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Validate input
    const validatedInput = ConfirmAvatarUploadSchema.parse(event.arguments);

    // Update user profile with new avatar
    const response = await graphqlClient.graphql({
      query: `
        mutation UpdateUser($input: UpdateUserInput!) {
          updateUser(input: $input) {
            id
            avatar
            updatedAt
          }
        }
      `,
      variables: {
        input: {
          id: userId,
          avatar: validatedInput.s3Key
        }
      }
    });

    const updatedUser = response.data?.updateUser;
    if (!updatedUser) {
      throw new Error('Failed to update user avatar');
    }

    // Create activity log for avatar upload
    await client.graphql({
      query: `
        mutation CreateUserActivity($input: CreateUserActivityInput!) {
          createUserActivity(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          userId,
          activityType: 'AVATAR_UPLOAD',
          description: 'Profile avatar updated',
          metadata: JSON.stringify({
            s3Key: validatedInput.s3Key,
            timestamp: new Date().toISOString()
          })
        }
      }
    });

    return updatedUser;
  } catch (error) {
    console.error('Error confirming avatar upload:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      throw error;
    }
    throw new Error('Failed to confirm avatar upload');
  }
}

/**
 * Lambda handler for user profile operations
 */
export const handler = async (event: AppSyncResolverEvent<any, any>, context: Context) => {
  console.log('User profile function invoked:', JSON.stringify(event));

  try {
    switch (event.info.fieldName) {
      case 'getUser':
        return await getUserProfile(event, context);

      case 'updateUserProfile':
        return await updateUserProfile(event, context);

      case 'getAvatarUploadUrl':
        return await getAvatarUploadUrl(event, context);

      case 'confirmAvatarUpload':
        return await confirmAvatarUpload(event, context);

      default:
        throw new Error(`Unknown field: ${event.info.fieldName}`);
    }
  } catch (error) {
    console.error('Error in user profile handler:', error);
    throw error;
  }
};
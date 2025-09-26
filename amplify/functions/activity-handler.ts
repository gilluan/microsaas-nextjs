import { type AppSyncResolverEvent, type Context } from 'aws-lambda';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import {
  CreateUserActivityInputSchema,
  ListUserActivitiesInputSchema,
  type CreateUserActivityInput,
  type ListUserActivitiesInput,
} from '../../lib/validations';

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
 * Create user activity record
 */
export async function createUserActivity(event: AppSyncResolverEvent<{ input: CreateUserActivityInput }, any>, context: Context) {
  try {
    const userId = event.identity?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Validate input
    const validatedInput = CreateUserActivityInputSchema.parse(event.arguments.input);

    // Create activity record in database
    const response = await client.graphql({
      query: `
        mutation CreateUserActivity($input: CreateUserActivityInput!) {
          createUserActivity(input: $input) {
            id
            activityType
            description
            metadata
            createdAt
          }
        }
      `,
      variables: {
        input: {
          userId,
          activityType: validatedInput.activityType,
          description: validatedInput.description,
          metadata: validatedInput.metadata ? JSON.stringify(validatedInput.metadata) : null
        }
      }
    });

    const activity = response.data?.createUserActivity;
    if (!activity) {
      throw new Error('Failed to create activity');
    }

    return activity;
  } catch (error) {
    console.error('Error creating user activity:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      throw error;
    }
    throw new Error('Failed to create user activity');
  }
}

/**
 * List user activities with pagination
 */
export async function listUserActivities(event: AppSyncResolverEvent<ListUserActivitiesInput, any>, context: Context) {
  try {
    const userId = event.identity?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Validate input with defaults
    const validatedInput = ListUserActivitiesInputSchema.parse({
      limit: event.arguments.limit || 10,
      nextToken: event.arguments.nextToken
    });

    // Query activities for the user
    const response = await client.graphql({
      query: `
        query ListUserActivities($userId: ID!, $limit: Int, $nextToken: String) {
          listUserActivities(
            filter: { userId: { eq: $userId } }
            limit: $limit
            nextToken: $nextToken
            sortDirection: DESC
          ) {
            items {
              id
              activityType
              description
              metadata
              createdAt
            }
            nextToken
          }
        }
      `,
      variables: {
        userId,
        limit: validatedInput.limit,
        nextToken: validatedInput.nextToken
      }
    });

    const activities = response.data?.listUserActivities;
    if (!activities) {
      throw new Error('Failed to list activities');
    }

    // Parse metadata JSON for each activity
    const processedActivities = {
      items: activities.items?.map(activity => ({
        ...activity,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null
      })) || [],
      nextToken: activities.nextToken
    };

    return processedActivities;
  } catch (error) {
    console.error('Error listing user activities:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      throw error;
    }
    throw new Error('Failed to list user activities');
  }
}

/**
 * Get recent activities for dashboard summary
 */
export async function getRecentActivities(event: AppSyncResolverEvent<{ limit?: number }, any>, context: Context) {
  try {
    const userId = event.identity?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const limit = event.arguments.limit || 5;

    // Query recent activities for the user
    const response = await client.graphql({
      query: `
        query ListUserActivities($userId: ID!, $limit: Int) {
          listUserActivities(
            filter: { userId: { eq: $userId } }
            limit: $limit
            sortDirection: DESC
          ) {
            items {
              id
              activityType
              description
              createdAt
              metadata
            }
          }
        }
      `,
      variables: {
        userId,
        limit
      }
    });

    const activities = response.data?.listUserActivities?.items || [];

    // Process and return activities
    return activities.map(activity => ({
      ...activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null
    }));
  } catch (error) {
    console.error('Error getting recent activities:', error);
    throw new Error('Failed to get recent activities');
  }
}

/**
 * Get activity statistics for dashboard
 */
export async function getActivityStats(event: AppSyncResolverEvent<{ days?: number }, any>, context: Context) {
  try {
    const userId = event.identity?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const days = event.arguments.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Query activities for the specified period
    const response = await client.graphql({
      query: `
        query ListUserActivities($userId: ID!, $filter: ModelUserActivityFilterInput) {
          listUserActivities(
            filter: $filter
          ) {
            items {
              id
              activityType
              createdAt
            }
          }
        }
      `,
      variables: {
        userId,
        filter: {
          userId: { eq: userId },
          createdAt: { ge: startDate.toISOString() }
        }
      }
    });

    const activities = response.data?.listUserActivities?.items || [];

    // Calculate statistics
    const stats = {
      totalActivities: activities.length,
      activitiesByType: activities.reduce((acc, activity) => {
        acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      activitiesByDay: activities.reduce((acc, activity) => {
        const date = new Date(activity.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      }
    };

    return stats;
  } catch (error) {
    console.error('Error getting activity stats:', error);
    throw new Error('Failed to get activity statistics');
  }
}

/**
 * Lambda handler for activity tracking operations
 */
export const handler = async (event: AppSyncResolverEvent<any, any>, context: Context) => {
  console.log('Activity function invoked:', JSON.stringify(event));

  try {
    switch (event.info.fieldName) {
      case 'createUserActivity':
        return await createUserActivity(event, context);

      case 'listUserActivities':
        return await listUserActivities(event, context);

      case 'getRecentActivities':
        return await getRecentActivities(event, context);

      case 'getActivityStats':
        return await getActivityStats(event, context);

      default:
        throw new Error(`Unknown field: ${event.info.fieldName}`);
    }
  } catch (error) {
    console.error('Error in activity handler:', error);
    throw error;
  }
};
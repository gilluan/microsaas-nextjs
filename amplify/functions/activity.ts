import { defineFunction } from '@aws-amplify/backend';

export const activityFunction = defineFunction({
  name: 'activity',
  entry: './activity-handler.ts',
  runtime: 18,
  environment: {
    API_ENDPOINT: process.env.AMPLIFY_DATA_GRAPHQL_ENDPOINT || '',
  },
});
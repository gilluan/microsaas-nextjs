import { defineFunction } from '@aws-amplify/backend';

export const userProfileFunction = defineFunction({
  name: 'user-profile',
  entry: './user-profile-handler.ts',
  runtime: 18,
  environment: {
    API_ENDPOINT: process.env.AMPLIFY_DATA_GRAPHQL_ENDPOINT || '',
  },
});
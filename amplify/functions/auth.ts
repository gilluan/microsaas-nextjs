import { defineFunction } from '@aws-amplify/backend';

export const authFunction = defineFunction({
  name: 'auth',
  entry: './auth-handler.ts',
  runtime: 18,
  environment: {
    API_ENDPOINT: process.env.AMPLIFY_DATA_GRAPHQL_ENDPOINT || '',
    USER_POOL_ID: process.env.AMPLIFY_AUTH_USERPOOL_ID || '',
    USER_POOL_CLIENT_ID: process.env.AMPLIFY_AUTH_USERPOOL_WEBCLIENTID || '',
  },
});
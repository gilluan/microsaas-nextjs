import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { userProfileFunction } from './functions/user-profile';
import { authFunction } from './functions/auth';
import { activityFunction } from './functions/activity';

export const backend = defineBackend({
  auth,
  data,
  storage,
  userProfileFunction,
  authFunction,
  activityFunction,
});

// Grant the functions access to the data API
// TODO: Fix GraphQL API endpoint reference
// backend.userProfileFunction.addEnvironment('AMPLIFY_DATA_GRAPHQL_ENDPOINT', backend.data.resources.graphqlApi.graphqlUrl);
// backend.authFunction.addEnvironment('AMPLIFY_DATA_GRAPHQL_ENDPOINT', backend.data.resources.graphqlApi.graphqlUrl);
// backend.activityFunction.addEnvironment('AMPLIFY_DATA_GRAPHQL_ENDPOINT', backend.data.resources.graphqlApi.graphqlUrl);

// Grant the functions permission to query and mutate data
backend.data.resources.graphqlApi.grantMutation(backend.userProfileFunction.resources.lambda, "createUser", "updateUser", "createUserActivity");
backend.data.resources.graphqlApi.grantQuery(backend.userProfileFunction.resources.lambda, "getUser", "listUsers");

backend.data.resources.graphqlApi.grantMutation(backend.authFunction.resources.lambda, "createUser", "updateUser", "createUserActivity");
backend.data.resources.graphqlApi.grantQuery(backend.authFunction.resources.lambda, "getUser", "listUsers");

backend.data.resources.graphqlApi.grantMutation(backend.activityFunction.resources.lambda, "createUserActivity");
backend.data.resources.graphqlApi.grantQuery(backend.activityFunction.resources.lambda, "listUserActivities");

// Grant auth function access to Cognito
backend.authFunction.addEnvironment('USER_POOL_ID', backend.auth.resources.userPool.userPoolId);
backend.authFunction.addEnvironment('USER_POOL_CLIENT_ID', backend.auth.resources.userPoolClient.userPoolClientId);

// Grant user profile function access to S3 storage
backend.userProfileFunction.addEnvironment('STORAGE_BUCKET_NAME', backend.storage.resources.bucket.bucketName);
backend.storage.resources.bucket.grantReadWrite(backend.userProfileFunction.resources.lambda);
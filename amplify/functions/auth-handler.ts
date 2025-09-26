import { type AppSyncResolverEvent, type Context } from 'aws-lambda';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminConfirmSignUpCommand,
  AdminResendConfirmationCodeCommand,
  AdminInitiateAuthCommand,
  AdminRespondToAuthChallengeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
  AdminGetUserCommand,
  type AdminCreateUserCommandInput,
  type AdminSetUserPasswordCommandInput,
  type AdminConfirmSignUpCommandInput,
  type ForgotPasswordCommandInput,
  type ConfirmForgotPasswordCommandInput,
  type ChangePasswordCommandInput
} from '@aws-sdk/client-cognito-identity-provider';
import {
  UserRegistrationSchema,
  VerifyEmailInputSchema,
  RequestPasswordResetSchema,
  ConfirmPasswordResetSchema,
  ChangePasswordSchema,
  type UserRegistration,
  type VerifyEmailInput,
  type RequestPasswordReset,
  type ConfirmPasswordReset,
  type ChangePassword,
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

// Create Cognito client
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

/**
 * Get current authenticated user information
 */
export async function getCurrentUser(event: AppSyncResolverEvent<{}, any>, context: Context) {
  try {
    const userId = event.identity?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get user from database
    const response = await client.graphql({
      query: `
        query GetUser($id: ID!) {
          getUser(id: $id) {
            id
            email
            name
            avatar
            emailVerified
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
    console.error('Error getting current user:', error);
    throw new Error('Failed to get current user');
  }
}

/**
 * Register new user
 */
export async function registerUser(event: AppSyncResolverEvent<{ input: UserRegistration }, any>, context: Context) {
  try {
    // Validate input
    const validatedInput = UserRegistrationSchema.parse(event.arguments.input);

    // Create user in Cognito
    const createUserParams: AdminCreateUserCommandInput = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: validatedInput.email,
      UserAttributes: [
        { Name: 'email', Value: validatedInput.email },
        { Name: 'email_verified', Value: 'false' },
        { Name: 'name', Value: validatedInput.name }
      ],
      MessageAction: 'SUPPRESS', // We'll handle email verification separately
      TemporaryPassword: validatedInput.password
    };

    const createUserResponse = await cognitoClient.send(new AdminCreateUserCommand(createUserParams));
    const cognitoUserId = createUserResponse.User?.Username;

    if (!cognitoUserId) {
      throw new Error('Failed to create user in Cognito');
    }

    // Set permanent password
    const setPasswordParams: AdminSetUserPasswordCommandInput = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: cognitoUserId,
      Password: validatedInput.password,
      Permanent: true
    };

    await cognitoClient.send(new AdminSetUserPasswordCommand(setPasswordParams));

    // Create user record in database
    await client.graphql({
      query: `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            email
            name
            emailVerified
          }
        }
      `,
      variables: {
        input: {
          id: cognitoUserId,
          email: validatedInput.email,
          name: validatedInput.name,
          emailVerified: false
        }
      }
    });

    // Send verification email
    await cognitoClient.send(new AdminResendConfirmationCodeCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Username: cognitoUserId
    }));

    return {
      userId: cognitoUserId,
      email: validatedInput.email,
      emailVerificationRequired: true
    };
  } catch (error) {
    console.error('Error registering user:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      throw error;
    }
    throw new Error('Failed to register user');
  }
}

/**
 * Verify email address
 */
export async function verifyEmail(event: AppSyncResolverEvent<{ input: VerifyEmailInput }, any>, context: Context) {
  try {
    // Validate input
    const validatedInput = VerifyEmailInputSchema.parse(event.arguments.input);

    // Confirm user signup in Cognito
    const confirmParams: AdminConfirmSignUpCommandInput = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: validatedInput.email,
      ConfirmationCode: validatedInput.verificationCode
    };

    await cognitoClient.send(new AdminConfirmSignUpCommand(confirmParams));

    // Update user in database
    await client.graphql({
      query: `
        mutation UpdateUser($input: UpdateUserInput!) {
          updateUser(input: $input) {
            id
            emailVerified
          }
        }
      `,
      variables: {
        input: {
          email: validatedInput.email,
          emailVerified: true
        }
      }
    });

    // Create activity log for email verification
    const getUserResponse = await client.graphql({
      query: `
        query GetUserByEmail($email: String!) {
          listUsers(filter: { email: { eq: $email } }) {
            items {
              id
            }
          }
        }
      `,
      variables: { email: validatedInput.email }
    });

    const userId = getUserResponse.data?.listUsers?.items?.[0]?.id;
    if (userId) {
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
            activityType: 'EMAIL_VERIFICATION',
            description: 'Email address verified',
            metadata: JSON.stringify({
              email: validatedInput.email,
              timestamp: new Date().toISOString()
            })
          }
        }
      });
    }

    return {
      success: true,
      message: 'Email verified successfully'
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      throw error;
    }
    return {
      success: false,
      message: 'Invalid verification code'
    };
  }
}

/**
 * Resend email verification
 */
export async function resendEmailVerification(event: AppSyncResolverEvent<{ email: string }, any>, context: Context) {
  try {
    const email = event.arguments.email;

    // Resend confirmation code
    await cognitoClient.send(new AdminResendConfirmationCodeCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Username: email
    }));

    return {
      success: true,
      message: 'Verification email sent'
    };
  } catch (error) {
    console.error('Error resending verification email:', error);
    return {
      success: false,
      message: 'Failed to send verification email'
    };
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(event: AppSyncResolverEvent<RequestPasswordReset, any>, context: Context) {
  try {
    // Validate input
    const validatedInput = RequestPasswordResetSchema.parse(event.arguments);

    // Send forgot password email
    const forgotPasswordParams: ForgotPasswordCommandInput = {
      ClientId: process.env.USER_POOL_CLIENT_ID,
      Username: validatedInput.email
    };

    await cognitoClient.send(new ForgotPasswordCommand(forgotPasswordParams));

    return {
      success: true,
      message: 'Password reset email sent'
    };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return {
      success: false,
      message: 'Failed to send password reset email'
    };
  }
}

/**
 * Confirm password reset
 */
export async function confirmPasswordReset(event: AppSyncResolverEvent<{ input: ConfirmPasswordReset }, any>, context: Context) {
  try {
    // Validate input
    const validatedInput = ConfirmPasswordResetSchema.parse(event.arguments.input);

    // Confirm forgot password
    const confirmParams: ConfirmForgotPasswordCommandInput = {
      ClientId: process.env.USER_POOL_CLIENT_ID,
      Username: validatedInput.email,
      ConfirmationCode: validatedInput.confirmationCode,
      Password: validatedInput.newPassword
    };

    await cognitoClient.send(new ConfirmForgotPasswordCommand(confirmParams));

    // Create activity log for password change
    const getUserResponse = await client.graphql({
      query: `
        query GetUserByEmail($email: String!) {
          listUsers(filter: { email: { eq: $email } }) {
            items {
              id
            }
          }
        }
      `,
      variables: { email: validatedInput.email }
    });

    const userId = getUserResponse.data?.listUsers?.items?.[0]?.id;
    if (userId) {
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
            activityType: 'PASSWORD_CHANGE',
            description: 'Password reset via email',
            metadata: JSON.stringify({
              method: 'forgot_password',
              timestamp: new Date().toISOString()
            })
          }
        }
      });
    }

    return {
      success: true,
      message: 'Password reset successfully'
    };
  } catch (error) {
    console.error('Error confirming password reset:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      throw error;
    }
    return {
      success: false,
      message: 'Invalid reset code or password'
    };
  }
}

/**
 * Change password for authenticated user
 */
export async function changePassword(event: AppSyncResolverEvent<{ input: ChangePassword }, any>, context: Context) {
  try {
    const userId = event.identity?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Validate input
    const validatedInput = ChangePasswordSchema.parse(event.arguments.input);

    // Get user's access token from event context
    const accessToken = event.request?.headers?.authorization?.replace('Bearer ', '');
    if (!accessToken) {
      throw new Error('Access token not found');
    }

    // Change password using Cognito
    const changePasswordParams: ChangePasswordCommandInput = {
      AccessToken: accessToken,
      PreviousPassword: validatedInput.currentPassword,
      ProposedPassword: validatedInput.newPassword
    };

    await cognitoClient.send(new ChangePasswordCommand(changePasswordParams));

    // Create activity log for password change
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
          activityType: 'PASSWORD_CHANGE',
          description: 'Password changed by user',
          metadata: JSON.stringify({
            method: 'user_initiated',
            timestamp: new Date().toISOString()
          })
        }
      }
    });

    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    console.error('Error changing password:', error);
    if (error instanceof Error && error.message.includes('validation')) {
      throw error;
    }
    return {
      success: false,
      message: 'Failed to change password. Check your current password.'
    };
  }
}

/**
 * Lambda handler for authentication operations
 */
export const handler = async (event: AppSyncResolverEvent<any, any>, context: Context) => {
  console.log('Auth function invoked:', JSON.stringify(event));

  try {
    switch (event.info.fieldName) {
      case 'getCurrentUser':
        return await getCurrentUser(event, context);

      case 'registerUser':
        return await registerUser(event, context);

      case 'verifyEmail':
        return await verifyEmail(event, context);

      case 'resendEmailVerification':
        return await resendEmailVerification(event, context);

      case 'requestPasswordReset':
        return await requestPasswordReset(event, context);

      case 'confirmPasswordReset':
        return await confirmPasswordReset(event, context);

      case 'changePassword':
        return await changePassword(event, context);

      default:
        throw new Error(`Unknown field: ${event.info.fieldName}`);
    }
  } catch (error) {
    console.error('Error in auth handler:', error);
    throw error;
  }
};
import type { PreAuthenticationTriggerHandler } from 'aws-lambda';

export const handler: PreAuthenticationTriggerHandler = async (event) => {
  // Check if the user's email is verified
  if (event.request.userAttributes.email_verified !== 'true') {
    throw new Error('Email verification required before authentication');
  }

  // Return the event object to continue the authentication flow
  return event;
};
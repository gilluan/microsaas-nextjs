import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'microsaasStorage',
  access: (allow) => ({
    'avatars/{entity_id}/*': [
      // Allow authenticated users to read any avatar
      allow.authenticated.to(['read']),
      // Allow users to manage their own avatars
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'public/*': [
      // Public read access for general assets
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
    ],
    'private/{entity_id}/*': [
      // Private user files - only the owner can access
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});
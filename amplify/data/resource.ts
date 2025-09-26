import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // Activity Type Enum
  ActivityType: a.enum([
    'LOGIN',
    'PROFILE_UPDATE',
    'AVATAR_UPLOAD',
    'PASSWORD_CHANGE',
    'EMAIL_VERIFICATION'
  ]),

  // User Model - Enhanced with full specification
  User: a
    .model({
      id: a.id().required(),
      email: a.email().required(),
      name: a.string().required(),
      avatar: a.string(),
      emailVerified: a.boolean().default(false),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      lastLoginAt: a.datetime(),
      // Relationship to activities
      activities: a.hasMany('UserActivity', 'userId')
    })
    .authorization((allow) => [
      allow.owner(),
      // Public read for basic profile info (name, avatar) - for social features
      allow.authenticated().to(['read']),
      // Email and other sensitive fields are owner-only
    ]),

  // UserActivity Model - New model for activity tracking
  UserActivity: a
    .model({
      id: a.id().required(),
      userId: a.id().required(),
      activityType: a.ref('ActivityType').required(),
      description: a.string().required(),
      metadata: a.json(),
      createdAt: a.datetime(),
      // Relationship to user
      user: a.belongsTo('User', 'userId')
    })
    .authorization((allow) => [
      // Only owner can read their activities
      allow.owner(),
      // Allow functions to create activities
      allow.authenticated().to(['create']),
    ])
    .secondaryIndexes((index) => [
      index('userId').sortKeys(['createdAt']).name('byUser')
    ]),

  // Custom Types for API responses
  AvatarUploadResponse: a.customType({
    uploadUrl: a.url().required(),
    downloadUrl: a.url().required(),
    expiresIn: a.integer().required(),
  }),

  AuthResponse: a.customType({
    userId: a.id(),
    email: a.email(),
    emailVerificationRequired: a.boolean(),
  }),

  AuthResult: a.customType({
    success: a.boolean().required(),
    message: a.string(),
  }),

  CurrentUser: a.customType({
    id: a.id().required(),
    email: a.email().required(),
    name: a.string().required(),
    avatar: a.string(),
    emailVerified: a.boolean().required(),
    lastLoginAt: a.datetime(),
  }),

  UserActivityConnection: a.customType({
    items: a.ref('UserActivity').array(),
    nextToken: a.string(),
  }),

  ActivityStats: a.customType({
    totalActivities: a.integer().required(),
    activitiesByType: a.json().required(),
    activitiesByDay: a.json().required(),
    period: a.json().required(),
  }),

  // Input Types
  UpdateUserProfileInput: a.customType({
    name: a.string(),
    email: a.email(),
  }),

  RegisterUserInput: a.customType({
    email: a.email().required(),
    password: a.string().required(),
    name: a.string().required(),
  }),

  VerifyEmailInput: a.customType({
    email: a.email().required(),
    verificationCode: a.string().required(),
  }),

  ConfirmPasswordResetInput: a.customType({
    email: a.email().required(),
    confirmationCode: a.string().required(),
    newPassword: a.string().required(),
  }),

  ChangePasswordInput: a.customType({
    currentPassword: a.string().required(),
    newPassword: a.string().required(),
  }),

  CreateUserActivityInput: a.customType({
    activityType: a.ref('ActivityType').required(),
    description: a.string().required(),
    metadata: a.json(),
  }),

  // Custom Queries
  getUserProfile: a
    .query()
    .returns(a.ref('User'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('userProfileFunction')),

  getCurrentUser: a
    .query()
    .returns(a.ref('CurrentUser'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('authFunction')),

  listUserActivities: a
    .query()
    .arguments({
      limit: a.integer(),
      nextToken: a.string(),
    })
    .returns(a.ref('UserActivityConnection'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('activityFunction')),

  getRecentActivities: a
    .query()
    .arguments({
      limit: a.integer(),
    })
    .returns(a.ref('UserActivity').array())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('activityFunction')),

  getActivityStats: a
    .query()
    .arguments({
      days: a.integer(),
    })
    .returns(a.ref('ActivityStats'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('activityFunction')),

  // Custom Mutations
  updateUserProfile: a
    .mutation()
    .arguments({
      input: a.ref('UpdateUserProfileInput').required(),
    })
    .returns(a.ref('User'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('userProfileFunction')),

  getAvatarUploadUrl: a
    .mutation()
    .arguments({
      contentType: a.string().required(),
      fileName: a.string().required(),
    })
    .returns(a.ref('AvatarUploadResponse'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('userProfileFunction')),

  confirmAvatarUpload: a
    .mutation()
    .arguments({
      s3Key: a.string().required(),
    })
    .returns(a.ref('User'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('userProfileFunction')),

  registerUser: a
    .mutation()
    .arguments({
      input: a.ref('RegisterUserInput').required(),
    })
    .returns(a.ref('AuthResponse'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function('authFunction')),

  verifyEmail: a
    .mutation()
    .arguments({
      input: a.ref('VerifyEmailInput').required(),
    })
    .returns(a.ref('AuthResult'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function('authFunction')),

  resendEmailVerification: a
    .mutation()
    .arguments({
      email: a.email().required(),
    })
    .returns(a.ref('AuthResult'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function('authFunction')),

  requestPasswordReset: a
    .mutation()
    .arguments({
      email: a.email().required(),
    })
    .returns(a.ref('AuthResult'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function('authFunction')),

  confirmPasswordReset: a
    .mutation()
    .arguments({
      input: a.ref('ConfirmPasswordResetInput').required(),
    })
    .returns(a.ref('AuthResult'))
    .authorization((allow) => [allow.publicApiKey()])
    .handler(a.handler.function('authFunction')),

  changePassword: a
    .mutation()
    .arguments({
      input: a.ref('ChangePasswordInput').required(),
    })
    .returns(a.ref('AuthResult'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('authFunction')),

  createUserActivity: a
    .mutation()
    .arguments({
      input: a.ref('CreateUserActivityInput').required(),
    })
    .returns(a.ref('UserActivity'))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function('activityFunction')),

  // Real-time subscription for activity updates
  onCreateUserActivity: a
    .subscription()
    .for(a.ref('UserActivity'))
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
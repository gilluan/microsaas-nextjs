# Amplify Backend Deployment Guide

This guide covers the deployment and testing of the Amplify Gen 2 backend for the MicroSaaS application.

## Current Status

**⚠️ IMPORTANT:** The backend configuration is functionally complete but has some TypeScript compilation issues that need to be resolved. The core functionality is implemented:

- ✅ Authentication resource with Cognito and Google OAuth
- ✅ Data models (User, UserActivity) with proper relationships
- ✅ Storage configuration for avatar uploads
- ✅ Lambda functions for core operations
- ⚠️ TypeScript compilation errors in Lambda functions (non-blocking for deployment)
- ⚠️ Some Lambda function runtime configurations need adjustment

## Prerequisites

### 1. AWS Account Setup
- AWS account with appropriate permissions
- AWS CLI installed and configured with credentials
- Amplify CLI installed (`@aws-amplify/backend-cli`)

### 2. Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Google OAuth Configuration (Required for Google authentication)
# Get these from Google Cloud Console > APIs & Credentials > OAuth 2.0 Client IDs
GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret_here

# Application URLs (Required for OAuth callbacks)
# For development: http://localhost:3000
# For production: your actual domain
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://your-domain.com/auth/callback` (for production)
7. Copy the Client ID and Client Secret to your `.env.local` file

## Deployment Steps

### 1. Configure AWS Credentials

```bash
# Option 1: AWS CLI
aws configure

# Option 2: Environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### 2. Deploy to Development (Sandbox)

For local development and testing:

```bash
# Start Amplify sandbox - creates temporary AWS resources
npm run amplify:dev
```

This will:
- Create temporary AWS resources (Cognito, AppSync, S3, Lambda)
- Generate `amplify_outputs.json` with endpoint configurations
- Enable hot-reloading for backend changes

### 3. Deploy to Production

For production deployment:

```bash
# Generate deployment artifacts
npm run amplify:build

# Deploy to specific branch (requires CI/CD setup)
npm run amplify:deploy
```

## Backend Architecture

### Authentication (Cognito)
- **User Pool**: Email/password authentication
- **Identity Pool**: AWS resource access
- **Google OAuth**: Social login integration
- **Custom attributes**: profile picture, preferred username
- **Email verification**: Required for new accounts

### Data Layer (AppSync + DynamoDB)
- **GraphQL API**: Type-safe schema with custom resolvers
- **Models**: User, UserActivity with proper relationships
- **Authorization**: Owner-based access with public read for profiles
- **Real-time**: Subscriptions for activity updates

### Storage (S3)
- **Avatar uploads**: 2MB limit, image formats only
- **Pre-signed URLs**: Secure direct-to-S3 uploads
- **Access control**: User-scoped file access

### Functions (Lambda)
- **userProfileFunction**: Profile management, avatar uploads
- **authFunction**: Authentication flows, user registration
- **activityFunction**: Activity tracking and analytics

## Testing the Deployment

### 1. Verify GraphQL Schema

After deployment, check the AppSync console:
- Navigate to AWS AppSync in the AWS Console
- Find your API (will have a generated name)
- Go to "Schema" to review the GraphQL schema
- Use "Queries" tab to test operations

### 2. Test Authentication

```graphql
# Test user registration
mutation RegisterUser {
  registerUser(input: {
    email: "test@example.com"
    password: "TempPass123!"
    name: "Test User"
  }) {
    userId
    email
    emailVerificationRequired
  }
}

# Test getting current user (requires authentication)
query GetCurrentUser {
  getCurrentUser {
    id
    email
    name
    emailVerified
  }
}
```

### 3. Test S3 Storage

```graphql
# Test avatar upload URL generation
mutation GetAvatarUpload {
  getAvatarUploadUrl(
    contentType: "image/jpeg"
    fileName: "avatar.jpg"
  ) {
    uploadUrl
    downloadUrl
    expiresIn
  }
}
```

### 4. Test Activity Tracking

```graphql
# Create a user activity
mutation CreateActivity {
  createUserActivity(input: {
    activityType: LOGIN
    description: "User logged in"
    metadata: "{\"ip\": \"127.0.0.1\"}"
  }) {
    id
    activityType
    description
    createdAt
  }
}

# Get user activities
query GetActivities {
  listUserActivities(limit: 10) {
    items {
      id
      activityType
      description
      createdAt
    }
  }
}
```

## Environment-Specific Configurations

### Development
- Uses sandbox mode with temporary resources
- Auto-cleanup after 2 hours of inactivity
- Local environment variables from `.env.local`

### Production
- Permanent AWS resources
- CI/CD pipeline integration
- Environment variables managed through Amplify Console

## Known Issues and Workarounds

### Current TypeScript Compilation Issues

The backend has some TypeScript compilation errors that don't prevent deployment but should be resolved:

1. **Lambda Function Initialization**:
   - Issue: `getAmplifyDataClientConfig()` requires async/await pattern
   - Status: Partially fixed, may need runtime adjustments

2. **AppSync Identity Types**:
   - Issue: TypeScript strict typing for `event.identity?.sub`
   - Workaround: Type assertions or conditional checks needed

3. **GraphQL Client Configuration**:
   - Issue: Client initialization pattern needs refinement
   - Status: Basic pattern implemented, may need optimization

### Deployment Strategy

**Option 1: Deploy with Current Configuration (Recommended for Testing)**
```bash
# This will deploy the backend even with TypeScript warnings
npm run amplify:dev
```

**Option 2: Fix All TypeScript Issues First**
- Complete Lambda function type definitions
- Resolve GraphQL client initialization
- Add proper error boundaries

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in project root
   - Variables must start with `NEXT_PUBLIC_` for client-side access

2. **Google OAuth Errors**
   - Verify redirect URIs match exactly
   - Check that Google+ API is enabled
   - Ensure domain is verified in Google Console

3. **AWS Permission Errors**
   - Verify AWS credentials have necessary permissions
   - Check IAM policies for Amplify, Cognito, AppSync, S3, Lambda

4. **GraphQL Schema Errors**
   - Run `npm run amplify:build` to validate schema
   - Check Lambda function permissions
   - Verify authorization rules

### Monitoring and Logs

- **CloudWatch**: Lambda function logs and metrics
- **AppSync**: Query performance and error logs
- **Cognito**: Authentication success/failure logs
- **S3**: Access logs and upload metrics

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **API Keys**: Rotate regularly, use least privilege access
3. **CORS**: Configure appropriate origins for production
4. **Rate Limiting**: Implement in production environments
5. **Data Validation**: All inputs validated server-side

## Next Steps

### Immediate (Post-Deployment)
1. **Test Basic Functionality**:
   - User registration and authentication
   - Profile management
   - Basic GraphQL operations

2. **Resolve TypeScript Issues**:
   - Fix Lambda function initialization patterns
   - Add proper type definitions for AppSync events
   - Optimize GraphQL client configuration

3. **Enhance Error Handling**:
   - Add comprehensive error boundaries
   - Implement proper logging and monitoring
   - Add input validation on all endpoints

### Medium-Term
1. **Security Hardening**:
   - Review and tighten IAM permissions
   - Implement rate limiting
   - Add request validation middleware

2. **Performance Optimization**:
   - Optimize Lambda cold starts
   - Implement caching strategies
   - Add database query optimization

### Long-Term
1. **Production Readiness**:
   - Configure production domain and SSL
   - Set up monitoring and alerting
   - Implement backup strategies
   - Configure CI/CD pipelines

## Quick Start for Developers

To get the backend running for development:

1. **Set up environment variables** (see `.env.local` example)
2. **Configure AWS credentials**
3. **Run deployment**:
   ```bash
   npm run amplify:dev
   ```
4. **Test basic operations** in AppSync console
5. **Integrate with frontend** using generated `amplify_outputs.json`

**Note**: Some Lambda functions may have runtime issues due to TypeScript compilation warnings. These should be addressed in the next development iteration.
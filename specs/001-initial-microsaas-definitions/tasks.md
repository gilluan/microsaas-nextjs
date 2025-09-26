# Tasks: Initial MicroSaaS Platform Foundation

**Feature**: Initial MicroSaaS Platform Foundation
**Branch**: `001-initial-microsaas-definitions`
**Generated**: 2025-01-25
**Source**: Auto-generated from design artifacts

## Task Generation Summary

This task list implements the MicroSaaS platform foundation with:
- **Entities**: User, UserActivity with GraphQL schema
- **Contracts**: user-queries.graphql, activity-queries.graphql, auth-queries.graphql
- **Tech Stack**: Next.js 14, AWS Amplify Gen 2, ShadcnUI, Zustand, Zod
- **Approach**: Rapid MVP development, **no testing infrastructure**
- **Validation**: Manual procedures from quickstart.md

**Task Breakdown**: 36 tasks across 5 phases
**Parallel Execution**: Tasks marked [P] can run in parallel
**Constitutional**: Amplify Gen 2 first, type-safe throughout

---

## Phase 1: Setup & Backend Configuration (8 tasks)

### T001: Initialize Next.js 14 project with TypeScript [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/package.json`, `/home/formiga/wo/github/microsaas/tsconfig.json`
- Create Next.js 14 project with App Router and TypeScript
- Configure TypeScript strict mode
- Set up ESLint and Prettier configurations
- Install core dependencies: React 18, Next.js 14

### T002: Install and configure AWS Amplify Gen 2 dependencies [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/package.json`
- Install @aws-amplify/backend, aws-amplify, @aws-amplify/ui-react
- Install GraphQL dependencies: graphql, @aws-amplify/api-graphql
- Configure package.json scripts for Amplify commands

### T003: Install UI and state management dependencies [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/package.json`
- Install ShadcnUI: @radix-ui components, class-variance-authority, clsx
- Install Zustand for state management
- Install Zod for schema validation
- Install Tailwind CSS and configure

### T004: Create Amplify backend configuration ✅
**Files**: `/home/formiga/wo/github/microsaas/amplify/backend.ts`
- Set up backend.ts as single source of truth
- Configure Amplify Gen 2 project structure
- Define backend resource imports (data, auth, storage, functions)

### T005: Configure authentication with Cognito [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/amplify/auth/resource.ts`
- Set up Cognito User Pool with email/password auth
- Configure Google OAuth provider
- Set password policy (min 8 chars, uppercase, lowercase, number)
- Enable email verification and password reset

### T006: Configure S3 storage for avatars [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/amplify/storage/resource.ts`
- Set up S3 bucket for user profile images
- Configure access patterns and permissions
- Set up CDN integration for avatar delivery
- Define file size limits (2MB max)

### T007: Set up Next.js configuration and globals ✅
**Files**: `/home/formiga/wo/github/microsaas/next.config.js`, `/home/formiga/wo/github/microsaas/app/globals.css`
- Configure Next.js for Amplify integration
- Set up Tailwind CSS configuration
- Configure global styles and CSS variables
- Set up font loading and optimization

### T008: Initialize ShadcnUI components ✅
**Files**: `/home/formiga/wo/github/microsaas/components/ui/`, `/home/formiga/wo/github/microsaas/lib/utils.ts`
- Initialize ShadcnUI component library
- Set up cn() utility for conditional styling
- Install core UI components: Button, Input, Card, Avatar, Dialog
- Configure component theming and variants

---

## Phase 2: Data Models & GraphQL Schema (7 tasks)

### T009: Implement User data model [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/amplify/data/resource.ts`
- Define User model with GraphQL schema from data-model.md
- Implement authorization rules (owner access, public read for basic fields)
- Set up relationships and indexes
- Configure auto-timestamps (createdAt, updatedAt)

### T010: Implement UserActivity data model [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/amplify/data/resource.ts`
- Define UserActivity model with belongsTo User relationship
- Implement ActivityType enum (LOGIN, PROFILE_UPDATE, AVATAR_UPLOAD, etc.)
- Set up GSI for efficient user-based activity queries
- Configure authorization for owner-only access

### T011: Create user profile GraphQL resolvers [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/amplify/functions/user-profile.ts`
- Implement getUserProfile resolver matching user-queries.graphql contract
- Create updateUserProfile mutation with Zod validation
- Handle avatar upload URL generation with S3 pre-signed URLs
- Implement confirmAvatarUpload mutation

### T012: Create authentication GraphQL resolvers [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/amplify/functions/auth.ts`
- Implement registerUser mutation matching auth-queries.graphql contract
- Create email verification and resend verification resolvers
- Implement password reset request and confirmation
- Handle changePassword for authenticated users

### T013: Create activity tracking GraphQL resolvers [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/amplify/functions/activity.ts`
- Implement createUserActivity mutation for activity logging
- Create listUserActivities query with pagination
- Set up real-time subscription onCreateUserActivity
- Handle activity metadata JSON parsing

### T014: Set up Zod validation schemas [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/lib/validations.ts`
- Create UserProfileSchema, PasswordSchema from data-model.md
- Implement UserRegistrationSchema with password confirmation
- Create ActivityTypeSchema and UserActivitySchema
- Export all validation schemas for use across app

### T015: Deploy Amplify backend and test GraphQL API ✅
**Files**: Backend deployment
- Deploy Amplify backend to development environment
- Test GraphQL schema in AppSync console
- Verify authentication configuration
- Test S3 storage permissions and pre-signed URLs

---

## Phase 3: Core Implementation (9 tasks)

### T016: Create TypeScript type definitions [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/types/auth.ts`, `/home/formiga/wo/github/microsaas/types/user.ts`, `/home/formiga/wo/github/microsaas/types/api.ts`
- Define User, UserActivity, and Auth interfaces
- Create API response types matching GraphQL contracts
- Export activity types and validation schemas
- Set up shared type definitions for components

### T017: Set up Amplify client configuration [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/lib/amplify.ts`
- Configure Amplify client with backend outputs
- Set up GraphQL client configuration
- Configure authentication and storage clients
- Export configured Amplify instance

### T018: Create authentication Zustand store [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/stores/auth-store.ts`
- Implement auth state management with Zustand
- Create login, logout, register actions
- Handle authentication state persistence
- Integrate with Amplify auth APIs

### T019: Create user profile Zustand store [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/stores/user-store.ts`
- Implement user profile state management
- Create updateProfile, uploadAvatar actions
- Handle real-time profile updates
- Integrate with GraphQL user mutations

### T020: Create activity feed Zustand store [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/stores/activity-store.ts`
- Implement activity state management with pagination
- Create addActivity, loadActivities actions
- Handle real-time activity subscriptions
- Integrate with GraphQL activity queries

### T021: Create authentication custom hooks [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/hooks/use-auth.ts`, `/home/formiga/wo/github/microsaas/hooks/use-user.ts`
- Implement useAuth hook with authentication methods
- Create useUser hook for profile operations
- Handle loading states and error handling
- Provide convenient authentication utilities

### T022: Create API integration hooks [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/hooks/use-api.ts`
- Implement GraphQL query and mutation hooks
- Create file upload hooks for avatar management
- Handle API error states and retry logic
- Provide real-time subscription hooks

### T023: Create Amplify provider component [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/components/providers/amplify-provider.tsx`
- Set up Amplify configuration provider
- Initialize authentication state on app start
- Handle Amplify client configuration
- Provide authentication context to app

### T024: Create root layout with providers ✅
**Files**: `/home/formiga/wo/github/microsaas/app/layout.tsx`
- Set up root layout with Amplify provider
- Configure global fonts and metadata
- Add authentication provider wrapper
- Set up error boundaries for auth failures

---

## Phase 4: UI Components & Pages (8 tasks)

### T025: Create authentication form components [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/components/forms/login-form.tsx`, `/home/formiga/wo/github/microsaas/components/forms/register-form.tsx`
- Build login form with email/password and Google OAuth
- Create registration form with Zod validation
- Implement password reset form
- Add loading states and error handling with ShadcnUI

### T026: Create profile management form [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/components/forms/profile-form.tsx`
- Build profile edit form with name, email fields
- Implement avatar upload with progress tracking
- Add form validation with Zod schemas
- Handle real-time preview of changes

### T027: Create landing page components [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/components/landing/hero-section.tsx`, `/home/formiga/wo/github/microsaas/components/landing/features-section.tsx`, `/home/formiga/wo/github/microsaas/components/landing/pricing-section.tsx`
- Build hero section with value proposition and CTA
- Create features section highlighting key capabilities
- Implement pricing section with clear plans
- Make all components mobile-responsive

### T028: Create dashboard components [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/components/dashboard/welcome-section.tsx`, `/home/formiga/wo/github/microsaas/components/dashboard/quick-actions.tsx`, `/home/formiga/wo/github/microsaas/components/dashboard/activity-feed.tsx`
- Build personalized welcome message component
- Create quick actions menu for common tasks
- Implement real-time activity feed with subscriptions
- Add pagination and infinite scroll for activities

### T029: Create landing page [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/app/page.tsx`
- Assemble landing page from components (hero, features, pricing)
- Implement responsive design with ShadcnUI
- Add SEO optimization with metadata
- Include call-to-action buttons linking to registration

### T030: Create authentication pages [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/app/(auth)/login/page.tsx`, `/home/formiga/wo/github/microsaas/app/(auth)/register/page.tsx`, `/home/formiga/wo/github/microsaas/app/(auth)/layout.tsx`
- Build login page with form and OAuth options
- Create registration page with email verification flow
- Set up auth layout for consistent styling
- Implement redirects for authenticated users

### T031: Create dashboard page [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/app/(dashboard)/dashboard/page.tsx`
- Assemble dashboard from welcome, quick actions, activity components
- Implement real-time data loading on page mount
- Add loading skeletons for better UX
- Handle authentication requirements and redirects

### T032: Create profile page [P] ✅
**Files**: `/home/formiga/wo/github/microsaas/app/(dashboard)/profile/page.tsx`, `/home/formiga/wo/github/microsaas/app/(dashboard)/layout.tsx`
- Build profile page with profile form component
- Set up dashboard layout with navigation
- Implement breadcrumbs and page titles
- Add logout functionality in navigation

---

## Phase 5: Integration & Real-time Features (4 tasks)

### T033: Implement real-time activity subscriptions ✅
**Files**: `/home/formiga/wo/github/microsaas/hooks/use-activity-subscription.ts`
- Set up WebSocket subscriptions for activity updates
- Handle subscription lifecycle (connect, disconnect, reconnect)
- Integrate with activity store for real-time updates
- Add connection status indicators

### T034: Implement navigation and route protection ✅
**Files**: `/home/formiga/wo/github/microsaas/components/navigation.tsx`, `/home/formiga/wo/github/microsaas/middleware.ts`
- Create responsive navigation component
- Implement route protection middleware
- Handle unauthenticated redirects to login
- Add logout functionality with session cleanup

### T035: Set up file upload with S3 integration ✅
**Files**: `/home/formiga/wo/github/microsaas/lib/file-upload.ts`
- Implement avatar upload with pre-signed URLs
- Add file validation (type, size, dimensions)
- Create upload progress tracking
- Handle upload errors and retry logic

### T036: Implement performance optimizations ✅
**Files**: `/home/formiga/wo/github/microsaas/next.config.js`, component optimizations
- Configure Next.js Image optimization for avatars
- Implement dynamic imports for non-critical components
- Add bundle analysis and code splitting
- Optimize Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1)

---

## Manual Validation Procedures

**No automated testing** - All validation performed manually following quickstart.md:

### Primary Validation Flows
1. **New User Registration**: Landing page → Sign up → Email verification → Login → Dashboard
2. **Profile Management**: Dashboard → Profile → Edit name/email → Upload avatar → Verify real-time updates
3. **Authentication Edge Cases**: Invalid login → Unauthorized access → Session management
4. **Responsive Design**: Mobile viewport testing across all pages
5. **Performance**: Lighthouse audit for Core Web Vitals compliance

### Success Criteria
- Registration conversion >80%
- Email verification >90% within 24 hours
- Average session >5 minutes for authenticated users
- API error rate <1%
- Lighthouse performance score >90

### Manual Testing Checklist
- [ ] Complete user registration and verification flow
- [ ] Test all authentication scenarios (valid/invalid credentials)
- [ ] Verify dashboard real-time updates in multiple browser tabs
- [ ] Test profile editing and avatar upload functionality
- [ ] Validate responsive design on mobile devices
- [ ] Confirm Core Web Vitals meet constitutional requirements
- [ ] Test route protection and unauthorized access handling
- [ ] Verify S3 file upload and permissions
- [ ] Check real-time activity feed subscriptions
- [ ] Validate form validation and error handling

---

## Implementation Notes

**Constitutional Compliance**:
- ✅ AWS Amplify Gen 2 First: All backend through Amplify backend.ts
- ✅ Component Library Consistency: ShadcnUI throughout
- ✅ Type Safety Throughout: TypeScript strict + Zod validation
- ✅ Modern Web Standards: Next.js App Router + React best practices
- ⚠️ Testing Override: Manual validation only for rapid MVP development

**Key Technical Decisions**:
- Next.js App Router with route groups for auth/dashboard organization
- Zustand + Zod for type-safe state management
- Real-time subscriptions via AppSync WebSockets
- S3 pre-signed URLs for secure file uploads
- Owner-based authorization for multi-tenant data isolation

**Performance Targets**:
- LCP <2.5s, FID <100ms, CLS <0.1 (Core Web Vitals)
- API responses <200ms
- Bundle size <1MB with code splitting
- Support 1k concurrent users

**Deployment Strategy**:
- Development environment first for testing
- Staging deployment after manual validation
- Production deployment with monitoring setup
- CloudWatch logging for error tracking
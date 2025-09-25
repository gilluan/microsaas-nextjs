# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: Amplify backend init, dependencies, linting
   → Backend Config: amplify/backend.ts, GraphQL schema, auth setup
   → Storage/Functions: S3 configuration, Lambda functions, triggers
   → Tests: contract tests, integration tests, auth flows
   → Core: models, services, API endpoints, UI components
   → Integration: real-time subscriptions, external APIs, webhooks
   → Polish: unit tests, performance, monitoring, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup & Backend Configuration
- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize Next.js project with TypeScript and required dependencies
- [ ] T003 [P] Configure linting, formatting, and TypeScript strict mode
- [ ] T004 Initialize Amplify Gen 2 backend configuration in amplify/backend.ts
- [ ] T005 [P] Configure authentication with Cognito (email/password, OAuth providers)
- [ ] T006 [P] Define GraphQL schema with proper types and relationships
- [ ] T007 [P] Set up authorization rules and user groups
- [ ] T008 [P] Configure environment-specific settings (dev, staging, prod)

## Phase 3.2: Storage & Functions Setup
- [ ] T009 [P] Configure S3 storage with proper access controls and file organization
- [ ] T010 [P] Set up Lambda functions for custom business logic
- [ ] T011 [P] Configure function triggers (data, auth, storage events)
- [ ] T012 [P] Implement environment variable management for functions
- [ ] T013 [P] Set up CloudWatch logging and monitoring

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T014 [P] GraphQL query/mutation contract tests with proper auth context
- [ ] T015 [P] Storage upload/download integration tests with access controls
- [ ] T016 [P] Authentication flow tests (signup, login, OAuth, token refresh)
- [ ] T017 [P] Real-time subscription tests for live data updates
- [ ] T018 [P] Function trigger tests with proper event handling
- [ ] T019 [P] Multi-tenant data isolation tests

## Phase 3.4: Core Implementation (ONLY after tests are failing)
- [ ] T020 [P] GraphQL resolvers with proper authorization and validation
- [ ] T021 [P] Data models with Zod schemas for runtime validation
- [ ] T022 [P] Authentication components using Amplify UI primitives
- [ ] T023 [P] File upload/download components with progress tracking
- [ ] T024 [P] Real-time subscription hooks for live data
- [ ] T025 [P] State management stores using Zustand with Zod integration
- [ ] T026 Input validation and sanitization using Zod schemas
- [ ] T027 Error boundaries and proper error handling patterns
- [ ] T028 Loading states and user feedback components

## Phase 3.5: Integration & Real-time Features
- [ ] T029 Connect components to GraphQL API with proper error handling
- [ ] T030 Implement real-time subscriptions for live data updates
- [ ] T031 Configure CDN integration for file delivery optimization
- [ ] T032 Set up webhook processing for external integrations
- [ ] T033 Implement proper session management and protected routes
- [ ] T034 Configure security headers and CORS policies
- [ ] T035 Set up monitoring dashboards and alerting

## Phase 3.6: Polish & Optimization
- [ ] T036 [P] Unit tests for Zod schemas and utility functions
- [ ] T037 [P] Component tests using React Testing Library
- [ ] T038 Performance optimization (bundle analysis, code splitting)
- [ ] T039 [P] Accessibility testing and improvements
- [ ] T040 Core Web Vitals optimization and monitoring
- [ ] T041 [P] Update API documentation with GraphQL schema
- [ ] T042 Security audit and penetration testing
- [ ] T043 Load testing with realistic user scenarios
- [ ] T044 Remove code duplication and refactor for maintainability
- [ ] T045 Run comprehensive manual testing scenarios

## Dependencies
- Setup (T001-T008) before all other phases
- Backend config (T004-T008) before storage/functions (T009-T013)
- Storage/functions setup (T009-T013) before tests (T014-T019)
- Tests (T014-T019) before implementation (T020-T028)
- Core implementation (T020-T028) before integration (T029-T035)
- Integration (T029-T035) before polish (T036-T045)
- Authentication setup (T005, T007) blocks auth tests (T016) and components (T022)
- GraphQL schema (T006) blocks resolvers (T020) and API tests (T014)
- Storage config (T009) blocks file components (T023) and storage tests (T015)

## Parallel Example
```
# Launch backend configuration tasks together (T005-T008):
Task: "Configure authentication with Cognito in amplify/backend.ts"
Task: "Define GraphQL schema with proper types in amplify/data/resource.ts"
Task: "Set up authorization rules and user groups in schema"
Task: "Configure environment-specific settings in amplify/backend.ts"

# Launch test tasks together (T014-T019):
Task: "GraphQL query/mutation contract tests with auth context"
Task: "Storage upload/download integration tests"
Task: "Authentication flow tests (signup, login, OAuth)"
Task: "Real-time subscription tests for live data updates"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From GraphQL Schema**:
   - Each query/mutation → contract test task [P]
   - Each resolver → implementation task
   - Each subscription → real-time test [P]

2. **From Data Model**:
   - Each entity → Zod schema creation task [P]
   - Relationships → GraphQL relationship tasks
   - Authorization rules → access control tests [P]

3. **From Storage Requirements**:
   - File operations → upload/download component tasks [P]
   - Access patterns → security test tasks [P]

4. **From Function Requirements**:
   - Each trigger → Lambda function task [P]
   - Background jobs → scheduled function tasks [P]

5. **From User Stories**:
   - Each story → integration test [P]
   - Real-time features → subscription test [P]
   - Quickstart scenarios → validation tasks

6. **Ordering**:
   - Setup → Backend Config → Storage/Functions → Tests → Implementation → Integration → Polish
   - Amplify backend.ts must be configured before other backend tasks
   - GraphQL schema must exist before resolvers and tests
   - Authentication setup blocks auth-dependent components
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] Amplify backend configuration tasks are properly ordered
- [ ] All GraphQL operations have corresponding tests
- [ ] All entities have Zod schema validation tasks
- [ ] Storage and function requirements have implementation tasks
- [ ] Authentication flows are properly tested
- [ ] Real-time subscriptions have test coverage
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent (different files/resources)
- [ ] Each task specifies exact file path or Amplify resource
- [ ] No task modifies same file as another [P] task
- [ ] Multi-tenant data isolation is properly tested
- [ ] Security and authorization rules are validated
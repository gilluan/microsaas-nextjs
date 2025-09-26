
# Implementation Plan: Initial MicroSaaS Platform Foundation

**Branch**: `001-initial-microsaas-definitions` | **Date**: 2025-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/home/formiga/wo/github/microsaas/specs/001-initial-microsaas-definitions/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Building the foundation of a MicroSaaS platform with a modern landing page (hero, features, pricing, CTA), secure user authentication (email/password + Google OAuth), and authenticated area featuring a personalized dashboard (welcome message, quick actions, activity feed) and user profile management (name, email, avatar). Uses AWS Amplify Gen 2 for backend services with Next.js frontend. **No testing infrastructure required** - focus on rapid MVP development.

## Technical Context
**Language/Version**: TypeScript 5.x, Node.js 18+
**Primary Dependencies**: Next.js 14 with App Router, AWS Amplify Gen 2, ShadcnUI, Zustand, Zod, Stripe
**Storage**: Amazon S3 via Amplify Gen 2 for profile avatars, CDN integration
**Functions**: Lambda functions via Amplify Gen 2 for custom business logic and triggers
**Backend Configuration**: Amplify backend.ts for single source of truth, GraphQL schema, Cognito authentication with email/password + Google OAuth
**Testing**: **REMOVED** - No testing infrastructure, rapid MVP development approach
**Target Platform**: Web application, mobile-responsive design
**Project Type**: web - Next.js frontend with Amplify Gen 2 backend
**Performance Goals**: Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1), API responses <200ms, bundle size <1MB
**Constraints**: AWS Amplify Gen 2 capabilities, ShadcnUI component patterns, TypeScript strict mode, **no testing overhead**
**Scale/Scope**: MVP for 1k users, profile image storage up to 2MB per user, real-time activity updates

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. AWS Amplify Gen 2 First**: ✅ PASS
- All backend features using Amplify Gen 2 capabilities
- Backend configuration in `amplify/backend.ts`
- GraphQL schema and Cognito authentication via Amplify
- S3 storage and Lambda functions through Amplify

**II. Component Library Consistency**: ✅ PASS
- ShadcnUI components as foundation for all UI
- Customizing existing components vs building from scratch
- Using `cn()` utility for conditional styling

**III. Type Safety Throughout**: ✅ PASS
- TypeScript strict mode everywhere
- Zod schemas for validation at boundaries (forms, API responses, store updates)
- Zustand + Zod for type-safe state management

**IV. Modern Web Standards**: ✅ PASS
- Next.js App Router for routing and navigation
- Proper loading states, error boundaries, SEO optimization
- React best practices with functional components and hooks

**V. Secure Payment Integration**: ✅ PASS (Future)
- Stripe integration planned for future phases (not in current MVP scope)

**Constitutional Override**: Testing requirements waived for rapid MVP development

**Initial Assessment**: NO VIOLATIONS - All constitutional principles aligned with testing exception

**Post-Design Re-evaluation**: ✅ PASS
- GraphQL schema follows Amplify Gen 2 patterns with proper authorization rules
- Data model uses belongsTo/hasMany relationships correctly
- Storage pattern uses S3 through Amplify with pre-signed URLs
- All validation uses Zod schemas at boundaries
- Next.js App Router with proper route organization
- ShadcnUI components with custom styling approach
- TypeScript throughout with strict configuration
- **Testing override maintained** - manual validation approach documented
- No constitutional violations introduced during design phase

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
amplify/
├── backend.ts              # Single source of truth for backend config
├── data/
│   └── resource.ts         # GraphQL schema definitions
├── auth/
│   └── resource.ts         # Authentication configuration
├── storage/
│   └── resource.ts         # S3 storage configuration
└── functions/
    └── *.ts                # Lambda function implementations

app/                        # Next.js App Router structure
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── layout.tsx          # Auth layout
├── (dashboard)/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   └── layout.tsx          # Dashboard layout
├── page.tsx                # Landing page
├── layout.tsx              # Root layout
└── globals.css             # Global styles

components/
├── ui/                     # ShadcnUI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
├── forms/                  # Form components with Zod validation
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── profile-form.tsx
├── landing/                # Landing page components
│   ├── hero-section.tsx
│   ├── features-section.tsx
│   └── pricing-section.tsx
└── providers/              # Context providers
    ├── amplify-provider.tsx
    └── auth-provider.tsx

stores/                     # Zustand stores with Zod schemas
├── auth-store.ts
├── user-store.ts
└── app-store.ts

hooks/                      # Custom React hooks
├── use-auth.ts
├── use-user.ts
└── use-api.ts

lib/                        # Utility functions and configurations
├── utils.ts
├── validations.ts          # Zod schemas
├── amplify.ts              # Amplify client configuration
└── constants.ts

types/                      # TypeScript type definitions
├── auth.ts
├── user.ts
└── api.ts
```

**Structure Decision**: Next.js web application with Amplify Gen 2 backend. Using App Router with route groups for organized layouts (auth routes and dashboard routes). ShadcnUI components in dedicated ui folder, Zustand stores with Zod validation. **No testing directories** - focus on rapid development without test overhead. All backend configuration managed through Amplify Gen 2 in the amplify/ directory.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Document API contracts** for future reference:
   - GraphQL schema documentation
   - Request/response format specifications
   - API usage examples

4. **Extract user scenarios** from user stories:
   - Document user journey flows
   - Manual validation procedures
   - Quickstart guide = user validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base for Amplify Gen 2 structure
- Generate tasks from Phase 1 design docs (data-model.md, contracts/, quickstart.md)
- Backend Config: amplify/backend.ts setup, GraphQL schema, auth configuration
- GraphQL contracts → direct implementation tasks [P]
- Entities (User, UserActivity) → data model implementation tasks [P]
- User scenarios from quickstart.md → manual validation procedures
- Next.js App Router pages → UI implementation tasks
- ShadcnUI components → component creation tasks [P]
- Zustand stores + Zod schemas → state management tasks [P]

**Ordering Strategy**:
- Phase 1: Setup & Backend Configuration (Amplify backend.ts, dependencies)
- Phase 2: Storage & Functions Setup (S3, Lambda functions, CloudWatch)
- Phase 3: Core Implementation (GraphQL resolvers, Next.js pages, components)
- Phase 4: Integration & Real-time (subscriptions, auth flows, navigation)
- Phase 5: Polish & Optimization (performance, accessibility, monitoring)
- **No testing phases** - direct implementation approach

**Estimated Output**: 30-40 numbered, ordered tasks across 5 phases in tasks.md

**Key Task Categories**:
- Amplify backend configuration and deployment
- GraphQL schema and resolver implementation
- Next.js pages with App Router structure
- ShadcnUI component customization
- Zustand + Zod state management
- Real-time subscriptions and WebSocket handling
- File upload with S3 integration
- Manual validation procedures (no automated tests)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (execute quickstart.md, manual validation, performance verification)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Remove testing infrastructure | Rapid MVP development with manual validation | Automated testing would slow down initial development cycle |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS (with testing override)
- [x] All critical NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (testing removal justified)

**Artifacts Generated**:
- [x] research.md - Technology decisions without testing overhead
- [x] data-model.md - User and UserActivity entities with GraphQL schema
- [x] contracts/user-queries.graphql - User profile management API contract
- [x] contracts/activity-queries.graphql - Activity feed and real-time subscriptions
- [x] contracts/auth-queries.graphql - Authentication and user management
- [x] quickstart.md - Manual validation guide (no automated tests)
- [x] CLAUDE.md updated - Agent context updated with test-free approach

---
*Based on Constitution v1.2.0 - See `.specify/memory/constitution.md`*

# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions (Cognito user groups, authorization rules)
   - Data retention/deletion policies (S3 lifecycle, data archiving)
   - Performance targets and scale (concurrent users, API rate limits)
   - Error handling behaviors (retry logic, fallback strategies)
   - Integration requirements (external APIs, webhook handling)
   - Security/compliance needs (data encryption, audit logging)
   - Storage requirements (file types, size limits, access patterns)
   - Functions/automation needs (triggers, scheduled tasks, background processing)
   - Real-time requirements (subscriptions, live updates, notifications)
   - Multi-tenancy patterns (data isolation, resource sharing)

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
[Describe the main user journey in plain language]

### Acceptance Scenarios
1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

### Edge Cases
- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

### Authentication & Authorization Requirements *(include if feature involves user management)*
- **AUTH-001**: System MUST support [authentication method, e.g., "email/password and Google OAuth"]
- **AUTH-002**: System MUST implement [user roles/groups, e.g., "admin, user, viewer roles"]
- **AUTH-003**: System MUST enforce [access controls, e.g., "tenant data isolation"]
- **AUTH-004**: System MUST provide [session management, e.g., "secure token refresh"]

### Data & API Requirements *(include if feature involves data operations)*
- **DATA-001**: System MUST [data operation, e.g., "support real-time updates via subscriptions"]
- **DATA-002**: System MUST [data validation, e.g., "validate all inputs using Zod schemas"]
- **DATA-003**: System MUST [data relationships, e.g., "maintain referential integrity"]
- **DATA-004**: System MUST [performance requirement, e.g., "respond to queries within 200ms"]

### Functional Requirements
- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

*Example of marking unclear requirements:*
- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]
- **FR-008**: System MUST process files [NEEDS CLARIFICATION: processing requirements not specified - resize, convert, validate?]
- **FR-009**: System MUST trigger notifications [NEEDS CLARIFICATION: trigger conditions and delivery method not specified]

### Storage Requirements *(include if feature involves files)*
- **File Types**: [What types of files, e.g., images, documents, videos]
- **Size Limits**: [Maximum file sizes, total storage per user/tenant]
- **Access Patterns**: [Who can access what files, sharing requirements]
- **Processing Needs**: [Image resizing, document conversion, virus scanning]

### Functions Requirements *(include if feature needs automation)*
- **Triggers**: [What events should trigger automation, e.g., user signup, file upload]
- **Scheduled Tasks**: [Regular processing needs, e.g., daily reports, cleanup]
- **Background Processing**: [Async operations, batch jobs, data transformations]
- **External Integrations**: [Third-party API calls, webhook processing]

### Real-time Requirements *(include if feature needs live updates)*
- **Subscription Patterns**: [What data changes need real-time updates]
- **User Experience**: [How users should see live changes, notification preferences]
- **Scale Considerations**: [Expected concurrent users, update frequency]

### Key Entities *(include if feature involves data)*
- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]
- **Multi-tenancy**: [How data isolation works, tenant boundaries]

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous  
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---

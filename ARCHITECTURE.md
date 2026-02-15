# SASS-E Architecture Documentation

**Version:** 1.0  
**Last Updated:** February 15, 2026  
**Author:** Manus AI

---

## Table of Contents

1. [Overview](#overview)
2. [Dual-Database Architecture](#dual-database-architecture)
3. [Adapter Pattern](#adapter-pattern)
4. [Row-Level Security (RLS) Strategy](#row-level-security-rls-strategy)
5. [Authentication & Authorization](#authentication--authorization)
6. [Database Schema](#database-schema)
7. [Testing Strategy](#testing-strategy)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Adding New Features](#adding-new-features)
10. [Troubleshooting](#troubleshooting)

---

## Overview

SASS-E (Sarcastic AI Assistant System - Enterprise) is a full-stack TypeScript application built with React, tRPC, Express, and a dual-database architecture. The system provides a comprehensive AI assistant platform with features including voice interaction, budget management, debt coaching, language learning, IoT device control, and more.

### Technology Stack

The application leverages a modern technology stack designed for scalability, type safety, and developer productivity.

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, TailwindCSS 4, shadcn/ui | Modern UI with component library |
| **API Layer** | tRPC 11, Superjson | End-to-end type-safe API |
| **Backend** | Express 4, Node.js 22 | HTTP server and middleware |
| **Admin Database** | MySQL/TiDB | Owner/admin data storage |
| **User Database** | Supabase (PostgreSQL) | Regular user data with RLS |
| **Testing** | Vitest, Testing Library | Unit and integration tests |
| **CI/CD** | GitHub Actions | Automated testing and deployment |

### Key Design Principles

The architecture follows several core principles that guide all development decisions. **Separation of concerns** ensures admin and user data are completely isolated through the dual-database architecture. **Type safety** is maintained end-to-end from database to UI using TypeScript and tRPC. **Security by default** is achieved through Row-Level Security (RLS) for user data and role-based access control. **Testability** is prioritized with comprehensive test coverage (269 tests) and integration tests for critical paths. Finally, **maintainability** is ensured through clear patterns, documentation, and consistent code organization.

---

## Dual-Database Architecture

The application employs a dual-database architecture to completely isolate administrative data from user data, providing enhanced security and scalability.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    (React + tRPC Client)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      tRPC Router                             │
│                  (server/routers.ts)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Context Middleware                         │
│              (server/_core/trpc.ts)                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  if (user.role === 'admin')                        │    │
│  │    → Create MySQL Adapters                         │    │
│  │  else                                              │    │
│  │    → Create Supabase Adapters (with RLS)          │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
┌──────────────────────┐   ┌──────────────────────┐
│   MySQL/TiDB         │   │   Supabase           │
│   (Admin Database)   │   │   (User Database)    │
│                      │   │                      │
│  • Owner data        │   │  • User data         │
│  • Admin operations  │   │  • RLS enabled       │
│  • Full access       │   │  • User-scoped       │
└──────────────────────┘   └──────────────────────┘
```

### Database Routing Logic

The system routes database operations based on user role, ensuring complete data isolation between administrative and regular user operations.

**Admin Users (role='admin'):**
- Route to MySQL/TiDB database
- Full access to all data
- No RLS restrictions
- Used for owner/admin operations

**Regular Users (role='user'):**
- Route to Supabase (PostgreSQL) database
- RLS policies enforce data isolation
- Users can only access their own data
- Scalable for large user bases

### Benefits of Dual-Database Architecture

This architecture provides several critical advantages for enterprise applications. **Security isolation** ensures admin data is completely separated from user data, preventing any possibility of unauthorized access. **Scalability** is achieved by offloading user data to Supabase, which can scale independently from the admin database. **Performance** benefits from specialized optimization for each database based on its access patterns. **Compliance** is simplified by maintaining separate databases for different data sensitivity levels. Finally, **cost optimization** allows for different pricing tiers and resource allocation for admin versus user databases.

---

## Adapter Pattern

The adapter pattern provides a unified interface for database operations while abstracting the underlying database implementation (MySQL or Supabase).

### Adapter Interface Design

Each domain has its own adapter interface that defines the contract for database operations. The system includes nine adapter interfaces, each responsible for a specific domain.

| Adapter | Purpose | Location |
|---------|---------|----------|
| **CoreAdapter** | User profiles, conversations, settings | `server/adapters/CoreAdapter.ts` |
| **BudgetAdapter** | Budget management, transactions, categories | `server/adapters/BudgetAdapter.ts` |
| **DebtAdapter** | Debt tracking, payments, milestones | `server/adapters/DebtAdapter.ts` |
| **LearningAdapter** | Learning sessions, quizzes, study guides | `server/adapters/LearningAdapter.ts` |
| **IoTAdapter** | IoT devices, commands, state management | `server/adapters/IoTAdapter.ts` |
| **GoalsAdapter** | Goal tracking, progress, achievements | `server/adapters/GoalsAdapter.ts` |
| **TranslationAdapter** | Translation history, conversations, phrasebook | `server/adapters/TranslationAdapter.ts` |
| **NotificationAdapter** | User notifications, preferences | `server/adapters/NotificationAdapter.ts` |
| **VerifiedFactAdapter** | Fact checking, verified information | `server/adapters/VerifiedFactAdapter.ts` |

### Adapter Implementation Pattern

Each adapter has two concrete implementations that provide database-specific logic while maintaining the same interface.

**MySQL Implementation:**
```typescript
// server/adapters/MySQLCoreAdapter.ts
export class MySQLCoreAdapter implements CoreAdapter {
  async getUserProfile(userId: number): Promise<UserProfile | null> {
    const db = await getDb();
    const result = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    return result[0] || null;
  }
}
```

**Supabase Implementation:**
```typescript
// server/adapters/SupabaseCoreAdapter.ts
export class SupabaseCoreAdapter implements CoreAdapter {
  constructor(
    private userId: string,
    private accessToken: string
  ) {}

  private async getClient(): Promise<SupabaseClient> {
    return getSupabaseClient(this.userId, this.accessToken);
  }

  async getUserProfile(userId: number): Promise<UserProfile | null> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) return null;
    return data;
  }
}
```

### Adapter Factory Functions

Factory functions in `server/adapters/index.ts` create the appropriate adapter implementation based on user role. These factories encapsulate the routing logic and ensure consistent adapter creation across the application.

```typescript
export function createCoreAdapter(ctx: AdapterContext): CoreAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLCoreAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseCoreAdapter(userId, accessToken);
  }
}
```

### Using Adapters in tRPC Procedures

The tRPC context middleware automatically creates all adapters and makes them available in procedure handlers. Adapters are accessed through the context object, providing a clean and type-safe API.

```typescript
// server/routers.ts
getUserProfile: protectedProcedure.query(async ({ ctx }) => {
  // ctx.coreDb is guaranteed to be non-null by middleware
  const profile = await ctx.coreDb.getUserProfile(ctx.user.numericId);
  return profile;
}),
```

### Adapter Pattern Benefits

The adapter pattern provides significant advantages for maintainability and scalability. **Abstraction** hides database implementation details from business logic, making code easier to understand and modify. **Consistency** ensures all database operations follow the same pattern, reducing cognitive load for developers. **Testability** allows for easy mocking of adapters in unit tests without requiring actual database connections. **Flexibility** enables switching database implementations without changing business logic, supporting future migrations or optimizations. **Type safety** is maintained through TypeScript interfaces, catching errors at compile time rather than runtime.

---

## Row-Level Security (RLS) Strategy

Supabase employs Row-Level Security (RLS) policies to enforce data isolation at the database level, ensuring users can only access their own data.

### RLS Policy Structure

RLS policies are defined in Supabase and automatically enforced for all queries. The system uses a consistent pattern across all tables to ensure security and maintainability.

**Standard RLS Pattern:**
```sql
-- Enable RLS on table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id::text);

-- Policy: Users can only insert their own data
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id::text);

-- Policy: Users can only update their own data
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id::text);

-- Policy: Users can only delete their own data
CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  USING (auth.uid() = user_id::text);
```

### RLS Policy Coverage

RLS policies are applied to all user-facing tables in the Supabase database. The following table summarizes the RLS policy coverage across different domains.

| Domain | Tables with RLS | Policy Type |
|--------|----------------|-------------|
| **Core** | user_profiles, conversations, conversation_feedback | User-scoped (auth.uid() = user_id) |
| **Budget** | budgets, transactions, categories, snapshots | User-scoped (auth.uid() = user_id) |
| **Debt** | debts, debt_payments, debt_milestones | User-scoped (auth.uid() = user_id) |
| **Learning** | learning_sessions, quizzes, study_guides | User-scoped (auth.uid() = user_id) |
| **IoT** | iot_devices, iot_commands | User-scoped (auth.uid() = user_id) |
| **Goals** | goals, goal_progress | User-scoped (auth.uid() = user_id) |
| **Translation** | translations, translation_conversations | User-scoped (auth.uid() = user_id) |
| **Notifications** | notifications, notification_preferences | User-scoped (auth.uid() = user_id) |

### Supabase Client Configuration

The Supabase client is configured with the user's access token to enforce RLS policies automatically. This configuration ensures that all database operations respect RLS policies without requiring explicit checks in application code.

```typescript
// server/supabaseClient.ts
export async function getSupabaseClient(
  userId: string,
  accessToken: string
): Promise<SupabaseClient> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
  
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
```

### RLS Security Benefits

Row-Level Security provides defense-in-depth security that operates at multiple layers. **Database-level enforcement** ensures security policies are enforced even if application code has bugs or vulnerabilities. **Zero-trust architecture** means every query is validated against RLS policies, regardless of the calling code. **Automatic enforcement** eliminates the need for manual access checks in application code, reducing the risk of security gaps. **Audit trail** capabilities allow for comprehensive logging of all data access at the database level. **Compliance** support simplifies meeting regulatory requirements like GDPR by enforcing data access controls at the database layer.

---

## Authentication & Authorization

The application uses a dual-authentication system that mirrors the dual-database architecture, providing separate authentication flows for admin and regular users.

### Authentication Flow

The authentication system handles two distinct user types with different authentication mechanisms and access patterns.

**Admin Authentication:**
- Authenticated via Manus OAuth (manus.im)
- JWT token stored in HTTP-only cookie
- Role set to 'admin' in database
- Routes to MySQL database

**User Authentication:**
- Authenticated via Supabase Auth
- Supabase session token stored in HTTP-only cookie
- Role set to 'user' in database
- Routes to Supabase database with RLS

### tRPC Context Middleware

The tRPC context middleware is responsible for validating authentication and creating the appropriate adapters based on user role. This middleware runs before every protected procedure, ensuring consistent authentication and authorization.

```typescript
// server/_core/trpc.ts
const requireUser = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // Create adapters based on user role
  const coreDb = createCoreAdapter(ctx);
  const budgetDb = createBudgetAdapter(ctx);
  const debtDb = createDebtAdapter(ctx);
  const learningDb = createLearningAdapter(ctx);
  const iotDb = createIoTAdapter(ctx);
  const goalsDb = createGoalsAdapter(ctx);
  const translationDb = createTranslationAdapter(ctx);
  const notificationDb = createNotificationAdapter(ctx);
  const verifiedFactDb = createVerifiedFactAdapter(ctx);

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      coreDb,
      budgetDb,
      debtDb,
      learningDb,
      iotDb,
      goalsDb,
      translationDb,
      notificationDb,
      verifiedFactDb,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireUser);
```

### Role-Based Access Control

The system implements role-based access control (RBAC) at multiple layers to ensure proper authorization. **Middleware level** routing occurs where the context middleware routes users to appropriate database adapters based on role. **Procedure level** protection uses `protectedProcedure` for authenticated users and `adminProcedure` for admin-only operations. **Database level** enforcement through RLS policies ensures Supabase automatically enforces user-scoped access. **Adapter level** isolation means MySQL adapters have no RLS, Supabase adapters enforce RLS automatically.

---

## Database Schema

The application maintains parallel schemas in both MySQL and Supabase databases, with some differences in implementation details.

### Core Tables

The core domain manages user profiles, conversations, and application settings. These tables form the foundation of the user experience.

**user_profiles:**
- `user_id` (primary key): Unique identifier for the user
- `language`: User's preferred language (e.g., 'en', 'es', 'fr')
- `stay_signed_in`: Boolean flag for persistent sessions
- `hub_selection`: JSON array of enabled feature hubs
- `created_at`: Timestamp of profile creation
- `updated_at`: Timestamp of last profile update

**conversations:**
- `id` (primary key): Unique conversation identifier
- `user_id`: Foreign key to users table
- `message`: User's input message
- `response`: AI assistant's response
- `search_results`: JSON object with web search results
- `created_at`: Timestamp of conversation

**conversation_feedback:**
- `id` (primary key): Unique feedback identifier
- `user_id`: Foreign key to users table
- `conversation_id`: Foreign key to conversations table
- `rating`: Integer rating (1-5)
- `feedback_text`: Optional text feedback
- `created_at`: Timestamp of feedback

### Budget & Finance Tables

The budget domain provides comprehensive financial management capabilities including transaction tracking, categorization, and budget snapshots.

**budgets:**
- `id` (primary key): Unique budget identifier
- `user_id`: Foreign key to users table
- `category_id`: Foreign key to categories table
- `amount`: Budget amount (decimal)
- `period`: Budget period ('monthly', 'weekly', 'yearly')
- `created_at`: Timestamp of budget creation

**transactions:**
- `id` (primary key): Unique transaction identifier
- `user_id`: Foreign key to users table
- `category_id`: Foreign key to categories table
- `amount`: Transaction amount (decimal)
- `description`: Transaction description
- `date`: Transaction date
- `type`: Transaction type ('income', 'expense')
- `created_at`: Timestamp of transaction creation

**categories:**
- `id` (primary key): Unique category identifier
- `user_id`: Foreign key to users table
- `name`: Category name
- `icon`: Icon identifier for UI display
- `color`: Color hex code for UI display
- `created_at`: Timestamp of category creation

### Foreign Key Constraints with CASCADE DELETE

The system uses foreign key constraints with CASCADE DELETE to maintain referential integrity and automatically clean up orphaned records when parent records are deleted.

**Translation Domain Example:**
```sql
-- translate_conversations table
ALTER TABLE translate_conversations
  ADD CONSTRAINT fk_translate_conversations_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- translate_messages table
ALTER TABLE translate_messages
  ADD CONSTRAINT fk_translate_messages_conversation
  FOREIGN KEY (conversation_id)
  REFERENCES translate_conversations(id)
  ON DELETE CASCADE;
```

This ensures that when a conversation is deleted, all associated messages are automatically deleted as well, preventing orphaned records and simplifying deletion logic in application code.

---

## Testing Strategy

The application maintains comprehensive test coverage with 269 tests across unit tests, integration tests, and adapter routing tests.

### Test Structure

The testing strategy follows a layered approach that validates functionality at multiple levels of the application stack.

| Test Type | Count | Purpose | Location |
|-----------|-------|---------|----------|
| **Unit Tests** | 220 | Test individual functions and components | `server/**/*.test.ts`, `client/**/*.test.tsx` |
| **Integration Tests** | 24 | Test feature workflows end-to-end | `server/*Router.test.ts` |
| **Adapter Routing Tests** | 25 | Verify correct database routing | `server/adapter-routing.test.ts` |
| **Total** | **269** | Comprehensive coverage | - |

### Adapter Routing Integration Tests

The adapter routing tests are critical for ensuring the dual-database architecture functions correctly. These tests verify that users are routed to the correct database based on their role, preventing security vulnerabilities and data leakage.

**Test Coverage:**
```typescript
// server/adapter-routing.test.ts
describe('Adapter Routing Integration Tests', () => {
  // Individual adapter routing tests (18 tests)
  describe('CoreAdapter Routing', () => {
    it('should route admin users to MySQLCoreAdapter');
    it('should route regular users to SupabaseCoreAdapter');
  });
  // ... repeated for all 9 adapters

  // Cross-adapter consistency tests (2 tests)
  it('should consistently route all adapters for admin users to MySQL');
  it('should consistently route all adapters for regular users to Supabase');

  // Security tests (2 tests)
  it('should never route regular users to MySQL adapters');
  it('should never route admin users to Supabase adapters');

  // Context validation tests (3 tests)
  it('should pass correct userId to Supabase adapters');
  it('should pass correct accessToken to Supabase adapters');
  it('should create MySQL adapters without userId or accessToken');
});
```

### Running Tests

The test suite can be executed using several npm scripts that provide different levels of detail and interactivity.

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (re-run on file changes)
pnpm test:watch

# Run tests with UI dashboard
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

### Test Environment Configuration

Tests require specific environment variables to be set for database connections and API integrations. The test environment is configured to use test-specific credentials that are isolated from production data.

```bash
# Required environment variables for tests
DATABASE_URL=mysql://test:test@localhost:3306/test
JWT_SECRET=test-jwt-secret
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
TAVILY_API_KEY=your-tavily-key
OPENWEATHER_API_KEY=your-weather-key
```

### Test Best Practices

The testing strategy follows several best practices to ensure reliability and maintainability. **Isolation** is achieved by ensuring each test is independent and can run in any order without side effects. **Mocking** is used for external dependencies like API calls to prevent flaky tests and reduce test execution time. **Assertions** are specific and meaningful, clearly indicating what functionality is being validated. **Coverage** focuses on critical paths and edge cases rather than achieving 100% line coverage. **Performance** is maintained by keeping tests fast, with the full suite completing in under 20 seconds.

---

## CI/CD Pipeline

The application uses GitHub Actions for continuous integration and deployment, automatically running tests on every push and pull request.

### Workflow Configuration

The CI/CD pipeline is defined in `.github/workflows/ci.yml` and consists of two main jobs that run in parallel.

**Test Job:**
1. Checkout code from repository
2. Setup pnpm and Node.js 22.x with dependency caching
3. Install dependencies with frozen lockfile
4. Set up test environment variables
5. Run TypeScript type checking
6. Execute full test suite (269 tests)
7. Upload test results as artifacts (30-day retention)

**Lint Job:**
1. Checkout code from repository
2. Setup pnpm and Node.js with caching
3. Install dependencies
4. Run ESLint (continues on error for now)

### Workflow Triggers

The CI/CD workflow is triggered automatically on specific Git events to ensure code quality before merging.

```yaml
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
```

### Required GitHub Secrets

The workflow requires several secrets to be configured in the GitHub repository settings for successful test execution.

| Secret Name | Purpose |
|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret |
| `TAVILY_API_KEY` | Tavily web search API key |
| `OPENWEATHER_API_KEY` | OpenWeather API key |

### CI Status Badge

The README.md includes a CI status badge that displays the current build status, providing immediate visibility into the health of the codebase.

```markdown
![CI Status](https://github.com/DavSah-1/SASS-E.com/actions/workflows/ci.yml/badge.svg)
```

---

## Adding New Features

When adding new features to the application, follow this structured approach to maintain consistency with the existing architecture.

### Step 1: Define Database Schema

Start by defining the database schema for the new feature in both MySQL and Supabase databases. Ensure schema consistency between databases while accounting for implementation differences.

**MySQL Schema (Drizzle ORM):**
```typescript
// drizzle/schema.ts
export const newFeature = mysqlTable('new_feature', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  data: text('data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Supabase Schema (SQL):**
```sql
-- Create table in Supabase dashboard
CREATE TABLE new_feature (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data"
  ON new_feature FOR SELECT
  USING (auth.uid() = user_id);
```

### Step 2: Create Adapter Interface

Define the adapter interface that specifies the contract for database operations related to the new feature.

```typescript
// server/adapters/NewFeatureAdapter.ts
export interface NewFeatureAdapter {
  getFeatureData(userId: number): Promise<FeatureData[]>;
  createFeatureData(userId: number, data: string): Promise<number>;
  updateFeatureData(id: number, data: string): Promise<void>;
  deleteFeatureData(id: number, userId: number): Promise<void>;
}
```

### Step 3: Implement MySQL Adapter

Create the MySQL adapter implementation that uses Drizzle ORM to interact with the MySQL database.

```typescript
// server/adapters/MySQLNewFeatureAdapter.ts
export class MySQLNewFeatureAdapter implements NewFeatureAdapter {
  async getFeatureData(userId: number): Promise<FeatureData[]> {
    const db = await getDb();
    return await db.select()
      .from(newFeature)
      .where(eq(newFeature.userId, userId));
  }
  // ... implement other methods
}
```

### Step 4: Implement Supabase Adapter

Create the Supabase adapter implementation that uses the Supabase client with RLS enforcement.

```typescript
// server/adapters/SupabaseNewFeatureAdapter.ts
export class SupabaseNewFeatureAdapter implements NewFeatureAdapter {
  constructor(
    private userId: string,
    private accessToken: string
  ) {}

  private async getClient(): Promise<SupabaseClient> {
    return getSupabaseClient(this.userId, this.accessToken);
  }

  async getFeatureData(userId: number): Promise<FeatureData[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('new_feature')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }
  // ... implement other methods
}
```

### Step 5: Create Adapter Factory

Add a factory function to create the appropriate adapter based on user role.

```typescript
// server/adapters/index.ts
export function createNewFeatureAdapter(ctx: AdapterContext): NewFeatureAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLNewFeatureAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseNewFeatureAdapter(userId, accessToken);
  }
}
```

### Step 6: Add Adapter to Context

Update the tRPC context middleware to include the new adapter, making it available to all protected procedures.

```typescript
// server/_core/trpc.ts
const requireUser = t.middleware(async ({ ctx, next }) => {
  // ... existing adapter creation
  const newFeatureDb = createNewFeatureAdapter(ctx);

  return next({
    ctx: {
      ...ctx,
      newFeatureDb,
      // ... other adapters
    },
  });
});
```

### Step 7: Create tRPC Router

Create a new tRPC router that defines the API endpoints for the feature, using the adapter for database operations.

```typescript
// server/newFeatureRouter.ts
export const newFeatureRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.newFeatureDb.getFeatureData(ctx.user.numericId);
  }),

  create: protectedProcedure
    .input(z.object({ data: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.newFeatureDb.createFeatureData(
        ctx.user.numericId,
        input.data
      );
    }),
});
```

### Step 8: Write Tests

Create comprehensive tests for the new feature, including unit tests for adapters and integration tests for the router.

```typescript
// server/newFeature.test.ts
describe('NewFeature Adapter Routing', () => {
  it('should route admin users to MySQLNewFeatureAdapter');
  it('should route regular users to SupabaseNewFeatureAdapter');
  it('should create feature data');
  it('should retrieve feature data');
});
```

### Step 9: Update Documentation

Finally, update this ARCHITECTURE.md document to include information about the new feature, its adapter, and any special considerations.

---

## Troubleshooting

This section provides solutions to common issues encountered during development and deployment.

### Adapter Routing Issues

**Problem:** User data appearing in wrong database or access denied errors.

**Solution:** Verify user role is correctly set in the database and that the adapter factory is using the correct role check. Run adapter routing tests to ensure proper routing.

```bash
# Run adapter routing tests
pnpm test adapter-routing.test.ts
```

### RLS Policy Errors

**Problem:** Supabase queries fail with "permission denied" or return empty results.

**Solution:** Ensure RLS policies are correctly configured in Supabase dashboard and that the access token is being passed correctly to the Supabase client. Verify the user's auth.uid() matches the user_id in the table.

```typescript
// Check if access token is being passed
const supabase = await getSupabaseClient(userId, accessToken);
console.log('Access token:', accessToken); // Should not be empty
```

### Test Failures

**Problem:** Tests fail with database connection errors or timeout issues.

**Solution:** Ensure all required environment variables are set in the test environment and that database connections are properly configured. Check that test database is accessible and has correct schema.

```bash
# Verify environment variables
echo $DATABASE_URL
echo $VITE_SUPABASE_URL

# Run tests with verbose output
pnpm test --reporter=verbose
```

### TypeScript Errors

**Problem:** TypeScript compilation errors related to adapter types or context.

**Solution:** Ensure all adapter interfaces are properly defined and that the context middleware is correctly typed. Run type checking to identify specific issues.

```bash
# Run TypeScript type checking
pnpm typecheck
```

### Foreign Key Constraint Violations

**Problem:** Database operations fail with foreign key constraint errors.

**Solution:** Ensure parent records exist before creating child records and that CASCADE DELETE is properly configured for cleanup operations. Check the order of operations in transactions.

```typescript
// Correct order: Create parent first, then children
const conversationId = await createConversation(userId, title);
await createMessage(conversationId, message);
```

---

## Conclusion

The SASS-E architecture provides a robust, scalable, and secure foundation for building enterprise AI assistant applications. The dual-database architecture with adapter pattern ensures complete data isolation while maintaining code simplicity. Row-Level Security policies provide defense-in-depth security at the database level. Comprehensive test coverage with 269 tests ensures reliability and prevents regressions. The CI/CD pipeline automates testing and deployment, maintaining code quality.

For questions or contributions, please refer to the project repository and follow the established patterns documented in this guide.

---

**Document Version:** 1.0  
**Last Updated:** February 15, 2026  
**Maintained By:** Manus AI

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { UnifiedUser } from "./dbRouter";
import { sdk } from "./sdk";
import { createCoreAdapter, type CoreAdapter, createNotificationAdapter, type NotificationAdapter, createBudgetAdapter, type BudgetAdapter, createDebtAdapter, type DebtAdapter, createLearningAdapter, type LearningAdapter, createIoTAdapter, type IoTAdapter, createGoalsAdapter, type GoalsAdapter, createTranslationAdapter, type TranslationAdapter } from "../adapters";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: UnifiedUser | null;
  accessToken?: string; // JWT token for RLS enforcement
  coreDb: CoreAdapter | null; // Core adapter (user/profile/conversation)
  notificationDb: NotificationAdapter | null; // Notification adapter
  budgetDb: BudgetAdapter | null; // Budget adapter
  debtDb: DebtAdapter | null; // Debt adapter
  learningDb: LearningAdapter | null; // Learning adapter
  iotDb: IoTAdapter | null; // IoT adapter
  goalsDb: GoalsAdapter | null; // Goals adapter
  translationDb: TranslationAdapter | null; // Translation adapter
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: UnifiedUser | null = null;
  let accessToken: string | undefined = undefined;

  try {
    user = await sdk.authenticateRequest(opts.req);
    
    // Extract JWT token from Authorization header for RLS
    const authHeader = opts.req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Create adapters if user is authenticated
  const coreDb = user ? createCoreAdapter({ user, accessToken }) : null;
  const notificationDb = user ? createNotificationAdapter({ user, accessToken }) : null;
  const budgetDb = user ? createBudgetAdapter({ user, accessToken }) : null;
  const debtDb = user ? createDebtAdapter({ user, accessToken }) : null;
  const learningDb = user ? createLearningAdapter({ user, accessToken }) : null;
  const iotDb = user ? createIoTAdapter({ user, accessToken }) : null;
  const goalsDb = user ? createGoalsAdapter({ user, accessToken }) : null;
  const translationDb = user ? createTranslationAdapter({ user, accessToken }) : null;

  return {
    req: opts.req,
    res: opts.res,
    user,
    accessToken,
    coreDb,
    notificationDb,
    budgetDb,
    debtDb,
    learningDb,
    iotDb,
    goalsDb,
    translationDb,
  };
}

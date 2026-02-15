import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { UnifiedUser } from "./dbRouter";
import { sdk } from "./sdk";
import { createCoreAdapter, type CoreAdapter, createNotificationAdapter, type NotificationAdapter, createBudgetAdapter, type BudgetAdapter, createDebtAdapter, type DebtAdapter, createLearningAdapter, type LearningAdapter, createIoTAdapter, type IoTAdapter, createGoalsAdapter, type GoalsAdapter, createTranslationAdapter, type TranslationAdapter, createVerifiedFactAdapter, type VerifiedFactAdapter, createWellbeingAdapter, type WellbeingAdapter, createSharingAdapter, type SharingAdapter, createWearableAdapter, type WearableAdapter, createAlertsAdapter, type AlertsAdapter, createRecurringAdapter, type RecurringAdapter, createInsightsAdapter, type InsightsAdapter, createReceiptsAdapter, type ReceiptsAdapter, createLanguageLearningAdapter, type LanguageLearningAdapter, createMathScienceAdapter, type MathScienceAdapter, createLearningHubAdapter, type LearningHubAdapter, createLearnFinanceAdapter, type LearnFinanceAdapter } from "../adapters";

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
  verifiedFactDb: VerifiedFactAdapter | null; // Verified fact adapter
  wellbeingDb: WellbeingAdapter | null; // Wellbeing adapter
  sharingDb: SharingAdapter | null; // Sharing adapter
  wearableDb: WearableAdapter | null; // Wearable adapter
  alertsDb: AlertsAdapter | null; // Alerts adapter
  recurringDb: RecurringAdapter | null; // Recurring adapter
  insightsDb: InsightsAdapter | null; // Insights adapter
  receiptsDb: ReceiptsAdapter | null; // Receipts adapter
  languageLearningDb: LanguageLearningAdapter | null; // Language learning adapter
  mathScienceDb: MathScienceAdapter | null; // Math & science adapter
  learningHubDb: LearningHubAdapter | null; // Learning hub adapter
  learnFinanceDb: LearnFinanceAdapter | null; // Learn finance adapter
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
  const verifiedFactDb = user ? createVerifiedFactAdapter({ user, accessToken }) : null;
  const wellbeingDb = user ? createWellbeingAdapter({ user, accessToken }) : null;
  const sharingDb = user ? createSharingAdapter({ user, accessToken }) : null;
  const wearableDb = user ? createWearableAdapter({ user, accessToken }) : null;
  const alertsDb = user ? createAlertsAdapter({ user, accessToken }) : null;
  const recurringDb = user ? createRecurringAdapter({ user, accessToken }) : null;
  const insightsDb = user ? createInsightsAdapter({ user, accessToken }) : null;
  const receiptsDb = user ? createReceiptsAdapter({ user, accessToken }) : null;
  const languageLearningDb = user ? createLanguageLearningAdapter({ user, accessToken }) : null;
  const mathScienceDb = user ? createMathScienceAdapter({ user, accessToken }) : null;
  const learningHubDb = user ? createLearningHubAdapter({ user, accessToken }) : null;
  const learnFinanceDb = user ? createLearnFinanceAdapter({ user, accessToken }) : null;

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
    verifiedFactDb,
    wellbeingDb,
    sharingDb,
    wearableDb,
    alertsDb,
    recurringDb,
    insightsDb,
    receiptsDb,
    languageLearningDb,
    mathScienceDb,
    learningHubDb,
    learnFinanceDb,
  };
}

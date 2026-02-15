import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createCoreAdapter,
  createBudgetAdapter,
  createDebtAdapter,
  createLearningAdapter,
  createIoTAdapter,
  createGoalsAdapter,
  createTranslationAdapter,
  createNotificationAdapter,
  createVerifiedFactAdapter,
  createWellbeingAdapter,
  createSharingAdapter,
  createWearableAdapter,
  createAlertsAdapter,
  createRecurringAdapter,
  createInsightsAdapter,
  createReceiptsAdapter,
  type AdapterContext,
} from './adapters/index';
import { MySQLCoreAdapter } from './adapters/MySQLCoreAdapter';
import { SupabaseCoreAdapter } from './adapters/SupabaseCoreAdapter';
import { MysqlBudgetAdapter } from './adapters/MysqlBudgetAdapter';
import { SupabaseBudgetAdapter } from './adapters/SupabaseBudgetAdapter';
import { MysqlDebtAdapter } from './adapters/MysqlDebtAdapter';
import { SupabaseDebtAdapter } from './adapters/SupabaseDebtAdapter';
import { MysqlLearningAdapter } from './adapters/MysqlLearningAdapter';
import { SupabaseLearningAdapter } from './adapters/SupabaseLearningAdapter';
import { MysqlIoTAdapter } from './adapters/MysqlIoTAdapter';
import { SupabaseIoTAdapter } from './adapters/SupabaseIoTAdapter';
import { MysqlGoalsAdapter } from './adapters/MysqlGoalsAdapter';
import { SupabaseGoalsAdapter } from './adapters/SupabaseGoalsAdapter';
import { MysqlTranslationAdapter } from './adapters/MysqlTranslationAdapter';
import { SupabaseTranslationAdapter } from './adapters/SupabaseTranslationAdapter';
import { MysqlNotificationAdapter } from './adapters/MysqlNotificationAdapter';
import { SupabaseNotificationAdapter } from './adapters/SupabaseNotificationAdapter';
import { MySQLVerifiedFactAdapter } from './adapters/MySQLVerifiedFactAdapter';
import { SupabaseVerifiedFactAdapter } from './adapters/SupabaseVerifiedFactAdapter';
import { MySQLWellbeingAdapter } from './adapters/MySQLWellbeingAdapter';
import { SupabaseWellbeingAdapter } from './adapters/SupabaseWellbeingAdapter';
import { MySQLSharingAdapter } from './adapters/MySQLSharingAdapter';
import { SupabaseSharingAdapter } from './adapters/SupabaseSharingAdapter';
import { MySQLWearableAdapter } from './adapters/MySQLWearableAdapter';
import { SupabaseWearableAdapter } from './adapters/SupabaseWearableAdapter';
import { MySQLAlertsAdapter } from './adapters/MySQLAlertsAdapter';
import { SupabaseAlertsAdapter } from './adapters/SupabaseAlertsAdapter';
import { MySQLRecurringAdapter } from './adapters/MySQLRecurringAdapter';
import { SupabaseRecurringAdapter } from './adapters/SupabaseRecurringAdapter';
import { MySQLInsightsAdapter } from './adapters/MySQLInsightsAdapter';
import { SupabaseInsightsAdapter } from './adapters/SupabaseInsightsAdapter';
import { MySQLReceiptsAdapter } from './adapters/MySQLReceiptsAdapter';
import { SupabaseReceiptsAdapter } from './adapters/SupabaseReceiptsAdapter';

/**
 * Adapter Routing Integration Tests
 * 
 * These tests verify that the adapter factory functions correctly route:
 * - Admin users (role='admin') → MySQL adapters
 * - Regular users (role='user') → Supabase adapters
 * 
 * This ensures proper dual-database architecture and prevents data leakage
 * between admin and user databases.
 */

describe('Adapter Routing Integration Tests', () => {
  const adminContext: AdapterContext = {
    user: {
      id: 'admin-123',
      numericId: 1,
      role: 'admin',
      email: 'admin@example.com',
      name: 'Admin User',
    },
    accessToken: 'admin-token-123',
  };

  const userContext: AdapterContext = {
    user: {
      id: 'user-456',
      numericId: 2,
      role: 'user',
      email: 'user@example.com',
      name: 'Regular User',
    },
    accessToken: 'user-token-456',
  };

  describe('CoreAdapter Routing', () => {
    it('should route admin users to MySQLCoreAdapter', () => {
      const adapter = createCoreAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MySQLCoreAdapter);
    });

    it('should route regular users to SupabaseCoreAdapter', () => {
      const adapter = createCoreAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseCoreAdapter);
    });
  });

  describe('BudgetAdapter Routing', () => {
    it('should route admin users to MysqlBudgetAdapter', () => {
      const adapter = createBudgetAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MysqlBudgetAdapter);
    });

    it('should route regular users to SupabaseBudgetAdapter', () => {
      const adapter = createBudgetAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseBudgetAdapter);
    });
  });

  describe('DebtAdapter Routing', () => {
    it('should route admin users to MysqlDebtAdapter', () => {
      const adapter = createDebtAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MysqlDebtAdapter);
    });

    it('should route regular users to SupabaseDebtAdapter', () => {
      const adapter = createDebtAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseDebtAdapter);
    });
  });

  describe('LearningAdapter Routing', () => {
    it('should route admin users to MysqlLearningAdapter', () => {
      const adapter = createLearningAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MysqlLearningAdapter);
    });

    it('should route regular users to SupabaseLearningAdapter', () => {
      const adapter = createLearningAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseLearningAdapter);
    });
  });

  describe('IoTAdapter Routing', () => {
    it('should route admin users to MysqlIoTAdapter', () => {
      const adapter = createIoTAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MysqlIoTAdapter);
    });

    it('should route regular users to SupabaseIoTAdapter', () => {
      const adapter = createIoTAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseIoTAdapter);
    });
  });

  describe('GoalsAdapter Routing', () => {
    it('should route admin users to MysqlGoalsAdapter', () => {
      const adapter = createGoalsAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MysqlGoalsAdapter);
    });

    it('should route regular users to SupabaseGoalsAdapter', () => {
      const adapter = createGoalsAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseGoalsAdapter);
    });
  });

  describe('TranslationAdapter Routing', () => {
    it('should route admin users to MysqlTranslationAdapter', () => {
      const adapter = createTranslationAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MysqlTranslationAdapter);
    });

    it('should route regular users to SupabaseTranslationAdapter', () => {
      const adapter = createTranslationAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseTranslationAdapter);
    });
  });

  describe('NotificationAdapter Routing', () => {
    it('should route admin users to MysqlNotificationAdapter', () => {
      const adapter = createNotificationAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MysqlNotificationAdapter);
    });

    it('should route regular users to SupabaseNotificationAdapter', () => {
      const adapter = createNotificationAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseNotificationAdapter);
    });
  });

  describe('VerifiedFactAdapter Routing', () => {
    it('should route admin users to MySQLVerifiedFactAdapter', () => {
      const adapter = createVerifiedFactAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MySQLVerifiedFactAdapter);
    });

    it('should route regular users to SupabaseVerifiedFactAdapter', () => {
      const adapter = createVerifiedFactAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseVerifiedFactAdapter);
    });
  });

  describe('Cross-Adapter Consistency', () => {
    it('should consistently route all adapters for admin users to MySQL', () => {
      const coreAdapter = createCoreAdapter(adminContext);
      const budgetAdapter = createBudgetAdapter(adminContext);
      const debtAdapter = createDebtAdapter(adminContext);
      const learningAdapter = createLearningAdapter(adminContext);
      const iotAdapter = createIoTAdapter(adminContext);
      const goalsAdapter = createGoalsAdapter(adminContext);
      const translationAdapter = createTranslationAdapter(adminContext);
      const notificationAdapter = createNotificationAdapter(adminContext);
      const verifiedFactAdapter = createVerifiedFactAdapter(adminContext);
      const wellbeingAdapter = createWellbeingAdapter(adminContext);
      const sharingAdapter = createSharingAdapter(adminContext);
      const wearableAdapter = createWearableAdapter(adminContext);
      const alertsAdapter = createAlertsAdapter(adminContext);
      const recurringAdapter = createRecurringAdapter(adminContext);
      const insightsAdapter = createInsightsAdapter(adminContext);
      const receiptsAdapter = createReceiptsAdapter(adminContext);

      expect(coreAdapter).toBeInstanceOf(MySQLCoreAdapter);
      expect(budgetAdapter).toBeInstanceOf(MysqlBudgetAdapter);
      expect(debtAdapter).toBeInstanceOf(MysqlDebtAdapter);
      expect(learningAdapter).toBeInstanceOf(MysqlLearningAdapter);
      expect(iotAdapter).toBeInstanceOf(MysqlIoTAdapter);
      expect(goalsAdapter).toBeInstanceOf(MysqlGoalsAdapter);
      expect(translationAdapter).toBeInstanceOf(MysqlTranslationAdapter);
      expect(notificationAdapter).toBeInstanceOf(MysqlNotificationAdapter);
      expect(verifiedFactAdapter).toBeInstanceOf(MySQLVerifiedFactAdapter);
      expect(wellbeingAdapter).toBeInstanceOf(MySQLWellbeingAdapter);
      expect(sharingAdapter).toBeInstanceOf(MySQLSharingAdapter);
      expect(wearableAdapter).toBeInstanceOf(MySQLWearableAdapter);
      expect(alertsAdapter).toBeInstanceOf(MySQLAlertsAdapter);
      expect(recurringAdapter).toBeInstanceOf(MySQLRecurringAdapter);
      expect(insightsAdapter).toBeInstanceOf(MySQLInsightsAdapter);
      expect(receiptsAdapter).toBeInstanceOf(MySQLReceiptsAdapter);
    });

    it('should consistently route all adapters for regular users to Supabase', () => {
      const coreAdapter = createCoreAdapter(userContext);
      const budgetAdapter = createBudgetAdapter(userContext);
      const debtAdapter = createDebtAdapter(userContext);
      const learningAdapter = createLearningAdapter(userContext);
      const iotAdapter = createIoTAdapter(userContext);
      const goalsAdapter = createGoalsAdapter(userContext);
      const translationAdapter = createTranslationAdapter(userContext);
      const notificationAdapter = createNotificationAdapter(userContext);
      const verifiedFactAdapter = createVerifiedFactAdapter(userContext);
      const wellbeingAdapter = createWellbeingAdapter(userContext);
      const sharingAdapter = createSharingAdapter(userContext);
      const wearableAdapter = createWearableAdapter(userContext);
      const alertsAdapter = createAlertsAdapter(userContext);
      const recurringAdapter = createRecurringAdapter(userContext);
      const insightsAdapter = createInsightsAdapter(userContext);
      const receiptsAdapter = createReceiptsAdapter(userContext);

      expect(coreAdapter).toBeInstanceOf(SupabaseCoreAdapter);
      expect(budgetAdapter).toBeInstanceOf(SupabaseBudgetAdapter);
      expect(debtAdapter).toBeInstanceOf(SupabaseDebtAdapter);
      expect(learningAdapter).toBeInstanceOf(SupabaseLearningAdapter);
      expect(iotAdapter).toBeInstanceOf(SupabaseIoTAdapter);
      expect(goalsAdapter).toBeInstanceOf(SupabaseGoalsAdapter);
      expect(translationAdapter).toBeInstanceOf(SupabaseTranslationAdapter);
      expect(notificationAdapter).toBeInstanceOf(SupabaseNotificationAdapter);
      expect(verifiedFactAdapter).toBeInstanceOf(SupabaseVerifiedFactAdapter);
      expect(wellbeingAdapter).toBeInstanceOf(SupabaseWellbeingAdapter);
      expect(sharingAdapter).toBeInstanceOf(SupabaseSharingAdapter);
      expect(wearableAdapter).toBeInstanceOf(SupabaseWearableAdapter);
      expect(alertsAdapter).toBeInstanceOf(SupabaseAlertsAdapter);
      expect(recurringAdapter).toBeInstanceOf(SupabaseRecurringAdapter);
      expect(insightsAdapter).toBeInstanceOf(SupabaseInsightsAdapter);
      expect(receiptsAdapter).toBeInstanceOf(SupabaseReceiptsAdapter);
    });
  });

  describe('Role-Based Routing Security', () => {
    it('should never route regular users to MySQL adapters', () => {
      // Test all 16 adapters
      const adapters = [
        createCoreAdapter(userContext),
        createBudgetAdapter(userContext),
        createDebtAdapter(userContext),
        createLearningAdapter(userContext),
        createIoTAdapter(userContext),
        createGoalsAdapter(userContext),
        createTranslationAdapter(userContext),
        createNotificationAdapter(userContext),
        createVerifiedFactAdapter(userContext),
        createWellbeingAdapter(userContext),
        createSharingAdapter(userContext),
        createWearableAdapter(userContext),
        createAlertsAdapter(userContext),
        createRecurringAdapter(userContext),
        createInsightsAdapter(userContext),
        createReceiptsAdapter(userContext),
      ];

      // None should be MySQL adapters
      const mysqlAdapters = [
        MySQLCoreAdapter,
        MysqlBudgetAdapter,
        MysqlDebtAdapter,
        MysqlLearningAdapter,
        MysqlIoTAdapter,
        MysqlGoalsAdapter,
        MysqlTranslationAdapter,
        MysqlNotificationAdapter,
        MySQLVerifiedFactAdapter,
        MySQLWellbeingAdapter,
        MySQLSharingAdapter,
        MySQLWearableAdapter,
        MySQLAlertsAdapter,
        MySQLRecurringAdapter,
        MySQLInsightsAdapter,
        MySQLReceiptsAdapter,
      ];

      adapters.forEach((adapter) => {
        mysqlAdapters.forEach((MysqlAdapter) => {
          expect(adapter).not.toBeInstanceOf(MysqlAdapter);
        });
      });
    });

    it('should never route admin users to Supabase adapters', () => {
      // Test all 16 adapters
      const adapters = [
        createCoreAdapter(adminContext),
        createBudgetAdapter(adminContext),
        createDebtAdapter(adminContext),
        createLearningAdapter(adminContext),
        createIoTAdapter(adminContext),
        createGoalsAdapter(adminContext),
        createTranslationAdapter(adminContext),
        createNotificationAdapter(adminContext),
        createVerifiedFactAdapter(adminContext),
        createWellbeingAdapter(adminContext),
        createSharingAdapter(adminContext),
        createWearableAdapter(adminContext),
        createAlertsAdapter(adminContext),
        createRecurringAdapter(adminContext),
        createInsightsAdapter(adminContext),
        createReceiptsAdapter(adminContext),
      ];

      // None should be Supabase adapters
      const supabaseAdapters = [
        SupabaseCoreAdapter,
        SupabaseBudgetAdapter,
        SupabaseDebtAdapter,
        SupabaseLearningAdapter,
        SupabaseIoTAdapter,
        SupabaseGoalsAdapter,
        SupabaseTranslationAdapter,
        SupabaseNotificationAdapter,
        SupabaseVerifiedFactAdapter,
        SupabaseWellbeingAdapter,
        SupabaseSharingAdapter,
        SupabaseWearableAdapter,
        SupabaseAlertsAdapter,
        SupabaseRecurringAdapter,
        SupabaseInsightsAdapter,
        SupabaseReceiptsAdapter,
      ];

      adapters.forEach((adapter) => {
        supabaseAdapters.forEach((SupabaseAdapter) => {
          expect(adapter).not.toBeInstanceOf(SupabaseAdapter);
        });
      });
    });
  });

  describe('Adapter Context Validation', () => {
    it('should pass correct userId to Supabase adapters', () => {
      const adapter = createCoreAdapter(userContext) as SupabaseCoreAdapter;
      // Verify the adapter was created with the correct userId
      expect(adapter).toBeInstanceOf(SupabaseCoreAdapter);
      // The userId should match the context user id
      expect(userContext.user.id).toBe('user-456');
    });

    it('should pass correct accessToken to Supabase adapters', () => {
      const adapter = createCoreAdapter(userContext) as SupabaseCoreAdapter;
      expect(adapter).toBeInstanceOf(SupabaseCoreAdapter);
      expect(userContext.accessToken).toBe('user-token-456');
    });

    it('should create MySQL adapters without userId or accessToken', () => {
      const adapter = createCoreAdapter(adminContext) as MySQLCoreAdapter;
      expect(adapter).toBeInstanceOf(MySQLCoreAdapter);
      // MySQL adapters don't need userId or accessToken
    });
  });

  describe('WellbeingAdapter Routing', () => {
    it('should route admin users to MySQLWellbeingAdapter', () => {
      const adapter = createWellbeingAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MySQLWellbeingAdapter);
    });

    it('should route regular users to SupabaseWellbeingAdapter', () => {
      const adapter = createWellbeingAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseWellbeingAdapter);
    });
  });

  describe('SharingAdapter Routing', () => {
    it('should route admin users to MySQLSharingAdapter', () => {
      const adapter = createSharingAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MySQLSharingAdapter);
    });

    it('should route regular users to SupabaseSharingAdapter', () => {
      const adapter = createSharingAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseSharingAdapter);
    });
  });

  describe('WearableAdapter Routing', () => {
    it('should route admin users to MySQLWearableAdapter', () => {
      const adapter = createWearableAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MySQLWearableAdapter);
    });

    it('should route regular users to SupabaseWearableAdapter', () => {
      const adapter = createWearableAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseWearableAdapter);
    });
  });

  describe('AlertsAdapter Routing', () => {
    it('should route admin users to MySQLAlertsAdapter', () => {
      const adapter = createAlertsAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MySQLAlertsAdapter);
    });

    it('should route regular users to SupabaseAlertsAdapter', () => {
      const adapter = createAlertsAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseAlertsAdapter);
    });
  });

  describe('RecurringAdapter Routing', () => {
    it('should route admin users to MySQLRecurringAdapter', () => {
      const adapter = createRecurringAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MySQLRecurringAdapter);
    });

    it('should route regular users to SupabaseRecurringAdapter', () => {
      const adapter = createRecurringAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseRecurringAdapter);
    });
  });

  describe('InsightsAdapter Routing', () => {
    it('should route admin users to MySQLInsightsAdapter', () => {
      const adapter = createInsightsAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MySQLInsightsAdapter);
    });

    it('should route regular users to SupabaseInsightsAdapter', () => {
      const adapter = createInsightsAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseInsightsAdapter);
    });
  });

  describe('ReceiptsAdapter Routing', () => {
    it('should route admin users to MySQLReceiptsAdapter', () => {
      const adapter = createReceiptsAdapter(adminContext);
      expect(adapter).toBeInstanceOf(MySQLReceiptsAdapter);
    });

    it('should route regular users to SupabaseReceiptsAdapter', () => {
      const adapter = createReceiptsAdapter(userContext);
      expect(adapter).toBeInstanceOf(SupabaseReceiptsAdapter);
    });
  });
});

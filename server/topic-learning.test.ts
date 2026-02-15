import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';
import { 
  createCoreAdapter,
  createNotificationAdapter, 
  createBudgetAdapter, 
  createDebtAdapter, 
  createLearningAdapter, 
  createIoTAdapter, 
  createGoalsAdapter, 
  createTranslationAdapter,
  createVerifiedFactAdapter,
  createWellbeingAdapter,
  createSharingAdapter,
  createWearableAdapter,
  createAlertsAdapter,
  createRecurringAdapter,
  createInsightsAdapter,
  createReceiptsAdapter,
  createLanguageLearningAdapter,
  createMathScienceAdapter,
  createLearningHubAdapter,
  createLearnFinanceAdapter
} from './adapters';

describe('Topic Learning System', () => {
  const mockUser = {
    id: 1,
    openId: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user' as const,
  };

  const adapterContext = { user: mockUser, accessToken: undefined };

  const mockContext: Context = {
    req: {} as any,
    res: {} as any,
    user: mockUser,
    coreDb: createCoreAdapter(adapterContext),
    notificationDb: createNotificationAdapter(adapterContext),
    budgetDb: createBudgetAdapter(adapterContext),
    debtDb: createDebtAdapter(adapterContext),
    learningDb: createLearningAdapter(adapterContext),
    iotDb: createIoTAdapter(adapterContext),
    goalsDb: createGoalsAdapter(adapterContext),
    translationDb: createTranslationAdapter(adapterContext),
    verifiedFactDb: createVerifiedFactAdapter(adapterContext),
    wellbeingDb: createWellbeingAdapter(adapterContext),
    sharingDb: createSharingAdapter(adapterContext),
    wearableDb: createWearableAdapter(adapterContext),
    alertsDb: createAlertsAdapter(adapterContext),
    recurringDb: createRecurringAdapter(adapterContext),
    insightsDb: createInsightsAdapter(adapterContext),
    receiptsDb: createReceiptsAdapter(adapterContext),
    languageLearningDb: createLanguageLearningAdapter(adapterContext),
    mathScienceDb: createMathScienceAdapter(adapterContext),
    learningHubDb: createLearningHubAdapter(adapterContext),
    learnFinanceDb: createLearnFinanceAdapter(adapterContext),
  };

  it('should generate lesson content for a topic', async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.topic.getLessonContent({
      topicName: 'Counting and number recognition',
      category: 'early-math',
    });

    expect(result).toBeDefined();
    expect(result.title).toBeDefined();
    expect(result.introduction).toBeDefined();
    expect(result.explanation).toBeDefined();
    expect(result.examples).toBeInstanceOf(Array);
    expect(result.examples.length).toBeGreaterThan(0);
    expect(result.realWorldApplications).toBeInstanceOf(Array);
    expect(result.funFacts).toBeInstanceOf(Array);
    expect(result.commonMistakes).toBeInstanceOf(Array);
    expect(result.keyTakeaways).toBeInstanceOf(Array);
  }, 30000); // 30 second timeout for LLM call

  it('should mark lesson as completed', async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.topic.completeLesson({
      topicName: 'Counting and number recognition',
      category: 'early-math',
    });

    expect(result.success).toBe(true);
  });

  it('should get topic progress', async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.topic.getProgress({
      topicName: 'Counting and number recognition',
      category: 'early-math',
    });

    expect(result).toBeDefined();
    expect(result?.topicName).toBe('Counting and number recognition');
    expect(result?.category).toBe('early-math');
    expect(result?.status).toBeDefined();
  });

  it('should get category progress', async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.topic.getCategoryProgress({
      category: 'early-math',
    });

    expect(result).toBeInstanceOf(Array);
  });

  it('should generate practice problems', async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.topic.generatePracticeProblems({
      topicName: 'Basic addition and subtraction (within 20)',
      category: 'early-math',
      count: 5,
    });

    expect(result).toBeDefined();
    expect(result.problems).toBeInstanceOf(Array);
    expect(result.problems.length).toBe(5);
    
    const firstProblem = result.problems[0];
    expect(firstProblem.question).toBeDefined();
    expect(firstProblem.answer).toBeDefined();
    expect(firstProblem.hint).toBeDefined();
    expect(firstProblem.explanation).toBeDefined();
  }, 30000);

  it('should submit practice answer correctly', async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.topic.submitPracticeAnswer({
      topicName: 'Basic addition and subtraction (within 20)',
      category: 'early-math',
      question: '2 + 2 = ?',
      userAnswer: '4',
      correctAnswer: '4',
      usedHint: false,
    });

    expect(result.isCorrect).toBe(true);
    expect(result.feedback).toBeDefined();
  });

  it('should generate topic quiz', async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.topic.generateTopicQuiz({
      topicName: 'Shapes and basic geometry (2D and 3D shapes)',
      category: 'early-math',
      questionCount: 5,
    });

    expect(result).toBeDefined();
    expect(result.questions).toBeInstanceOf(Array);
    expect(result.questions.length).toBe(5);

    const firstQuestion = result.questions[0];
    expect(firstQuestion.question).toBeDefined();
    expect(firstQuestion.options).toBeInstanceOf(Array);
    expect(firstQuestion.correctAnswer).toBeDefined();
    expect(firstQuestion.explanation).toBeDefined();
  }, 30000);

  it('should submit quiz and calculate score', async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.topic.submitQuiz({
      topicName: 'Shapes and basic geometry (2D and 3D shapes)',
      category: 'early-math',
      answers: [
        {
          question: 'How many sides does a triangle have?',
          userAnswer: '3',
          correctAnswer: '3',
          isCorrect: true,
        },
        {
          question: 'How many sides does a square have?',
          userAnswer: '4',
          correctAnswer: '4',
          isCorrect: true,
        },
        {
          question: 'How many sides does a circle have?',
          userAnswer: '1',
          correctAnswer: '0',
          isCorrect: false,
        },
      ],
      timeSpent: 120,
    });

    expect(result).toBeDefined();
    expect(result.score).toBeDefined();
    expect(result.totalQuestions).toBe(3);
    expect(result.correctAnswers).toBe(2);
    expect(result.passed).toBeDefined();
    expect(result.feedback).toBeDefined();
  });
});

import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      coreDb: ctx.coreDb!,
      notificationDb: ctx.notificationDb!,
      budgetDb: ctx.budgetDb!,
      debtDb: ctx.debtDb!,
      learningDb: ctx.learningDb!,
      iotDb: ctx.iotDb!,
      goalsDb: ctx.goalsDb!,
      translationDb: ctx.translationDb!,
      verifiedFactDb: ctx.verifiedFactDb!,
      wellbeingDb: ctx.wellbeingDb!,
      sharingDb: ctx.sharingDb!,
      wearableDb: ctx.wearableDb!,
      alertsDb: ctx.alertsDb!,
      recurringDb: ctx.recurringDb!,
      insightsDb: ctx.insightsDb!,
      receiptsDb: ctx.receiptsDb!,
      languageLearningDb: ctx.languageLearningDb!,
      mathScienceDb: ctx.mathScienceDb!,
      learningHubDb: ctx.learningHubDb!,
      learnFinanceDb: ctx.learnFinanceDb!,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        coreDb: ctx.coreDb!,
        notificationDb: ctx.notificationDb!,
        budgetDb: ctx.budgetDb!,
        debtDb: ctx.debtDb!,
        learningDb: ctx.learningDb!,
        iotDb: ctx.iotDb!,
        goalsDb: ctx.goalsDb!,
        translationDb: ctx.translationDb!,
        verifiedFactDb: ctx.verifiedFactDb!,
        wellbeingDb: ctx.wellbeingDb!,
        sharingDb: ctx.sharingDb!,
        wearableDb: ctx.wearableDb!,
        alertsDb: ctx.alertsDb!,
        recurringDb: ctx.recurringDb!,
        insightsDb: ctx.insightsDb!,
        receiptsDb: ctx.receiptsDb!,
        languageLearningDb: ctx.languageLearningDb!,
        mathScienceDb: ctx.mathScienceDb!,
        learningHubDb: ctx.learningHubDb!,
        learnFinanceDb: ctx.learnFinanceDb!,
      },
    });
  }),
);

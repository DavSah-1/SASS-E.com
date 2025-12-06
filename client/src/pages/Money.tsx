import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Target,
  AlertCircle,
  CheckCircle2,
  Calendar,
  CreditCard,
  Sparkles,
  ArrowRight,
  PiggyBank,
  TrendingDown as DebtIcon,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import Budget from "./Budget";
import DebtCoach from "./DebtCoach";
import Goals from "./Goals";

// Wrapper to hide navigation in embedded context
const BudgetTab = () => {
  return (
    <div className="[&_.min-h-screen]:min-h-0 [&_nav]:hidden">
      <Budget />
    </div>
  );
};

const DebtCoachTab = () => {
  return (
    <div className="[&_.min-h-screen]:min-h-0 [&_nav]:hidden">
      <DebtCoach />
    </div>
  );
};

const GoalsTab = () => {
  return (
    <div className="[&_.min-h-screen]:min-h-0 [&_nav]:hidden">
      <Goals />
    </div>
  );
};

export default function Money() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Fetch budget data
  const { data: monthlySummary } = trpc.budget.getMonthlySummary.useQuery(
    { monthYear: currentMonth },
    { enabled: isAuthenticated }
  );

  const { data: availableForDebt } = trpc.budget.getAvailableForDebt.useQuery(
    { monthYear: currentMonth },
    { enabled: isAuthenticated }
  );

  // Fetch debt data
  const { data: debts } = trpc.debtCoach.getDebts.useQuery({ includeInactive: false }, { enabled: isAuthenticated });
  const { data: debtSummary } = trpc.debtCoach.getSummary.useQuery(undefined, { enabled: isAuthenticated });

  // Fetch goals data
  const { data: goals } = trpc.goals.getGoals.useQuery({ includeCompleted: false }, { enabled: isAuthenticated });

  // Format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  // Calculate financial health score (0-100)
  const calculateHealthScore = () => {
    if (!monthlySummary || !debtSummary) return 0;

    let score = 50; // Base score

    // Positive cash flow (+20 points)
    if (monthlySummary.netCashFlow > 0) {
      score += 20;
    } else if (monthlySummary.netCashFlow < 0) {
      score -= 20;
    }

    // Savings rate (+15 points for >20%, +10 for >10%, +5 for >5%)
    const savingsRate = monthlySummary.savingsRate / 100;
    if (savingsRate >= 20) score += 15;
    else if (savingsRate >= 10) score += 10;
    else if (savingsRate >= 5) score += 5;

    // Debt payment rate (+10 points if paying >15% of income to debt)
    const debtRate = monthlySummary.debtPaymentRate / 100;
    if (debtRate >= 15) score += 10;
    else if (debtRate >= 10) score += 5;

    // Debt progress (+15 points based on % paid off)
    if (debtSummary.totalOriginalBalance > 0) {
      const paidOffPercentage = (debtSummary.totalPaid / debtSummary.totalOriginalBalance) * 100;
      score += Math.min(15, Math.floor(paidOffPercentage / 10) * 2);
    }

    // Debts paid off bonus (+10 points)
    if (debtSummary.debtsPaidOff > 0) {
      score += Math.min(10, debtSummary.debtsPaidOff * 5);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const healthScore = calculateHealthScore();

  // Get health score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  // Get health score label
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">💰 Money Hub</h1>
          <p className="text-xl text-slate-300 mb-8">
            Your complete financial command center - budget, debts, and insights in one place
          </p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Get Started</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-500 to-purple-400 bg-clip-text text-transparent" style={{height: '50px'}}>
            💰 Money Hub
          </h1>
          <p className="text-slate-300">
            Your complete financial command center
          </p>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              <Sparkles className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="budget" className="data-[state=active]:bg-green-600">
              <Wallet className="h-4 w-4 mr-2" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="debts" className="data-[state=active]:bg-blue-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Debt Coach
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-orange-600">
              <Target className="h-4 w-4 mr-2" />
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Financial Health Score */}
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <Target className="h-6 w-6" />
                    Financial Health Score
                  </span>
                  <span className={`text-4xl font-bold ${getScoreColor(healthScore)}`}>
                    {healthScore}
                  </span>
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {getScoreLabel(healthScore)} - {healthScore >= 60 ? "Keep up the great work!" : "Let's improve together"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-slate-700 rounded-full h-4 mb-4">
                  <div
                    className="h-4 rounded-full transition-all duration-500"
                    style={{
                      width: `${healthScore}%`,
                      background: healthScore >= 80
                        ? "linear-gradient(to right, #10b981, #059669)"
                        : healthScore >= 60
                        ? "linear-gradient(to right, #3b82f6, #2563eb)"
                        : healthScore >= 40
                        ? "linear-gradient(to right, #f59e0b, #d97706)"
                        : "linear-gradient(to right, #ef4444, #dc2626)",
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Cash Flow</p>
                    <p className={`font-semibold ${monthlySummary?.netCashFlow && monthlySummary.netCashFlow > 0 ? "text-green-400" : "text-red-400"}`}>
                      {monthlySummary?.netCashFlow && monthlySummary.netCashFlow > 0 ? <CheckCircle2 className="h-4 w-4 inline" /> : <AlertCircle className="h-4 w-4 inline" />}
                      {" "}{monthlySummary?.netCashFlow && monthlySummary.netCashFlow > 0 ? "Positive" : "Negative"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Savings Rate</p>
                    <p className="font-semibold text-white">
                      {monthlySummary ? (monthlySummary.savingsRate / 100).toFixed(1) : "0.0"}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Debt Progress</p>
                    <p className="font-semibold text-white">
                      {debtSummary && debtSummary.totalOriginalBalance > 0
                        ? ((debtSummary.totalPaid / debtSummary.totalOriginalBalance) * 100).toFixed(0)
                        : "0"}% Paid
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Debts Cleared</p>
                    <p className="font-semibold text-white">
                      {debtSummary?.debtsPaidOff || 0} of {(debtSummary?.totalDebts || 0) + (debtSummary?.debtsPaidOff || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* This Month Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {monthlySummary ? formatCurrency(monthlySummary.totalIncome) : "$0.00"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">
                    {monthlySummary ? formatCurrency(monthlySummary.totalExpenses) : "$0.00"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <DebtIcon className="h-4 w-4" />
                    Debt Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    {monthlySummary ? formatCurrency(monthlySummary.totalDebtPayments) : "$0.00"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <PiggyBank className="h-4 w-4" />
                    Net Cash Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${monthlySummary?.netCashFlow && monthlySummary.netCashFlow >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {monthlySummary ? formatCurrency(monthlySummary.netCashFlow) : "$0.00"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Available</p>
                </CardContent>
              </Card>
            </div>

            {/* Debt Acceleration Opportunity */}
            {availableForDebt && availableForDebt.availableForExtraPayments > 0 && (
              <Card className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ArrowRight className="h-5 w-5" />
                    Debt Acceleration Opportunity
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    You have extra funds available this month!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Available This Month</p>
                      <p className="text-3xl font-bold text-green-400">
                        {formatCurrency(availableForDebt.availableForExtraPayments)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Recommended Extra Payment</p>
                      <p className="text-3xl font-bold text-purple-400">
                        {formatCurrency(availableForDebt.recommendedExtraPayment)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">50% of available (save the rest!)</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Projected Debt-Free</p>
                      <p className="text-3xl font-bold text-blue-400">
                        {availableForDebt.projectedMonthsToDebtFree} months
                      </p>
                      <p className="text-xs text-slate-500 mt-1">With recommended payments</p>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button onClick={() => setActiveTab("debts")} className="gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Log Extra Payment
                    </Button>
                    <Button onClick={() => setActiveTab("budget")} variant="outline" className="gap-2">
                      <Wallet className="h-4 w-4" />
                      Review Budget
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription>Common tasks to keep your finances on track</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => setActiveTab("budget")} variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Plus className="h-5 w-5" />
                    <span>Add Transaction</span>
                  </Button>
                  <Button onClick={() => setActiveTab("debts")} variant="outline" className="h-auto py-4 flex-col gap-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Log Debt Payment</span>
                  </Button>
                  <Button onClick={() => setActiveTab("debts")} variant="outline" className="h-auto py-4 flex-col gap-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Add New Debt</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Financial Goals Widget */}
            {goals && goals.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Financial Goals
                      </CardTitle>
                      <CardDescription>
                        {goals.filter(g => g.status === 'active').length} active goal{goals.filter(g => g.status === 'active').length !== 1 ? 's' : ''} in progress
                      </CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <a href="/goals">View All</a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goals.filter(g => g.status === 'active').slice(0, 3).map((goal) => {
                      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                      const isNearTarget = progress >= 75;
                      return (
                        <div key={goal.id} className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-purple-500/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{goal.icon || '🎯'}</span>
                              <div>
                                <h4 className="font-semibold text-white text-sm">{goal.name}</h4>
                                <p className="text-xs text-slate-400">{goal.type.replace('_', ' ')}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Progress</span>
                              <span className={`font-semibold ${isNearTarget ? 'text-green-400' : 'text-purple-400'}`}>
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(progress, 100)}%`,
                                  background: isNearTarget
                                    ? 'linear-gradient(to right, #10b981, #059669)'
                                    : 'linear-gradient(to right, #a855f7, #9333ea)',
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>{formatCurrency(goal.currentAmount)}</span>
                              <span>{formatCurrency(goal.targetAmount)}</span>
                            </div>
                            {goal.targetDate && (
                              <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                                <Calendar className="h-3 w-3" />
                                <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {goals.filter(g => g.status === 'active').length > 3 && (
                    <div className="mt-4 text-center">
                      <Button asChild variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                        <a href="/goals">View {goals.filter(g => g.status === 'active').length - 3} more goal{goals.filter(g => g.status === 'active').length - 3 !== 1 ? 's' : ''} →</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* SASS-E Coaching Message */}
            <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="h-5 w-5" />
                  SASS-E's Financial Insight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-lg leading-relaxed">
                  {healthScore >= 80
                    ? "🎉 Outstanding work! Your financial discipline is impressive. You're crushing your goals and building real wealth. Keep this momentum going!"
                    : healthScore >= 60
                    ? "💪 You're on the right track! Your finances are heading in a positive direction. A few tweaks to your spending or extra debt payments could push you to the next level."
                    : healthScore >= 40
                    ? "🎯 Let's turn this around together. Your financial foundation needs some work, but every journey starts with a single step. Focus on creating positive cash flow first."
                    : "⚠️ We need to have a serious talk about your finances. You're in a challenging spot, but it's not hopeless. Let's start by understanding where your money is going and create a realistic plan to get back on track."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="mt-0">
            <BudgetTab />
          </TabsContent>

          {/* Debt Coach Tab */}
          <TabsContent value="debts" className="mt-0">
            <DebtCoachTab />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="mt-0">
            <GoalsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

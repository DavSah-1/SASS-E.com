import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PricingModal } from "@/components/PricingModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  Lock,
  Crown,
  Zap,
  Bell,
  Camera,
  Users,
  BarChart3,
  Lightbulb,
  Repeat,
  FileText,
  Calculator,
} from "lucide-react";
import {
  DEMO_DEBTS,
  DEMO_PAYMENTS,
  DEMO_BUDGET_CATEGORIES,
  DEMO_TRANSACTIONS,
  DEMO_GOALS,
  DEMO_MILESTONES,
  DEMO_COACHING_MESSAGE,
  DEMO_MONTHLY_SUMMARY,
  DEMO_DEBT_SUMMARY,
  DEMO_STRATEGY_COMPARISON,
  DEMO_SPENDING_TRENDS,
  DEMO_BUDGET_TEMPLATES,
  DEMO_BUDGET_ALERTS,
  DEMO_AI_INSIGHTS,
  DEMO_RECURRING_TRANSACTIONS,
  DEMO_GOAL_PREDICTIONS,
  DEMO_RECEIPT_EXAMPLES,
  DEMO_SHARED_BUDGETS,
  DEMO_SPLIT_EXPENSES,
} from "@/lib/demoData";

export default function MoneyDemo() {
  const [activeTab, setActiveTab] = useState("overview");
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  // Read tab from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    const newUrl = activeTab === "overview" ? "/money-demo" : `/money-demo?tab=${activeTab}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [activeTab]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const UpgradeTooltip = ({ children }: { children: React.ReactNode }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            Subscribe to manage your own data
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      {/* Demo Mode Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">🎯 Demo Mode - Exploring with sample data</span>
          </div>
          <Button size="sm" className="bg-white text-purple-600 hover:bg-slate-100" onClick={() => setPricingModalOpen(true)}>
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-500 to-purple-400 bg-clip-text text-transparent"
            style={{ height: "50px" }}
          >
            💰 Money Hub Demo
          </h1>
          <p className="text-slate-300">Explore financial management with realistic sample data</p>
          <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
            <p className="text-sm text-blue-200">
              <AlertCircle className="inline h-4 w-4 mr-2" />
              This is a demo with sample data. To track your real finances, <button onClick={() => setPricingModalOpen(true)} className="underline font-semibold">upgrade to Pro</button>.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-slate-800/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              <DollarSign className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="budget" className="data-[state=active]:bg-green-600">
              <Wallet className="h-4 w-4 mr-2" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="debts" className="data-[state=active]:bg-red-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Debt Coach
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-blue-600">
              <Target className="h-4 w-4 mr-2" />
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Monthly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{formatCurrency(DEMO_MONTHLY_SUMMARY.totalIncome)}</div>
                  <p className="text-xs text-slate-500 mt-1">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">{formatCurrency(DEMO_MONTHLY_SUMMARY.totalExpenses)}</div>
                  <p className="text-xs text-slate-500 mt-1">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Debt Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">{formatCurrency(DEMO_MONTHLY_SUMMARY.totalDebtPayments)}</div>
                  <p className="text-xs text-slate-500 mt-1">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Net Cash Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{formatCurrency(DEMO_MONTHLY_SUMMARY.netCashFlow)}</div>
                  <p className="text-xs text-slate-500 mt-1">Available</p>
                </CardContent>
              </Card>
            </div>

            {/* Financial Goals Widget */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Financial Goals</CardTitle>
                    <CardDescription>Track your progress toward financial targets</CardDescription>
                  </div>
                  <Badge variant="secondary">{DEMO_GOALS.length} Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DEMO_GOALS.map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                      <div key={goal.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-white">{goal.name}</h4>
                            <p className="text-xs text-slate-400">{goal.type.replace("_", " ")}</p>
                          </div>
                          <Target className="h-5 w-5" style={{ color: goal.color }} />
                        </div>
                        <Progress value={progress} className="h-2 mb-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">{formatCurrency(goal.currentAmount)}</span>
                          <span className="text-slate-400">{formatCurrency(goal.targetAmount)}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Target: {formatDate(goal.targetDate)}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* SASS-E Coaching */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-white">{DEMO_COACHING_MESSAGE.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 leading-relaxed">{DEMO_COACHING_MESSAGE.message}</p>
              </CardContent>
            </Card>

            {/* Debt Summary */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Debt Overview</CardTitle>
                <CardDescription>Your path to financial freedom</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Total Debt</p>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(DEMO_DEBT_SUMMARY.totalDebt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Total Paid</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(DEMO_DEBT_SUMMARY.totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Debt-Free In</p>
                    <p className="text-2xl font-bold text-blue-400">{DEMO_DEBT_SUMMARY.debtFreeMonths} months</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Budget Categories</CardTitle>
                    <CardDescription>Monthly budget breakdown</CardDescription>
                  </div>
                  <UpgradeTooltip>
                    <Button disabled className="opacity-50">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </UpgradeTooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DEMO_BUDGET_CATEGORIES.map((category) => {
                    const spent = DEMO_TRANSACTIONS.filter((t) => t.categoryId === category.id).reduce(
                      (sum, t) => sum + t.amount,
                      0
                    );
                    const progress = category.monthlyLimit > 0 ? (spent / category.monthlyLimit) * 100 : 0;

                    return (
                      <div key={category.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                            <div>
                              <h4 className="font-semibold text-white">{category.name}</h4>
                              <p className="text-xs text-slate-400">{category.type}</p>
                            </div>
                          </div>
                          <Badge variant={category.type === "income" ? "default" : "secondary"}>
                            {formatCurrency(spent)}
                          </Badge>
                        </div>
                        {category.monthlyLimit > 0 && (
                          <>
                            <Progress value={progress} className="h-2 mb-1" />
                            <p className="text-xs text-slate-400">
                              {formatCurrency(spent)} of {formatCurrency(category.monthlyLimit)}
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Recent Transactions</CardTitle>
                    <CardDescription>Last 10 transactions</CardDescription>
                  </div>
                  <UpgradeTooltip>
                    <Button disabled className="opacity-50">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </UpgradeTooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {DEMO_TRANSACTIONS.slice(0, 10).map((transaction) => {
                    const category = DEMO_BUDGET_CATEGORIES.find((c) => c.id === transaction.categoryId);
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category?.color }} />
                          <div>
                            <p className="font-medium text-white">{transaction.description}</p>
                            <p className="text-xs text-slate-400">
                              {category?.name} • {formatDate(transaction.date)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-semibold ${
                            transaction.type === "income" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* NEW FEATURES SHOWCASE */}

            {/* Spending Trends */}
            <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    <CardTitle className="text-white">Spending Trends</CardTitle>
                  </div>
                  <Badge variant="secondary">6 Months</Badge>
                </div>
                <CardDescription>Track your spending patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-6 gap-2">
                    {DEMO_SPENDING_TRENDS.monthlyData.map((month, idx) => (
                      <div key={idx} className="text-center">
                        <div
                          className="bg-blue-500 rounded-t"
                          style={{ height: `${(month.total / 4000)}px` }}
                        />
                        <p className="text-xs text-slate-400 mt-1">{month.month}</p>
                        <p className="text-xs text-white font-semibold">
                          {formatCurrency(month.total)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-700">
                    <p className="text-sm text-blue-200 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {DEMO_SPENDING_TRENDS.insights.savingsOpportunity}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Templates */}
            <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-400" />
                  <CardTitle className="text-white">Budget Templates</CardTitle>
                </div>
                <CardDescription>Pre-configured strategies for quick setup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DEMO_BUDGET_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 bg-green-900/30 rounded-lg border border-green-700 hover:border-green-500 transition-colors"
                    >
                      <h4 className="font-semibold text-white mb-2">{template.name}</h4>
                      <p className="text-xs text-slate-300 mb-3">{template.description}</p>
                      <UpgradeTooltip>
                        <Button size="sm" disabled className="w-full opacity-50">
                          Apply Template
                        </Button>
                      </UpgradeTooltip>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Budget Alerts */}
            <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-400" />
                    <CardTitle className="text-white">Budget Alerts</CardTitle>
                  </div>
                  <Badge variant="destructive">
                    {DEMO_BUDGET_ALERTS.filter((a) => !a.isRead).length} New
                  </Badge>
                </div>
                <CardDescription>Real-time notifications for spending thresholds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {DEMO_BUDGET_ALERTS.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.type === "exceeded"
                          ? "bg-red-900/30 border-red-700"
                          : alert.type === "warning"
                            ? "bg-orange-900/30 border-orange-700"
                            : "bg-green-900/30 border-green-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          className={`h-5 w-5 mt-0.5 ${
                            alert.type === "exceeded"
                              ? "text-red-400"
                              : alert.type === "warning"
                                ? "text-orange-400"
                                : "text-green-400"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">{alert.category}</p>
                          <p className="text-xs text-slate-300 mt-1">{alert.message}</p>
                        </div>
                        {!alert.isRead && (
                          <div className="w-2 h-2 rounded-full bg-orange-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-white">AI-Powered Insights</CardTitle>
                </div>
                <CardDescription>Personalized recommendations from SASS-E</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DEMO_AI_INSIGHTS.map((insight) => (
                    <div
                      key={insight.id}
                      className="p-4 bg-purple-900/30 rounded-lg border border-purple-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{insight.title}</h4>
                        <Badge variant="secondary">{insight.confidence}% confident</Badge>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{insight.insight}</p>
                      {insight.potentialSavings > 0 && (
                        <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                          <DollarSign className="h-4 w-4" />
                          Save {formatCurrency(insight.potentialSavings)}/month
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recurring Transactions */}
            <Card className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 border-indigo-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-indigo-400" />
                  <CardTitle className="text-white">Recurring Transactions</CardTitle>
                </div>
                <CardDescription>Automatically detected subscriptions and bills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {DEMO_RECURRING_TRANSACTIONS.map((recurring) => (
                    <div
                      key={recurring.id}
                      className="flex items-center justify-between p-3 bg-indigo-900/30 rounded-lg border border-indigo-700"
                    >
                      <div className="flex items-center gap-3">
                        <Repeat className="h-4 w-4 text-indigo-400" />
                        <div>
                          <p className="font-medium text-white">{recurring.merchantName}</p>
                          <p className="text-xs text-slate-400">
                            {recurring.category} • {recurring.frequency}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">
                          {formatCurrency(recurring.amount)}
                        </p>
                        <p className="text-xs text-slate-400">
                          Next: {formatDate(recurring.nextDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Receipt Scanner */}
            <Card className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 border-teal-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-teal-400" />
                  <CardTitle className="text-white">Receipt Scanner</CardTitle>
                </div>
                <CardDescription>OCR-powered receipt processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-teal-900/30 rounded-lg border border-teal-700 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-3 text-teal-400" />
                    <p className="text-sm text-slate-300 mb-3">
                      Snap a photo of your receipt and let AI extract all the details
                    </p>
                    <UpgradeTooltip>
                      <Button disabled className="opacity-50">
                        <Camera className="h-4 w-4 mr-2" />
                        Scan Receipt
                      </Button>
                    </UpgradeTooltip>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-semibold">Recent Scans</p>
                    {DEMO_RECEIPT_EXAMPLES.map((receipt) => (
                      <div
                        key={receipt.id}
                        className="p-3 bg-teal-900/20 rounded-lg border border-teal-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-white">{receipt.merchant}</p>
                          <Badge variant="secondary">{receipt.confidence}% match</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">{receipt.category}</span>
                          <span className="text-white font-semibold">
                            {formatCurrency(receipt.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Sharing */}
            <Card className="bg-gradient-to-br from-pink-900/30 to-rose-900/30 border-pink-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-pink-400" />
                  <CardTitle className="text-white">Budget Sharing & Collaboration</CardTitle>
                </div>
                <CardDescription>Manage finances with family or roommates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DEMO_SHARED_BUDGETS.map((budget) => (
                    <div
                      key={budget.id}
                      className="p-4 bg-pink-900/30 rounded-lg border border-pink-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{budget.name}</h4>
                          <p className="text-xs text-slate-400">{budget.description}</p>
                        </div>
                        <Badge variant="secondary">{budget.members.length} members</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {budget.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-1 px-2 py-1 bg-pink-900/50 rounded text-xs"
                          >
                            <span>{member.avatar}</span>
                            <span className="text-white">{member.name}</span>
                            <span className="text-slate-400">({member.role})</span>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-400">Total Spending</p>
                          <p className="text-white font-semibold">
                            {formatCurrency(budget.totalSpending)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Your Share</p>
                          <p className="text-white font-semibold">
                            {formatCurrency(budget.yourShare)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Debt Coach Tab */}
          <TabsContent value="debts" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Debt Portfolio</CardTitle>
                    <CardDescription>Track and eliminate your debts</CardDescription>
                  </div>
                  <UpgradeTooltip>
                    <Button disabled className="opacity-50">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Debt
                    </Button>
                  </UpgradeTooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DEMO_DEBTS.map((debt) => {
                    const progress = ((debt.originalBalance - debt.currentBalance) / debt.originalBalance) * 100;
                    return (
                      <div key={debt.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white">{debt.name}</h4>
                            <p className="text-xs text-slate-400">{debt.type.replace("_", " ")}</p>
                          </div>
                          <Badge variant="destructive">{formatCurrency(debt.currentBalance)}</Badge>
                        </div>
                        <Progress value={progress} className="h-2 mb-2" />
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-slate-400">Interest Rate</p>
                            <p className="text-white font-semibold">{debt.interestRate}%</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Min Payment</p>
                            <p className="text-white font-semibold">{formatCurrency(debt.minimumPayment)}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <UpgradeTooltip>
                            <Button size="sm" variant="outline" disabled className="opacity-50 flex-1">
                              Log Payment
                            </Button>
                          </UpgradeTooltip>
                          <UpgradeTooltip>
                            <Button size="sm" variant="ghost" disabled className="opacity-50">
                              Edit
                            </Button>
                          </UpgradeTooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Loan Interest Calculator Demo */}
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Calculator className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Loan Interest Calculator</CardTitle>
                    <CardDescription>See the true cost of any loan</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Example Calculation */}
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <h4 className="font-semibold text-white mb-3">Example: $25,000 Car Loan</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-400">Principal</p>
                          <p className="text-white font-semibold">$25,000</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Interest Rate</p>
                          <p className="text-white font-semibold">6.5% APR</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Term</p>
                          <p className="text-white font-semibold">60 months</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Monthly Payment</p>
                          <p className="text-blue-400 font-semibold">$489.15</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-700">
                        <p className="text-xs text-slate-400">Total Interest</p>
                        <p className="text-xl font-bold text-purple-400">$4,349</p>
                      </div>
                      <div className="p-3 bg-red-900/30 rounded-lg border border-red-700">
                        <p className="text-xs text-slate-400">Total Cost</p>
                        <p className="text-xl font-bold text-red-400">$29,349</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Extra Payment Savings */}
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-700">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-green-400" />
                      Extra Payment Impact
                    </h4>
                    <p className="text-sm text-slate-300 mb-4">
                      Adding just $100/month extra saves you money and time!
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-900/50 rounded border border-green-600">
                        <p className="text-xs text-slate-400">Interest Saved</p>
                        <p className="text-xl font-bold text-green-400">$1,247</p>
                      </div>
                      <div className="p-3 bg-blue-900/50 rounded border border-blue-600">
                        <p className="text-xs text-slate-400">Time Saved</p>
                        <p className="text-xl font-bold text-blue-400">11 months</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-green-700">
                      <UpgradeTooltip>
                        <Button disabled className="w-full opacity-50">
                          Try Full Calculator
                        </Button>
                      </UpgradeTooltip>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Comparison */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Payoff Strategy Comparison</CardTitle>
                <CardDescription>Choose the best approach for your situation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <h4 className="font-semibold text-white mb-2">Debt Snowball</h4>
                    <p className="text-xs text-slate-400 mb-4">Pay smallest debts first for quick wins</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Payoff Date</span>
                        <span className="text-white">{formatDate(DEMO_STRATEGY_COMPARISON.snowball.projectedPayoffDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Interest</span>
                        <span className="text-red-400">{formatCurrency(DEMO_STRATEGY_COMPARISON.snowball.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Months</span>
                        <span className="text-white">{DEMO_STRATEGY_COMPARISON.snowball.monthsToPayoff}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">Debt Avalanche</h4>
                      <Badge variant="default" className="bg-green-600">Recommended</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">Pay highest interest first to save money</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Payoff Date</span>
                        <span className="text-white">{formatDate(DEMO_STRATEGY_COMPARISON.avalanche.projectedPayoffDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Interest</span>
                        <span className="text-green-400">{formatCurrency(DEMO_STRATEGY_COMPARISON.avalanche.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Months</span>
                        <span className="text-white">{DEMO_STRATEGY_COMPARISON.avalanche.monthsToPayoff}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-600">
                        <span className="text-green-400 font-semibold">
                          Save {formatCurrency(DEMO_STRATEGY_COMPARISON.snowball.totalInterest - DEMO_STRATEGY_COMPARISON.avalanche.totalInterest)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Financial Goals</CardTitle>
                    <CardDescription>Set and track your financial targets</CardDescription>
                  </div>
                  <UpgradeTooltip>
                    <Button disabled className="opacity-50">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Goal
                    </Button>
                  </UpgradeTooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {DEMO_GOALS.map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    const milestones = DEMO_MILESTONES.filter((m) => m.goalId === goal.id);

                    return (
                      <div key={goal.id} className="p-6 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-xl font-semibold text-white mb-1">{goal.name}</h4>
                            <p className="text-sm text-slate-400">{goal.description}</p>
                          </div>
                          <Target className="h-6 w-6" style={{ color: goal.color }} />
                        </div>

                        {/* Circular Progress */}
                        <div className="flex items-center justify-center my-6">
                          <div className="relative w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-slate-700"
                              />
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke={goal.color}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 56}`}
                                strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                                className="transition-all duration-500"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Current</span>
                            <span className="text-white font-semibold">{formatCurrency(goal.currentAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Target</span>
                            <span className="text-white font-semibold">{formatCurrency(goal.targetAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Target Date</span>
                            <span className="text-white font-semibold">{formatDate(goal.targetDate)}</span>
                          </div>
                          {milestones.length > 0 && (
                            <div className="pt-3 border-t border-slate-600">
                              <p className="text-xs text-slate-400 mb-2">Milestones Achieved</p>
                              <div className="flex gap-2">
                                {milestones.map((milestone) => (
                                  <Badge key={milestone.id} variant="secondary">
                                    {milestone.milestonePercentage}%
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <UpgradeTooltip>
                            <Button size="sm" variant="outline" disabled className="opacity-50 flex-1">
                              Update Progress
                            </Button>
                          </UpgradeTooltip>
                          <UpgradeTooltip>
                            <Button size="sm" variant="ghost" disabled className="opacity-50">
                              Edit
                            </Button>
                          </UpgradeTooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Goal Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Active Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{DEMO_GOALS.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Target</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(DEMO_GOALS.reduce((sum, g) => sum + g.targetAmount, 0))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {Math.round(
                      (DEMO_GOALS.reduce((sum, g) => sum + g.currentAmount, 0) /
                        DEMO_GOALS.reduce((sum, g) => sum + g.targetAmount, 0)) *
                        100
                    )}
                    %
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI-Powered Goal Predictions */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-white">AI Goal Predictions</CardTitle>
                </div>
                <CardDescription>Smart forecasts and motivational insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.values(DEMO_GOAL_PREDICTIONS).map((prediction, idx) => {
                    const goal = DEMO_GOALS.find((g) => g.id === prediction.goalId);
                    if (!goal) return null;

                    return (
                      <div
                        key={idx}
                        className="p-4 bg-purple-900/30 rounded-lg border border-purple-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-white">{goal.name}</h4>
                            <p className="text-xs text-slate-400">Current Progress: {prediction.currentProgress}%</p>
                          </div>
                          <Badge variant={prediction.onTrack ? "default" : "destructive"}>
                            {prediction.onTrack ? "On Track" : "Behind"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-slate-400">Estimated Completion</p>
                            <p className="text-sm text-white font-semibold">
                              {formatDate(prediction.estimatedCompletionDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Monthly Contribution</p>
                            <p className="text-sm text-white font-semibold">
                              {formatCurrency(prediction.monthlyContribution)}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-purple-900/50 rounded border border-purple-600">
                          <p className="text-sm text-purple-100">{prediction.motivationalMessage}</p>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            Next milestone: {prediction.nextMilestone}%
                          </span>
                          <span className="text-purple-300 font-semibold">
                            {prediction.daysUntilMilestone} days away
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Upgrade CTA */}
        <Card className="mt-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  Ready to Track Your Real Finances?
                </h3>
                <p className="text-slate-300">
                  Unlock unlimited debts, budgets, and goals. Get AI-powered coaching from SASS-E. Start managing your money like a
                  pro.
                </p>
                <div className="flex gap-4 mt-4 text-sm text-slate-300">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    Unlimited tracking
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    AI coaching
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    Export reports
                  </span>
                </div>
              </div>
              <div className="text-center">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={() => setPricingModalOpen(true)}>
                  <Zap className="h-5 w-5 mr-2" />
                  Upgrade to Pro
                </Button>
                <p className="text-xs text-slate-400 mt-2">Cancel anytime. No hidden fees.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Modal */}
      <PricingModal open={pricingModalOpen} onOpenChange={setPricingModalOpen} />
      <Footer />
    </div>
  );
}

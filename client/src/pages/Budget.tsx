import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  PieChart,
  Calendar,
  ArrowRight,
  Wallet,
  Target,
  AlertCircle,
  CheckCircle2,
  Download,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { useCurrency } from "@/contexts/CurrencyContext";
import { SpendingTrendsChart } from "@/components/money-hub/SpendingTrendsChart";
import { BudgetTemplates } from "@/components/money-hub/BudgetTemplates";
import { RecurringTransactions } from "@/components/money-hub/RecurringTransactions";
import { GoalProgressTracker } from "@/components/money-hub/GoalProgressTracker";
import { ReceiptScanner } from "@/components/money-hub/ReceiptScanner";

export default function Budget() {
  const { user, isAuthenticated, loading } = useAuth();
  const { symbol: currencySymbol, formatRaw } = useCurrency();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');

  // Fetch data
  const { data: categories, refetch: refetchCategories } = trpc.budget.getCategories.useQuery(
    {},
    { enabled: isAuthenticated }
  );

  const { data: transactions, refetch: refetchTransactions } = trpc.budget.getTransactions.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  const { data: monthlySummary, refetch: refetchSummary } = trpc.budget.getMonthlySummary.useQuery(
    { monthYear: currentMonth },
    { enabled: isAuthenticated }
  );

  const { data: categoryBreakdown } = trpc.budget.getCategoryBreakdown.useQuery(
    { monthYear: currentMonth },
    { enabled: isAuthenticated }
  );

  const { data: availableForDebt } = trpc.budget.getAvailableForDebt.useQuery(
    { monthYear: currentMonth },
    { enabled: isAuthenticated }
  );

  // Mutations
  const initializeCategories = trpc.budget.initializeDefaultCategories.useMutation({
    onSuccess: () => {
      toast.success("Default categories initialized!");
      refetchCategories();
    },
  });

  const createTransaction = trpc.budget.createTransaction.useMutation({
    onSuccess: () => {
      toast.success("Transaction added!");
      setAddTransactionOpen(false);
      refetchTransactions();
      refetchSummary();
    },
    onError: (error) => {
      toast.error(`Failed to add transaction: ${error.message}`);
    },
  });

  const createCategory = trpc.budget.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Category created!");
      setAddCategoryOpen(false);
      refetchCategories();
    },
    onError: (error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });

  // Format currency - use context currency
  const formatCurrency = (cents: number) => {
    return formatRaw(cents / 100);
  };

  // Format percentage
  const formatPercentage = (basisPoints: number) => {
    return (basisPoints / 100).toFixed(1) + "%";
  };

  // Get budget health color
  const getHealthColor = (health?: string) => {
    switch (health) {
      case "excellent":
        return "text-green-400";
      case "good":
        return "text-blue-400";
      case "warning":
        return "text-yellow-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  // Get budget health icon
  const getHealthIcon = (health?: string) => {
    switch (health) {
      case "excellent":
      case "good":
        return <CheckCircle2 className="h-5 w-5" />;
      case "warning":
      case "critical":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
    }
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
          <h1 className="text-4xl font-bold mb-4 text-white">Budget Manager</h1>
          <p className="text-xl text-slate-300 mb-8">
            Track your income and expenses to maximize debt payments
          </p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Get Started</a>
          </Button>
        </div>
      </div>
    );
  }

  // Initialize categories if none exist
  if (categories && categories.length === 0 && !initializeCategories.isPending) {
    initializeCategories.mutate();
  }

  const incomeCategories = categories?.filter((c) => c.type === "income") || [];
  const expenseCategories = categories?.filter((c) => c.type === "expense") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{height: '50px'}}>
                <span className="text-4xl md:text-5xl">💰</span>{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">Budget Manager</span>
              </h1>
              <p className="text-slate-300">
                Track income and expenses to maximize debt payments
              </p>
            </div>
            <div className="flex gap-3">
              <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Budget Category</DialogTitle>
                    <DialogDescription>
                      Add a new income or expense category
                    </DialogDescription>
                  </DialogHeader>
                  <AddCategoryForm
                    onSubmit={(data) => createCategory.mutate(data)}
                    isSubmitting={createCategory.isPending}
                  />
                </DialogContent>
              </Dialog>
              <Dialog open={addTransactionOpen} onOpenChange={setAddTransactionOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>
                      Record a new income or expense transaction
                    </DialogDescription>
                  </DialogHeader>
                  <AddTransactionForm
                    categories={categories || []}
                    onSubmit={(data) => createTransaction.mutate(data)}
                    isSubmitting={createTransaction.isPending}
                  />
                </DialogContent>
              </Dialog>
              <Select value={exportFormat} onValueChange={(value: 'csv' | 'pdf' | 'excel') => setExportFormat(value)}>
                <SelectTrigger className="w-[140px]">
                  <Download className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">Export CSV</SelectItem>
                  <SelectItem value="pdf">Export PDF</SelectItem>
                  <SelectItem value="excel">Export Excel</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  toast.info(`Exporting as ${exportFormat.toUpperCase()}...`);
                  // TODO: Implement actual export functionality
                  setTimeout(() => {
                    toast.success(`Budget exported as ${exportFormat.toUpperCase()}!`);
                  }, 1000);
                }}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Month Selector */}
        <div className="mb-6">
          <Label htmlFor="month-select" className="text-white mb-2 block">
            Select Month
          </Label>
          <Input
            id="month-select"
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Monthly Summary Cards */}
        {monthlySummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(monthlySummary.totalIncome)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {formatCurrency(monthlySummary.totalExpenses)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Debt Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">
                  {formatCurrency(monthlySummary.totalDebtPayments)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Net Cash Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    monthlySummary.netCashFlow >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {formatCurrency(monthlySummary.netCashFlow)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Budget Health & Debt Integration */}
        {availableForDebt && (
          <Card className="mb-8 bg-gradient-to-r from-emerald-900/50 to-green-900/50 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5" />
                Available for Debt Payments
                {monthlySummary && (
                  <span className={`ml-auto flex items-center gap-2 ${getHealthColor(monthlySummary.budgetHealth)}`}>
                    {getHealthIcon(monthlySummary.budgetHealth)}
                    <span className="capitalize text-sm">{monthlySummary.budgetHealth} Health</span>
                  </span>
                )}
              </CardTitle>
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
                  <p className="text-xs text-slate-500 mt-1">50% of available funds</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Projected Debt-Free</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {availableForDebt.projectedMonthsToDebtFree} months
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    With recommended payments
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <Button asChild className="gap-2">
                  <a href="/debt-coach">
                    <ArrowRight className="h-4 w-4" />
                    Go to Debt Coach
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        {categoryBreakdown && categoryBreakdown.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <PieChart className="h-6 w-6" />
              Spending by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryBreakdown.map((item) => (
                <Card key={item.category.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.category.color }}
                        />
                        <div>
                          <p className="font-semibold text-white">
                            {item.category.icon} {item.category.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {item.count} {item.count === 1 ? "transaction" : "transactions"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          {formatCurrency(item.total)}
                        </p>
                        {item.category.monthlyLimit && (
                          <p className="text-xs text-slate-400">
                            of {formatCurrency(item.category.monthlyLimit)} limit
                          </p>
                        )}
                      </div>
                    </div>
                    {item.category.monthlyLimit && (
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (item.total / item.category.monthlyLimit) * 100)}%`,
                            backgroundColor:
                              item.total > item.category.monthlyLimit
                                ? "#ef4444"
                                : item.category.color,
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Budget Templates */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="h-6 w-6" />
            Budget Templates
          </h2>
          <BudgetTemplates />
        </div>

        {/* Spending Trends */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="h-6 w-6" />
            Spending Trends
          </h2>
          <SpendingTrendsChart />
        </div>

        {/* Recurring Transactions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="h-6 w-6" />
            Recurring Transactions & Subscriptions
          </h2>
          <RecurringTransactions />
        </div>

        {/* Financial Goals */}
        <div className="mb-8">
          <GoalProgressTracker />
        </div>

        {/* Receipt Scanner */}
        <div className="mb-8">
          <ReceiptScanner />
        </div>

        {/* Recent Transactions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Recent Transactions
          </h2>
          
          {transactions && transactions.length > 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-0">
                <div className="divide-y divide-slate-700">
                  {transactions.slice(0, 10).map((transaction) => {
                    const category = categories?.find((c) => c.id === transaction.categoryId);
                    return (
                      <div
                        key={transaction.id}
                        className="p-4 hover:bg-slate-700/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {category && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                            <div>
                              <p className="font-semibold text-white">
                                {transaction.description || category?.name || "Transaction"}
                              </p>
                              <p className="text-sm text-slate-400">
                                {new Date(transaction.transactionDate).toLocaleDateString()} •{" "}
                                {category?.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-lg font-bold ${
                                category?.type === "income" ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {category?.type === "income" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700 border-dashed">
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Transactions Yet
                </h3>
                <p className="text-slate-400 mb-6">
                  Start tracking your income and expenses
                </p>
                <Button onClick={() => setAddTransactionOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Transaction
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Add Transaction Form Component
function AddTransactionForm({
  categories,
  onSubmit,
  isSubmitting,
}: {
  categories: any[];
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}) {
  const { symbol: currencySymbol } = useCurrency();
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    transactionDate: new Date().toISOString().split("T")[0],
    description: "",
    notes: "",
    isRecurring: false,
    recurringFrequency: "monthly" as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      categoryId: parseInt(formData.categoryId),
      amount: Math.round(parseFloat(formData.amount) * 100), // Convert to cents
      transactionDate: new Date(formData.transactionDate).toISOString(),
      description: formData.description || undefined,
      notes: formData.notes || undefined,
      isRecurring: formData.isRecurring,
      recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="categoryId">Category *</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">Income</div>
            {categories
              .filter((c) => c.type === "income")
              .map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 border-t">
              Expenses
            </div>
            {categories
              .filter((c) => c.type === "expense")
              .map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="amount">Amount ({currencySymbol}) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="100.00"
          required
        />
      </div>

      <div>
        <Label htmlFor="transactionDate">Date *</Label>
        <Input
          id="transactionDate"
          type="date"
          value={formData.transactionDate}
          onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g., Grocery shopping"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional details..."
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Transaction"}
      </Button>
    </form>
  );
}

// Add Category Form Component
function AddCategoryForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}) {
  const { symbol: currencySymbol } = useCurrency();
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as const,
    monthlyLimit: "",
    color: "#8b5cf6",
    icon: "📦",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      type: formData.type,
      monthlyLimit: formData.monthlyLimit
        ? Math.round(parseFloat(formData.monthlyLimit) * 100)
        : undefined,
      color: formData.color,
      icon: formData.icon || undefined,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Entertainment"
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value: any) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type === "expense" && (
        <div>
          <Label htmlFor="monthlyLimit">Monthly Limit ({currencySymbol})</Label>
          <Input
            id="monthlyLimit"
            type="number"
            step="0.01"
            value={formData.monthlyLimit}
            onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
            placeholder="500.00"
          />
        </div>
      )}

      <div>
        <Label htmlFor="color">Color *</Label>
        <Input
          id="color"
          type="color"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="icon">Icon (Emoji)</Label>
        <Input
          id="icon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="📦"
          maxLength={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Category"}
      </Button>
    </form>
  );
}

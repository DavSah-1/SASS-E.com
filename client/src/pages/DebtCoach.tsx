import { useState, useEffect, useRef } from "react";
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
  TrendingDown,
  DollarSign,
  Target,
  Award,
  Calendar,
  CreditCard,
  Sparkles,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { useCurrency } from "@/contexts/CurrencyContext";
import { LoanCalculator, LoanCalculatorRef } from "@/components/money-hub/LoanCalculator";
import { LoanComparison } from "@/components/money-hub/LoanComparison";
import { RefinanceAnalyzer } from "@/components/money-hub/RefinanceAnalyzer";
import { Calculator } from "lucide-react";

export default function DebtCoach() {
  const { user, isAuthenticated, loading } = useAuth();
  const { symbol: currencySymbol, formatRaw } = useCurrency();
  const [addDebtOpen, setAddDebtOpen] = useState(false);
  const [paymentDebtId, setPaymentDebtId] = useState<number | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<"snowball" | "avalanche">("snowball");
  const calculatorRef = useRef<LoanCalculatorRef>(null);
  
  // Function to send debt to calculator
  const sendToCalculator = (debt: { name: string; currentBalance: number; interestRate: number }) => {
    if (calculatorRef.current) {
      calculatorRef.current.setValues({
        principal: debt.currentBalance,
        annualInterestRate: debt.interestRate,
        termMonths: 60, // Default to 60 months, user can adjust
        debtName: debt.name,
      });
      calculatorRef.current.scrollIntoView();
    }
  };

  // Fetch data
  const { data: debts, refetch: refetchDebts } = trpc.debtCoach.getDebts.useQuery(
    { includeInactive: false },
    { enabled: isAuthenticated }
  );
  
  const { data: summary } = trpc.debtCoach.getSummary.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: milestones } = trpc.debtCoach.getMilestones.useQuery(
    {},
    { enabled: isAuthenticated }
  );

  const { data: coachingMessages } = trpc.debtCoach.getCoachingMessages.useQuery(
    { limit: 3 },
    { enabled: isAuthenticated }
  );

  const { data: snowballStrategy } = trpc.debtCoach.getStrategy.useQuery(
    { strategyType: "snowball" },
    { enabled: isAuthenticated }
  );

  const { data: avalancheStrategy } = trpc.debtCoach.getStrategy.useQuery(
    { strategyType: "avalanche" },
    { enabled: isAuthenticated }
  );

  // Mutations
  const addDebt = trpc.debtCoach.addDebt.useMutation({
    onSuccess: () => {
      toast.success("Debt added successfully!");
      setAddDebtOpen(false);
      refetchDebts();
    },
    onError: (error) => {
      toast.error(`Failed to add debt: ${error.message}`);
    },
  });

  const recordPayment = trpc.debtCoach.recordPayment.useMutation({
    onSuccess: (data) => {
      toast.success("Payment recorded!");
      if (data.coachingMessage) {
        toast.info(data.coachingMessage, { duration: 5000 });
      }
      setPaymentDebtId(null);
      refetchDebts();
    },
    onError: (error) => {
      toast.error(`Failed to record payment: ${error.message}`);
    },
  });

  const calculateStrategy = trpc.debtCoach.calculateStrategy.useMutation({
    onSuccess: () => {
      toast.success("Strategy calculated!");
    },
  });

  const getMotivation = trpc.debtCoach.getMotivation.useMutation({
    onSuccess: (data) => {
      toast.info(data.message, { duration: 6000 });
    },
  });

  // Format currency
  // Use currency context for formatting
  const formatCurrency = (cents: number) => {
    return formatRaw(cents / 100);
  };

  // Format interest rate
  const formatInterestRate = (basisPoints: number) => {
    return (basisPoints / 100).toFixed(2) + "%";
  };

  // Calculate progress percentage
  const calculateProgress = (original: number, current: number) => {
    if (original === 0) return 0;
    return Math.round(((original - current) / original) * 100);
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
          <h1 className="text-4xl font-bold mb-4 text-white">Debt Elimination Coach</h1>
          <p className="text-xl text-slate-300 mb-8">
            Take control of your financial future with AI-powered debt coaching
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="text-4xl md:text-5xl">💰</span>{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Debt Elimination Coach</span>
              </h1>
              <p className="text-slate-300">
                Your journey to financial freedom, guided by SASS-E
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => getMotivation.mutate()}
                variant="outline"
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Get Motivation
              </Button>
              <Dialog open={addDebtOpen} onOpenChange={setAddDebtOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Debt
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Debt</DialogTitle>
                    <DialogDescription>
                      Enter the details of your debt to start tracking it
                    </DialogDescription>
                  </DialogHeader>
                  <AddDebtForm
                    onSubmit={(data) => addDebt.mutate(data)}
                    isSubmitting={addDebt.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Debt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(summary.totalBalance)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {summary.totalDebts} active {summary.totalDebts === 1 ? "debt" : "debts"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Total Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(summary.totalPaid)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {summary.totalOriginalBalance > 0
                    ? Math.round((summary.totalPaid / summary.totalOriginalBalance) * 100)
                    : 0}
                  % of original debt
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Debts Paid Off
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">
                  {summary.debtsPaidOff}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Congratulations! 🎉
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Avg Interest Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">
                  {formatInterestRate(summary.averageInterestRate)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Monthly minimum: {formatCurrency(summary.totalMonthlyMinimum)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Coaching Message */}
        {coachingMessages && coachingMessages.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                SASS-E Says
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-200 text-lg italic">
                "{coachingMessages[0].message}"
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {new Date(coachingMessages[0].createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Debt Portfolio */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Your Debt Portfolio
          </h2>
          
          {debts && debts.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {debts.map((debt) => (
                <Card key={debt.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{debt.debtName}</CardTitle>
                        <CardDescription className="capitalize">
                          {debt.debtType.replace("_", " ")}
                          {debt.creditor && ` • ${debt.creditor}`}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {formatCurrency(debt.currentBalance)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatInterestRate(debt.interestRate)} APR
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-green-400 font-semibold">
                          {calculateProgress(debt.originalBalance, debt.currentBalance)}% paid
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${calculateProgress(debt.originalBalance, debt.currentBalance)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Original: {formatCurrency(debt.originalBalance)}</span>
                        <span>Remaining: {formatCurrency(debt.currentBalance)}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div>
                        <p className="text-slate-400">Minimum Payment</p>
                        <p className="text-white font-semibold">
                          {formatCurrency(debt.minimumPayment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Due Day</p>
                        <p className="text-white font-semibold">
                          {debt.dueDay}{debt.dueDay === 1 ? "st" : debt.dueDay === 2 ? "nd" : debt.dueDay === 3 ? "rd" : "th"} of month
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mb-2">
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 border-blue-600 text-blue-400 hover:bg-blue-600/20"
                        onClick={() => sendToCalculator({
                          name: debt.debtName,
                          currentBalance: debt.currentBalance,
                          interestRate: debt.interestRate,
                        })}
                      >
                        <Calculator className="h-4 w-4" />
                        Calculate
                      </Button>
                    </div>
                    <Dialog
                      open={paymentDebtId === debt.id}
                      onOpenChange={(open) => setPaymentDebtId(open ? debt.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full gap-2">
                          <DollarSign className="h-4 w-4" />
                          Log Payment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Log Payment for {debt.debtName}</DialogTitle>
                          <DialogDescription>
                            Record a payment toward this debt
                          </DialogDescription>
                        </DialogHeader>
                        <PaymentForm
                          debtId={debt.id}
                          currentBalance={debt.currentBalance}
                          onSubmit={(data) => recordPayment.mutate(data)}
                          isSubmitting={recordPayment.isPending}
                        />
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700 border-dashed">
              <CardContent className="py-12 text-center">
                <CreditCard className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Debts Added Yet
                </h3>
                <p className="text-slate-400 mb-6">
                  Start your debt-free journey by adding your first debt
                </p>
                <Button onClick={() => setAddDebtOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Debt
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Strategy Comparison */}
        {debts && debts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Payoff Strategies
            </h2>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Compare Debt Elimination Strategies</CardTitle>
                <CardDescription>
                  See which strategy saves you the most money and time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Snowball Strategy */}
                  <div className="border border-slate-600 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">
                      🎯 Debt Snowball
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      Pay off smallest debts first for quick wins and motivation
                    </p>
                    {snowballStrategy ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Payoff Time:</span>
                          <span className="text-white font-semibold">
                            {snowballStrategy.monthsToPayoff} months
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Interest:</span>
                          <span className="text-white font-semibold">
                            {formatCurrency(snowballStrategy.totalInterestPaid)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Interest Saved:</span>
                          <span className="text-green-400 font-semibold">
                            {formatCurrency(snowballStrategy.totalInterestSaved)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() =>
                          calculateStrategy.mutate({
                            strategyType: "snowball",
                            monthlyExtraPayment: 10000, // $100
                          })
                        }
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Calculate Strategy
                      </Button>
                    )}
                  </div>

                  {/* Avalanche Strategy */}
                  <div className="border border-slate-600 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">
                      ⚡ Debt Avalanche
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      Pay off highest interest debts first to save the most money
                    </p>
                    {avalancheStrategy ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Payoff Time:</span>
                          <span className="text-white font-semibold">
                            {avalancheStrategy.monthsToPayoff} months
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Interest:</span>
                          <span className="text-white font-semibold">
                            {formatCurrency(avalancheStrategy.totalInterestPaid)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Interest Saved:</span>
                          <span className="text-green-400 font-semibold">
                            {formatCurrency(avalancheStrategy.totalInterestSaved)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() =>
                          calculateStrategy.mutate({
                            strategyType: "avalanche",
                            monthlyExtraPayment: 10000, // $100
                          })
                        }
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Calculate Strategy
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Milestones */}
        {milestones && milestones.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="h-6 w-6" />
              Your Achievements
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {milestones.slice(0, 6).map((milestone) => (
                <Card key={milestone.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏆</div>
                      <h3 className="font-semibold text-white mb-1">
                        {milestone.title}
                      </h3>
                      <p className="text-sm text-slate-400 mb-2">
                        {milestone.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(milestone.achievedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Loan Interest Calculator */}
        <div className="mb-8">
          <LoanCalculator ref={calculatorRef} />
        </div>
        
        {/* Loan Comparison Tool */}
        <div className="mb-8">
          <LoanComparison />
        </div>
        
        {/* Refinance Analyzer */}
        <div className="mb-8">
          <RefinanceAnalyzer />
        </div>
      </div>
    </div>
  );
}

// Add Debt Form Component
function AddDebtForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    debtName: "",
    debtType: "credit_card" as const,
    originalBalance: "",
    currentBalance: "",
    interestRate: "",
    minimumPayment: "",
    dueDay: "",
    creditor: "",
    accountNumber: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert to cents and basis points
    const data = {
      debtName: formData.debtName,
      debtType: formData.debtType,
      originalBalance: Math.round(parseFloat(formData.originalBalance) * 100),
      currentBalance: Math.round(parseFloat(formData.currentBalance) * 100),
      interestRate: Math.round(parseFloat(formData.interestRate) * 100), // Convert to basis points
      minimumPayment: Math.round(parseFloat(formData.minimumPayment) * 100),
      dueDay: parseInt(formData.dueDay),
      creditor: formData.creditor || undefined,
      accountNumber: formData.accountNumber || undefined,
      notes: formData.notes || undefined,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="debtName">Debt Name *</Label>
        <Input
          id="debtName"
          value={formData.debtName}
          onChange={(e) => setFormData({ ...formData, debtName: e.target.value })}
          placeholder="e.g., Chase Credit Card"
          required
        />
      </div>

      <div>
        <Label htmlFor="debtType">Debt Type *</Label>
        <Select
          value={formData.debtType}
          onValueChange={(value: any) => setFormData({ ...formData, debtType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="student_loan">Student Loan</SelectItem>
            <SelectItem value="personal_loan">Personal Loan</SelectItem>
            <SelectItem value="auto_loan">Auto Loan</SelectItem>
            <SelectItem value="mortgage">Mortgage</SelectItem>
            <SelectItem value="medical">Medical</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="originalBalance">Original Balance ($) *</Label>
          <Input
            id="originalBalance"
            type="number"
            step="0.01"
            value={formData.originalBalance}
            onChange={(e) => setFormData({ ...formData, originalBalance: e.target.value })}
            placeholder="5000.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="currentBalance">Current Balance ($) *</Label>
          <Input
            id="currentBalance"
            type="number"
            step="0.01"
            value={formData.currentBalance}
            onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
            placeholder="5000.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="interestRate">Interest Rate (%) *</Label>
          <Input
            id="interestRate"
            type="number"
            step="0.01"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
            placeholder="18.99"
            required
          />
        </div>
        <div>
          <Label htmlFor="minimumPayment">Minimum Payment ($) *</Label>
          <Input
            id="minimumPayment"
            type="number"
            step="0.01"
            value={formData.minimumPayment}
            onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
            placeholder="100.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dueDay">Due Day (1-31) *</Label>
          <Input
            id="dueDay"
            type="number"
            min="1"
            max="31"
            value={formData.dueDay}
            onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
            placeholder="15"
            required
          />
        </div>
        <div>
          <Label htmlFor="creditor">Creditor</Label>
          <Input
            id="creditor"
            value={formData.creditor}
            onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
            placeholder="Bank Name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="accountNumber">Account Number (last 4 digits)</Label>
        <Input
          id="accountNumber"
          value={formData.accountNumber}
          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
          placeholder="****1234"
          maxLength={10}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional notes about this debt..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Debt"}
      </Button>
    </form>
  );
}

// Payment Form Component
function PaymentForm({
  debtId,
  currentBalance,
  onSubmit,
  isSubmitting,
}: {
  debtId: number;
  currentBalance: number;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}) {
  const { formatRaw } = useCurrency();
  const [formData, setFormData] = useState({
    amount: "",
    paymentType: "extra" as const,
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      debtId,
      amount: Math.round(parseFloat(formData.amount) * 100), // Convert to cents
      paymentType: formData.paymentType,
      paymentDate: new Date(formData.paymentDate).toISOString(),
      notes: formData.notes || undefined,
    };

    onSubmit(data);
  };

  // Use currency context for formatting
  const formatCurrency = (cents: number) => {
    return formatRaw(cents / 100);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Current Balance: <span className="font-semibold">{formatCurrency(currentBalance)}</span>
        </p>
      </div>

      <div>
        <Label htmlFor="amount">Payment Amount ($) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="200.00"
          required
        />
      </div>

      <div>
        <Label htmlFor="paymentType">Payment Type *</Label>
        <Select
          value={formData.paymentType}
          onValueChange={(value: any) => setFormData({ ...formData, paymentType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minimum">Minimum Payment</SelectItem>
            <SelectItem value="extra">Extra Payment</SelectItem>
            <SelectItem value="lump_sum">Lump Sum</SelectItem>
            <SelectItem value="automatic">Automatic Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="paymentDate">Payment Date *</Label>
        <Input
          id="paymentDate"
          type="date"
          value={formData.paymentDate}
          onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any notes about this payment..."
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record Payment"}
      </Button>
    </form>
  );
}

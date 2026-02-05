import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  DollarSign,
  Percent,
  Calendar,
  TrendingDown,
  PiggyBank,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LoanInput {
  principal: number;
  annualInterestRate: number;
  termMonths: number;
  extraMonthlyPayment: number;
}

interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
}

// Client-side calculation functions (matching server logic)
function calculateMonthlyPayment(principal: number, rate: number, months: number): number {
  if (rate === 0) return Math.round(principal / months);
  const monthlyRate = rate / 100 / 12;
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
  const denominator = Math.pow(1 + monthlyRate, months) - 1;
  return Math.round(principal * (numerator / denominator));
}

function generateAmortization(
  principal: number,
  rate: number,
  months: number,
  extraPayment: number = 0
): AmortizationEntry[] {
  const entries: AmortizationEntry[] = [];
  const monthlyRate = rate / 100 / 12;
  const basePayment = calculateMonthlyPayment(principal, rate, months);
  const totalPayment = basePayment + extraPayment;
  
  let balance = principal;
  let cumulativeInterest = 0;
  let month = 0;
  
  while (balance > 0 && month < months * 2) {
    month++;
    const interest = Math.round(balance * monthlyRate);
    let principalPaid = totalPayment - interest;
    
    if (principalPaid >= balance) {
      principalPaid = balance;
    }
    
    cumulativeInterest += interest;
    balance -= principalPaid;
    if (balance < 0) balance = 0;
    
    entries.push({
      month,
      payment: principalPaid + interest,
      principal: principalPaid,
      interest,
      balance,
      cumulativeInterest,
    });
    
    if (balance === 0) break;
  }
  
  return entries;
}

// formatCurrency is now passed as a prop or uses context inside the component

export interface LoanCalculatorProps {
  initialValues?: {
    principal?: number;
    annualInterestRate?: number;
    termMonths?: number;
    debtName?: string;
  };
  onValuesChange?: (values: LoanInput) => void;
}

export interface LoanCalculatorRef {
  setValues: (values: Partial<LoanInput> & { debtName?: string }) => void;
  scrollIntoView: () => void;
}

export const LoanCalculator = forwardRef<LoanCalculatorRef, LoanCalculatorProps>(
  function LoanCalculator({ initialValues, onValuesChange }, ref) {
  const { formatRaw, symbol: currencySymbol } = useCurrency();
  
  // Use currency context for formatting
  const formatCurrency = (cents: number): string => {
    return formatRaw(cents / 100);
  };
  
  const [loanInput, setLoanInput] = useState<LoanInput>({
    principal: initialValues?.principal ?? 2500000, // $25,000
    annualInterestRate: initialValues?.annualInterestRate ?? 6.5,
    termMonths: initialValues?.termMonths ?? 60,
    extraMonthlyPayment: 0,
  });
  
  const [prefilledFrom, setPrefilledFrom] = useState<string | null>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    setValues: (values) => {
      setLoanInput(prev => ({
        ...prev,
        principal: values.principal ?? prev.principal,
        annualInterestRate: values.annualInterestRate ?? prev.annualInterestRate,
        termMonths: values.termMonths ?? prev.termMonths,
      }));
      if (values.debtName) {
        setPrefilledFrom(values.debtName);
      }
      setActiveTab("calculator");
    },
    scrollIntoView: () => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  }));
  
  // Clear prefilled indicator after user makes changes
  useEffect(() => {
    if (prefilledFrom) {
      const timer = setTimeout(() => setPrefilledFrom(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [prefilledFrom]);
  
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [activeTab, setActiveTab] = useState("calculator");
  
  // Calculate results
  const results = useMemo(() => {
    const { principal, annualInterestRate, termMonths, extraMonthlyPayment } = loanInput;
    
    if (principal <= 0 || termMonths <= 0) {
      return null;
    }
    
    const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, termMonths);
    const schedule = generateAmortization(principal, annualInterestRate, termMonths, extraMonthlyPayment);
    const scheduleWithoutExtra = generateAmortization(principal, annualInterestRate, termMonths, 0);
    
    const totalInterest = schedule[schedule.length - 1]?.cumulativeInterest || 0;
    const totalPayment = schedule.reduce((sum, e) => sum + e.payment, 0);
    const totalInterestWithoutExtra = scheduleWithoutExtra[scheduleWithoutExtra.length - 1]?.cumulativeInterest || 0;
    
    const interestSaved = totalInterestWithoutExtra - totalInterest;
    const monthsSaved = scheduleWithoutExtra.length - schedule.length;
    
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + schedule.length);
    
    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      interestPercentage: Math.round((totalInterest / principal) * 100),
      schedule,
      monthsToPayoff: schedule.length,
      payoffDate,
      interestSaved,
      monthsSaved,
    };
  }, [loanInput]);
  
  const handleInputChange = (field: keyof LoanInput, value: string) => {
    let numValue: number;
    
    if (field === "principal") {
      // Convert dollars to cents
      numValue = Math.round(parseFloat(value || "0") * 100);
    } else if (field === "extraMonthlyPayment") {
      numValue = Math.round(parseFloat(value || "0") * 100);
    } else if (field === "annualInterestRate") {
      numValue = parseFloat(value || "0");
    } else {
      numValue = parseInt(value || "0", 10);
    }
    
    setLoanInput((prev) => ({ ...prev, [field]: numValue }));
  };
  
  return (
    <Card ref={cardRef} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Calculator className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-white">Loan Interest Calculator</CardTitle>
            <CardDescription>
              See the true cost of your loan and how extra payments can save you money
            </CardDescription>
          </div>
          {prefilledFrom && (
            <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600">
              Loaded from: {prefilledFrom}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
            <TabsTrigger value="calculator" className="data-[state=active]:bg-blue-600">
              Calculator
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-blue-600">
              Schedule
            </TabsTrigger>
            <TabsTrigger value="savings" className="data-[state=active]:bg-blue-600">
              Extra Payments
            </TabsTrigger>
          </TabsList>
          
          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="principal" className="text-slate-300 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Loan Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{currencySymbol}</span>
                  <Input
                    id="principal"
                    type="number"
                    value={(loanInput.principal / 100).toFixed(0)}
                    onChange={(e) => handleInputChange("principal", e.target.value)}
                    className="pl-7 bg-slate-700/50 border-slate-600 text-white"
                    placeholder="25000"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rate" className="text-slate-300 flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Annual Interest Rate
                </Label>
                <div className="relative">
                  <Input
                    id="rate"
                    type="number"
                    step="0.1"
                    value={loanInput.annualInterestRate}
                    onChange={(e) => handleInputChange("annualInterestRate", e.target.value)}
                    className="pr-7 bg-slate-700/50 border-slate-600 text-white"
                    placeholder="6.5"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="term" className="text-slate-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Loan Term (months)
                </Label>
                <Input
                  id="term"
                  type="number"
                  value={loanInput.termMonths}
                  onChange={(e) => handleInputChange("termMonths", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="60"
                />
                <p className="text-xs text-slate-500">
                  {Math.floor(loanInput.termMonths / 12)} years {loanInput.termMonths % 12} months
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="extra" className="text-slate-300 flex items-center gap-2">
                  <PiggyBank className="h-4 w-4" />
                  Extra Monthly Payment
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-slate-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Additional payment each month to pay off faster</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{currencySymbol}</span>
                  <Input
                    id="extra"
                    type="number"
                    value={(loanInput.extraMonthlyPayment / 100).toFixed(0)}
                    onChange={(e) => handleInputChange("extraMonthlyPayment", e.target.value)}
                    className="pl-7 bg-slate-700/50 border-slate-600 text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            
            {/* Results Summary */}
            {results && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                    <p className="text-xs text-slate-400 mb-1">Monthly Payment</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {formatCurrency(results.monthlyPayment + loanInput.extraMonthlyPayment)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-700">
                    <p className="text-xs text-slate-400 mb-1">Total Interest</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {formatCurrency(results.totalInterest)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-red-900/30 rounded-lg border border-red-700">
                    <p className="text-xs text-slate-400 mb-1">Total Cost</p>
                    <p className="text-2xl font-bold text-red-400">
                      {formatCurrency(results.totalPayment)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-900/30 rounded-lg border border-green-700">
                    <p className="text-xs text-slate-400 mb-1">Payoff Date</p>
                    <p className="text-lg font-bold text-green-400">
                      {results.payoffDate.toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-slate-500">{results.monthsToPayoff} months</p>
                  </div>
                </div>
                
                {/* Cost Breakdown Visual */}
                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                  <p className="text-sm text-slate-300 mb-3">Cost Breakdown</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Principal</span>
                        <span className="text-white">{formatCurrency(loanInput.principal)}</span>
                      </div>
                      <Progress
                        value={(loanInput.principal / results.totalPayment) * 100}
                        className="h-3 bg-slate-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Interest ({results.interestPercentage}% of principal)</span>
                        <span className="text-red-400">{formatCurrency(results.totalInterest)}</span>
                      </div>
                      <Progress
                        value={(results.totalInterest / results.totalPayment) * 100}
                        className="h-3 bg-slate-600 [&>div]:bg-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Amortization Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            {results && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-300">
                    {results.schedule.length} payments over{" "}
                    {Math.floor(results.schedule.length / 12)} years{" "}
                    {results.schedule.length % 12} months
                  </p>
                  <Badge variant="secondary">
                    Total: {formatCurrency(results.totalPayment)}
                  </Badge>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-2 px-3 text-slate-400">Month</th>
                        <th className="text-right py-2 px-3 text-slate-400">Payment</th>
                        <th className="text-right py-2 px-3 text-slate-400">Principal</th>
                        <th className="text-right py-2 px-3 text-slate-400">Interest</th>
                        <th className="text-right py-2 px-3 text-slate-400">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showFullSchedule ? results.schedule : results.schedule.slice(0, 12)).map(
                        (entry) => (
                          <tr
                            key={entry.month}
                            className="border-b border-slate-700/50 hover:bg-slate-700/30"
                          >
                            <td className="py-2 px-3 text-white">{entry.month}</td>
                            <td className="py-2 px-3 text-right text-white">
                              {formatCurrency(entry.payment)}
                            </td>
                            <td className="py-2 px-3 text-right text-green-400">
                              {formatCurrency(entry.principal)}
                            </td>
                            <td className="py-2 px-3 text-right text-red-400">
                              {formatCurrency(entry.interest)}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-300">
                              {formatCurrency(entry.balance)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                
                {results.schedule.length > 12 && (
                  <Button
                    variant="ghost"
                    className="w-full text-slate-400 hover:text-white"
                    onClick={() => setShowFullSchedule(!showFullSchedule)}
                  >
                    {showFullSchedule ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show All {results.schedule.length} Payments
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
          </TabsContent>
          
          {/* Extra Payments Tab */}
          <TabsContent value="savings" className="space-y-4">
            {results && loanInput.extraMonthlyPayment > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-900/30 rounded-lg border border-green-700">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="h-5 w-5 text-green-400" />
                    <h4 className="font-semibold text-white">Extra Payment Impact</h4>
                  </div>
                  <p className="text-sm text-slate-300 mb-4">
                    By paying an extra {formatCurrency(loanInput.extraMonthlyPayment)} per month,
                    you'll save significantly on interest and pay off your loan faster.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-900/50 rounded border border-green-600">
                      <p className="text-xs text-slate-400">Interest Saved</p>
                      <p className="text-xl font-bold text-green-400">
                        {formatCurrency(results.interestSaved)}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-900/50 rounded border border-blue-600">
                      <p className="text-xs text-slate-400">Time Saved</p>
                      <p className="text-xl font-bold text-blue-400">
                        {results.monthsSaved} months
                      </p>
                      <p className="text-xs text-slate-500">
                        ({(results.monthsSaved / 12).toFixed(1)} years)
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <h5 className="text-sm font-semibold text-slate-300 mb-3">Without Extra</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monthly</span>
                        <span className="text-white">{formatCurrency(results.monthlyPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Months</span>
                        <span className="text-white">{loanInput.termMonths}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Interest</span>
                        <span className="text-red-400">
                          {formatCurrency(results.totalInterest + results.interestSaved)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-900/20 rounded-lg border border-green-700">
                    <h5 className="text-sm font-semibold text-green-300 mb-3">With Extra</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monthly</span>
                        <span className="text-white">
                          {formatCurrency(results.monthlyPayment + loanInput.extraMonthlyPayment)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Months</span>
                        <span className="text-green-400">{results.monthsToPayoff}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Interest</span>
                        <span className="text-green-400">{formatCurrency(results.totalInterest)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-700/30 rounded-lg border border-slate-600 text-center">
                <PiggyBank className="h-12 w-12 mx-auto mb-3 text-slate-500" />
                <h4 className="font-semibold text-white mb-2">Add Extra Payments</h4>
                <p className="text-sm text-slate-400 mb-4">
                  Enter an extra monthly payment amount in the Calculator tab to see how much you
                  could save on interest and time.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("calculator")}
                  className="border-slate-600"
                >
                  Go to Calculator
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
     </Card>
  );
});

export default LoanCalculator;

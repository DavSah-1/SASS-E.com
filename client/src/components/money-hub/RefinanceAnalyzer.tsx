import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RefreshCw,
  DollarSign,
  Percent,
  Calendar,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  PiggyBank,
} from "lucide-react";

interface CurrentLoan {
  remainingBalance: number;
  annualInterestRate: number;
  remainingMonths: number;
  monthlyPayment: number;
}

interface NewLoan {
  annualInterestRate: number;
  termMonths: number;
  closingCosts: number;
}

function calculateMonthlyPayment(principal: number, rate: number, months: number): number {
  if (rate === 0) return Math.round(principal / months);
  const monthlyRate = rate / 100 / 12;
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
  const denominator = Math.pow(1 + monthlyRate, months) - 1;
  return Math.round(principal * (numerator / denominator));
}

function calculateTotalInterest(principal: number, rate: number, months: number): number {
  const monthlyPayment = calculateMonthlyPayment(principal, rate, months);
  return (monthlyPayment * months) - principal;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function RefinanceAnalyzer() {
  const [currentLoan, setCurrentLoan] = useState<CurrentLoan>({
    remainingBalance: 2000000, // $20,000
    annualInterestRate: 8.5,
    remainingMonths: 48,
    monthlyPayment: 49300, // ~$493
  });
  
  const [newLoan, setNewLoan] = useState<NewLoan>({
    annualInterestRate: 5.5,
    termMonths: 48,
    closingCosts: 50000, // $500
  });
  
  const analysis = useMemo(() => {
    const { remainingBalance, annualInterestRate: currentRate, remainingMonths, monthlyPayment: currentPayment } = currentLoan;
    const { annualInterestRate: newRate, termMonths: newTermMonths, closingCosts } = newLoan;
    
    // Current loan remaining cost
    const currentRemainingPayments = currentPayment * remainingMonths;
    const currentRemainingInterest = currentRemainingPayments - remainingBalance;
    
    // New loan calculations (including closing costs in principal)
    const newPrincipal = remainingBalance + closingCosts;
    const newMonthlyPayment = calculateMonthlyPayment(newPrincipal, newRate, newTermMonths);
    const newTotalPayments = newMonthlyPayment * newTermMonths;
    const newTotalInterest = newTotalPayments - newPrincipal;
    
    // Savings calculations
    const monthlySavings = currentPayment - newMonthlyPayment;
    const totalSavings = currentRemainingPayments - newTotalPayments;
    
    // Break-even calculation (months to recoup closing costs through monthly savings)
    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : Infinity;
    
    // Recommendation
    let recommendation: "recommend" | "caution" | "not_recommended" = "not_recommended";
    let recommendationText = "";
    
    if (totalSavings > 0 && breakEvenMonths <= newTermMonths) {
      if (breakEvenMonths <= 12) {
        recommendation = "recommend";
        recommendationText = `Strong recommendation! You'll break even in just ${breakEvenMonths} months and save ${formatCurrency(totalSavings)} overall.`;
      } else if (breakEvenMonths <= 24) {
        recommendation = "recommend";
        recommendationText = `Good option. You'll break even in ${breakEvenMonths} months and save ${formatCurrency(totalSavings)} over the life of the loan.`;
      } else {
        recommendation = "caution";
        recommendationText = `Proceed with caution. While you'll save ${formatCurrency(totalSavings)} overall, it takes ${breakEvenMonths} months to break even. Make sure you'll keep the loan that long.`;
      }
    } else if (monthlySavings > 0 && totalSavings <= 0) {
      recommendation = "caution";
      recommendationText = `Lower monthly payment but higher total cost. You'll pay ${formatCurrency(Math.abs(totalSavings))} more overall due to the longer term.`;
    } else {
      recommendation = "not_recommended";
      recommendationText = `Not recommended. The new loan would cost you ${formatCurrency(Math.abs(totalSavings))} more than keeping your current loan.`;
    }
    
    return {
      currentRemainingPayments,
      currentRemainingInterest,
      newMonthlyPayment,
      newTotalPayments,
      newTotalInterest,
      monthlySavings,
      totalSavings,
      breakEvenMonths,
      recommendation,
      recommendationText,
    };
  }, [currentLoan, newLoan]);
  
  const updateCurrentLoan = (field: keyof CurrentLoan, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    if (field === "remainingBalance" || field === "monthlyPayment") {
      setCurrentLoan(prev => ({ ...prev, [field]: Math.round(numValue * 100) }));
    } else {
      setCurrentLoan(prev => ({ ...prev, [field]: numValue }));
    }
  };
  
  const updateNewLoan = (field: keyof NewLoan, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    if (field === "closingCosts") {
      setNewLoan(prev => ({ ...prev, [field]: Math.round(numValue * 100) }));
    } else {
      setNewLoan(prev => ({ ...prev, [field]: numValue }));
    }
  };
  
  return (
    <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <RefreshCw className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <CardTitle className="text-white">Refinance Analyzer</CardTitle>
            <CardDescription>
              Calculate if refinancing your loan makes financial sense
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Loan */}
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-400" />
              Current Loan
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-slate-400 text-xs">Remaining Balance</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    value={currentLoan.remainingBalance / 100}
                    onChange={(e) => updateCurrentLoan("remainingBalance", e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-slate-400 text-xs">Current Interest Rate (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    step="0.1"
                    value={currentLoan.annualInterestRate}
                    onChange={(e) => updateCurrentLoan("annualInterestRate", e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-slate-400 text-xs">Remaining Months</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    value={currentLoan.remainingMonths}
                    onChange={(e) => updateCurrentLoan("remainingMonths", e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-slate-400 text-xs">Current Monthly Payment</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    value={currentLoan.monthlyPayment / 100}
                    onChange={(e) => updateCurrentLoan("monthlyPayment", e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-600">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Remaining Cost</span>
                <span className="text-white font-semibold">
                  {formatCurrency(analysis.currentRemainingPayments)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-400">Remaining Interest</span>
                <span className="text-red-400">
                  {formatCurrency(analysis.currentRemainingInterest)}
                </span>
              </div>
            </div>
          </div>
          
          {/* New Loan */}
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-400" />
              New Loan Offer
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-slate-400 text-xs">New Interest Rate (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    step="0.1"
                    value={newLoan.annualInterestRate}
                    onChange={(e) => updateNewLoan("annualInterestRate", e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-slate-400 text-xs">New Term (months)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    value={newLoan.termMonths}
                    onChange={(e) => updateNewLoan("termMonths", e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-slate-400 text-xs">Closing Costs / Fees</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    value={newLoan.closingCosts / 100}
                    onChange={(e) => updateNewLoan("closingCosts", e.target.value)}
                    className="pl-9 bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-600">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">New Monthly Payment</span>
                <span className="text-white font-semibold">
                  {formatCurrency(analysis.newMonthlyPayment)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-400">New Total Cost</span>
                <span className="text-white">
                  {formatCurrency(analysis.newTotalPayments)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-400">New Total Interest</span>
                <span className="text-red-400">
                  {formatCurrency(analysis.newTotalInterest)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Analysis Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${
            analysis.monthlySavings > 0 
              ? "bg-green-900/30 border-green-600" 
              : "bg-red-900/30 border-red-600"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={`h-5 w-5 ${analysis.monthlySavings > 0 ? "text-green-400" : "text-red-400"}`} />
              <span className="text-slate-400 text-sm">Monthly Savings</span>
            </div>
            <p className={`text-2xl font-bold ${analysis.monthlySavings > 0 ? "text-green-400" : "text-red-400"}`}>
              {analysis.monthlySavings > 0 ? "+" : ""}{formatCurrency(analysis.monthlySavings)}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border ${
            analysis.totalSavings > 0 
              ? "bg-green-900/30 border-green-600" 
              : "bg-red-900/30 border-red-600"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className={`h-5 w-5 ${analysis.totalSavings > 0 ? "text-green-400" : "text-red-400"}`} />
              <span className="text-slate-400 text-sm">Total Savings</span>
            </div>
            <p className={`text-2xl font-bold ${analysis.totalSavings > 0 ? "text-green-400" : "text-red-400"}`}>
              {analysis.totalSavings > 0 ? "+" : ""}{formatCurrency(analysis.totalSavings)}
            </p>
          </div>
          
          <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Break-Even Point</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {analysis.breakEvenMonths === Infinity ? "N/A" : `${analysis.breakEvenMonths} months`}
            </p>
          </div>
        </div>
        
        {/* Recommendation */}
        <div className={`p-4 rounded-lg border ${
          analysis.recommendation === "recommend" 
            ? "bg-green-900/20 border-green-700"
            : analysis.recommendation === "caution"
            ? "bg-yellow-900/20 border-yellow-700"
            : "bg-red-900/20 border-red-700"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {analysis.recommendation === "recommend" ? (
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            ) : analysis.recommendation === "caution" ? (
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400" />
            )}
            <h4 className="font-semibold text-white">
              {analysis.recommendation === "recommend" 
                ? "Refinancing Recommended"
                : analysis.recommendation === "caution"
                ? "Proceed with Caution"
                : "Not Recommended"}
            </h4>
          </div>
          <p className="text-slate-300 text-sm">{analysis.recommendationText}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default RefinanceAnalyzer;

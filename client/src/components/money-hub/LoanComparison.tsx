import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Plus,
  Trash2,
  Trophy,
  DollarSign,
  Calendar,
  Percent,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";

interface LoanScenario {
  id: string;
  name: string;
  principal: number;
  annualInterestRate: number;
  termMonths: number;
}

interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

function calculateLoanResult(scenario: LoanScenario): LoanResult {
  const { principal, annualInterestRate, termMonths } = scenario;
  
  if (principal <= 0 || termMonths <= 0) {
    return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
  }
  
  if (annualInterestRate === 0) {
    const monthlyPayment = Math.round(principal / termMonths);
    return {
      monthlyPayment,
      totalPayment: principal,
      totalInterest: 0,
    };
  }
  
  const monthlyRate = annualInterestRate / 100 / 12;
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  const monthlyPayment = Math.round(principal * (numerator / denominator));
  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - principal;
  
  return { monthlyPayment, totalPayment, totalInterest };
}



const DEFAULT_SCENARIOS: LoanScenario[] = [
  { id: "1", name: "Option A", principal: 2500000, annualInterestRate: 6.5, termMonths: 48 },
  { id: "2", name: "Option B", principal: 2500000, annualInterestRate: 6.5, termMonths: 60 },
];

export function LoanComparison() {
  const { formatRaw, symbol: currencySymbol } = useCurrency();
  
  // Use currency context for formatting
  const formatCurrency = (cents: number): string => {
    return formatRaw(cents / 100);
  };
  
  const [scenarios, setScenarios] = useState<LoanScenario[]>(DEFAULT_SCENARIOS);
  
  const results = useMemo(() => {
    return scenarios.map(scenario => ({
      scenario,
      result: calculateLoanResult(scenario),
    }));
  }, [scenarios]);
  
  // Find best options
  const bestMonthlyPayment = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((best, curr) => 
      curr.result.monthlyPayment < best.result.monthlyPayment ? curr : best
    );
  }, [results]);
  
  const bestTotalCost = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((best, curr) => 
      curr.result.totalPayment < best.result.totalPayment ? curr : best
    );
  }, [results]);
  
  const addScenario = () => {
    if (scenarios.length >= 4) return;
    const newId = (Math.max(...scenarios.map(s => parseInt(s.id))) + 1).toString();
    setScenarios([...scenarios, {
      id: newId,
      name: `Option ${String.fromCharCode(65 + scenarios.length)}`,
      principal: 2500000,
      annualInterestRate: 6.5,
      termMonths: 60,
    }]);
  };
  
  const removeScenario = (id: string) => {
    if (scenarios.length <= 2) return;
    setScenarios(scenarios.filter(s => s.id !== id));
  };
  
  const updateScenario = (id: string, field: keyof LoanScenario, value: string | number) => {
    setScenarios(scenarios.map(s => {
      if (s.id !== id) return s;
      if (field === "name") return { ...s, name: value as string };
      
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(numValue)) return s;
      
      if (field === "principal") {
        return { ...s, principal: Math.round(numValue * 100) };
      }
      return { ...s, [field]: numValue };
    }));
  };
  
  return (
    <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Scale className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-white">Loan Comparison Tool</CardTitle>
              <CardDescription>
                Compare up to 4 loan scenarios side by side
              </CardDescription>
            </div>
          </div>
          {scenarios.length < 4 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addScenario}
              className="gap-2 border-purple-600 text-purple-400 hover:bg-purple-600/20"
            >
              <Plus className="h-4 w-4" />
              Add Scenario
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Inputs */}
        <div className={`grid gap-4 ${scenarios.length === 2 ? 'grid-cols-1 md:grid-cols-2' : scenarios.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Input
                  value={scenario.name}
                  onChange={(e) => updateScenario(scenario.id, "name", e.target.value)}
                  className="font-semibold text-white bg-transparent border-none p-0 h-auto text-lg focus-visible:ring-0"
                />
                {scenarios.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeScenario(scenario.id)}
                    className="text-slate-400 hover:text-red-400 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-slate-400 text-xs">Loan Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{currencySymbol}</span>
                    <Input
                      type="number"
                      value={scenario.principal / 100}
                      onChange={(e) => updateScenario(scenario.id, "principal", e.target.value)}
                      className="pl-9 bg-slate-800 border-slate-600"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-slate-400 text-xs">Interest Rate (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      step="0.1"
                      value={scenario.annualInterestRate}
                      onChange={(e) => updateScenario(scenario.id, "annualInterestRate", parseFloat(e.target.value) || 0)}
                      className="pl-9 bg-slate-800 border-slate-600"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-slate-400 text-xs">Term (months)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      value={scenario.termMonths}
                      onChange={(e) => updateScenario(scenario.id, "termMonths", parseInt(e.target.value) || 0)}
                      className="pl-9 bg-slate-800 border-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Results Comparison */}
        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Comparison Results</h3>
          
          <div className={`grid gap-4 ${scenarios.length === 2 ? 'grid-cols-1 md:grid-cols-2' : scenarios.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
            {results.map(({ scenario, result }) => {
              const isBestMonthly = bestMonthlyPayment?.scenario.id === scenario.id;
              const isBestTotal = bestTotalCost?.scenario.id === scenario.id;
              
              return (
                <div
                  key={scenario.id}
                  className={`p-4 rounded-lg border ${
                    isBestTotal
                      ? "bg-green-900/30 border-green-600"
                      : "bg-slate-700/30 border-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-white">{scenario.name}</h4>
                    <div className="flex gap-1">
                      {isBestMonthly && (
                        <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 text-xs">
                          Lowest Payment
                        </Badge>
                      )}
                      {isBestTotal && (
                        <Badge variant="secondary" className="bg-green-600/20 text-green-400 text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          Best Value
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Monthly Payment</span>
                      <span className={`font-bold ${isBestMonthly ? "text-blue-400" : "text-white"}`}>
                        {formatCurrency(result.monthlyPayment)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Total Interest</span>
                      <span className="text-red-400 font-semibold">
                        {formatCurrency(result.totalInterest)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                      <span className="text-slate-400 text-sm">Total Cost</span>
                      <span className={`font-bold text-lg ${isBestTotal ? "text-green-400" : "text-white"}`}>
                        {formatCurrency(result.totalPayment)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-slate-400 pt-2">
                      {scenario.termMonths} months @ {scenario.annualInterestRate}% APR
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Savings Summary */}
        {results.length >= 2 && bestTotalCost && (
          <div className="p-4 bg-green-900/20 rounded-lg border border-green-700">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <h4 className="font-semibold text-white">Recommendation</h4>
            </div>
            <p className="text-slate-300 text-sm">
              <strong className="text-green-400">{bestTotalCost.scenario.name}</strong> offers the best overall value, 
              saving you{" "}
              <strong className="text-green-400">
                {formatCurrency(
                  Math.max(...results.map(r => r.result.totalPayment)) - bestTotalCost.result.totalPayment
                )}
              </strong>{" "}
              compared to the most expensive option.
              {bestMonthlyPayment && bestMonthlyPayment.scenario.id !== bestTotalCost.scenario.id && (
                <span>
                  {" "}However, if monthly cash flow is a priority, <strong className="text-blue-400">{bestMonthlyPayment.scenario.name}</strong> has the lowest monthly payment.
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LoanComparison;

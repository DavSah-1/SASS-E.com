import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Percent, Plus, Trash2, TrendingDown, Calendar, Zap, Mountain } from "lucide-react";

interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
}

interface PayoffResult {
  method: string;
  monthsToPayoff: number;
  totalInterest: number;
  payoffSchedule: Array<{
    month: number;
    debtName: string;
    payment: number;
    remainingBalance: number;
  }>;
}

export function DebtPayoffSimulator() {
  const [debts, setDebts] = useState<Debt[]>([
    { id: "1", name: "Credit Card A", balance: 3000, interestRate: 22, minimumPayment: 90 },
    { id: "2", name: "Credit Card B", balance: 8000, interestRate: 18, minimumPayment: 240 },
    { id: "3", name: "Car Loan", balance: 12000, interestRate: 6, minimumPayment: 350 },
  ]);
  const [extraPayment, setExtraPayment] = useState<string>("300");
  const [calculated, setCalculated] = useState(false);
  const [snowballResult, setSnowballResult] = useState<PayoffResult | null>(null);
  const [avalancheResult, setAvalancheResult] = useState<PayoffResult | null>(null);

  const addDebt = () => {
    const newDebt: Debt = {
      id: Date.now().toString(),
      name: `Debt ${debts.length + 1}`,
      balance: 0,
      interestRate: 0,
      minimumPayment: 0,
    };
    setDebts([...debts, newDebt]);
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  const updateDebt = (id: string, field: keyof Debt, value: string | number) => {
    setDebts(
      debts.map((d) =>
        d.id === id ? { ...d, [field]: typeof value === "string" ? value : value } : d
      )
    );
  };

  const calculatePayoff = (method: "snowball" | "avalanche"): PayoffResult => {
    let extra = parseFloat(extraPayment) || 0;
    let debtsCopy = debts.map((d) => ({ ...d }));
    
    // Sort debts based on method
    if (method === "snowball") {
      debtsCopy.sort((a, b) => a.balance - b.balance);
    } else {
      debtsCopy.sort((a, b) => b.interestRate - a.interestRate);
    }

    let month = 0;
    let totalInterest = 0;
    const schedule: Array<{
      month: number;
      debtName: string;
      payment: number;
      remainingBalance: number;
    }> = [];

    while (debtsCopy.some((d) => d.balance > 0)) {
      month++;
      let availableExtra = extra;

      // Apply minimum payments and interest to all debts
      debtsCopy.forEach((debt) => {
        if (debt.balance > 0) {
          const monthlyInterest = (debt.balance * (debt.interestRate / 100)) / 12;
          totalInterest += monthlyInterest;
          debt.balance += monthlyInterest;

          const payment = Math.min(debt.minimumPayment, debt.balance);
          debt.balance -= payment;
        }
      });

      // Apply extra payment to first debt with balance
      for (const debt of debtsCopy) {
        if (debt.balance > 0 && availableExtra > 0) {
          const extraApplied = Math.min(availableExtra, debt.balance);
          debt.balance -= extraApplied;
          availableExtra -= extraApplied;

          schedule.push({
            month,
            debtName: debt.name,
            payment: debt.minimumPayment + extraApplied,
            remainingBalance: Math.max(0, debt.balance),
          });

          if (debt.balance <= 0) {
            // Debt paid off, add its minimum to extra payment for next debt
            extra += debt.minimumPayment;
          }
          break;
        }
      }

      // Safety check to prevent infinite loops
      if (month > 600) break;
    }

    return {
      method,
      monthsToPayoff: month,
      totalInterest,
      payoffSchedule: schedule,
    };
  };

  const runSimulation = () => {
    const snowball = calculatePayoff("snowball");
    const avalanche = calculatePayoff("avalanche");
    setSnowballResult(snowball);
    setAvalancheResult(avalanche);
    setCalculated(true);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMonths = (months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${months} months`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? "s" : ""}`;
    return `${years} year${years > 1 ? "s" : ""}, ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinimum = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-200">
            <TrendingDown className="h-5 w-5" />
            Debt Payoff Simulator
          </CardTitle>
          <CardDescription className="text-slate-300">
            Compare snowball vs avalanche methods and find your path to debt freedom
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Debt Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-yellow-200">Your Debts</h3>
              <Button
                onClick={addDebt}
                variant="outline"
                size="sm"
                className="border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Debt
              </Button>
            </div>

            {debts.map((debt, index) => (
              <Card key={debt.id} className="bg-slate-800/50 border-yellow-500/20">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        value={debt.name}
                        onChange={(e) => updateDebt(debt.id, "name", e.target.value)}
                        className="flex-1 bg-slate-700/50 border-yellow-500/20 text-white"
                        placeholder="Debt name"
                      />
                      {debts.length > 1 && (
                        <Button
                          onClick={() => removeDebt(debt.id)}
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-slate-400">Balance ($)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            value={debt.balance}
                            onChange={(e) => updateDebt(debt.id, "balance", parseFloat(e.target.value) || 0)}
                            className="pl-8 bg-slate-700/50 border-yellow-500/20 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-slate-400">Interest Rate (%)</Label>
                        <div className="relative">
                          <Percent className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.1"
                            value={debt.interestRate}
                            onChange={(e) => updateDebt(debt.id, "interestRate", parseFloat(e.target.value) || 0)}
                            className="pl-8 bg-slate-700/50 border-yellow-500/20 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-slate-400">Minimum Payment ($)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            value={debt.minimumPayment}
                            onChange={(e) => updateDebt(debt.id, "minimumPayment", parseFloat(e.target.value) || 0)}
                            className="pl-8 bg-slate-700/50 border-yellow-500/20 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary and Extra Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-yellow-500/20">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Debt:</span>
                    <span className="font-semibold text-white">{formatCurrency(totalDebt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Minimum Payments:</span>
                    <span className="font-semibold text-white">{formatCurrency(totalMinimum)}/mo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="extraPayment" className="text-yellow-200">
                Extra Monthly Payment ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="extraPayment"
                  type="number"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(e.target.value)}
                  className="pl-9 bg-slate-800/50 border-yellow-500/30 text-white"
                  placeholder="300"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={runSimulation}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
            disabled={debts.length === 0 || totalDebt === 0}
          >
            Run Simulation
          </Button>

          {/* Results Section */}
          {calculated && snowballResult && avalancheResult && (
            <div className="space-y-4 pt-4 border-t border-yellow-500/20">
              <Tabs defaultValue="comparison" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                  <TabsTrigger value="comparison">Comparison</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="comparison" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Snowball Method */}
                    <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-200">
                          <Zap className="h-5 w-5" />
                          Debt Snowball
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Smallest balance first
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-center space-y-1">
                          <p className="text-sm text-slate-400">Time to Debt Freedom</p>
                          <p className="text-3xl font-bold text-blue-300">
                            {formatMonths(snowballResult.monthsToPayoff)}
                          </p>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm text-slate-400">Total Interest Paid</p>
                          <p className="text-2xl font-semibold text-white">
                            {formatCurrency(snowballResult.totalInterest)}
                          </p>
                        </div>
                        <Badge variant="outline" className="w-full justify-center border-blue-500/30 text-blue-200">
                          Quick psychological wins
                        </Badge>
                      </CardContent>
                    </Card>

                    {/* Avalanche Method */}
                    <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-200">
                          <Mountain className="h-5 w-5" />
                          Debt Avalanche
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          Highest interest first
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-center space-y-1">
                          <p className="text-sm text-slate-400">Time to Debt Freedom</p>
                          <p className="text-3xl font-bold text-green-300">
                            {formatMonths(avalancheResult.monthsToPayoff)}
                          </p>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm text-slate-400">Total Interest Paid</p>
                          <p className="text-2xl font-semibold text-white">
                            {formatCurrency(avalancheResult.totalInterest)}
                          </p>
                        </div>
                        <Badge variant="outline" className="w-full justify-center border-green-500/30 text-green-200">
                          Maximum interest savings
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Savings Comparison */}
                  {snowballResult.totalInterest !== avalancheResult.totalInterest && (
                    <Card className="bg-yellow-900/20 border-yellow-500/30">
                      <CardContent className="pt-4">
                        <div className="text-center space-y-2">
                          <p className="text-sm text-yellow-200">
                            💰 Avalanche Method Saves You
                          </p>
                          <p className="text-3xl font-bold text-yellow-400">
                            {formatCurrency(Math.abs(snowballResult.totalInterest - avalancheResult.totalInterest))}
                          </p>
                          <p className="text-sm text-slate-400">
                            in interest over {Math.abs(snowballResult.monthsToPayoff - avalancheResult.monthsToPayoff)} fewer months
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-yellow-200">Payoff Order</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-300 mb-2">Snowball (Smallest First)</p>
                        <ol className="space-y-1 text-sm text-slate-300">
                          {debts
                            .slice()
                            .sort((a, b) => a.balance - b.balance)
                            .map((d, i) => (
                              <li key={d.id}>
                                {i + 1}. {d.name} - {formatCurrency(d.balance)}
                              </li>
                            ))}
                        </ol>
                      </div>
                      <div>
                        <p className="text-sm text-green-300 mb-2">Avalanche (Highest Rate First)</p>
                        <ol className="space-y-1 text-sm text-slate-300">
                          {debts
                            .slice()
                            .sort((a, b) => b.interestRate - a.interestRate)
                            .map((d, i) => (
                              <li key={d.id}>
                                {i + 1}. {d.name} - {d.interestRate}% APR
                              </li>
                            ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  <strong>💡 Pro Tip:</strong> Try increasing your extra payment by $50-100 to see how much faster you can become debt-free. Even small increases can shave months off your timeline!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

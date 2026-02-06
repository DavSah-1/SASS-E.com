import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Calendar, Percent } from "lucide-react";

export function RetirementCalculator() {
  const [currentSavings, setCurrentSavings] = useState<string>("10000");
  const [monthlyContribution, setMonthlyContribution] = useState<string>("500");
  const [yearsUntilRetirement, setYearsUntilRetirement] = useState<string>("30");
  const [expectedReturn, setExpectedReturn] = useState<string>("7");
  const [calculated, setCalculated] = useState(false);

  // Calculation results
  const [futureValue, setFutureValue] = useState<number>(0);
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [annualIncome, setAnnualIncome] = useState<number>(0);

  const calculateRetirement = () => {
    const current = parseFloat(currentSavings) || 0;
    const monthly = parseFloat(monthlyContribution) || 0;
    const years = parseFloat(yearsUntilRetirement) || 0;
    const rate = (parseFloat(expectedReturn) || 0) / 100;

    // Calculate future value with compound interest
    // FV = PV(1+r)^n + PMT * [((1+r)^n - 1) / r]
    const monthlyRate = rate / 12;
    const months = years * 12;

    // Future value of current savings
    const fvCurrent = current * Math.pow(1 + monthlyRate, months);

    // Future value of monthly contributions (annuity)
    const fvContributions = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    const total = fvCurrent + fvContributions;
    const contributions = current + (monthly * months);
    const interest = total - contributions;

    // Calculate annual income using 4% rule
    const income = total * 0.04;

    setFutureValue(total);
    setTotalContributions(contributions);
    setTotalInterest(interest);
    setAnnualIncome(income);
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

  const formatPercent = (value: number): string => {
    return `${((value / futureValue) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-200">
            <TrendingUp className="h-5 w-5" />
            Retirement Savings Calculator
          </CardTitle>
          <CardDescription className="text-slate-300">
            Project your retirement nest egg and see the power of compound interest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentSavings" className="text-yellow-200">
                Current Savings ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentSavings"
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  className="pl-9 bg-slate-800/50 border-yellow-500/30 text-white"
                  placeholder="10000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyContribution" className="text-yellow-200">
                Monthly Contribution ($)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="monthlyContribution"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="pl-9 bg-slate-800/50 border-yellow-500/30 text-white"
                  placeholder="500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsUntilRetirement" className="text-yellow-200">
                Years Until Retirement
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="yearsUntilRetirement"
                  type="number"
                  value={yearsUntilRetirement}
                  onChange={(e) => setYearsUntilRetirement(e.target.value)}
                  className="pl-9 bg-slate-800/50 border-yellow-500/30 text-white"
                  placeholder="30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedReturn" className="text-yellow-200">
                Expected Annual Return (%)
              </Label>
              <div className="relative">
                <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="expectedReturn"
                  type="number"
                  step="0.1"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                  className="pl-9 bg-slate-800/50 border-yellow-500/30 text-white"
                  placeholder="7"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={calculateRetirement}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
          >
            Calculate My Retirement
          </Button>

          {/* Results Section */}
          {calculated && (
            <div className="space-y-4 pt-4 border-t border-yellow-500/20">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-400">Projected Retirement Savings</p>
                <p className="text-4xl font-bold text-yellow-400">
                  {formatCurrency(futureValue)}
                </p>
                <p className="text-sm text-slate-400">
                  After {yearsUntilRetirement} years at {expectedReturn}% annual return
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-800/50 border-yellow-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-1">
                      <p className="text-xs text-slate-400">Total Contributions</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(totalContributions)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatPercent(totalContributions)} of total
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-yellow-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-1">
                      <p className="text-xs text-slate-400">Interest Earned</p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatCurrency(totalInterest)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatPercent(totalInterest)} of total
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-yellow-500/20">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-1">
                      <p className="text-xs text-slate-400">Annual Income (4% Rule)</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {formatCurrency(annualIncome)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(annualIncome / 12)}/month
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Visual breakdown */}
              <div className="space-y-2">
                <p className="text-sm text-slate-400 text-center">Savings Breakdown</p>
                <div className="h-8 flex rounded-lg overflow-hidden">
                  <div
                    className="bg-yellow-500 flex items-center justify-center text-xs font-semibold text-slate-900"
                    style={{ width: formatPercent(totalContributions) }}
                  >
                    {totalContributions > futureValue * 0.15 && "Contributions"}
                  </div>
                  <div
                    className="bg-green-500 flex items-center justify-center text-xs font-semibold text-slate-900"
                    style={{ width: formatPercent(totalInterest) }}
                  >
                    {totalInterest > futureValue * 0.15 && "Interest"}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Your money: {formatCurrency(totalContributions)}</span>
                  <span>Compound interest: {formatCurrency(totalInterest)}</span>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  <strong>💡 Pro Tip:</strong> Try increasing your monthly contribution by just $100 to see the dramatic impact on your retirement savings. Small increases today create massive differences decades from now!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

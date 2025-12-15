import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Download } from "lucide-react";

type ChartType = "line" | "bar" | "pie";

export function SpendingTrendsChart() {
  const { symbol: currencySymbol, formatRaw } = useCurrency();
  const [chartType, setChartType] = useState<ChartType>("line");
  const [monthsBack, setMonthsBack] = useState(6);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);
  
  const startMonth = startDate.toISOString().slice(0, 7);
  const endMonth = endDate.toISOString().slice(0, 7);

  // Fetch spending trends data
  const { data: trendsData, isLoading: trendsLoading } = trpc.budget.getSpendingTrends.useQuery({
    startMonth,
    endMonth,
    categoryId: selectedCategoryId,
  });

  // Fetch spending trends summary
  const { data: summaryData, isLoading: summaryLoading } = trpc.budget.getSpendingTrendsSummary.useQuery({
    months: monthsBack,
  });

  // Fetch categories for filter
  const { data: categories } = trpc.budget.getCategories.useQuery({});

  const isLoading = trendsLoading || summaryLoading;

  // Prepare data for line/bar charts (monthly spending)
  const monthlyChartData = trendsData?.map((trend) => ({
    month: new Date(trend.month + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    expenses: trend.totalSpending / 100,
    income: trend.totalIncome / 100,
    net: (trend.totalIncome - trend.totalSpending) / 100,
  })) || [];

  // Prepare data for pie chart (category breakdown for latest month)
  const latestMonthData = trendsData && trendsData.length > 0 ? trendsData[trendsData.length - 1] : null;
  const categoryPieData = latestMonthData?.categories
    .filter((c) => c.category.type === "expense")
    .map((c) => ({
      name: `${c.category.icon} ${c.category.name}`,
      value: c.total / 100,
      color: c.category.color,
    })) || [];

  // Calculate trend indicators
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, direction: "stable" as const };
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(Math.round(change * 10) / 10),
      direction: change > 5 ? "up" as const : change < -5 ? "down" as const : "stable" as const,
    };
  };

  const expenseTrend = summaryData && summaryData.trends.length >= 2
    ? calculateTrend(
        summaryData.trends[summaryData.trends.length - 1].expenses,
        summaryData.trends[summaryData.trends.length - 2].expenses
      )
    : null;

  const exportData = () => {
    const csv = [
      ["Month", "Income", "Expenses", "Net Cash Flow"],
      ...monthlyChartData.map((d) => [d.month, d.income, d.expenses, d.net]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spending-trends-${startMonth}-to-${endMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Monthly Income</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {formatRaw(summaryData.summary.avgMonthlyIncome / 100)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Monthly Expenses</CardDescription>
              <CardTitle className="text-2xl text-red-600 flex items-center gap-2">
                {formatRaw(summaryData.summary.avgMonthlyExpenses / 100)}
                {expenseTrend && (
                  <span className="text-sm flex items-center gap-1">
                    {expenseTrend.direction === "up" && <TrendingUp className="h-4 w-4 text-red-500" />}
                    {expenseTrend.direction === "down" && <TrendingDown className="h-4 w-4 text-green-500" />}
                    {expenseTrend.direction === "stable" && <Minus className="h-4 w-4 text-gray-500" />}
                    {expenseTrend.percentage}%
                  </span>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Savings Rate</CardDescription>
              <CardTitle className="text-2xl text-blue-600">
                {summaryData.summary.avgSavingsRate.toFixed(1)}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>
                Track your spending patterns over time
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>

              <Select value={monthsBack.toString()} onValueChange={(v) => setMonthsBack(parseInt(v))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Last 3 Months</SelectItem>
                  <SelectItem value="6">Last 6 Months</SelectItem>
                  <SelectItem value="12">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>

              {categories && categories.length > 0 && (
                <Select
                  value={selectedCategoryId?.toString() || "all"}
                  onValueChange={(v) => setSelectedCategoryId(v === "all" ? undefined : parseInt(v))}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button variant="outline" size="sm" onClick={exportData} disabled={isLoading || monthlyChartData.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Loading chart data...
            </div>
          ) : monthlyChartData.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
              <p className="text-lg font-medium">No transaction data available</p>
              <p className="text-sm">Add some transactions to see your spending trends</p>
            </div>
          ) : (
            <div className="h-[400px]">
              {chartType === "line" && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${currencySymbol}${value}`} />
                    <Tooltip
                      formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, ""]}
                      labelStyle={{ color: "#000" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Income"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Expenses"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="net"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Net Cash Flow"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {chartType === "bar" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${currencySymbol}${value}`} />
                    <Tooltip
                      formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, ""]}
                      labelStyle={{ color: "#000" }}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" name="Income" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {chartType === "pie" && categoryPieData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${currencySymbol}${entry.value.toFixed(0)}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${currencySymbol}${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

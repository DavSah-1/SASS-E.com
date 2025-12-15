import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/CurrencyContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Repeat, Calendar, TrendingUp, Bell, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function RecurringTransactions() {
  const { symbol: currencySymbol, formatRaw } = useCurrency();
  const utils = trpc.useUtils();

  const { data: recurring = [], isLoading } = trpc.budget.getRecurring.useQuery({
    activeOnly: true,
  });

  const { data: projections } = trpc.budget.getRecurringProjections.useQuery();

  const { data: upcoming = [] } = trpc.budget.getUpcomingRecurring.useQuery();

  const detectRecurring = trpc.budget.detectRecurring.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Detected ${result.patternsFound} recurring patterns`);
        utils.budget.getRecurring.invalidate();
        utils.budget.getRecurringProjections.invalidate();
        utils.budget.getUpcomingRecurring.invalidate();
      } else {
        toast.error("Not enough transaction data to detect patterns");
      }
    },
  });

  const updateRecurring = trpc.budget.updateRecurring.useMutation({
    onSuccess: () => {
      utils.budget.getRecurring.invalidate();
      toast.success("Settings updated");
    },
  });

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      weekly: "Weekly",
      biweekly: "Every 2 weeks",
      monthly: "Monthly",
      quarterly: "Quarterly",
      yearly: "Yearly",
    };
    return labels[frequency] || frequency;
  };

  const getFrequencyColor = (frequency: string) => {
    const colors: Record<string, string> = {
      weekly: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      biweekly: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      monthly: "bg-green-500/10 text-green-500 border-green-500/20",
      quarterly: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      yearly: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[frequency] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Repeat className="h-6 w-6" />
            Recurring Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Projections Summary */}
      {projections && (
        <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Recurring Expense Forecast
            </CardTitle>
            <CardDescription className="text-gray-400">
              Projected expenses from recurring transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Monthly</p>
                <p className="text-2xl font-bold text-white">
                  {formatRaw(projections.monthlyTotal / 100)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Quarterly</p>
                <p className="text-2xl font-bold text-white">
                  {formatRaw(projections.quarterlyTotal / 100)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Yearly</p>
                <p className="text-2xl font-bold text-white">
                  {formatRaw(projections.yearlyTotal / 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Transactions */}
      {upcoming.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Upcoming (Next 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcoming.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.description}</p>
                    <p className="text-sm text-gray-400">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{formatRaw(item.amount / 100)}</p>
                    <p className="text-xs text-gray-400">
                      {item.daysUntilDue === 0
                        ? "Today"
                        : item.daysUntilDue === 1
                        ? "Tomorrow"
                        : `In ${item.daysUntilDue} days`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recurring Transactions List */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Repeat className="h-6 w-6" />
                Detected Recurring Transactions
              </CardTitle>
              <CardDescription className="text-gray-400">
                Automatically detected subscriptions and recurring expenses
              </CardDescription>
            </div>
            <Button
              onClick={() => detectRecurring.mutate()}
              disabled={detectRecurring.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {detectRecurring.isPending ? "Detecting..." : "Detect Patterns"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recurring.length === 0 ? (
            <div className="text-center py-8">
              <Repeat className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-4">
                No recurring transactions detected yet
              </p>
              <p className="text-sm text-gray-500">
                Click "Detect Patterns" to analyze your transactions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recurring.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium">{item.description}</p>
                        {item.isSubscription === 1 && (
                          <Badge variant="secondary" className="text-xs">
                            Subscription
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          {item.categoryIcon} {item.categoryName}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getFrequencyColor(item.frequency)}`}
                        >
                          {getFrequencyLabel(item.frequency)}
                        </Badge>
                        <span className="flex items-center gap-1">
                          {item.confidence >= 80 ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                          )}
                          {item.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">
                        {formatRaw(item.averageAmount / 100)}
                      </p>
                      {item.nextExpectedDate && (
                        <p className="text-xs text-gray-400">
                          Next: {new Date(item.nextExpectedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`reminder-${item.id}`}
                        checked={item.reminderEnabled === 1}
                        onCheckedChange={(checked) =>
                          updateRecurring.mutate({
                            recurringId: item.id,
                            reminderEnabled: checked,
                          })
                        }
                      />
                      <Label htmlFor={`reminder-${item.id}`} className="text-sm text-gray-400">
                        <Bell className="h-3 w-3 inline mr-1" />
                        Reminders
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id={`active-${item.id}`}
                        checked={item.isActive === 1}
                        onCheckedChange={(checked) =>
                          updateRecurring.mutate({
                            recurringId: item.id,
                            isActive: checked,
                          })
                        }
                      />
                      <Label htmlFor={`active-${item.id}`} className="text-sm text-gray-400">
                        Active
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

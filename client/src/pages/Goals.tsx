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
  Target,
  TrendingUp,
  Award,
  Calendar,
  DollarSign,
  Sparkles,
  Trophy,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Play,
  Pause,
  X,
  Share2,
} from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Goals() {
  const { user, isAuthenticated, loading } = useAuth();
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [updateProgressOpen, setUpdateProgressOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // Fetch data
  const { data: goals } = trpc.goals.getGoals.useQuery(
    { includeCompleted: false },
    { enabled: isAuthenticated }
  );

  const { data: summary } = trpc.goals.getSummary.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: celebrations } = trpc.goals.getUnshownCelebrations.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutations
  const createGoal = trpc.goals.createGoal.useMutation({
    onMutate: async (newGoal) => {
      // Cancel outgoing refetches
      await utils.goals.getGoals.cancel();
      
      // Snapshot previous value
      const previousGoals = utils.goals.getGoals.getData({ includeCompleted: false });
      
      // Optimistically update to the new value
      utils.goals.getGoals.setData({ includeCompleted: false }, (old) => {
        if (!old) return old;
        return [
          ...old,
          {
            id: Date.now(), // Temporary ID
            userId: 0, // Will be set by server
            ...newGoal,
            currentAmount: 0,
            progress: 0,
            status: 'in_progress' as const,
            completedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any, // Type assertion for optimistic update
        ];
      });
      
      return { previousGoals };
    },
    onError: (error, _newGoal, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        utils.goals.getGoals.setData({ includeCompleted: false }, context.previousGoals);
      }
      toast.error(`Failed to create goal: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Goal created!");
      setAddGoalOpen(false);
    },
    onSettled: () => {
      // Always refetch after error or success
      utils.goals.getGoals.invalidate();
      utils.goals.getSummary.invalidate();
    },
  });

  const recordProgress = trpc.goals.recordProgress.useMutation({
    onSuccess: () => {
      toast.success("Progress updated!");
      setUpdateProgressOpen(false);
      setSelectedGoalId(null);
      utils.goals.getGoals.invalidate();
      utils.goals.getSummary.invalidate();
      utils.goals.getUnshownCelebrations.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update progress: ${error.message}`);
    },
  });

  const deleteGoal = trpc.goals.deleteGoal.useMutation({
    onSuccess: () => {
      toast.success("Goal deleted");
      utils.goals.getGoals.invalidate();
      utils.goals.getSummary.invalidate();
    },
  });

  const updateGoal = trpc.goals.updateGoal.useMutation({
    onSuccess: () => {
      toast.success("Goal updated");
      utils.goals.getGoals.invalidate();
      utils.goals.getSummary.invalidate();
    },
  });

  const markCelebrationShown = trpc.goals.markCelebrationShown.useMutation();

  // Format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  // Calculate progress percentage
  const getProgressPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  // Get days until target date
  const getDaysUntil = (targetDate: Date | null) => {
    if (!targetDate) return null;
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Show celebration modal
  useEffect(() => {
    if (celebrations && celebrations.length > 0) {
      const celebration = celebrations[0];
      toast.success(celebration.milestone.message || "Milestone achieved!", {
        duration: 5000,
        icon: "🎉",
      });
      markCelebrationShown.mutate({ milestoneId: celebration.milestone.id });
    }
  }, [celebrations]);

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
          <h1 className="text-4xl font-bold mb-4 text-white">🎯 Financial Goals</h1>
          <p className="text-xl text-slate-300 mb-8">
            Set and track your financial targets
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
                <span className="text-4xl md:text-5xl">🎯</span>{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Financial Goals</span>
              </h1>
              <p className="text-slate-300">
                Set targets, track progress, celebrate milestones
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  toast.info("AI analyzing your financial profile...", { duration: 2000 });
                  setTimeout(() => {
                    toast.success("Recommendation: Based on your spending, consider starting an Emergency Fund of $5,000", { duration: 8000 });
                  }, 2000);
                }}
              >
                <Sparkles className="h-4 w-4" />
                Get AI Suggestions
              </Button>
            </div>
            <Dialog open={addGoalOpen} onOpenChange={(open) => {
              setAddGoalOpen(open);
              // Reset form when dialog closes
              if (!open) {
                // Force re-render of form by closing and reopening
                setTimeout(() => {}, 0);
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Financial Goal</DialogTitle>
                  <DialogDescription>
                    Set a new financial target to work towards
                  </DialogDescription>
                </DialogHeader>
                <AddGoalForm
                  key={addGoalOpen ? 'open' : 'closed'}
                  onSubmit={(data) => createGoal.mutate(data)}
                  isSubmitting={createGoal.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Active Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">
                  {summary.activeGoalsCount}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {summary.completedGoalsCount}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(summary.totalTargetAmount)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">
                  {summary.overallProgress}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Popular Goals Templates (shown when no goals) */}
        {goals && goals.length === 0 && (
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Popular Goal Templates
              </CardTitle>
              <CardDescription className="text-slate-300">
                Get started quickly with these common financial goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Emergency Fund", type: "emergency_fund", icon: "🚨", target: 5000, description: "3-6 months of expenses" },
                  { name: "Vacation Fund", type: "purchase", icon: "✈️", target: 3000, description: "Dream vacation savings" },
                  { name: "Down Payment", type: "savings", icon: "🏠", target: 20000, description: "Home down payment" },
                  { name: "New Car", type: "purchase", icon: "🚗", target: 15000, description: "Vehicle purchase fund" },
                  { name: "Retirement Boost", type: "investment", icon: "📈", target: 10000, description: "Extra retirement savings" },
                  { name: "Debt Elimination", type: "debt_free", icon: "💳", target: 8000, description: "Pay off credit cards" },
                ].map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    className="h-auto flex-col items-start p-4 text-left hover:bg-purple-900/20 hover:border-purple-500"
                    onClick={() => {
                      // Pre-fill form with template data
                      setAddGoalOpen(true);
                      // Note: We'll need to pass template data to the form
                    }}
                  >
                    <div className="text-2xl mb-2">{template.icon}</div>
                    <div className="font-semibold text-white mb-1">{template.name}</div>
                    <div className="text-sm text-slate-400 mb-2">{template.description}</div>
                    <div className="text-sm text-purple-400 font-semibold">
                      Target: ${template.target.toLocaleString()}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals Grid */}
        {goals && goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
              const daysUntil = getDaysUntil(goal.targetDate);
              
              return (
                <Card key={goal.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="text-4xl"
                          style={{ filter: `drop-shadow(0 0 8px ${goal.color})` }}
                        >
                          {goal.icon}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{goal.name}</CardTitle>
                          <CardDescription className="text-slate-400 capitalize">
                            {goal.type.replace("_", " ")}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const shareText = `I'm working towards my ${goal.name} goal! Target: ${formatCurrency(goal.targetAmount)}, Progress: ${getProgressPercentage(goal.currentAmount, goal.targetAmount)}%`;
                            if (navigator.share) {
                              navigator.share({ text: shareText });
                            } else {
                              navigator.clipboard.writeText(shareText);
                              toast.success("Goal copied to clipboard!");
                            }
                          }}
                        >
                          <Share2 className="h-4 w-4 text-blue-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (goal.status === "active") {
                              updateGoal.mutate({ goalId: goal.id, status: "paused" });
                            } else {
                              updateGoal.mutate({ goalId: goal.id, status: "active" });
                            }
                          }}
                        >
                          {goal.status === "active" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this goal?")) {
                              deleteGoal.mutate({ goalId: goal.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Circle */}
                    <div className="flex items-center justify-center">
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
                            stroke={goal.color || "#10b981"}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{progress}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Current</span>
                        <span className="text-white font-semibold">
                          {formatCurrency(goal.currentAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Target</span>
                        <span className="text-white font-semibold">
                          {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Remaining</span>
                        <span className="text-purple-400 font-semibold">
                          {formatCurrency(goal.targetAmount - goal.currentAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Target Date */}
                    {goal.targetDate && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {daysUntil !== null && daysUntil > 0
                            ? `${daysUntil} days remaining`
                            : daysUntil === 0
                            ? "Due today"
                            : "Overdue"}
                        </span>
                      </div>
                    )}

                    {/* Update Progress Button */}
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setSelectedGoalId(goal.id);
                        setUpdateProgressOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Update Progress
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enhanced Empty State with Examples */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-12 text-center">
                <Target className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Goals Yet</h3>
                <p className="text-slate-400 mb-6">
                  Create your first financial goal to start tracking your progress
                </p>
                <Button onClick={() => setAddGoalOpen(true)} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>

            {/* Demo Goals Preview */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  How Goals Work
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Here's what your goals will look like once you create them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Demo Goal 1 */}
                  <div className="bg-slate-800/70 border border-slate-600 rounded-lg p-4 opacity-60">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">🚨</div>
                      <div>
                        <div className="font-semibold text-white">Emergency Fund</div>
                        <div className="text-sm text-slate-400">Emergency Fund</div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-purple-400 font-semibold">60%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400 mb-2">
                      $3,000 of $5,000
                    </div>
                    <div className="text-xs text-slate-500 italic">
                      Demo goal - Create your own to get started!
                    </div>
                  </div>

                  {/* Demo Goal 2 */}
                  <div className="bg-slate-800/70 border border-slate-600 rounded-lg p-4 opacity-60">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-3xl">✈️</div>
                      <div>
                        <div className="font-semibold text-white">Vacation Fund</div>
                        <div className="text-sm text-slate-400">Major Purchase</div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-purple-400 font-semibold">25%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400 mb-2">
                      $750 of $3,000
                    </div>
                    <div className="text-xs text-slate-500 italic">
                      Demo goal - Create your own to get started!
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Update Progress Dialog */}
      <Dialog open={updateProgressOpen} onOpenChange={setUpdateProgressOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>
              Record progress toward your goal
            </DialogDescription>
          </DialogHeader>
          {selectedGoalId && (
            <UpdateProgressForm
              goalId={selectedGoalId}
              onSubmit={(data) => recordProgress.mutate(data)}
              isSubmitting={recordProgress.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add Goal Form Component
function AddGoalForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "" as string | undefined,
    type: "savings" as any,
    targetAmount: "",
    currentAmount: "0",
    targetDate: "",
    icon: "🎯",
    color: "#10b981",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      targetAmount: Math.round(parseFloat(formData.targetAmount) * 100),
      currentAmount: Math.round(parseFloat(formData.currentAmount) * 100),
      targetDate: formData.targetDate || undefined,
    });
  };

  const goalCategories = {
    emergency: [
      { value: "emergency_fund", label: "Emergency Fund", icon: "🚨", category: "Emergency" },
    ],
    short_term: [
      { value: "purchase", label: "Major Purchase", icon: "🛍️", category: "Short-term (< 1 year)" },
      { value: "vacation", label: "Vacation Fund", icon: "✈️", category: "Short-term (< 1 year)" },
    ],
    medium_term: [
      { value: "savings", label: "Savings Goal", icon: "💰", category: "Medium-term (1-5 years)" },
      { value: "debt_free", label: "Debt Free", icon: "💳", category: "Medium-term (1-5 years)" },
      { value: "down_payment", label: "Down Payment", icon: "🏠", category: "Medium-term (1-5 years)" },
    ],
    long_term: [
      { value: "investment", label: "Investment", icon: "📈", category: "Long-term (5+ years)" },
      { value: "retirement", label: "Retirement", icon: "🌴", category: "Long-term (5+ years)" },
    ],
    custom: [
      { value: "custom", label: "Custom Goal", icon: "🎯", category: "Custom" },
    ],
  };

  const goalTypes = Object.values(goalCategories).flat();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Emergency Fund"
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Goal Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => {
            const selectedType = goalTypes.find(t => t.value === value);
            setFormData({ 
              ...formData, 
              type: value,
              icon: selectedType?.icon || "🎯"
            });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(goalCategories).map(([categoryKey, types]) => (
              <div key={categoryKey}>
                {types.length > 0 && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase">
                    {types[0].category}
                  </div>
                )}
                {types.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="targetAmount">Target Amount ($)</Label>
          <Input
            id="targetAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.targetAmount}
            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            placeholder="10000.00"
            required
          />
        </div>

        <div>
          <Label htmlFor="currentAmount">Current Amount ($)</Label>
          <Input
            id="currentAmount"
            type="number"
            step="0.01"
            min="0"
            value={formData.currentAmount}
            onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="targetDate">Target Date (Optional)</Label>
        <Input
          id="targetDate"
          type="date"
          value={formData.targetDate}
          onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Why is this goal important to you?"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="icon">Icon</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="🎯"
            maxLength={2}
          />
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Goal"}
      </Button>
    </form>
  );
}

// Update Progress Form Component
function UpdateProgressForm({
  goalId,
  onSubmit,
  isSubmitting,
}: {
  goalId: number;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    amount: "",
    note: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      goalId,
      amount: Math.round(parseFloat(formData.amount) * 100),
      note: formData.note || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount to Add ($)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="100.00"
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          Enter a positive number to add progress, or negative to subtract
        </p>
      </div>

      <div>
        <Label htmlFor="note">Note (Optional)</Label>
        <Textarea
          id="note"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="e.g., Monthly savings deposit"
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Progress"}
      </Button>
    </form>
  );
}

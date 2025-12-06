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
} from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Goals() {
  const { user, isAuthenticated, loading } = useAuth();
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [updateProgressOpen, setUpdateProgressOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  // Fetch data
  const { data: goals, refetch: refetchGoals } = trpc.goals.getGoals.useQuery(
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
    onSuccess: () => {
      toast.success("Goal created!");
      setAddGoalOpen(false);
      refetchGoals();
    },
    onError: (error) => {
      toast.error(`Failed to create goal: ${error.message}`);
    },
  });

  const recordProgress = trpc.goals.recordProgress.useMutation({
    onSuccess: () => {
      toast.success("Progress updated!");
      setUpdateProgressOpen(false);
      setSelectedGoalId(null);
      refetchGoals();
    },
    onError: (error) => {
      toast.error(`Failed to update progress: ${error.message}`);
    },
  });

  const deleteGoal = trpc.goals.deleteGoal.useMutation({
    onSuccess: () => {
      toast.success("Goal deleted");
      refetchGoals();
    },
  });

  const updateGoal = trpc.goals.updateGoal.useMutation({
    onSuccess: () => {
      toast.success("Goal updated");
      refetchGoals();
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
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                🎯 Financial Goals
              </h1>
              <p className="text-slate-300">
                Set targets, track progress, celebrate milestones
              </p>
            </div>
            <Dialog open={addGoalOpen} onOpenChange={setAddGoalOpen}>
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
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-16 text-center">
              <Target className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Goals Yet</h3>
              <p className="text-slate-400 mb-6">
                Create your first financial goal to start tracking your progress
              </p>
              <Button onClick={() => setAddGoalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
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

  const goalTypes = [
    { value: "savings", label: "Savings Goal", icon: "💰" },
    { value: "debt_free", label: "Debt Free", icon: "💳" },
    { value: "emergency_fund", label: "Emergency Fund", icon: "🚨" },
    { value: "investment", label: "Investment", icon: "📈" },
    { value: "purchase", label: "Major Purchase", icon: "🛍️" },
    { value: "custom", label: "Custom Goal", icon: "🎯" },
  ];

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
            {goalTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.icon} {type.label}
              </SelectItem>
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

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Target, TrendingUp, Calendar, Sparkles, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import Confetti from "react-confetti";

export function GoalProgressTracker() {
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const utils = trpc.useUtils();

  const { data: goals = [], isLoading } = trpc.budget.getGoals.useQuery();

  const { data: uncelebratedMilestones = [] } = trpc.budget.getUncelebratedMilestones.useQuery();

  const markCelebrated = trpc.budget.markMilestoneCelebrated.useMutation({
    onSuccess: () => {
      utils.budget.getUncelebratedMilestones.invalidate();
    },
  });

  // Show celebration for uncelebrated milestones
  useEffect(() => {
    if (uncelebratedMilestones.length > 0 && !showCelebration) {
      const milestone = uncelebratedMilestones[0];
      setCelebrationMessage(milestone.milestone.message || "Milestone achieved!");
      setShowCelebration(true);

      // Mark as celebrated after showing
      setTimeout(() => {
        markCelebrated.mutate({ milestoneId: milestone.milestone.id });
      }, 3000);
    }
  }, [uncelebratedMilestones, showCelebration]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      paused: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status] || colors.active;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      savings: "💰",
      debt_free: "🎯",
      emergency_fund: "🛡️",
      investment: "📈",
      purchase: "🛍️",
      custom: "⭐",
    };
    return icons[type] || "🎯";
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-6 w-6" />
            Financial Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Loading goals...</p>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-6 w-6" />
            Financial Goals
          </CardTitle>
          <CardDescription className="text-gray-400">
            Set financial goals and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-4">No goals yet</p>
            <p className="text-sm text-gray-500">
              Create a goal to start tracking your financial progress
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Celebration Modal */}
      {showCelebration && (
        <>
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
          <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
            <DialogContent className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 border-purple-500/50">
              <DialogHeader>
                <DialogTitle className="text-white text-2xl flex items-center gap-2">
                  <PartyPopper className="h-8 w-8" />
                  Milestone Achieved!
                </DialogTitle>
                <DialogDescription className="text-gray-300 text-lg mt-4">
                  {celebrationMessage}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center py-6">
                <div className="text-6xl animate-bounce">🎉</div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-6 w-6" />
            Financial Goals
          </CardTitle>
          <CardDescription className="text-gray-400">
            Track your progress towards financial targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-6 bg-white/5 rounded-lg border border-white/10 space-y-4 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setSelectedGoalId(goal.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{goal.icon || getTypeIcon(goal.type)}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{goal.name}</h3>
                        {goal.description && (
                          <p className="text-sm text-gray-400">{goal.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(goal.status)}>
                    {goal.status}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-bold">
                      {goal.percentageComplete.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={goal.percentageComplete}
                    className="h-3"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                    }}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      ${(goal.currentAmount / 100).toFixed(2)} saved
                    </span>
                    <span className="text-gray-400">
                      ${(goal.targetAmount / 100).toFixed(2)} target
                    </span>
                  </div>
                </div>

                {/* Target Date */}
                {goal.targetDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                )}

                {/* Latest Milestone */}
                {goal.latestMilestone && (
                  <div className="flex items-center gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-purple-300">
                      {goal.latestMilestone.milestonePercentage}% milestone achieved!
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goal Details Modal */}
      {selectedGoalId && (
        <GoalDetailsModal
          goalId={selectedGoalId}
          onClose={() => setSelectedGoalId(null)}
        />
      )}
    </>
  );
}

function GoalDetailsModal({ goalId, onClose }: { goalId: number; onClose: () => void }) {
  const { data: stats, isLoading } = trpc.budget.getGoalStats.useQuery({ goalId });

  const generateInsights = trpc.budget.generateGoalInsights.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("AI insights generated!");
      } else {
        toast.error("Failed to generate insights");
      }
    },
  });

  if (isLoading || !stats) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border-indigo-500/50">
          <DialogHeader>
            <DialogTitle className="text-white">Loading...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const { goal, percentageComplete, remaining, avgMonthlyProgress, estimatedCompletionDate } =
    stats;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border-indigo-500/50">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center gap-3">
            <span className="text-4xl">{goal.icon}</span>
            {goal.name}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {goal.description || "Track your progress and get AI-powered insights"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Progress Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Current Progress</p>
              <p className="text-2xl font-bold text-white">
                ${(goal.currentAmount / 100).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {percentageComplete.toFixed(1)}% of ${(goal.targetAmount / 100).toFixed(2)}
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Remaining</p>
              <p className="text-2xl font-bold text-white">
                ${(remaining / 100).toFixed(2)}
              </p>
              {avgMonthlyProgress > 0 && (
                <p className="text-xs text-gray-500">
                  ~${(avgMonthlyProgress / 100).toFixed(2)}/month
                </p>
              )}
            </div>
          </div>

          {/* Estimated Completion */}
          {estimatedCompletionDate && (
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-green-400" />
                <p className="text-sm font-medium text-green-300">Estimated Completion</p>
              </div>
              <p className="text-lg text-white">
                {estimatedCompletionDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}

          {/* AI Insights Button */}
          <Button
            onClick={() => generateInsights.mutate({ goalId })}
            disabled={generateInsights.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {generateInsights.isPending ? "Generating..." : "Get AI Insights"}
          </Button>

          {/* Show AI Insights */}
          {generateInsights.data?.success && (
            <div className="space-y-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div>
                <p className="text-sm font-medium text-purple-300 mb-2">Prediction</p>
                <p className="text-white">{generateInsights.data.prediction}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-purple-300 mb-2">Motivational Message</p>
                <p className="text-white">{generateInsights.data.motivationalMessage}</p>
              </div>

              {generateInsights.data.recommendations && (
                <div>
                  <p className="text-sm font-medium text-purple-300 mb-2">Recommendations</p>
                  <ul className="space-y-2">
                    {generateInsights.data.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-white">
                        <span className="text-purple-400">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Coaching Dashboard - Displays AI-powered personalized recommendations
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Sparkles,
  Target,
  Apple,
  Brain,
  Moon,
  TrendingUp,
  X,
  Check,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  RefreshCw,
  Loader2,
} from "lucide-react";

const RECOMMENDATION_ICONS = {
  workout: Target,
  nutrition: Apple,
  mental_wellness: Brain,
  sleep: Moon,
  general: TrendingUp,
};

const PRIORITY_COLORS = {
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

interface CoachingDashboardProps {
  hasProfile?: boolean;
}

export function CoachingDashboard({ hasProfile = true }: CoachingDashboardProps = {}) {
  const [feedbackId, setFeedbackId] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");

  const recommendations = trpc.wellbeing.getCoachingRecommendations.useQuery();
  const generateMutation = trpc.wellbeing.generateCoaching.useMutation({
    onSuccess: (data) => {
      toast.success(`Generated ${data.count} new recommendations!`);
      recommendations.refetch();
    },
    onError: (error) => {
      toast.error("Failed to generate recommendations: " + error.message);
    },
  });

  const markViewedMutation = trpc.wellbeing.markRecommendationViewed.useMutation();
  const dismissMutation = trpc.wellbeing.dismissRecommendation.useMutation({
    onSuccess: () => {
      toast.success("Recommendation dismissed");
      recommendations.refetch();
    },
  });

  const completeMutation = trpc.wellbeing.completeRecommendation.useMutation({
    onSuccess: () => {
      toast.success("Great job! Keep up the momentum!");
      recommendations.refetch();
    },
  });

  const feedbackMutation = trpc.wellbeing.addCoachingFeedback.useMutation({
    onSuccess: () => {
      toast.success("Thanks for your feedback!");
      setFeedbackId(null);
      setFeedbackComment("");
    },
  });

  const handleDismiss = (id: number) => {
    dismissMutation.mutate({ id });
  };

  const handleComplete = (id: number) => {
    completeMutation.mutate({ id });
  };

  const handleFeedback = (id: number, helpful: boolean) => {
    feedbackMutation.mutate({
      recommendationId: id,
      helpful: helpful ? 1 : 0,
    });
  };

  const handleSubmitComment = (id: number) => {
    if (!feedbackComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    feedbackMutation.mutate({
      recommendationId: id,
      comment: feedbackComment,
    });
  };

  if (recommendations.isLoading) {
    return (
      <Card className="border-cyan-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show message if profile incomplete
  if (!hasProfile) {
    return (
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Your AI Coach
            </CardTitle>
          </div>
          <CardDescription>
            Complete your wellness profile to unlock personalized AI coaching
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const recs = recommendations.data || [];

  return (
    <div className="space-y-4">
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Your AI Coach
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="gap-2"
            >
              {generateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Generate New
            </Button>
          </div>
          <CardDescription>
            Personalized recommendations based on your goals, progress, and activity
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {recs.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
              <p className="text-sm text-slate-400 mb-4">
                Click "Generate New" to get personalized coaching based on your activity
              </p>
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Started
                  </>
                )}
              </Button>
            </div>
          ) : (
            recs.map((rec) => {
              const Icon = RECOMMENDATION_ICONS[rec.recommendationType as keyof typeof RECOMMENDATION_ICONS] || TrendingUp;
              const priorityClass = PRIORITY_COLORS[rec.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;

              return (
                <Card key={rec.id} className="border-slate-700 bg-slate-800/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-cyan-500/10">
                          <Icon className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base">{rec.title}</CardTitle>
                            <Badge variant="outline" className={priorityClass}>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{rec.content}</p>
                          <p className="text-xs text-slate-400 italic">💡 {rec.reasoning}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(rec.id)}
                        className="text-slate-400 hover:text-slate-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {rec.actionable === 1 && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleComplete(rec.id)}
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Mark as Done
                        </Button>
                        {rec.actionUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = rec.actionUrl!}
                          >
                            Take Action
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Feedback Section */}
                    <div className="border-t border-slate-700 pt-3">
                      {feedbackId === rec.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Share your thoughts on this recommendation..."
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            rows={2}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSubmitComment(rec.id)}
                              disabled={feedbackMutation.isPending}
                            >
                              Submit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setFeedbackId(null);
                                setFeedbackComment("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-400">Was this helpful?</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFeedback(rec.id, true)}
                            className="gap-1 text-slate-400 hover:text-green-400"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            Yes
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFeedback(rec.id, false)}
                            className="gap-1 text-slate-400 hover:text-red-400"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            No
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setFeedbackId(rec.id)}
                            className="gap-1 text-slate-400 hover:text-cyan-400"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Comment
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

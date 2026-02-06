import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, BookOpen, CheckCircle2, Target, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function LearnFinanceProgress() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: userStats, isLoading: statsLoading } = trpc.learnFinance.getUserStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: userBadges, isLoading: badgesLoading } = trpc.learnFinance.getUserBadges.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (loading || statsLoading || badgesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your progress...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your progress</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const completedArticles = userStats?.completedArticles || 0;
  const totalArticles = 57; // Total articles across all tiers
  const passedQuizzes = userStats?.passedQuizzes || 0;
  const passedAssessments = userStats?.passedAssessments || 0;
  const earnedBadges = userBadges || [];

  // Calculate tier-specific progress
  const tierProgress = [
    { tier: 1, name: "Financial Foundations", articles: 10, completed: 0 },
    { tier: 2, name: "Building Wealth", articles: 12, completed: 0 },
    { tier: 3, name: "Advanced Investing", articles: 7, completed: 0 },
    { tier: 4, name: "Tax & Estate Planning", articles: 10, completed: 0 },
    { tier: 5, name: "Life-Stage Planning", articles: 8, completed: 0 },
    { tier: 6, name: "Interactive Learning", articles: 2, completed: 0 },
    { tier: 7, name: "Behavioral Finance", articles: 7, completed: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/learn-finance">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learn Finance
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Your Learning Progress</h1>
          <p className="text-purple-200">Track your journey to financial mastery</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Articles Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{completedArticles}</div>
              <p className="text-purple-200 text-sm">out of {totalArticles}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Quizzes Passed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{passedQuizzes}</div>
              <p className="text-purple-200 text-sm">total passed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Assessments Passed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{passedAssessments}</div>
              <p className="text-purple-200 text-sm">out of 7 tiers</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4" />
                Badges Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{earnedBadges.length}</div>
              <p className="text-purple-200 text-sm">achievements</p>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress Bar */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Overall Progress
            </CardTitle>
            <CardDescription className="text-purple-200">
              {Math.round((completedArticles / totalArticles) * 100)}% of all articles completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={(completedArticles / totalArticles) * 100} 
              className="h-3"
            />
          </CardContent>
        </Card>

        {/* Tier Progress */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Tier Progress</CardTitle>
            <CardDescription className="text-purple-200">
              Track your progress through each learning tier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {tierProgress.map((tier) => (
              <div key={tier.tier} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-medium">
                      Tier {tier.tier}: {tier.name}
                    </h4>
                    <p className="text-purple-200 text-sm">
                      {tier.completed} / {tier.articles} articles completed
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {Math.round((tier.completed / tier.articles) * 100)}%
                  </Badge>
                </div>
                <Progress 
                  value={(tier.completed / tier.articles) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Earned Badges */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5" />
              Your Badges
            </CardTitle>
            <CardDescription className="text-purple-200">
              {earnedBadges.length > 0
                ? `You've earned ${earnedBadges.length} badge${earnedBadges.length > 1 ? 's' : ''}!`
                : "Complete quizzes and assessments to earn badges"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {earnedBadges.map((badge: any) => (
                  <div
                    key={badge.id}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-colors"
                  >
                    <div className="text-4xl mb-2">{badge.badge.icon}</div>
                    <h4 className="text-white font-medium text-sm mb-1">
                      {badge.badge.name}
                    </h4>
                    <p className="text-purple-200 text-xs">
                      {badge.badge.description}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className="mt-2 bg-white/20 text-white text-xs"
                    >
                      {badge.badge.tier}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-purple-200">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No badges earned yet. Keep learning to unlock achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

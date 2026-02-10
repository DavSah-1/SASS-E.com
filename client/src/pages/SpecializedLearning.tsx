import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useHubAccess } from "@/hooks/useHubAccess";
import { HubUpgradeModal } from "@/components/HubUpgradeModal";
import { TrialStatus } from "@/components/TrialStatus";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Calculator,
  Globe,
  Microscope,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Trophy,
  Target,
  Sparkles,
} from "lucide-react";
import { Footer } from "@/components/Footer";

export default function SpecializedLearning() {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Hub access control
  const hubAccess = useHubAccess("learning");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Check hub access and show modal if needed
  useEffect(() => {
    if (!loading && isAuthenticated && !hubAccess.hasAccess && !hubAccess.isAdmin) {
      setShowUpgradeModal(true);
    }
  }, [loading, isAuthenticated, hubAccess.hasAccess, hubAccess.isAdmin]);

  // Fetch progress data for all 4 learning paths
  const { data: financeStats } = trpc.learnFinance.getUserStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Placeholder for other learning path stats (to be implemented)
  const mathProgress = 0; // TODO: Implement math progress tracking
  const languageProgress = 0; // TODO: Implement language progress tracking
  const scienceProgress = 0; // TODO: Implement science progress tracking

  const learningPaths = [
    {
      id: "finance",
      title: "Learn Finance",
      emoji: "💰",
      description: "Master personal finance with practical lessons on budgeting, investing, and building wealth",
      href: "/hubs/learning/finance",
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-900/40 to-orange-900/40",
      hoverBgColor: "from-yellow-800/50 to-orange-800/50",
      borderColor: "border-yellow-500/30",
      hoverBorderColor: "border-yellow-400/60",
      textColor: "text-yellow-200",
      hoverTextColor: "text-yellow-100",
      accentColor: "text-yellow-400",
      progress: financeStats?.overallProgress || 0,
      stats: financeStats ? {
        completed: financeStats.completedArticles,
        total: financeStats.totalArticles,
        label: "Articles"
      } : null,
    },
    {
      id: "math",
      title: "Math Tutor",
      emoji: "🧮",
      description: "Step-by-step problem solving with detailed explanations across all math topics",
      href: "/hubs/learning/math",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-900/40 to-cyan-900/40",
      hoverBgColor: "from-blue-800/50 to-cyan-800/50",
      borderColor: "border-blue-500/30",
      hoverBorderColor: "border-blue-400/60",
      textColor: "text-blue-200",
      hoverTextColor: "text-blue-100",
      accentColor: "text-blue-400",
      progress: mathProgress,
      stats: null, // TODO: Add math stats
    },
    {
      id: "language",
      title: "Language Learning",
      emoji: "🌍",
      description: "Master new languages with interactive conversations, vocabulary practice, and cultural insights",
      href: "/hubs/learning/language",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-900/40 to-pink-900/40",
      hoverBgColor: "from-purple-800/50 to-pink-800/50",
      borderColor: "border-purple-500/30",
      hoverBorderColor: "border-purple-400/60",
      textColor: "text-purple-200",
      hoverTextColor: "text-purple-100",
      accentColor: "text-purple-400",
      progress: languageProgress,
      stats: null, // TODO: Add language stats
    },
    {
      id: "science",
      title: "Science Lab",
      emoji: "🧪",
      description: "Virtual experiments in physics, chemistry, and biology with step-by-step procedures and AI feedback",
      href: "/hubs/learning/science",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-900/40 to-emerald-900/40",
      hoverBgColor: "from-green-800/50 to-emerald-800/50",
      borderColor: "border-green-500/30",
      hoverBorderColor: "border-green-400/60",
      textColor: "text-green-200",
      hoverTextColor: "text-green-100",
      accentColor: "text-green-400",
      progress: scienceProgress,
      stats: null, // TODO: Add science stats
    },
  ];

  // Calculate overall learning progress
  const overallProgress = isAuthenticated
    ? Math.round(
        learningPaths.reduce((sum, path) => sum + path.progress, 0) / learningPaths.length
      )
    : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <div className="container mx-auto py-16 px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Learning Hub Access Required</h2>
          <p className="text-slate-300 mb-8">Please sign in to access the Learning Hub and all learning paths.</p>
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
            <a href={getLoginUrl()}>Sign In to Continue</a>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      {/* Hub Upgrade Modal */}
      <HubUpgradeModal 
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        hubId="learning"
        hubName="Learning Hub"
        currentTier={hubAccess.currentTier}
        reason={hubAccess.reason || ""}
      />

      <div className="container mx-auto py-16 px-4">
        {/* Trial Status Banner */}
        {hubAccess.trialStatus === "active" && hubAccess.trialDaysRemaining !== undefined && (
          <div className="mb-6">
            <TrialStatus
              hubName="Learning Hub"
              daysRemaining={hubAccess.trialDaysRemaining}
              expiresAt={new Date(Date.now() + hubAccess.trialDaysRemaining * 24 * 60 * 60 * 1000)}
            />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
            <span className="text-purple-400 font-semibold text-sm">LEARNING HUB</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-6xl md:text-7xl">🎓</span>{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">
              Learning Hub
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Master new skills with AI-powered learning experiences across finance, math, languages, and science
          </p>
          {!isAuthenticated && (
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-6 text-lg">
              <a href={getLoginUrl()}>
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          )}
        </div>

        {/* Overall Progress (for authenticated users) */}
        {isAuthenticated && (
          <div className="mb-12">
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-yellow-400" />
                      Your Learning Progress
                    </CardTitle>
                    <CardDescription className="text-slate-300 mt-2">
                      Keep up the great work! You're making progress across {learningPaths.filter(p => p.progress > 0).length} learning path{learningPaths.filter(p => p.progress > 0).length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-purple-400">{overallProgress}%</div>
                    <div className="text-sm text-slate-400">Overall</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={overallProgress} className="h-3" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Learning Paths Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center">🎯 Learning Paths</h2>
          <p className="text-slate-300 mb-8 text-center max-w-2xl mx-auto">
            Choose your learning path and start mastering new skills with structured lessons and interactive practice
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningPaths.map((path) => (
              <a
                key={path.id}
                href={path.href}
                className={`block p-8 bg-gradient-to-br ${path.bgColor} hover:${path.hoverBgColor} border-2 ${path.borderColor} hover:${path.hoverBorderColor} rounded-xl transition-all group`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-6xl">{path.emoji}</div>
                  <ArrowRight className={`h-6 w-6 ${path.accentColor} group-hover:translate-x-1 transition-transform`} />
                </div>

                {/* Title and Description */}
                <h3 className={`text-2xl font-bold ${path.textColor} group-hover:${path.hoverTextColor} mb-3 transition-colors`}>
                  {path.title}
                </h3>
                <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                  {path.description}
                </p>

                {/* Progress Section (for authenticated users) */}
                {isAuthenticated && (
                  <div className="space-y-3 mt-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Progress</span>
                        <span className={`font-semibold ${path.accentColor}`}>{path.progress}%</span>
                      </div>
                      <Progress value={path.progress} className="h-2" />
                    </div>

                    {/* Stats */}
                    {path.stats && (
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span>
                          {path.stats.completed} / {path.stats.total} {path.stats.label} Completed
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Call to Action */}
                <div className={`flex items-center text-sm ${path.accentColor} font-semibold mt-6`}>
                  <span>{isAuthenticated && path.progress > 0 ? "Continue Learning" : "Start Learning"}</span>
                  <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center">✨ Why Learn with SASS-E?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">AI-Powered Learning</CardTitle>
                <CardDescription className="text-slate-300">
                  Get personalized explanations and instant feedback powered by advanced AI technology
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Track Your Progress</CardTitle>
                <CardDescription className="text-slate-300">
                  Monitor your learning journey with detailed progress tracking and achievement badges
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Structured Curriculum</CardTitle>
                <CardDescription className="text-slate-300">
                  Follow carefully designed learning paths that build knowledge step by step
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="mt-20 text-center">
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30 max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-3xl text-white">Ready to Master New Skills?</CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  Join thousands of learners advancing their knowledge with AI-powered education
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 text-lg">
                  <a href={getLoginUrl()}>
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Badge } from "@/components/Badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Target, 
  Briefcase, 
  Calendar, 
  Brain,
  Search,
  Clock,
  Award,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  Lock
} from "lucide-react";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import TierAssessment from "@/components/TierAssessment";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

// Learning tier structure
const learningTiers = [
  {
    id: 1,
    name: "Foundational Literacy",
    description: "The essentials for beginners or those needing a reset",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    articles: 10
  },
  {
    id: 2,
    name: "Building Stability",
    description: "Focus on safety nets and financial security",
    icon: Shield,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
    articles: 8
  },
  {
    id: 3,
    name: "Growing Wealth",
    description: "Core concepts of long-term wealth building",
    icon: TrendingUp,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    articles: 12
  },
  {
    id: 4,
    name: "Advanced Topics",
    description: "Level up with optimization strategies",
    icon: Briefcase,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    articles: 10
  },
  {
    id: 5,
    name: "Life-Stage Guides",
    description: "Contextual content for major life events",
    icon: Calendar,
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950",
    articles: 8
  },
  {
    id: 6,
    name: "Interactive Learning",
    description: "Calculators, quizzes, and hands-on tools",
    icon: Target,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
    articles: 6
  },
  {
    id: 7,
    name: "Behavioral Finance",
    description: "Psychology and mindset for financial success",
    icon: Brain,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950",
    articles: 7
  }
];

// Sample articles for demonstration (fallback)
const sampleArticlesFallback = [
  {
    id: 1,
    tierId: 1,
    title: "Budgeting 101: The 50/30/20 Rule",
    slug: "budgeting-101-50-30-20-rule",
    summary: "Learn the simple budgeting method that actually works for everyday people",
    estimatedReadTime: 5,
    difficulty: "beginner" as const,
    tags: ["budgeting", "basics", "money-management"],
    progress: 0
  },
  {
    id: 2,
    tierId: 1,
    title: "Zero-Based Budgeting: Give Every Dollar a Job",
    slug: "zero-based-budgeting",
    summary: "Master the art of telling your money where to go instead of wondering where it went",
    estimatedReadTime: 7,
    difficulty: "beginner" as const,
    tags: ["budgeting", "planning"],
    progress: 100
  },
  {
    id: 3,
    tierId: 1,
    title: "Banking Basics: Choosing the Right Accounts",
    slug: "banking-basics",
    summary: "Stop paying unnecessary fees and start making your bank work for you",
    estimatedReadTime: 6,
    difficulty: "beginner" as const,
    tags: ["banking", "savings"],
    progress: 45
  }
];

// Badges Display Component
function BadgesDisplay() {
  const { data: allBadges } = trpc.learnFinance.getAllBadges.useQuery();
  const { data: userBadges } = trpc.learnFinance.getUserBadges.useQuery();

  if (!allBadges || allBadges.length === 0) {
    return <div className="text-slate-400 text-sm">No badges available yet</div>;
  }

  const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badgeId) || []);

  // Show first 6 badges (3 earned + 3 locked)
  const badgesToShow = allBadges.slice(0, 6);

  return (
    <>
      {badgesToShow.map(badge => {
        const isEarned = earnedBadgeIds.has(badge.id);
        const userBadge = userBadges?.find(ub => ub.badgeId === badge.id);

        return (
          <Badge
            key={badge.id}
            icon={badge.icon || "🏆"}
            name={badge.name}
            description={badge.description}
            tier={badge.tier as any}
            earnedAt={userBadge?.earnedAt}
            locked={!isEarned}
          />
        );
      })}
    </>
  );
}

export default function LearnFinance() {
  const { user, isAuthenticated } = useAuth();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch real articles from database
  const { data: articles, isLoading } = trpc.learnFinance.getArticles.useQuery();

  // Get user's tier progression status
  const { data: tierProgression } = trpc.learnFinance.getTierProgressionStatus.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  // Use real articles or fallback to sample data
  const sampleArticles = articles?.map((article, index) => ({
    id: article.id,
    tierId: 1, // All Tier 1 articles for now
    title: article.title,
    slug: article.slug,
    summary: article.summary || "",
    estimatedReadTime: article.readTime,
    difficulty: article.difficulty as "beginner" | "intermediate" | "advanced",
    tags: article.tags?.split(",") || [],
    completed: false,
    progress: 0
  })) || sampleArticlesFallback;

  const selectedTierData = learningTiers.find(t => t.id === selectedTier);
  const filteredArticles = sampleArticles.filter(
    article => article.tierId === selectedTier &&
    (searchQuery === "" || 
     article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     article.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Fetch real user stats from backend
  const { data: userStats, isLoading: statsLoading } = trpc.learnFinance.getUserStats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Use real data or fallback to defaults
  const completedArticles = userStats?.completedArticles ?? 0;
  const totalArticles = userStats?.totalArticles ?? 10;
  const passedQuizzes = userStats?.passedQuizzes ?? 0;
  const currentTierName = userStats?.currentTierName ?? (selectedTierData?.name || "Tier 1: Foundational");
  const studyStreak = userStats?.studyStreak ?? 0;
  const overallProgress = userStats?.overallProgress ?? 0;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-orange-950/30 via-yellow-950/20 to-amber-950/30">
      {/* Compact Header with Stats */}
      <div className="bg-gradient-to-b from-yellow-900/40 via-orange-900/30 to-yellow-950/20 border-b border-yellow-500/30">
        <div className="container py-8">
          {/* Title and Subtitle */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-yellow-200">
              Learn Finance
            </h1>
            <p className="text-slate-300">
              Master personal finance with SASS-E's sarcastic yet straightforward approach
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Articles Completed */}
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/30 hover:border-yellow-400/60 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <BookOpen className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-200">{completedArticles}/{totalArticles}</div>
                    <div className="text-xs text-slate-300">Articles</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quizzes Passed */}
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/30 hover:border-yellow-400/60 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-200">{passedQuizzes}/{totalArticles}</div>
                    <div className="text-xs text-slate-300">Quizzes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Tier */}
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/30 hover:border-yellow-400/60 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg flex-shrink-0">
                    <Target className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-yellow-200 break-words">{currentTierName}</div>
                    <div className="text-xs text-slate-300">Current Tier</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Study Streak */}
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/30 hover:border-yellow-400/60 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-200">{studyStreak}</div>
                    <div className="text-xs text-slate-300">Day Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Progress */}
            <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/30 hover:border-yellow-400/60 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-200">{overallProgress}%</div>
                    <div className="text-xs text-slate-300">Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Badges */}
          {isAuthenticated && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-yellow-200 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Achievements
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Fetch and display badges */}
                <BadgesDisplay />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Learning Tiers */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-lg">Learning Path</CardTitle>
                <CardDescription>Choose your level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {learningTiers.map((tier) => {
                  const Icon = tier.icon;
                  const isTier2 = tier.id === 2;
                  const isTier3 = tier.id === 3;
                  const isTier4 = tier.id === 4;
                  const isTier2Locked = isTier2 && isAuthenticated && !tierProgression?.tier2Unlocked;
                  const isTier3Locked = isTier3 && isAuthenticated && !tierProgression?.tier3Unlocked;
                  const isTier4Locked = isTier4 && isAuthenticated && !tierProgression?.tier4Unlocked;
                  const isTier5Locked = tier.id === 5 && isAuthenticated && !tierProgression?.tier5Unlocked;
                  const isTier6Locked = tier.id === 6 && isAuthenticated && !tierProgression?.tier6Unlocked;
                  const isLocked = isTier2Locked || isTier3Locked || isTier4Locked || isTier5Locked || isTier6Locked;
                  
                  return (
                    <button
                      key={tier.id}
                      onClick={() => {
                        if (isLocked) return; // Don't allow clicking locked tiers
                        setSelectedTier(tier.id);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedTier === tier.id
                          ? `${tier.bgColor} border-2 border-current ${tier.color}`
                          : isLocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-muted"
                      }`}
                      disabled={isLocked}
                    >
                      <div className="flex items-start gap-3">
                        {isLocked ? (
                          <Lock className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                        ) : (
                          <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${tier.color}`} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">
                            {tier.name}
                            {isLocked && " 🔒"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isTier2Locked ? "Pass Tier 1 Assessment" : isTier3Locked ? "Pass Tier 2 Assessment" : isTier4Locked ? "Pass Tier 3 Assessment" : isTier5Locked ? "Pass Tier 4 Assessment" : isTier6Locked ? "Pass Tier 5 Assessment" : `${tier.articles} articles`}
                          </div>
                        </div>
                        {selectedTier === tier.id && !isLocked && (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Progress Card */}
            {isAuthenticated && (
              <Card className="mt-4 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Articles Read</span>
                      <span className="font-semibold">12/68</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "18%" }} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4" />
                      <span>3 badges earned</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Selected Tier Header */}
            {selectedTierData && (
              <div className={`${selectedTierData.bgColor} rounded-lg p-6 mb-6`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-white dark:bg-gray-900 rounded-lg ${selectedTierData.color}`}>
                    <selectedTierData.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedTierData.name}</h2>
                    <p className="text-muted-foreground">{selectedTierData.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <Link key={article.id} href={`/learn-finance/article/${article.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group bg-gradient-to-br from-yellow-900/10 to-orange-900/10 border-yellow-500/20 hover:border-yellow-400/40">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <BadgeUI variant={
                        article.difficulty === "beginner" ? "default" :
                        article.difficulty === "intermediate" ? "secondary" : "destructive"
                      }>
                        {article.difficulty}
                      </BadgeUI>
                      <div className="flex items-center gap-2">
                        {article.progress > 0 && article.progress < 100 && (
                          <BadgeUI variant="outline" className="bg-blue-50 dark:bg-blue-950">
                            {article.progress}%
                          </BadgeUI>
                        )}
                        {article.progress === 100 && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </CardTitle>
                    <CardDescription>{article.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{article.estimatedReadTime} min read</span>
                      </div>
                      <Button variant="ghost" size="sm" className="group-hover:text-blue-600">
                        Read Article
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "Try a different search term" : "Articles coming soon!"}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tier 1 Completion Assessment */}
            {selectedTier === 1 && filteredArticles.length > 0 && !searchQuery && (
              <div className="mt-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Ready to Unlock Tier 2?</h3>
                  <p className="text-muted-foreground">
                    Complete this 10-question assessment to prove you've mastered Tier 1 fundamentals. 
                    Score 80% or higher (8/10 correct) to unlock Building Stability content.
                  </p>
                </div>
                <TierAssessment tierId={1} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}

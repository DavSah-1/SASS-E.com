import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PricingModal } from "@/components/PricingModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Crown,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  Brain,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import {
  DEMO_LEARNING_SESSIONS,
  DEMO_STUDY_GUIDE,
  DEMO_QUIZ,
  DEMO_LEARNING_CATEGORIES,
  DEMO_LEARNING_STATS,
} from "@/lib/demoData";

export default function LearningDemo() {
  const [activeTab, setActiveTab] = useState("overview");
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(DEMO_LEARNING_SESSIONS[0]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Read tab from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    const newUrl = activeTab === "overview" ? "/learning-demo" : `/learning-demo?tab=${activeTab}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [activeTab]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-400";
    if (confidence >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (confidence >= 70) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case "disputed":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case "debunked":
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <HelpCircle className="h-5 w-5 text-slate-400" />;
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const calculateQuizScore = () => {
    let correct = 0;
    DEMO_QUIZ.questions.forEach((q, index) => {
      if (quizAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const UpgradeTooltip = ({ children }: { children: React.ReactNode }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            Subscribe to track your own learning
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      {/* Demo Mode Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">🎯 Demo Mode - Exploring with sample data</span>
          </div>
          <Button size="sm" className="bg-white text-purple-600 hover:bg-slate-100" onClick={() => setPricingModalOpen(true)}>
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent"
            style={{ height: "50px" }}
          >
            📚 Learning Hub Demo
          </h1>
          <p className="text-slate-300">Explore verified learning with realistic sample data</p>
          <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
            <p className="text-sm text-blue-200">
              <AlertCircle className="inline h-4 w-4 mr-2" />
              This is a demo with sample data. To track your real learning progress,{" "}
              <button onClick={() => setPricingModalOpen(true)} className="underline font-semibold">
                upgrade to Pro
              </button>
              .
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-slate-800/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              <Brain className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-green-600">
              <BookOpen className="h-4 w-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="study-guide" className="data-[state=active]:bg-blue-600">
              <FileText className="h-4 w-4 mr-2" />
              Study Guide
            </TabsTrigger>
            <TabsTrigger value="quiz" className="data-[state=active]:bg-yellow-600">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Quiz
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Learning Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">{DEMO_LEARNING_STATS.totalSessions}</div>
                  <p className="text-xs text-slate-500 mt-1">Learning sessions completed</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Topics Explored</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{DEMO_LEARNING_STATS.topicsExplored}</div>
                  <p className="text-xs text-slate-500 mt-1">Different subjects</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Quizzes Passed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{DEMO_LEARNING_STATS.quizzesPassed}</div>
                  <p className="text-xs text-slate-500 mt-1">Knowledge verified</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Study Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">{DEMO_LEARNING_STATS.studyStreak} days</div>
                  <p className="text-xs text-slate-500 mt-1">Keep it up!</p>
                </CardContent>
              </Card>
            </div>

            {/* Learning Categories */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Learning Categories
                </CardTitle>
                <CardDescription>Explore different subjects and topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DEMO_LEARNING_CATEGORIES.map((category) => (
                    <UpgradeTooltip key={category.id}>
                      <Card className="bg-slate-900/50 border-slate-600 hover:border-purple-500/50 transition-all cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{category.icon}</div>
                            <div>
                              <CardTitle className="text-base text-white">{category.name}</CardTitle>
                              <p className="text-xs text-slate-400 mt-1">{category.topics.join(", ")}</p>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </UpgradeTooltip>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Average Confidence */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Average Confidence Score
                </CardTitle>
                <CardDescription>How reliable your learned information is</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-green-400">{DEMO_LEARNING_STATS.averageConfidence}%</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">High Confidence</Badge>
                  </div>
                  <Progress value={DEMO_LEARNING_STATS.averageConfidence} className="h-2" />
                  <p className="text-sm text-slate-400">
                    Your learning sessions are backed by verified sources with high confidence ratings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  Recent Learning Sessions
                </CardTitle>
                <CardDescription>Your verified learning history with fact-checked explanations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {DEMO_LEARNING_SESSIONS.map((session) => (
                  <UpgradeTooltip key={session.id}>
                    <Card
                      className={`bg-slate-900/50 border-slate-600 hover:border-purple-500/50 transition-all cursor-pointer ${
                        selectedSession.id === session.id ? "border-purple-500" : ""
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                                {session.topic}
                              </Badge>
                              <Badge className={getConfidenceBadge(session.confidence)}>{session.confidence}% confidence</Badge>
                              {getVerificationIcon(session.verificationStatus)}
                            </div>
                            <CardTitle className="text-base text-white mb-2">{session.question}</CardTitle>
                            <p className="text-sm text-slate-300 line-clamp-2">{session.explanation}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {session.createdAt.toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {session.sources.length} sources
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </UpgradeTooltip>
                ))}
              </CardContent>
            </Card>

            {/* Selected Session Details */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Session Details
                </CardTitle>
                <CardDescription>{selectedSession.topic}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Question</h4>
                  <p className="text-white">{selectedSession.question}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Explanation</h4>
                  <p className="text-slate-300 leading-relaxed">{selectedSession.explanation}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Verification</h4>
                  <div className="flex items-center gap-3">
                    <Badge className={getConfidenceBadge(selectedSession.confidence)}>
                      {selectedSession.confidence}% confidence
                    </Badge>
                    <div className="flex items-center gap-2">
                      {getVerificationIcon(selectedSession.verificationStatus)}
                      <span className="text-sm text-slate-300 capitalize">{selectedSession.verificationStatus}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-400 mb-2">Sources</h4>
                  <div className="space-y-2">
                    {selectedSession.sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Study Guide Tab */}
          <TabsContent value="study-guide" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Study Guide: {DEMO_STUDY_GUIDE.topic}
                </CardTitle>
                <CardDescription>Comprehensive study materials generated from your learning session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Points */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    Key Points
                  </h3>
                  <ul className="space-y-2">
                    {DEMO_STUDY_GUIDE.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-3 text-slate-300">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Definitions */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    Key Definitions
                  </h3>
                  <div className="space-y-3">
                    {DEMO_STUDY_GUIDE.definitions.map((def, index) => (
                      <Card key={index} className="bg-slate-900/50 border-slate-600">
                        <CardContent className="pt-4">
                          <h4 className="font-semibold text-white mb-1">{def.term}</h4>
                          <p className="text-sm text-slate-300">{def.definition}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Practice Questions */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-yellow-400" />
                    Practice Questions
                  </h3>
                  <ul className="space-y-2">
                    {DEMO_STUDY_GUIDE.practiceQuestions.map((question, index) => (
                      <li key={index} className="flex items-start gap-3 text-slate-300">
                        <span className="text-yellow-400 font-semibold mt-1">{index + 1}.</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Study Tips */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-400" />
                    Study Tips
                  </h3>
                  <ul className="space-y-2">
                    {DEMO_STUDY_GUIDE.studyTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3 text-slate-300">
                        <span className="text-pink-400 mt-1">💡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-yellow-400" />
                  Quiz: {DEMO_QUIZ.topic}
                </CardTitle>
                <CardDescription>Test your knowledge with this interactive quiz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {DEMO_QUIZ.questions.map((question, qIndex) => (
                  <UpgradeTooltip key={question.id}>
                    <Card className="bg-slate-900/50 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-base text-white">
                          Question {qIndex + 1}: {question.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {question.options.map((option, oIndex) => {
                          const isSelected = quizAnswers[qIndex] === oIndex;
                          const isCorrect = oIndex === question.correctAnswer;
                          const showResult = quizSubmitted;

                          return (
                            <button
                              key={oIndex}
                              onClick={() => {
                                if (!quizSubmitted) {
                                  const newAnswers = [...quizAnswers];
                                  newAnswers[qIndex] = oIndex;
                                  setQuizAnswers(newAnswers);
                                }
                              }}
                              className={`w-full text-left p-3 rounded-lg border transition-all ${
                                showResult && isCorrect
                                  ? "border-green-500 bg-green-500/10"
                                  : showResult && isSelected && !isCorrect
                                    ? "border-red-500 bg-red-500/10"
                                    : isSelected
                                      ? "border-purple-500 bg-purple-500/10"
                                      : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-slate-300">{option}</span>
                                {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                                {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-400" />}
                              </div>
                            </button>
                          );
                        })}

                        {quizSubmitted && (
                          <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                            <p className="text-sm text-blue-200">
                              <AlertCircle className="inline h-4 w-4 mr-2" />
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </UpgradeTooltip>
                ))}

                {!quizSubmitted ? (
                  <UpgradeTooltip>
                    <Button
                      onClick={handleQuizSubmit}
                      disabled={quizAnswers.length !== DEMO_QUIZ.questions.length}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    >
                      Submit Quiz
                    </Button>
                  </UpgradeTooltip>
                ) : (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center">
                          {calculateQuizScore() >= DEMO_QUIZ.passingScore ? (
                            <Award className="h-16 w-16 text-yellow-400" />
                          ) : (
                            <AlertCircle className="h-16 w-16 text-orange-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            Score: {calculateQuizScore()}/{DEMO_QUIZ.questions.length}
                          </h3>
                          <p className="text-slate-300">
                            {calculateQuizScore() >= DEMO_QUIZ.passingScore
                              ? "Congratulations! You passed the quiz! 🎉"
                              : "Keep studying and try again! 📚"}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setQuizAnswers([]);
                            setQuizSubmitted(false);
                          }}
                          variant="outline"
                          className="mt-4"
                        >
                          Retake Quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
      <PricingModal open={pricingModalOpen} onOpenChange={setPricingModalOpen} />
    </div>
  );
}

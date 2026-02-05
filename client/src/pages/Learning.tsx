import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, CheckCircle2, XCircle, AlertCircle, HelpCircle, ExternalLink, Loader2, ArrowRight, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";
import { useFeatureAccess, useRecordUsage } from "@/hooks/useFeatureAccess";
import { UpgradePrompt } from "@/components/UpgradePrompt";

export default function Learning() {
  const { user, isAuthenticated, loading } = useAuth();
  const { t, translate } = useLanguage();
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [currentExplanation, setCurrentExplanation] = useState<any>(null);
  const [currentStudyGuide, setCurrentStudyGuide] = useState<any>(null);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);

  const explainMutation = trpc.learning.explainWithFactCheck.useMutation();
  const studyGuideMutation = trpc.learning.generateStudyGuide.useMutation();
  const quizMutation = trpc.learning.generateQuiz.useMutation();
  const submitQuizMutation = trpc.learning.submitQuizAttempt.useMutation();
  
  // Access control - only check for authenticated users
  const learningAccess = useFeatureAccess("verified_learning", undefined, { enabled: isAuthenticated });
  const { recordUsage } = useRecordUsage();
  
  const { data: history } = trpc.learning.getHistory.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleExplain = async () => {
    if (!question.trim()) {
      toast.error(translate("Please enter a question"));
      return;
    }
    
    // Check access before processing
    if (!learningAccess.allowed && !learningAccess.isLoading) {
      toast.error(learningAccess.reason || "You've reached your daily limit for Verified Learning");
      return;
    }

    try {
      const result = await explainMutation.mutateAsync({
        topic: topic.trim() || question.trim(),
        question: question.trim(),
      });

      setCurrentExplanation(result);
      setCurrentStudyGuide(null);
      setCurrentQuiz(null);
      setQuizCompleted(false);
      setQuizResults(null);
      
      // Record usage after successful explanation
      recordUsage("verified_learning");
      
      toast.success(translate("Explanation generated with fact-checking!"));
    } catch (error) {
      toast.error(translate("Failed to generate explanation"));
      console.error("Explain error:", error);
    }
  };

  const handleGenerateStudyGuide = async () => {
    if (!currentExplanation) {
      toast.error(translate("Please get an explanation first"));
      return;
    }

    try {
      const result = await studyGuideMutation.mutateAsync({
        sessionId: currentExplanation.sessionId,
      });

      setCurrentStudyGuide(result);
      toast.success(translate("Study guide generated!"));
    } catch (error) {
      toast.error(translate("Failed to generate study guide"));
      console.error("Study guide error:", error);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!currentExplanation) {
      toast.error(translate("Please get an explanation first"));
      return;
    }

    try {
      const result = await quizMutation.mutateAsync({
        sessionId: currentExplanation.sessionId,
      });

      setCurrentQuiz(result);
      setQuizAnswers([]);
      setQuizCompleted(false);
      setQuizResults(null);
      toast.success(translate("Quiz generated! Test your knowledge."));
    } catch (error) {
      toast.error(translate("Failed to generate quiz"));
      console.error("Quiz error:", error);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz || quizAnswers.length !== currentQuiz.questions.length) {
      toast.error(translate("Please answer all questions"));
      return;
    }

    try {
      const result = await submitQuizMutation.mutateAsync({
        quizId: currentQuiz.quizId,
        answers: quizAnswers,
      });

      setQuizResults(result);
      setQuizCompleted(true);
      
      if (result.passed) {
        toast.success(`Quiz passed! Score: ${result.score}/${result.totalQuestions}`);
      } else {
        toast.error(`Quiz failed. Score: ${result.score}/${result.totalQuestions}. Keep learning!`);
      }
    } catch (error) {
      toast.error(translate("Failed to submit quiz"));
      console.error("Submit quiz error:", error);
    }
  };

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

  const handleCategorySelect = (categoryTopic: string) => {
    setTopic(categoryTopic);
    toast.success(translate(`Category selected: ${categoryTopic}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-foreground">{translate("Loading...")}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        
        {/* Hero Section */}
        <div className="container mx-auto py-16 px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
              <span className="text-purple-400 font-semibold text-sm">{translate("AI-POWERED VERIFIED LEARNING")}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-6xl md:text-7xl">📚</span>{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent">Learning Hub</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              {translate("Master any subject with AI-powered explanations, fact-checked content, personalized study guides, and interactive quizzes")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-6 text-lg">
                <a href={getLoginUrl()}>{translate("Start Learning Today")}</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 px-8 py-6 text-lg">
                <Link href="/learning-demo">
                  <Sparkles className="h-5 w-5 mr-2" />
                  {t.common.viewDemo}
                </Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {/* AI Explanations */}
            <Card className="bg-slate-800/50 border-purple-500/30 hover:border-purple-500/60 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">{translate("AI-Powered Explanations")}</CardTitle>
                <CardDescription className="text-slate-300">
                  {translate("Get clear, detailed explanations for any topic with automatic fact-checking and source verification")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-400 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Natural language question input")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Comprehensive topic coverage")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Step-by-step breakdowns")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Multiple difficulty levels")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Fact Checking */}
            <Card className="bg-slate-800/50 border-purple-500/30 hover:border-purple-500/60 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-white">{translate("Automatic Fact-Checking")}</CardTitle>
                <CardDescription className="text-slate-300">
                  {translate("Every explanation is verified against reliable sources to ensure accuracy and credibility")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-400 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Real-time source verification")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Credible reference links")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Accuracy confidence scores")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Citation transparency")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Study Guides */}
            <Card className="bg-slate-800/50 border-purple-500/30 hover:border-purple-500/60 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-pink-400" />
                </div>
                <CardTitle className="text-white">{translate("Personalized Study Guides")}</CardTitle>
                <CardDescription className="text-slate-300">
                  {translate("Generate custom study guides tailored to your learning style and knowledge gaps")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-400 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Key concepts summary")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Important terms & definitions")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Practice questions")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Study tips & strategies")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Quizzes */}
            <Card className="bg-slate-800/50 border-purple-500/30 hover:border-purple-500/60 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <HelpCircle className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">{translate("Interactive Quizzes")}</CardTitle>
                <CardDescription className="text-slate-300">
                  {translate("Test your knowledge with AI-generated quizzes that adapt to your understanding level")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-400 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Multiple choice questions")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Instant feedback & scoring")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Detailed answer explanations")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Progress tracking")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Learning History */}
            <Card className="bg-slate-800/50 border-purple-500/30 hover:border-purple-500/60 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-yellow-400" />
                </div>
                <CardTitle className="text-white">{translate("Learning History")}</CardTitle>
                <CardDescription className="text-slate-300">
                  {translate("Track your learning journey with complete session history and progress analytics")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-400 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Session replay & review")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Topics mastered tracking")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Quiz performance analytics")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Learning streaks & milestones")}</span>
                </div>
              </CardContent>
            </Card>

            {/* Multi-Subject Support */}
            <Card className="bg-slate-800/50 border-purple-500/30 hover:border-purple-500/60 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-indigo-400" />
                </div>
                <CardTitle className="text-white">{translate("Multi-Subject Support")}</CardTitle>
                <CardDescription className="text-slate-300">
                  {translate("Learn anything from mathematics and science to history, languages, and professional skills")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-400 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("STEM subjects (Math, Physics, Chemistry)")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Humanities (History, Literature, Philosophy)")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Languages & linguistics")}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{translate("Professional & technical skills")}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Why Choose Learning Hub */}
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">{translate("Why Choose Learning Hub?")}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{translate("Verified Accuracy")}</h3>
                <p className="text-slate-300">
                  {translate("Every explanation is fact-checked against reliable sources, ensuring you learn correct information with proper citations")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{translate("Personalized Learning")}</h3>
                <p className="text-slate-300">
                  {translate("AI adapts to your knowledge level and learning style, providing customized study materials and quizzes that match your needs")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{translate("Complete Learning System")}</h3>
                <p className="text-slate-300">
                  {translate("From initial explanation to mastery testing—get explanations, study guides, quizzes, and progress tracking all in one place")}
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">{translate("Ready to Accelerate Your Learning?")}</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              {translate("Join students and professionals using Learning Hub to master new subjects faster with AI-powered, fact-checked education")}
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-6 text-lg">
              <a href={getLoginUrl()} className="flex items-center gap-2">
                {translate("Get Started Free")}
                <ExternalLink className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600" style={{height: '75px'}}>
              {translate("Verified Learning Assistant")}
            </h1>
            <p className="text-base sm:text-lg text-slate-300">
              {translate("Learn with confidence. Every fact checked, every source verified.")}
            </p>
          </div>

          {/* Upgrade Prompt if limit reached */}
          {!learningAccess.allowed && !learningAccess.isLoading && learningAccess.upgradeRequired && (
            <UpgradePrompt
              featureName="Verified Learning"
              currentUsage={learningAccess.currentUsage}
              limit={learningAccess.limit}
              reason={learningAccess.reason}
            />
          )}

          {/* Quick Learning Section */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">⚡ Quick Learning</h2>
            <p className="text-slate-300 mb-6">{translate("Get instant explanations on any topic with fact-checking and verified sources")}</p>
            
            <Card className="bg-slate-800/50 border-purple-500/20 mb-6">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-purple-400">{translate("Choose a Category")}</CardTitle>
                <CardDescription>{translate("Select a category to explore, or enter your own topic below")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { emoji: "🔬", title: "Sciences", topics: "Physics, Chemistry, Biology" },
                    { emoji: "📐", title: "Mathematics", topics: "Algebra, Calculus, Statistics" },
                    { emoji: "📚", title: "Humanities", topics: "History, Literature, Philosophy" },
                    { emoji: "💼", title: "Business", topics: "Economics, Marketing, Finance" },
                    { emoji: "💻", title: "Technology", topics: "Programming, AI, Cybersecurity" },
                    { emoji: "🎨", title: "Creative Arts", topics: "Music, Design, Photography" },
                    { emoji: "🏃", title: "Health & Fitness", topics: "Nutrition, Exercise, Wellness" },
                    { emoji: "🔧", title: "Life Skills", topics: "Cooking, DIY, Time Management" },
                    { emoji: "🧠", title: "Personal Growth", topics: "Mindfulness, Productivity, Leadership" },
                    { emoji: "🎭", title: "Psychology", topics: "Behavior, Cognition, Emotions" },
                    { emoji: "📊", title: "Data & Analytics", topics: "Statistics, Visualization, ML" },
                  ].map((category) => (
                    <button
                      key={category.title}
                      onClick={() => handleCategorySelect(category.title)}
                      className="p-3 sm:p-4 bg-slate-700/50 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-400/50 rounded-lg transition-all text-left group"
                    >
                      <div className="text-2xl sm:text-3xl mb-2">{category.emoji}</div>
                      <div className="text-sm sm:text-base font-semibold text-purple-300 group-hover:text-purple-200 mb-1">
                        {category.title}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-2">{category.topics}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Specialized Learning Paths Section */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">🎯 Specialized Learning Paths</h2>
            <p className="text-slate-300 mb-6">{translate("Dedicated learning experiences with structured lessons and interactive practice")}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Math Tutor Path */}
              <a
                href="/math-tutor"
                className="block p-6 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 hover:from-blue-800/50 hover:to-cyan-800/50 border-2 border-blue-500/30 hover:border-blue-400/60 rounded-xl transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">🧮</div>
                  <ExternalLink className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-blue-200 mb-2 group-hover:text-blue-100">Math Tutor</h3>
                <p className="text-sm text-slate-300 mb-3">Step-by-step problem solving with detailed explanations across all math topics</p>
                <div className="flex items-center text-xs text-blue-400 font-semibold">
                  <span>Start Solving</span>
                  <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                </div>
              </a>

              {/* Languages Path */}
              <a
                href="/language-learning"
                className="block p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 hover:from-purple-800/50 hover:to-pink-800/50 border-2 border-purple-500/30 hover:border-purple-400/60 rounded-xl transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">🌍</div>
                  <ExternalLink className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-purple-200 mb-2 group-hover:text-purple-100">Language Learning</h3>
                <p className="text-sm text-slate-300 mb-3">Master new languages with interactive conversations, vocabulary practice, and cultural insights</p>
                <div className="flex items-center text-xs text-purple-400 font-semibold">
                  <span>Start Learning</span>
                  <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                </div>
              </a>

              {/* Science Lab Path */}
              <a
                href="/science-lab"
                className="block p-6 bg-gradient-to-br from-green-900/40 to-emerald-900/40 hover:from-green-800/50 hover:to-emerald-800/50 border-2 border-green-500/30 hover:border-green-400/60 rounded-xl transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">🧪</div>
                  <ExternalLink className="h-5 w-5 text-green-400 group-hover:text-green-300 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-green-200 mb-2 group-hover:text-green-100">Science Lab</h3>
                <p className="text-sm text-slate-300 mb-3">Virtual experiments in physics, chemistry, and biology with step-by-step procedures and AI feedback</p>
                <div className="flex items-center text-xs text-green-400 font-semibold">
                  <span>Start Experimenting</span>
                  <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                </div>
              </a>

              {/* Learn Finance Path */}
              <a
                href="/learn-finance"
                className="block p-6 bg-gradient-to-br from-yellow-900/40 to-orange-900/40 hover:from-yellow-800/50 hover:to-orange-800/50 border-2 border-yellow-500/30 hover:border-yellow-400/60 rounded-xl transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">💰</div>
                  <ExternalLink className="h-5 w-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-yellow-200 mb-2 group-hover:text-yellow-100">Learn Finance</h3>
                <p className="text-sm text-slate-300 mb-3">Master personal finance with practical lessons on budgeting, investing, and building wealth for everyday life</p>
                <div className="flex items-center text-xs text-yellow-400 font-semibold">
                  <span>Start Learning</span>
                  <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                </div>
              </a>
            </div>
            
            {/* View All Button */}
            <div className="mt-6 text-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                <a href="/specialized-learning">
                  View All Learning Paths
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Question Input */}
          <Card className="bg-slate-800/50 border-purple-500/20">
            <CardHeader>
                <CardTitle className="text-purple-400">{translate("Ask Your Question")}</CardTitle>
              <CardDescription>{translate("Get verified explanations with fact-checking and source citations")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">{translate("Topic (Optional)")}</Label>
                <Input
                  id="topic"
                  placeholder={translate("e.g., Quantum Physics, World War II, Machine Learning")}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="question">{translate("Question")}</Label>
                <Input
                  id="question"
                  placeholder={translate("What would you like to learn about?")}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="bg-slate-700/50 border-purple-500/30"
                />
              </div>
              <Button 
                onClick={handleExplain} 
                disabled={explainMutation.isPending}
                className="w-full"
              >
                {explainMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translate("Generating...")}
                  </>
                ) : (
                  translate("Get Verified Explanation")
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Explanation Results */}
          {currentExplanation && (
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-purple-400">{currentExplanation.topic}</CardTitle>
                    <CardDescription>Verified explanation with fact-checking</CardDescription>
                  </div>
                  <div className={`text-2xl font-bold ${getConfidenceColor(currentExplanation.overallConfidence)}`}>
                    {currentExplanation.overallConfidence}%
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Explanation Text */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-200 whitespace-pre-wrap">{currentExplanation.explanation}</p>
                </div>

                {/* Fact Check Results */}
                {currentExplanation.factChecks && currentExplanation.factChecks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-purple-300">Fact Check Results</h3>
                    {currentExplanation.factChecks.map((fact: any, index: number) => (
                      <div 
                        key={index}
                        className="p-4 bg-slate-700/50 border border-purple-500/20 rounded-lg space-y-2"
                      >
                        <div className="flex items-start gap-3">
                          {getVerificationIcon(fact.verificationStatus)}
                          <div className="flex-1">
                            <p className="text-slate-200 font-medium">{fact.claim}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold border ${getConfidenceBadge(fact.confidence)}`}>
                                {fact.verificationStatus?.toUpperCase() || 'UNKNOWN'}
                              </span>
                              <span className="text-sm text-slate-400">
                                Confidence: {fact.confidence}%
                              </span>
                            </div>
                            {fact.analysis && (
                              <p className="text-sm text-slate-300 mt-2">{fact.analysis}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Sources */}
                        {fact.sources && fact.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-purple-500/20">
                            <p className="text-xs text-slate-400 mb-2">Sources:</p>
                            <div className="space-y-1">
                              {fact.sources.map((source: any, sourceIndex: number) => (
                                <a
                                  key={sourceIndex}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {source.title || source.url}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleGenerateStudyGuide}
                    disabled={studyGuideMutation.isPending}
                    variant="outline"
                  >
                    {studyGuideMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {translate("Generating...")}
                      </>
                    ) : (
                      "Generate Study Guide"
                    )}
                  </Button>
                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={quizMutation.isPending}
                    variant="outline"
                  >
                    {quizMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {translate("Generating...")}
                      </>
                    ) : (
                      "Generate Quiz"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Study Guide */}
          {currentStudyGuide && (
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-400">Study Guide</CardTitle>
                <CardDescription>Comprehensive study materials for {currentStudyGuide.topic}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Concepts */}
                {currentStudyGuide.keyConcepts && currentStudyGuide.keyConcepts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Key Concepts</h3>
                    <ul className="space-y-2">
                      {currentStudyGuide.keyConcepts.map((concept: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <BookOpen className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-200">{concept}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Important Terms */}
                {currentStudyGuide.importantTerms && currentStudyGuide.importantTerms.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Important Terms</h3>
                    <div className="grid gap-3">
                      {currentStudyGuide.importantTerms.map((term: any, index: number) => (
                        <div key={index} className="p-3 bg-slate-700/50 rounded-lg">
                          <p className="font-semibold text-purple-400">{term.term}</p>
                          <p className="text-sm text-slate-300 mt-1">{term.definition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {currentStudyGuide.summary && (
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Summary</h3>
                    <p className="text-slate-200 whitespace-pre-wrap">{currentStudyGuide.summary}</p>
                  </div>
                )}

                {/* Study Tips */}
                {currentStudyGuide.studyTips && currentStudyGuide.studyTips.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Study Tips</h3>
                    <ul className="space-y-2">
                      {currentStudyGuide.studyTips.map((tip: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-400 font-bold">•</span>
                          <span className="text-slate-200">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quiz */}
          {currentQuiz && (
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-400">Quiz: {currentQuiz.topic}</CardTitle>
                <CardDescription>
                  {quizCompleted 
                    ? `Completed - Score: ${quizResults?.score}/${quizResults?.totalQuestions}` 
                    : "Test your knowledge"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentQuiz.questions.map((q: any, qIndex: number) => (
                  <div key={qIndex} className="p-4 bg-slate-700/50 border border-purple-500/20 rounded-lg space-y-3">
                    <p className="font-semibold text-slate-200">
                      {qIndex + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((option: string, oIndex: number) => {
                        const optionLetter = String.fromCharCode(65 + oIndex); // A, B, C, D
                        const isSelected = quizAnswers[qIndex] === oIndex;
                        const isCorrect = quizCompleted && q.correctAnswer === optionLetter;
                        const isWrong = quizCompleted && isSelected && q.correctAnswer !== optionLetter;
                        
                        return (
                          <button
                            key={oIndex}
                            onClick={() => {
                              if (!quizCompleted) {
                                const newAnswers = [...quizAnswers];
                                newAnswers[qIndex] = oIndex;
                                setQuizAnswers(newAnswers);
                              }
                            }}
                            disabled={quizCompleted}
                            className={`w-full text-left p-3 rounded border transition-all ${
                              isCorrect
                                ? "bg-green-500/20 border-green-500/50 text-green-300"
                                : isWrong
                                ? "bg-red-500/20 border-red-500/50 text-red-300"
                                : isSelected
                                ? "bg-purple-500/20 border-purple-400"
                                : "bg-slate-600/50 border-slate-500/30 hover:border-purple-400/50"
                            }`}
                          >
                            <span className="font-semibold">{optionLetter}.</span> {option}
                          </button>
                        );
                      })}
                    </div>
                    {quizCompleted && q.explanation && (
                      <div className="mt-3 p-3 bg-slate-600/50 rounded border border-purple-500/20">
                        <p className="text-sm text-slate-300">
                          <span className="font-semibold text-purple-400">Explanation:</span> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {!quizCompleted && (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={quizAnswers.length !== currentQuiz.questions.length || submitQuizMutation.isPending}
                    className="w-full"
                  >
                    {submitQuizMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Quiz"
                    )}
                  </Button>
                )}

                {quizCompleted && quizResults && (
                  <div className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/20">
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-bold text-purple-400">
                        {quizResults.score}/{quizResults.totalQuestions}
                      </p>
                      <p className={`text-lg font-semibold ${quizResults.passed ? "text-green-400" : "text-red-400"}`}>
                        {quizResults.passed ? "Passed! 🎉" : "Keep Learning! 📚"}
                      </p>
                      <p className="text-sm text-slate-300">{quizResults.feedback}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Learning History */}
          {history && history.length > 0 && (
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-400">Recent Learning Sessions</CardTitle>
                <CardDescription>Your verified learning history</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {history.map((session: any) => (
                      <div
                        key={session.id}
                        className="p-3 bg-slate-700/50 border border-purple-500/20 rounded-lg hover:border-purple-400/50 transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-200">{session.topic}</p>
                            <p className="text-sm text-slate-400 mt-1">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-sm font-semibold ${getConfidenceColor(session.overallConfidence)}`}>
                            {session.overallConfidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

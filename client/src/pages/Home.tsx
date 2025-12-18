import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { getLoginUrl } from "@/const";
import { useIncognitoDetection } from "@/hooks/useIncognitoDetection";
import { 
  AlertCircle, 
  BookOpen, 
  Calculator, 
  Microscope, 
  GraduationCap,
  DollarSign,
  TrendingDown,
  PiggyBank,
  Receipt,
  Target,
  Sparkles,
  ArrowRight,
  Languages,
  MessageSquare,
  Zap
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";

export default function Home() {
  const { loading, isAuthenticated } = useAuth();
  const isIncognito = useIncognitoDetection();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <Navigation />

      {/* Incognito Mode Notice */}
      {isIncognito && !isAuthenticated && (
        <div className="container mx-auto px-6 pt-6">
          <Alert className="bg-yellow-900/20 border-yellow-500/50 text-yellow-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Private/Incognito Mode Detected</AlertTitle>
            <AlertDescription>
              You appear to be using private/incognito mode. Please note that authentication requires cookies and may not work properly in this mode. For the best experience, please use a regular browser window.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
              Meet SASS-E
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-2">
              Synthetic Adaptive Synaptic System - Entity
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300">
              Your intelligent AI assistant. Advanced, adaptive, and always ready to help.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <>
                <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Link href="/assistant">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Start Voice Chat
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto border-green-500 text-green-300 hover:bg-green-900/50">
                  <Link href="/money-hub">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Money Hub
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <a href={getLoginUrl()}>Get Started Free</a>
              </Button>
            )}
          </div>
        </div>

        {/* Money Hub Feature Highlight - PREMIUM SECTION */}
        <div className="mt-16 sm:mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900/40 via-emerald-900/40 to-teal-900/40 border-2 border-green-500/50 p-8 sm:p-12">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 mr-1 inline" />
                    NEW FEATURE
                  </Badge>
                </div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                  💰 Money Hub
                </h2>
                <p className="text-lg sm:text-xl text-center text-slate-300 mb-8 max-w-3xl mx-auto">
                  Take control of your financial future with AI-powered money management tools
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  <Card className="border-green-500/30 bg-slate-800/60 backdrop-blur hover:border-green-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <TrendingDown className="h-5 w-5" />
                        Debt Coach
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Track multiple debts, visualize payoff strategies, and get AI-powered motivation to become debt-free faster
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/30 bg-slate-800/60 backdrop-blur hover:border-green-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <PiggyBank className="h-5 w-5" />
                        Budget Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Create shared budgets, categorize expenses, and track spending with real-time insights
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/30 bg-slate-800/60 backdrop-blur hover:border-green-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Calculator className="h-5 w-5" />
                        Loan Calculators
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Calculate mortgages, auto loans, and personal loans with amortization schedules
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/30 bg-slate-800/60 backdrop-blur hover:border-green-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Receipt className="h-5 w-5" />
                        Receipt Scanner
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Scan receipts with AI, auto-categorize expenses, and track spending patterns
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/30 bg-slate-800/60 backdrop-blur hover:border-green-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Target className="h-5 w-5" />
                        Financial Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Set savings goals, track progress, and get personalized recommendations
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/30 bg-slate-800/60 backdrop-blur hover:border-green-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <DollarSign className="h-5 w-5" />
                        Currency Tools
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Real-time currency conversion, multi-currency support, and exchange rate tracking
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center">
                  <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-6 text-lg">
                    <Link href="/money-hub">
                      Explore Money Hub
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Features Section */}
        <div className="mt-16 sm:mt-24 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-100 mb-4">
              🎓 Comprehensive Learning Platform
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
              Master new skills with AI-powered learning tools tailored to your pace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-purple-500/30 bg-slate-800/50 backdrop-blur hover:border-purple-500/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400 text-xl">
                  <Languages className="h-6 w-6" />
                  Language Learning
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Master languages with interactive tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300 text-sm">Vocabulary flashcards with spaced repetition</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300 text-sm">Pronunciation practice with AI feedback</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300 text-sm">High-quality TTS with adjustable speed</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300 text-sm">Support for Spanish, French, German, Italian, Japanese</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-slate-800/50 backdrop-blur hover:border-purple-500/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400 text-xl">
                  <Calculator className="h-6 w-6" />
                  Math Tutor
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Step-by-step problem solving
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300 text-sm">Algebra, geometry, calculus, and statistics</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300 text-sm">Detailed explanations with visual aids</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300 text-sm">Practice problems with instant feedback</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300 text-sm">Adaptive difficulty based on performance</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-slate-800/50 backdrop-blur hover:border-purple-500/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400 text-xl">
                  <Microscope className="h-6 w-6" />
                  Science Lab
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Interactive experiments and simulations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300 text-sm">Physics, chemistry, and biology experiments</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300 text-sm">Virtual lab simulations with real-world scenarios</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300 text-sm">Safety-first environment for exploration</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300 text-sm">Detailed explanations of scientific concepts</p>
                </div>
              </CardContent>
            </Card>

            {/* Specialized Learning Paths - HIGHLIGHTED */}
            <Card className="border-2 border-pink-500/60 bg-gradient-to-br from-pink-900/30 to-purple-900/30 backdrop-blur hover:border-pink-500/80 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl"></div>
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-400 text-xl">
                  <GraduationCap className="h-6 w-6" />
                  Specialized Learning Paths
                </CardTitle>
                <CardDescription className="text-slate-300 font-medium">
                  Curated journeys for focused skill development
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-pink-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-200 text-sm font-medium">Structured curriculum from beginner to advanced</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-pink-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-200 text-sm font-medium">Progress tracking with achievement milestones</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-pink-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-200 text-sm font-medium">Personalized recommendations based on your goals</p>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-pink-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-200 text-sm font-medium">Certificates upon completion</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button asChild size="lg" variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-900/50 px-8 py-6 text-lg">
              <Link href="/language-learning">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Learning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Core Features */}
        <div className="mt-16 sm:mt-24 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Core AI Features
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎤 Voice Interface
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Speak your questions and hear my responses. Because typing is so last century.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  😏 Highly Clever(ish)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Get answers dripping with knowledge and enlightenment I didn't learn.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💾 Conversation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  All our delightful exchanges are saved. Relive the moments of my brilliance anytime.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 sm:mt-20 max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 text-center">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 text-left">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-400">1</div>
              <h3 className="text-xl font-semibold text-slate-200">Click the Mic</h3>
              <p className="text-slate-400">
                Press the microphone button and ask your question. Try to make it interesting.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-pink-400">2</div>
              <h3 className="text-xl font-semibold text-slate-200">Get Response</h3>
              <p className="text-slate-400">
                I'll process your query and deliver a helpful answer. And don't worry, I'll translate my genius into something you can understand.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-400">3</div>
              <h3 className="text-xl font-semibold text-slate-200">Hear It Spoken</h3>
              <p className="text-slate-400">
                Listen to my response with text-to-speech. Because reading is too much effort.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 bg-slate-900/50 backdrop-blur mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-slate-400">
          <p>Built with a Human and A.I. © 2025 SASS-E</p>
        </div>
      </footer>
    </div>
  );
}

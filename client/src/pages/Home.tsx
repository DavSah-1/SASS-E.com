import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslate } from "@/hooks/useTranslate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
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
  Zap,
  Heart,
  Activity,
  Dumbbell,
  Apple,
  Brain,
  Smile
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";

export default function Home() {
  const { loading, isAuthenticated } = useAuth();
  const isIncognito = useIncognitoDetection();
  const { translate: t } = useLanguage();
  
  // Test useTranslate hook with one string
  const translatedTagline = useTranslate("Your intelligent AI assistant. Advanced, adaptive, and always ready to help.");
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-foreground">{t("Loading...")}</div>
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
            <AlertTitle>{t("Private/Incognito Mode Detected")}</AlertTitle>
            <AlertDescription>
              {t("You appear to be using private/incognito mode. Please note that authentication requires cookies and may not work properly in this mode. For the best experience, please use a regular browser window.")}
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
              {translatedTagline}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <>
                <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Link href="/assistant">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    {t("Start Voice Chat")}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto border-green-500 text-green-300 hover:bg-green-900/50">
                  <Link href="/money">
                    <DollarSign className="mr-2 h-5 w-5" />
                    {t("Money Hub")}
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <a href={getLoginUrl()}>{t("Get Started Free")}</a>
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
                    {t("NEW FEATURE")}
                  </Badge>
                </div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
                  <span className="text-5xl sm:text-6xl">💰</span>{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">Money Hub</span>
                </h2>
                <p className="text-lg sm:text-xl text-center text-slate-300 mb-8 max-w-3xl mx-auto">
                  {t("Take control of your financial future with AI-powered money management tools")}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  <Card className="border-green-500/30 bg-slate-800/60 backdrop-blur hover:border-green-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <TrendingDown className="h-5 w-5" />
                        {t("Debt Coach")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Track multiple debts, visualize payoff strategies, and get AI-powered motivation to become debt-free faster")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/30 bg-slate-800/60 backdrop-blur hover:border-green-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <PiggyBank className="h-5 w-5" />
                        {t("Budget Management")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Create shared budgets, categorize expenses, and track spending with real-time insights")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/30 bg-slate-800/60 backdrop-blur hover:border-green-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Calculator className="h-5 w-5" />
                        {t("Loan Calculators")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Calculate mortgages, auto loans, and personal loans with amortization schedules")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/30 bg-slate-800/60 backdrop-blur hover:border-green-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Receipt className="h-5 w-5" />
                        {t("Receipt Scanner")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Scan receipts with AI, auto-categorize expenses, and track spending patterns")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/30 bg-slate-800/60 backdrop-blur hover:border-green-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Target className="h-5 w-5" />
                        {t("Financial Goals")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Set savings goals, track progress, and get personalized recommendations")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/30 bg-slate-800/60 backdrop-blur hover:border-green-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <DollarSign className="h-5 w-5" />
                        {t("Currency Tools")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Real-time currency conversion, multi-currency support, and exchange rate tracking")}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-6 text-lg">
              <Link href="/money">
                      {t("Explore Money Hub")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Hub Feature Highlight - PREMIUM SECTION */}
        <div className="mt-16 sm:mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border-2 p-8 sm:p-12" style={{backgroundColor: 'oklch(0.69 0.2 325.48 / 0.15)', borderColor: 'oklch(0.69 0.2 325.48 / 0.5)'}}>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{backgroundColor: 'oklch(0.69 0.2 325.48 / 0.1)'}}></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{backgroundColor: 'oklch(0.69 0.2 325.48 / 0.1)'}}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Badge className="text-white px-4 py-1 text-sm font-semibold" style={{backgroundColor: 'oklch(0.69 0.2 325.48)'}}>
                    <Sparkles className="h-4 w-4 mr-1 inline" />
                    {t("NEW FEATURE")}
                  </Badge>
                </div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4" style={{color: 'oklch(0.85 0.15 325.48)'}}>
                  🎓 Learning Hub
                </h2>
                <p className="text-lg sm:text-xl text-center text-slate-300 mb-8 max-w-3xl mx-auto">
                  {t("Master new skills with AI-powered learning tools tailored to your pace")}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  <Card className="bg-slate-800/60 backdrop-blur transition-all" style={{borderColor: 'oklch(0.69 0.2 325.48 / 0.3)'}}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2" style={{color: 'oklch(0.75 0.15 325.48)'}}>
                        <Languages className="h-5 w-5" />
                        {t("Language Learning")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Master languages with interactive vocabulary flashcards, pronunciation practice, and support for Spanish, French, German, Italian, and Japanese")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/60 backdrop-blur transition-all" style={{borderColor: 'oklch(0.69 0.2 325.48 / 0.3)'}}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2" style={{color: 'oklch(0.75 0.15 325.48)'}}>
                        <Calculator className="h-5 w-5" />
                        {t("Math Tutor")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Step-by-step problem solving for algebra, geometry, calculus, and statistics with detailed explanations and adaptive difficulty")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/60 backdrop-blur transition-all" style={{borderColor: 'oklch(0.69 0.2 325.48 / 0.3)'}}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2" style={{color: 'oklch(0.75 0.15 325.48)'}}>
                        <Microscope className="h-5 w-5" />
                        {t("Science Lab")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Interactive experiments and simulations for physics, chemistry, and biology with virtual lab environments and detailed explanations")}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center">
                  <Button asChild size="lg" className="text-white font-semibold px-8 py-6 text-lg hover:opacity-90 transition-opacity" style={{backgroundColor: 'oklch(0.69 0.2 325.48)'}}>
                    <Link href="/learning">
                      {t("Explore Learning Hub")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Wellbeing Feature Highlight */}
        <div className="mt-16 sm:mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 via-cyan-900/40 to-teal-900/40 border-2 border-cyan-500/50 p-8 sm:p-12">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-1 text-sm font-semibold">
                    <Heart className="h-4 w-4 mr-1 inline" />
                    WELLNESS
                  </Badge>
                </div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
                  <span className="text-5xl sm:text-6xl">💪</span>{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400">Wellness Hub</span>
                </h2>
                <p className="text-lg sm:text-xl text-center text-slate-300 mb-8 max-w-3xl mx-auto">
                  Transform your health with comprehensive fitness tracking, nutrition tools, and mental wellness support
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  <Card className="border-cyan-500/30 bg-slate-800/60 backdrop-blur hover:border-cyan-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-cyan-400">
                        <Dumbbell className="h-5 w-5" />
                        Fitness Tracking
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        30+ guided workouts (yoga, HIIT, strength, pilates), workout library with filtering, and automatic activity logging
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-cyan-500/30 bg-slate-800/60 backdrop-blur hover:border-cyan-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-cyan-400">
                        <Apple className="h-5 w-5" />
                        Smart Nutrition
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Barcode scanner for instant food lookup, macro/micro tracking, meal logging, and hydration monitoring
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-cyan-500/30 bg-slate-800/60 backdrop-blur hover:border-cyan-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-cyan-400">
                        <Brain className="h-5 w-5" />
                        Mental Wellness
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Mood tracking, meditation timer, journaling, and stress management tools for emotional wellbeing
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-cyan-500/30 bg-slate-800/60 backdrop-blur hover:border-cyan-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-cyan-400">
                        <Activity className="h-5 w-5" />
                        Wearable Sync
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Connect Apple Health, Google Fit, Fitbit, Garmin, or Samsung Health to auto-sync steps, heart rate, and sleep data
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-cyan-500/30 bg-slate-800/60 backdrop-blur hover:border-cyan-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-cyan-400">
                        <Smile className="h-5 w-5" />
                        Sleep & Recovery
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Track sleep quality, duration, and patterns to optimize rest and recovery for peak performance
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-cyan-500/30 bg-slate-800/60 backdrop-blur hover:border-cyan-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-cyan-400">
                        <Heart className="h-5 w-5" />
                        Health Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Monitor weight, heart rate, blood pressure, and other vital signs with visual progress charts
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center">
                  <Button asChild size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-8 py-6 text-lg">
                    <Link href="/wellness">
                      Explore Wellness Hub
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
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
      <Footer />
    </div>
  );
}

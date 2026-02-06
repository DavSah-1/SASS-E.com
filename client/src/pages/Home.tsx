import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslate } from "@/hooks/useTranslate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PRICING_TIERS, getAnnualDiscountPercent, getMonthlyFromAnnual, getMonthlyFromSixMonth, getSixMonthDiscountPercent, getCurrencySymbol } from "@shared/pricing";
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
  Smile,
  Check,
  ImageIcon,
  MessagesSquare,
  Mic
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import { HubSelectionModal } from "@/components/HubSelectionModal";
import { CheckoutHubModal } from "@/components/CheckoutHubModal";
import { useHubSelection } from "@/hooks/useHubSelection";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { savePlanSelection } from "@/lib/planSelection";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const isIncognito = useIncognitoDetection();
  const { translate: t } = useLanguage();
  const hubSelection = useHubSelection();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "six_month" | "annual">("monthly");
  const [currency, setCurrency] = useState<"GBP" | "USD" | "EUR">("GBP");
  const [hubModalOpen, setHubModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"starter" | "pro" | "ultimate" | null>(null);
  
  // Test useTranslate hook with one string
  const translatedTagline = useTranslate("Your intelligent AI assistant. Advanced, adaptive, and always ready to help.");

  const createCheckout = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.open(data.url, "_blank");
      toast.success("Redirecting to checkout...");
      setHubModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

  const handleChoosePlan = (tier: string) => {
    if (tier === "free") {
      return;
    }

    // Open hub selection modal (works for both authenticated and unauthenticated)
    setSelectedTier(tier as "starter" | "pro" | "ultimate");
    setHubModalOpen(true);
  };

  const handleHubConfirm = (selectedHubs: string[]) => {
    if (!selectedTier) return;

    // billingPeriod is already set in state
    
    // If not authenticated, save selection and redirect to sign-in
    if (!isAuthenticated) {
      savePlanSelection({
        tier: selectedTier,
        billingPeriod,
        selectedHubs: selectedTier === "ultimate" ? [] : selectedHubs,
      });
      
      toast.info("Create your account to continue");
      window.location.href = "/sign-up";
      return;
    }
    
    // If authenticated, proceed to checkout
    createCheckout.mutate({
      tier: selectedTier,
      billingPeriod,
      selectedHubs: selectedTier === "ultimate" ? [] : selectedHubs,
    });
  };
  

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
      
      {/* Hub Selection Modal for Account Management */}
      {isAuthenticated && (
        <HubSelectionModal
          open={hubSelection.showModal}
          onClose={() => hubSelection.setShowModal(false)}
          userTier={hubSelection.userTier}
          currentSelection={hubSelection.selectedHubs}
          isLocked={hubSelection.isLocked}
        />
      )}

      {/* Checkout Hub Selection Modal */}
      {selectedTier && (
        <CheckoutHubModal
          open={hubModalOpen}
          onOpenChange={setHubModalOpen}
          tier={selectedTier}
          billingPeriod={billingPeriod}
          onConfirm={handleHubConfirm}
          isLoading={createCheckout.isPending}
        />
      )}

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
                        <Activity className="h-5 w-5" />
                        {t("Financial Health Score")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Track overall financial wellness with AI-powered scoring and personalized insights")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/30 bg-slate-800/60 backdrop-blur hover:border-green-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <TrendingDown className="h-5 w-5" />
                        {t("Cash Flow Tracking")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Monitor income, expenses, debt payments, and net cash flow in real-time")}
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
                        <Sparkles className="h-5 w-5" />
                        {t("AI Financial Insights")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Get personalized AI-powered recommendations to improve your financial health")}
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
                        <Sparkles className="h-5 w-5" />
                        AI Wellness Coach
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Get personalized recommendations based on your goals, progress, and activity patterns
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-cyan-500/30 bg-slate-800/60 backdrop-blur hover:border-cyan-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-cyan-400">
                        <Target className="h-5 w-5" />
                        Daily Tracking Dashboard
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        Monitor steps, calories, hydration, and mood in one comprehensive daily view
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

        {/* Translation Hub Feature Highlight - PREMIUM SECTION */}
        <div className="mt-16 sm:mt-24">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 border-2 border-indigo-500/50 p-8 sm:p-12">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 mr-1 inline" />
                    {t("NEW FEATURE")}
                  </Badge>
                </div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
                  <span className="text-5xl sm:text-6xl">🌐</span>{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Translation Hub</span>
                </h2>
                <p className="text-lg sm:text-xl text-center text-slate-300 mb-8 max-w-3xl mx-auto">
                  {t("Break language barriers with AI-powered translation and language learning tools")}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  <Card className="border-indigo-500/30 bg-slate-800/60 backdrop-blur hover:border-indigo-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-indigo-400">
                        <Languages className="h-5 w-5" />
                        {t("Text Translation")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Translate text between 100+ languages with AI-powered accuracy and context awareness")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-indigo-500/30 bg-slate-800/60 backdrop-blur hover:border-indigo-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-indigo-400">
                        <MessageSquare className="h-5 w-5" />
                        {t("Real-time Conversation")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Have natural conversations across languages with voice-to-voice translation")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-indigo-500/30 bg-slate-800/60 backdrop-blur hover:border-indigo-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-indigo-400">
                        <ImageIcon className="h-5 w-5" />
                        {t("Image OCR")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Extract and translate text from images with optical character recognition")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-indigo-500/30 bg-slate-800/60 backdrop-blur hover:border-indigo-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-indigo-400">
                        <Zap className="h-5 w-5" />
                        {t("Phrase Book")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Save frequently used phrases and translations for quick access on the go")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-indigo-500/30 bg-slate-800/60 backdrop-blur hover:border-indigo-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-indigo-400">
                        <MessagesSquare className="h-5 w-5" />
                        {t("Multilingual Chat")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Chat seamlessly across languages with automatic real-time translation")}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-indigo-500/30 bg-slate-800/60 backdrop-blur hover:border-indigo-500/60 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-indigo-400">
                        <Mic className="h-5 w-5" />
                        {t("Voice Input")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm">
                        {t("Speak naturally and translate your voice input instantly with speech recognition")}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center">
                  <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-6 text-lg">
                    <Link href="/translation">
                      {t("Explore Translation Hub")}
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


        {/* Pricing Section */}
        <div className="mt-16 sm:mt-24 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-500/20 text-green-300 border-green-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Simple, Transparent Pricing
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg sm:text-xl text-purple-200 max-w-2xl mx-auto">
              Get access to AI-powered learning, financial management, wellness tracking, and more.
              All plans include a 7-day free trial of specialized features.
            </p>
          </div>

          {/* Billing Period Selector */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Button
              variant={billingPeriod === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setBillingPeriod("monthly")}
              className={billingPeriod === "monthly" ? "" : "bg-purple-800/50 border-purple-600 text-white hover:bg-purple-700"}
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === "six_month" ? "default" : "outline"}
              size="sm"
              onClick={() => setBillingPeriod("six_month")}
              className={billingPeriod === "six_month" ? "" : "bg-purple-800/50 border-purple-600 text-white hover:bg-purple-700"}
            >
              6 Months
              <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-300 border-green-500/30">
                Save {getSixMonthDiscountPercent("pro", currency)}%
              </Badge>
            </Button>
            <Button
              variant={billingPeriod === "annual" ? "default" : "outline"}
              size="sm"
              onClick={() => setBillingPeriod("annual")}
              className={billingPeriod === "annual" ? "" : "bg-purple-800/50 border-purple-600 text-white hover:bg-purple-700"}
            >
              Annual
              <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-300 border-green-500/30">
                Save {getAnnualDiscountPercent("pro", currency)}%
              </Badge>
            </Button>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center justify-center gap-2 mb-12">
            <span className="text-purple-200 text-sm">Currency:</span>
            {(["GBP", "USD", "EUR"] as const).map((curr) => (
              <Button
                key={curr}
                variant={currency === curr ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrency(curr)}
                className={currency === curr ? "" : "bg-purple-800/50 border-purple-600 text-white hover:bg-purple-700"}
              >
                {curr}
              </Button>
            ))}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(["free", "starter", "pro", "ultimate"] as const).map((tier) => {
              const tierData = PRICING_TIERS[tier];
              const price = billingPeriod === "annual" 
                ? getMonthlyFromAnnual(tier, currency) 
                : billingPeriod === "six_month"
                ? getMonthlyFromSixMonth(tier, currency)
                : tierData.pricing.monthly[currency];
              const isPopular = tierData.popular;
              const isCurrentTier = user?.subscriptionTier === tier;

              return (
                <Card
                  key={tier}
                  className={`relative ${
                    isPopular
                      ? "border-2 border-pink-500 shadow-xl shadow-pink-500/20"
                      : "border-purple-700/50 bg-purple-900/30"
                  } backdrop-blur-sm`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {isCurrentTier && (
                    <div className="absolute -top-4 right-4">
                      <Badge className="bg-green-500 text-white">
                        Current Plan
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl text-white">{tierData.name}</CardTitle>
                    <CardDescription className="text-purple-300">
                      {tierData.description}
                    </CardDescription>
                    <div className="mt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">
                          {getCurrencySymbol(currency)}{price.toFixed(2)}
                        </span>
                        <span className="text-purple-300">/month</span>
                      </div>
                      {billingPeriod === "annual" && price > 0 && (
                        <p className="text-sm text-purple-400 mt-1">
                          Billed {getCurrencySymbol(currency)}{tierData.pricing.annual[currency].toFixed(2)} annually
                        </p>
                      )}
                      {billingPeriod === "six_month" && price > 0 && tierData.pricing.sixMonth && (
                        <p className="text-sm text-purple-400 mt-1">
                          Billed {getCurrencySymbol(currency)}{tierData.pricing.sixMonth[currency].toFixed(2)} every 6 months
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4 flex-1">
                    {/* Core Features Table */}
                    <div className="mb-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-purple-700/30">
                            <th className="text-left py-2 text-purple-200 font-semibold">Feature</th>
                            <th className="text-right py-2 text-purple-200 font-semibold">{tierData.name} Plan</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={2} className="pt-3 pb-1 text-white font-semibold text-xs">Core Features</td>
                          </tr>
                          {tierData.coreFeatures.map((feature, index) => (
                            <tr key={index} className="border-b border-purple-700/10">
                              <td className="py-2 text-purple-200">{feature.name}</td>
                              <td className={`py-2 text-right ${
                                feature.limited ? "text-purple-300" : "text-green-400 font-semibold"
                              }`}>
                                {feature.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Hub Access Section */}
                    <div className={`mb-4 p-3 rounded-lg ${
                      tier === "ultimate" ? "bg-purple-800/40" : tier === "free" ? "bg-purple-900/40" : "bg-purple-800/30"
                    }`}>
                      <div className="text-xs font-semibold text-white mb-3">
                        {tierData.hubAccessHeader}
                      </div>
                      <div className="space-y-2">
                        {tierData.hubFeatures.map((hub, index) => (
                          <div key={index} className="flex justify-between items-center text-xs">
                            <span className="text-purple-200">{hub.name}</span>
                            <span className={
                              hub.included
                                ? "text-green-400 font-semibold"
                                : hub.limited
                                ? "text-purple-400"
                                : "text-purple-300"
                            }>
                              {hub.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Features */}
                    <div className="border-t border-purple-700/30 pt-3 space-y-2">
                      {tierData.additionalFeatures.map((feature, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="text-purple-200">{feature.name}</span>
                          <span className={
                            feature.included
                              ? "text-green-400 font-semibold"
                              : "text-purple-500"
                          }>
                            {feature.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2 pt-4">
                    {isCurrentTier ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : tier === "free" ? (
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        asChild
                      >
                        <Link href="/assistant">{tierData.ctaButton}</Link>
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${
                          isPopular
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                            : "bg-purple-600 hover:bg-purple-700"
                        }`}
                        onClick={() => handleChoosePlan(tier)}
                      >
                        {tierData.ctaButton}
                      </Button>
                    )}
                    <p className="text-xs text-center text-purple-400 leading-relaxed">
                      {tierData.footnote}
                    </p>
                  </CardFooter>
                </Card>
              );
            })}
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

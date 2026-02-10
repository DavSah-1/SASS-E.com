/**
 * Wellness page - Fitness, Nutrition, Mental Wellness, Health Metrics
 * Foundational version with core functionality
 */

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedTabs as Tabs, AnimatedTabsContent as TabsContent, AnimatedTabsList as TabsList, AnimatedTabsTrigger as TabsTrigger } from "@/components/AnimatedTabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Activity,
  Apple,
  Brain,
  Heart,
  Dumbbell,
  Droplet,
  Moon,
  Smile,
  BookOpen,
  Plus,
  Trash2,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  Watch,
  Utensils,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { getLoginUrl } from "@/const";
import { WorkoutTrendsChart, CalorieTrackingChart, MoodPatternsChart, WeightProgressChart } from "@/components/wellbeing/WellbeingCharts";
import { BarcodeScanner } from "@/components/wellbeing/BarcodeScanner";
import { FoodSearch } from "@/components/wellbeing/FoodSearch";
import { MacroMicroDashboard } from "@/components/wellbeing/MacroMicroDashboard";
import { WorkoutLibrary } from "@/components/WorkoutLibrary";
import { WearableDevices } from "@/components/WearableDevices";
import { WellnessOnboarding } from "@/components/WellnessOnboarding";
import { CoachingDashboard } from "@/components/CoachingDashboard";
import { useHubAccess } from "@/hooks/useHubAccess";
import { HubUpgradeModal } from "@/components/HubUpgradeModal";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Wellness() {
  const { user, isAuthenticated, loading } = useAuth();
  const { translate: t } = useLanguage();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Hub access control
  const hubAccess = useHubAccess("wellness");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Check hub access and show modal if needed
  useEffect(() => {
    if (!loading && isAuthenticated && !hubAccess.hasAccess && !hubAccess.isAdmin) {
      setShowUpgradeModal(true);
    }
  }, [loading, isAuthenticated, hubAccess.hasAccess, hubAccess.isAdmin]);

  // Fitness state
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [workoutCalories, setWorkoutCalories] = useState("");

  // Nutrition state
  const [foodName, setFoodName] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [waterAmount, setWaterAmount] = useState("250");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);

  // Mental wellness state
  const [mood, setMood] = useState<"great" | "good" | "okay" | "bad" | "terrible">("good");
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [journalContent, setJournalContent] = useState("");
  const [meditationDuration, setMeditationDuration] = useState("");

  // Health metrics state
  const [weight, setWeight] = useState("");
  const [restingHeartRate, setRestingHeartRate] = useState("");

  // Check if user has completed onboarding
  const wellnessProfile = trpc.wellbeing.getWellnessProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Queries
  const workoutHistory = trpc.wellbeing.getWorkoutHistory.useQuery({ limit: 10 }, { enabled: isAuthenticated });
  const dailyActivity = trpc.wellbeing.getDailyActivity.useQuery({ date: selectedDate }, { enabled: isAuthenticated });
  const foodLog = trpc.wellbeing.getFoodLog.useQuery({ date: selectedDate }, { enabled: isAuthenticated });
  const hydrationLog = trpc.wellbeing.getHydrationLog.useQuery({ date: selectedDate }, { enabled: isAuthenticated });
  const moodLog = trpc.wellbeing.getMoodLog.useQuery({ date: selectedDate }, { enabled: isAuthenticated });
  const journalEntries = trpc.wellbeing.getJournalEntries.useQuery({ limit: 10 }, { enabled: isAuthenticated });
  const meditationSessions = trpc.wellbeing.getMeditationSessions.useQuery({ limit: 10 }, { enabled: isAuthenticated });
  const healthMetrics = trpc.wellbeing.getHealthMetrics.useQuery({ limit: 10 }, { enabled: isAuthenticated });

  const utils = trpc.useUtils();

  // Mutations
  const logWorkoutMutation = trpc.wellbeing.logWorkout.useMutation({
    onSuccess: () => {
      toast.success(t("Workout logged successfully!"));
      utils.wellbeing.getWorkoutHistory.invalidate();
      utils.wellbeing.getDailyActivity.invalidate();
      setWorkoutTitle("");
      setWorkoutDuration("");
      setWorkoutCalories("");
    },
  });

  const addFoodLogMutation = trpc.wellbeing.addFoodLog.useMutation({
    onSuccess: () => {
      toast.success(t("Food logged successfully!"));
      utils.wellbeing.getFoodLog.invalidate();
      utils.wellbeing.getDailyActivity.invalidate();
      setFoodName("");
      setCalories("");
    },
  });

  const addHydrationMutation = trpc.wellbeing.addHydrationLog.useMutation({
    onSuccess: () => {
      toast.success(t("Water intake logged!"));
      utils.wellbeing.getHydrationLog.invalidate();
      utils.wellbeing.getDailyActivity.invalidate();
    },
  });

  const updateMoodMutation = trpc.wellbeing.updateMoodLog.useMutation({
    onSuccess: () => {
      toast.success(t("Mood updated!"));
      utils.wellbeing.getMoodLog.invalidate();
      utils.wellbeing.getDailyActivity.invalidate();
    },
  });

  const addJournalMutation = trpc.wellbeing.addJournalEntry.useMutation({
    onSuccess: () => {
      toast.success(t("Journal entry saved!"));
      utils.wellbeing.getJournalEntries.invalidate();
      setJournalContent("");
    },
  });

  const logMeditationMutation = trpc.wellbeing.logMeditationSession.useMutation({
    onSuccess: () => {
      toast.success(t("Meditation session logged!"));
      utils.wellbeing.getMeditationSessions.invalidate();
      setMeditationDuration("");
    },
  });

  const addHealthMetricMutation = trpc.wellbeing.addHealthMetric.useMutation({
    onSuccess: () => {
      toast.success(t("Health metrics updated!"));
      utils.wellbeing.getHealthMetrics.invalidate();
      setWeight("");
      setRestingHeartRate("");
    },
  });

  // Show onboarding if profile doesn't exist
  if (!wellnessProfile.isLoading && !wellnessProfile.data && isAuthenticated) {
    if (!showOnboarding) {
      setShowOnboarding(true);
    }
  }

  if (loading || wellnessProfile.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show onboarding questionnaire
  if (showOnboarding && isAuthenticated) {
    return (
      <WellnessOnboarding
        onComplete={() => {
          setShowOnboarding(false);
          wellnessProfile.refetch();
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
        <Navigation />
        
        {/* Hero Section */}
        <div className="container mx-auto py-16 px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
              <span className="text-cyan-400 font-semibold text-sm">HOLISTIC HEALTH & FITNESS</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-6xl md:text-7xl">💪</span>{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">Wellness Hub</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Transform your health with comprehensive fitness tracking, smart nutrition tools, mental wellness support, and AI-powered coaching
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg">
                <a href={getLoginUrl()}>Start Your Wellness Journey</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg">
                <a href="/wellness-demo">View Demo</a>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {/* Fitness Tracking */}
            <Card className="bg-slate-800/50 border-cyan-500/30 hover:border-cyan-500/60 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4">
                  <Dumbbell className="h-6 w-6 text-cyan-400" />
                </div>
                <CardTitle className="text-white">Fitness Tracking</CardTitle>
                <CardDescription className="text-slate-300">
                  Track workouts, log exercises, and monitor your fitness progress with detailed analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-400 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>30+ guided workout programs</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Exercise logging with sets & reps</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Workout history & trends</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Calorie burn tracking</span>
                </div>
              </CardContent>
            </Card>

            {/* Workout Library */}
            <Card className="bg-slate-800/50 border-cyan-500/30 hover:border-cyan-500/60 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Workout Library</CardTitle>
                <CardDescription className="text-slate-300">
                  Access 30+ professionally designed workouts across multiple categories and difficulty levels
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-400 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Yoga, HIIT, strength, cardio</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Beginner to advanced levels</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Equipment & no-equipment options</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Detailed exercise instructions</span>
                </div>
              </CardContent>
            </Card>

            {/* Smart Nutrition */}
            <Card className="bg-slate-800/50 border-cyan-500/30 hover:border-cyan-500/60 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <Utensils className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Smart Nutrition</CardTitle>
                <CardDescription className="text-slate-300">
                  Track meals, scan barcodes, and monitor macros with comprehensive nutrition database
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-400 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Barcode scanning for instant logging</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Macro & micronutrient tracking</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Calorie goals & daily summaries</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Food search with 500k+ items</span>
                </div>
              </CardContent>
            </Card>

            {/* Wearable Integration */}
            <Card className="bg-slate-800/50 border-cyan-500/30 hover:border-cyan-500/60 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <Watch className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Wearable Devices</CardTitle>
                <CardDescription className="text-slate-300">
                  Sync with Apple Health, Google Fit, Fitbit, and more for automatic health data tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-400 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Automatic steps & activity sync</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Heart rate monitoring</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Sleep tracking & analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Weight & body metrics sync</span>
                </div>
              </CardContent>
            </Card>

            {/* Mental Wellness */}
            <Card className="bg-slate-800/50 border-cyan-500/30 hover:border-cyan-500/60 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-pink-400" />
                </div>
                <CardTitle className="text-white">Mental Wellness</CardTitle>
                <CardDescription className="text-slate-300">
                  Support your mental health with mood tracking, meditation, and journaling tools
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-400 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Daily mood tracking & patterns</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Guided meditation sessions</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Private journaling space</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Stress & anxiety management</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Coaching */}
            <Card className="bg-slate-800/50 border-cyan-500/30 hover:border-cyan-500/60 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-yellow-400" />
                </div>
                <CardTitle className="text-white">AI-Powered Coaching</CardTitle>
                <CardDescription className="text-slate-300">
                  Get personalized recommendations and adaptive plans based on your progress and goals
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-400 text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Personalized workout suggestions</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Nutrition optimization tips</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Progress-based plan adjustments</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Mental wellness insights</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Why Choose Wellness Hub */}
          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-2xl p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Why Choose Wellness Hub?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">All-in-One Platform</h3>
                <p className="text-slate-300">
                  Track fitness, nutrition, mental wellness, and health metrics in one unified dashboard—no need for multiple apps
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Insights</h3>
                <p className="text-slate-300">
                  Get personalized coaching recommendations that adapt to your progress, goals, and lifestyle for optimal results
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Watch className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Seamless Integration</h3>
                <p className="text-slate-300">
                  Connect your wearable devices for automatic data sync and barcode scanning for effortless meal logging
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Health?</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands using Wellness Hub to achieve their fitness goals, improve nutrition, and enhance mental well-being
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg">
              <a href={getLoginUrl()} className="flex items-center gap-2">
                Get Started Free
                <ExternalLink className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleLogWorkout = () => {
    if (!workoutTitle || !workoutDuration) {
      toast.error(t("Please fill in workout title and duration"));
      return;
    }

    logWorkoutMutation.mutate({
      workoutTitle,
      duration: parseInt(workoutDuration),
      caloriesBurned: workoutCalories ? parseInt(workoutCalories) : undefined,
    });
  };

  const handleAddFood = () => {
    if (!foodName) {
      toast.error(t("Please enter food name"));
      return;
    }

    addFoodLogMutation.mutate({
      date: selectedDate,
      mealType,
      foodName,
      calories: calories ? parseFloat(calories) : undefined,
      protein: protein ? parseFloat(protein) : undefined,
      carbs: carbs ? parseFloat(carbs) : undefined,
      fat: fat ? parseFloat(fat) : undefined,
    });
  };

  const handleBarcodeScanned = (barcode: string) => {
    // Trigger barcode lookup
    fetch(`/api/trpc/wellbeing.lookupFoodByBarcode?input=${encodeURIComponent(JSON.stringify({ barcode }))}`)
      .then(res => res.json())
      .then(data => {
        const product = data.result?.data;
        if (product) {
          setFoodName(product.name + (product.brand ? ` (${product.brand})` : ""));
          setCalories(product.calories?.toString() || "");
          setProtein(product.protein?.toString() || "");
          setCarbs(product.carbs?.toString() || "");
          setFat(product.fat?.toString() || "");
          setShowBarcodeScanner(false);
          toast.success(t("Food details loaded from barcode!"));
        } else {
          toast.error(t("Product not found in database"));
        }
      })
      .catch(() => {
        toast.error(t("Error looking up barcode"));
      });
  };

  const handleFoodSelected = (food: any) => {
    setFoodName(food.name + (food.brand ? ` (${food.brand})` : ""));
    setCalories(food.calories?.toString() || "");
    setProtein(food.protein?.toString() || "");
    setCarbs(food.carbs?.toString() || "");
    setFat(food.fat?.toString() || "");
    toast.success(t("Food details loaded!"));
    // Close modal after short delay to show success message
    setTimeout(() => setShowFoodSearch(false), 500);
  };

  const handleAddWater = () => {
    addHydrationMutation.mutate({
      date: selectedDate,
      amount: parseInt(waterAmount),
    });
  };

  const handleUpdateMood = () => {
    updateMoodMutation.mutate({
      date: selectedDate,
      mood,
      energy,
      stress,
    });
  };

  const handleAddJournal = () => {
    if (!journalContent) {
      toast.error(t("Please write something in your journal"));
      return;
    }

    addJournalMutation.mutate({
      date: selectedDate,
      content: journalContent,
    });
  };

  const handleLogMeditation = () => {
    if (!meditationDuration) {
      toast.error(t("Please enter meditation duration"));
      return;
    }

    logMeditationMutation.mutate({
      type: "meditation",
      duration: parseInt(meditationDuration),
    });
  };

  const handleAddHealthMetric = () => {
    if (!weight && !restingHeartRate) {
      toast.error(t("Please enter at least one health metric"));
      return;
    }

    addHealthMetricMutation.mutate({
      date: selectedDate,
      weight: weight ? Math.round(parseFloat(weight) * 1000) : undefined, // Convert kg to grams
      restingHeartRate: restingHeartRate ? parseInt(restingHeartRate) : undefined,
    });
  };

  const totalCaloriesConsumed = foodLog.data?.reduce((sum, item) => sum + (parseFloat(item.calories?.toString() || '0') || 0), 0) || 0;
  const totalWaterIntake = hydrationLog.data?.total || 0;
  const waterGoal = 2000; // 2L in ml
  const waterProgress = Math.min((totalWaterIntake / waterGoal) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950">
      <Navigation />
      
      <main className="flex-1 container py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-1.5">
              <Heart className="h-4 w-4 mr-1.5 inline" />
              {t("WELLNESS HUB")}
            </Badge>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="text-5xl sm:text-6xl">💪</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400">Wellness Dashboard</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {t("Track your fitness, nutrition, mental health, and overall wellness in one comprehensive hub")}
          </p>
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <Label htmlFor="date">{t("Date")}</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-slate-800/50 border border-cyan-500/30 rounded-lg p-1">
            <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
            <TabsTrigger value="fitness">{t("Fitness")}</TabsTrigger>
            <TabsTrigger value="nutrition">{t("Nutrition")}</TabsTrigger>
            <TabsTrigger value="mental">{t("Mental")}</TabsTrigger>
            <TabsTrigger value="health">{t("Health")}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* AI Coaching Dashboard */}
            <CoachingDashboard />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("Steps Today")}</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dailyActivity.data?.steps || 0}</div>
                  <p className="text-xs text-muted-foreground">{t("Goal: 10,000 steps")}</p>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("Calories")}</CardTitle>
                  <Apple className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCaloriesConsumed}</div>
                  <p className="text-xs text-muted-foreground">{t("Consumed today")}</p>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("Hydration")}</CardTitle>
                  <Droplet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(totalWaterIntake / 1000).toFixed(1)}L</div>
                  <Progress value={waterProgress} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("Mood")}</CardTitle>
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{moodLog.data?.mood || t("Not set")}</div>
                  <p className="text-xs text-muted-foreground">{t("Today's mood")}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>{t("Recent Workouts")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {workoutHistory.data && workoutHistory.data.length > 0 ? (
                    <div className="space-y-4">
                      {workoutHistory.data.slice(0, 5).map((workout) => (
                        <div key={workout.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{workout.workoutTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              {workout.duration} min • {workout.caloriesBurned || 0} cal
                            </p>
                          </div>
                          <Dumbbell className="h-5 w-5 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{t("No workouts logged yet")}</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>{t("Recent Journal Entries")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {journalEntries.data && journalEntries.data.length > 0 ? (
                    <div className="space-y-4">
                      {journalEntries.data.slice(0, 5).map((entry) => (
                        <div key={entry.id}>
                          <p className="font-medium">{entry.title || "Untitled"}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">{entry.date}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{t("No journal entries yet")}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fitness Tab */}
          <TabsContent value="fitness" className="space-y-6">
            <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Log Workout</CardTitle>
                <CardDescription>Record your exercise session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="workout-title">Workout Title</Label>
                  <Input
                    id="workout-title"
                    placeholder="e.g., Morning Run, Yoga Session"
                    value={workoutTitle}
                    onChange={(e) => setWorkoutTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workout-duration">Duration (minutes)</Label>
                    <Input
                      id="workout-duration"
                      type="number"
                      placeholder="30"
                      value={workoutDuration}
                      onChange={(e) => setWorkoutDuration(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workout-calories">Calories Burned</Label>
                    <Input
                      id="workout-calories"
                      type="number"
                      placeholder="250"
                      value={workoutCalories}
                      onChange={(e) => setWorkoutCalories(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleLogWorkout} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700" disabled={logWorkoutMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Workout
                </Button>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Your activity stats for {selectedDate}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Steps</p>
                    <p className="text-2xl font-bold">{dailyActivity.data?.steps || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Minutes</p>
                    <p className="text-2xl font-bold">{dailyActivity.data?.activeMinutes || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distance (m)</p>
                    <p className="text-2xl font-bold">{dailyActivity.data?.distance || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-2xl font-bold">{dailyActivity.data?.calories || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workout Library */}
            <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Workout Library
                </CardTitle>
                <CardDescription>Browse and start guided workouts</CardDescription>
              </CardHeader>
              <CardContent>
                <WorkoutLibrary onWorkoutStart={() => workoutHistory.refetch()} />
              </CardContent>
            </Card>

            {/* Workout Trends Chart */}
            {workoutHistory.data && workoutHistory.data.length > 0 && (
              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Workout Trends
                  </CardTitle>
                  <CardDescription>Your workout duration and calories burned over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkoutTrendsChart
                    data={workoutHistory.data.map(w => ({
                      date: new Date(w.completedAt).toISOString(),
                      duration: w.duration,
                      calories: w.caloriesBurned || 0,
                    }))}
                  />
                </CardContent>
              </Card>
            )}

            <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Workout History</CardTitle>
              </CardHeader>
              <CardContent>
                {workoutHistory.data && workoutHistory.data.length > 0 ? (
                  <div className="space-y-4">
                    {workoutHistory.data.map((workout) => (
                      <div key={workout.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <p className="font-medium">{workout.workoutTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(workout.completedAt).toLocaleDateString()} • {workout.duration} min
                          </p>
                        </div>
                        <Badge>{workout.caloriesBurned || 0} cal</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No workouts logged yet. Start tracking your fitness journey!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Log Food</CardTitle>
                  <CardDescription>Track your meals and snacks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowBarcodeScanner(true)}>
                      Scan Barcode
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowFoodSearch(true)}>
                      Search Food
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor="meal-type">Meal Type</Label>
                    <Select value={mealType} onValueChange={(value: any) => setMealType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="food-name">Food Name</Label>
                    <Input
                      id="food-name"
                      placeholder="e.g., Grilled Chicken Salad"
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        placeholder="350"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        placeholder="25"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        placeholder="40"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        placeholder="15"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddFood} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700" disabled={addFoodLogMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Food
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Hydration</CardTitle>
                  <CardDescription>Track your water intake</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Today's Progress</p>
                      <p className="text-sm text-muted-foreground">
                        {(totalWaterIntake / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L
                      </p>
                    </div>
                    <Progress value={waterProgress} className="h-2" />
                  </div>
                  <div>
                    <Label htmlFor="water-amount">Amount (ml)</Label>
                    <Select value={waterAmount} onValueChange={setWaterAmount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="250">250ml (1 glass)</SelectItem>
                        <SelectItem value="500">500ml (1 bottle)</SelectItem>
                        <SelectItem value="750">750ml</SelectItem>
                        <SelectItem value="1000">1000ml (1L)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddWater} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700" disabled={addHydrationMutation.isPending}>
                    <Droplet className="h-4 w-4 mr-2" />
                    Log Water
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Macro/Micro Tracking Dashboard */}
            {foodLog.data && foodLog.data.length > 0 && (
              <MacroMicroDashboard
                foodLog={foodLog.data.filter(entry => entry.date === selectedDate)}
                dailyGoals={{
                  calories: 2000,
                  protein: 50,
                  carbs: 275,
                  fat: 78,
                }}
              />
            )}

            {/* Calorie Tracking Chart */}
            {foodLog.data && foodLog.data.length > 0 && (
              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Calorie Tracking
                  </CardTitle>
                  <CardDescription>Your daily calorie intake over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <CalorieTrackingChart
                    data={[
                      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), calories: 1850 },
                      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), calories: 2100 },
                      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), calories: 1950 },
                      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), calories: 2200 },
                      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), calories: 1800 },
                      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), calories: 2050 },
                      { date: new Date().toISOString(), calories: totalCaloriesConsumed },
                    ]}
                    goal={2000}
                  />
                </CardContent>
              </Card>
            )}

            <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Today's Food Log</CardTitle>
                <CardDescription>{selectedDate}</CardDescription>
              </CardHeader>
              <CardContent>
                {foodLog.data && foodLog.data.length > 0 ? (
                  <div className="space-y-4">
                    {foodLog.data.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <p className="font-medium">{item.foodName}</p>
                          <p className="text-sm text-muted-foreground capitalize">{item.mealType}</p>
                        </div>
                        <Badge>{item.calories || 0} cal</Badge>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <p className="text-lg font-semibold">Total: {totalCaloriesConsumed} calories</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No food logged for this day</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mental Wellness Tab */}
          <TabsContent value="mental" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Mood Tracker</CardTitle>
                  <CardDescription>How are you feeling today?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Mood</Label>
                    <Select value={mood} onValueChange={(value: any) => setMood(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="great">😄 Great</SelectItem>
                        <SelectItem value="good">🙂 Good</SelectItem>
                        <SelectItem value="okay">😐 Okay</SelectItem>
                        <SelectItem value="bad">😟 Bad</SelectItem>
                        <SelectItem value="terrible">😢 Terrible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Energy Level: {energy}/10</Label>
                    <Input
                      type="range"
                      min="1"
                      max="10"
                      value={energy}
                      onChange={(e) => setEnergy(parseInt(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Stress Level: {stress}/10</Label>
                    <Input
                      type="range"
                      min="1"
                      max="10"
                      value={stress}
                      onChange={(e) => setStress(parseInt(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                  <Button onClick={handleUpdateMood} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700" disabled={updateMoodMutation.isPending}>
                    Update Mood
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Meditation</CardTitle>
                  <CardDescription>Log your mindfulness practice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="meditation-duration">Duration (minutes)</Label>
                    <Input
                      id="meditation-duration"
                      type="number"
                      placeholder="10"
                      value={meditationDuration}
                      onChange={(e) => setMeditationDuration(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleLogMeditation} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700" disabled={logMeditationMutation.isPending}>
                    <Brain className="h-4 w-4 mr-2" />
                    Log Session
                  </Button>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Recent Sessions</p>
                    {meditationSessions.data && meditationSessions.data.length > 0 ? (
                      <div className="space-y-2">
                        {meditationSessions.data.slice(0, 5).map((session) => (
                          <div key={session.id} className="text-sm text-muted-foreground">
                            {session.duration} min • {new Date(session.completedAt).toLocaleDateString()}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No sessions yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Journal</CardTitle>
                <CardDescription>Write your thoughts and reflections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What's on your mind today?"
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  rows={6}
                />
                <Button onClick={handleAddJournal} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700" disabled={addJournalMutation.isPending}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
              </CardContent>
            </Card>
            {/* Mood Patterns Chart */}
            {Array.isArray(moodLog.data) && moodLog.data.length > 0 && (
              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Mood & Energy Patterns
                  </CardTitle>
                  <CardDescription>Track your emotional wellbeing over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <MoodPatternsChart
                    data={[
                      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), mood: 'good', energy: 7, stress: 4 },
                      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), mood: 'great', energy: 8, stress: 3 },
                      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), mood: 'okay', energy: 5, stress: 6 },
                      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), mood: 'good', energy: 7, stress: 4 },
                      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), mood: 'great', energy: 9, stress: 2 },
                      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), mood: 'good', energy: 6, stress: 5 },
                      { date: new Date().toISOString(), mood: (Array.isArray(moodLog.data) && moodLog.data.length > 0 ? moodLog.data[0].mood : 'good'), energy: (Array.isArray(moodLog.data) && moodLog.data.length > 0 ? moodLog.data[0].energy : null) || 5, stress: (Array.isArray(moodLog.data) && moodLog.data.length > 0 ? moodLog.data[0].stress : null) || 5 },
                    ]}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Health Metrics Tab */}
          <TabsContent value="health" className="space-y-6">
            <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Log Health Metrics</CardTitle>
                <CardDescription>Track your biometric data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70.0"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="heart-rate">Resting Heart Rate (bpm)</Label>
                    <Input
                      id="heart-rate"
                      type="number"
                      placeholder="60"
                      value={restingHeartRate}
                      onChange={(e) => setRestingHeartRate(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleAddHealthMetric} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700" disabled={addHealthMetricMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Metrics
                </Button>
              </CardContent>
            </Card>

            {/* Wearable Devices */}
            <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Wearable Devices
                </CardTitle>
                <CardDescription>Connect fitness trackers and smartwatches to automatically sync health data</CardDescription>
              </CardHeader>
              <CardContent>
                <WearableDevices />
              </CardContent>
            </Card>

            {/* Weight Progress Chart */}
            {healthMetrics.data && healthMetrics.data.length > 0 && healthMetrics.data.some(m => m.weight) && (
              <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Weight Progress
                  </CardTitle>
                  <CardDescription>Track your weight journey over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <WeightProgressChart
                    data={healthMetrics.data
                      .filter(m => m.weight)
                      .map(m => ({
                        date: m.date,
                        weight: m.weight!,
                      }))}
                    goal={70}
                  />
                </CardContent>
              </Card>
            )}

            <Card className="border-cyan-500/20 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Health Metrics History</CardTitle>
              </CardHeader>
              <CardContent>
                {healthMetrics.data && healthMetrics.data.length > 0 ? (
                  <div className="space-y-4">
                    {healthMetrics.data.map((metric) => (
                      <div key={metric.id} className="border-b pb-4">
                        <p className="text-sm text-muted-foreground mb-2">{metric.date}</p>
                        <div className="grid grid-cols-2 gap-4">
                          {metric.weight && (
                            <div>
                              <p className="text-xs text-muted-foreground">Weight</p>
                              <p className="font-medium">{(metric.weight / 1000).toFixed(1)} kg</p>
                            </div>
                          )}
                          {metric.restingHeartRate && (
                            <div>
                              <p className="text-xs text-muted-foreground">Heart Rate</p>
                              <p className="font-medium">{metric.restingHeartRate} bpm</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No health metrics logged yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScanned}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {/* Food Search Modal */}
      {showFoodSearch && (
        <FoodSearch
          onSelectFood={handleFoodSelected}
        />
      )}
      <Footer />
      
      {/* Hub Access Modal */}
      <HubUpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        hubId="wellness"
        hubName="Wellness Hub"
        currentTier={hubAccess.currentTier}
        reason={hubAccess.reason || ""}
      />
    </div>
  );
}

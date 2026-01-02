/**
 * Wellbeing page - Fitness, Nutrition, Mental Wellness, Health Metrics
 * Foundational version with core functionality
 */

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { getLoginUrl } from "@/const";
import { WorkoutTrendsChart, CalorieTrackingChart, MoodPatternsChart, WeightProgressChart } from "@/components/wellbeing/WellbeingCharts";
import { BarcodeScanner } from "@/components/wellbeing/BarcodeScanner";
import { FoodSearch } from "@/components/wellbeing/FoodSearch";
import { MacroMicroDashboard } from "@/components/wellbeing/MacroMicroDashboard";

export default function Wellbeing() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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

  // Queries
  const workoutHistory = trpc.wellbeing.getWorkoutHistory.useQuery({ limit: 10 });
  const dailyActivity = trpc.wellbeing.getDailyActivity.useQuery({ date: selectedDate });
  const foodLog = trpc.wellbeing.getFoodLog.useQuery({ date: selectedDate });
  const hydrationLog = trpc.wellbeing.getHydrationLog.useQuery({ date: selectedDate });
  const moodLog = trpc.wellbeing.getMoodLog.useQuery({ date: selectedDate });
  const journalEntries = trpc.wellbeing.getJournalEntries.useQuery({ limit: 10 });
  const meditationSessions = trpc.wellbeing.getMeditationSessions.useQuery({ limit: 10 });
  const healthMetrics = trpc.wellbeing.getHealthMetrics.useQuery({ limit: 10 });

  // Mutations
  const logWorkoutMutation = trpc.wellbeing.logWorkout.useMutation({
    onSuccess: () => {
      toast.success("Workout logged successfully!");
      workoutHistory.refetch();
      setWorkoutTitle("");
      setWorkoutDuration("");
      setWorkoutCalories("");
    },
  });

  const addFoodLogMutation = trpc.wellbeing.addFoodLog.useMutation({
    onSuccess: () => {
      toast.success("Food logged successfully!");
      foodLog.refetch();
      setFoodName("");
      setCalories("");
    },
  });

  const addHydrationMutation = trpc.wellbeing.addHydrationLog.useMutation({
    onSuccess: () => {
      toast.success("Water intake logged!");
      hydrationLog.refetch();
    },
  });

  const updateMoodMutation = trpc.wellbeing.updateMoodLog.useMutation({
    onSuccess: () => {
      toast.success("Mood updated!");
      moodLog.refetch();
    },
  });

  const addJournalMutation = trpc.wellbeing.addJournalEntry.useMutation({
    onSuccess: () => {
      toast.success("Journal entry saved!");
      journalEntries.refetch();
      setJournalContent("");
    },
  });

  const logMeditationMutation = trpc.wellbeing.logMeditationSession.useMutation({
    onSuccess: () => {
      toast.success("Meditation session logged!");
      meditationSessions.refetch();
      setMeditationDuration("");
    },
  });

  const addHealthMetricMutation = trpc.wellbeing.addHealthMetric.useMutation({
    onSuccess: () => {
      toast.success("Health metrics updated!");
      healthMetrics.refetch();
      setWeight("");
      setRestingHeartRate("");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to access your Wellbeing dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleLogWorkout = () => {
    if (!workoutTitle || !workoutDuration) {
      toast.error("Please fill in workout title and duration");
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
      toast.error("Please enter food name");
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
          toast.success("Food details loaded from barcode!");
        } else {
          toast.error("Product not found in database");
        }
      })
      .catch(() => {
        toast.error("Error looking up barcode");
      });
  };

  const handleFoodSelected = (food: any) => {
    setFoodName(food.name + (food.brand ? ` (${food.brand})` : ""));
    setCalories(food.calories?.toString() || "");
    setProtein(food.protein?.toString() || "");
    setCarbs(food.carbs?.toString() || "");
    setFat(food.fat?.toString() || "");
    toast.success("Food details loaded!");
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
      toast.error("Please write something in your journal");
      return;
    }

    addJournalMutation.mutate({
      date: selectedDate,
      content: journalContent,
    });
  };

  const handleLogMeditation = () => {
    if (!meditationDuration) {
      toast.error("Please enter meditation duration");
      return;
    }

    logMeditationMutation.mutate({
      type: "meditation",
      duration: parseInt(meditationDuration),
    });
  };

  const handleAddHealthMetric = () => {
    if (!weight && !restingHeartRate) {
      toast.error("Please enter at least one health metric");
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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Wellbeing Dashboard</h1>
          <p className="text-muted-foreground">
            Track your fitness, nutrition, mental health, and overall wellness
          </p>
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fitness">Fitness</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="mental">Mental</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Steps Today</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dailyActivity.data?.steps || 0}</div>
                  <p className="text-xs text-muted-foreground">Goal: 10,000 steps</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calories</CardTitle>
                  <Apple className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCaloriesConsumed}</div>
                  <p className="text-xs text-muted-foreground">Consumed today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hydration</CardTitle>
                  <Droplet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(totalWaterIntake / 1000).toFixed(1)}L</div>
                  <Progress value={waterProgress} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mood</CardTitle>
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{moodLog.data?.mood || "Not set"}</div>
                  <p className="text-xs text-muted-foreground">Today's mood</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Workouts</CardTitle>
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
                    <p className="text-muted-foreground">No workouts logged yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Journal Entries</CardTitle>
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
                    <p className="text-muted-foreground">No journal entries yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fitness Tab */}
          <TabsContent value="fitness" className="space-y-6">
            <Card>
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
                <Button onClick={handleLogWorkout} disabled={logWorkoutMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Workout
                </Button>
              </CardContent>
            </Card>

            <Card>
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

            {/* Workout Trends Chart */}
            {workoutHistory.data && workoutHistory.data.length > 0 && (
              <Card>
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

            <Card>
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
              <Card>
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
                  <Button onClick={handleAddFood} disabled={addFoodLogMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Food
                  </Button>
                </CardContent>
              </Card>

              <Card>
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
                  <Button onClick={handleAddWater} disabled={addHydrationMutation.isPending}>
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
              <Card>
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

            <Card>
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
              <Card>
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
                  <Button onClick={handleUpdateMood} disabled={updateMoodMutation.isPending}>
                    Update Mood
                  </Button>
                </CardContent>
              </Card>

              <Card>
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
                  <Button onClick={handleLogMeditation} disabled={logMeditationMutation.isPending}>
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

            <Card>
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
                <Button onClick={handleAddJournal} disabled={addJournalMutation.isPending}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
              </CardContent>
            </Card>
            {/* Mood Patterns Chart */}
            {Array.isArray(moodLog.data) && moodLog.data.length > 0 && (
              <Card>
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
            <Card>
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
                <Button onClick={handleAddHealthMetric} disabled={addHealthMetricMutation.isPending}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Metrics
                </Button>
              </CardContent>
            </Card>

            {/* Weight Progress Chart */}
            {healthMetrics.data && healthMetrics.data.length > 0 && healthMetrics.data.some(m => m.weight) && (
              <Card>
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

            <Card>
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
    </div>
  );
}

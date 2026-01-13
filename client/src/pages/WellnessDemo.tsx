import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Dumbbell,
  Heart,
  Apple,
  Brain,
  Moon,
  TrendingUp,
  Flame,
  Droplet,
  Calendar,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Trophy,
} from "lucide-react";

export default function WellnessDemo() {
  const [activeTab, setActiveTab] = useState("overview");

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
    const newUrl = activeTab === "overview" ? "/wellness-demo" : `/wellness-demo?tab=${activeTab}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [activeTab]);

  // Sample data
  const todayStats = {
    steps: 8543,
    stepsGoal: 10000,
    calories: 2150,
    caloriesGoal: 2400,
    water: 6,
    waterGoal: 8,
    workouts: 1,
    sleep: 7.5,
  };

  const weeklyWorkouts = [
    { day: "Mon", completed: true, type: "HIIT", duration: 30 },
    { day: "Tue", completed: true, type: "Yoga", duration: 45 },
    { day: "Wed", completed: true, type: "Strength", duration: 40 },
    { day: "Thu", completed: false, type: "Rest", duration: 0 },
    { day: "Fri", completed: true, type: "Cardio", duration: 35 },
    { day: "Sat", completed: true, type: "Pilates", duration: 50 },
    { day: "Sun", completed: false, type: "Planned", duration: 30 },
  ];

  const recentMeals = [
    { name: "Oatmeal with Berries", time: "8:00 AM", calories: 350, protein: 12, carbs: 58, fats: 8 },
    { name: "Grilled Chicken Salad", time: "12:30 PM", calories: 450, protein: 35, carbs: 25, fats: 18 },
    { name: "Greek Yogurt & Almonds", time: "3:00 PM", calories: 200, protein: 15, carbs: 12, fats: 10 },
    { name: "Salmon with Quinoa", time: "7:00 PM", calories: 550, protein: 40, carbs: 45, fats: 20 },
  ];

  const moodHistory = [
    { date: "Mon", mood: "😊", energy: 8, stress: 3 },
    { date: "Tue", mood: "😌", energy: 7, stress: 4 },
    { date: "Wed", mood: "😃", energy: 9, stress: 2 },
    { date: "Thu", mood: "😐", energy: 6, stress: 6 },
    { date: "Fri", mood: "😊", energy: 8, stress: 3 },
    { date: "Sat", mood: "😄", energy: 9, stress: 1 },
    { date: "Sun", mood: "😌", energy: 7, stress: 2 },
  ];

  const sleepData = [
    { date: "Mon", hours: 7.5, quality: 85 },
    { date: "Tue", hours: 8.0, quality: 90 },
    { date: "Wed", hours: 6.5, quality: 70 },
    { date: "Thu", hours: 7.0, quality: 75 },
    { date: "Fri", hours: 8.5, quality: 95 },
    { date: "Sat", hours: 9.0, quality: 92 },
    { date: "Sun", hours: 7.5, quality: 88 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            Wellness Hub Demo
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore wellness features with sample data. Track fitness, nutrition, and mental wellbeing.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fitness">Fitness</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="mental">Mental</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Today's Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Steps</CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.steps.toLocaleString()}</div>
                  <Progress value={(todayStats.steps / todayStats.stepsGoal) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {todayStats.stepsGoal.toLocaleString()} goal
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calories</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.calories}</div>
                  <Progress value={(todayStats.calories / todayStats.caloriesGoal) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {todayStats.caloriesGoal} goal
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hydration</CardTitle>
                  <Droplet className="h-4 w-4 text-cyan-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.water} / {todayStats.waterGoal}</div>
                  <Progress value={(todayStats.water / todayStats.waterGoal) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    glasses today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sleep</CardTitle>
                  <Moon className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayStats.sleep}h</div>
                  <Progress value={(todayStats.sleep / 8) * 100} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    last night
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  Weekly Activity
                </CardTitle>
                <CardDescription>Your workout streak this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {weeklyWorkouts.map((day) => (
                    <div key={day.day} className="text-center">
                      <div className={`rounded-lg p-3 mb-2 ${
                        day.completed 
                          ? 'bg-green-500/20 border-2 border-green-500' 
                          : 'bg-muted border-2 border-border'
                      }`}>
                        {day.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto" />
                        ) : (
                          <div className="h-6 w-6 mx-auto" />
                        )}
                      </div>
                      <p className="text-xs font-medium">{day.day}</p>
                      <p className="text-xs text-muted-foreground">{day.type}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-green-500" />
                    <p className="text-sm font-medium">5-day streak! Keep it up!</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-blue-500" />
                    Log Workout
                  </CardTitle>
                  <CardDescription>Track your exercise session</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Apple className="h-5 w-5 text-red-500" />
                    Log Meal
                  </CardTitle>
                  <CardDescription>Record what you ate</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Mood Check-in
                  </CardTitle>
                  <CardDescription>Log your mental state</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          {/* Fitness Tab */}
          <TabsContent value="fitness" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-blue-500" />
                  Workout Library
                </CardTitle>
                <CardDescription>30+ guided workouts available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { name: "HIIT Cardio", duration: "20 min", difficulty: "Intermediate", calories: 250 },
                    { name: "Yoga Flow", duration: "45 min", difficulty: "Beginner", calories: 150 },
                    { name: "Strength Training", duration: "40 min", difficulty: "Advanced", calories: 300 },
                    { name: "Pilates Core", duration: "30 min", difficulty: "Intermediate", calories: 180 },
                    { name: "Running", duration: "35 min", difficulty: "All Levels", calories: 320 },
                    { name: "Stretching", duration: "15 min", difficulty: "Beginner", calories: 50 },
                  ].map((workout) => (
                    <Card key={workout.name} className="hover:bg-accent/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="text-base">{workout.name}</CardTitle>
                        <CardDescription className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="h-3 w-3" />
                            {workout.duration}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Target className="h-3 w-3" />
                            {workout.difficulty}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Flame className="h-3 w-3" />
                            ~{workout.calories} cal
                          </div>
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5 text-red-500" />
                  Today's Meals
                </CardTitle>
                <CardDescription>Track your nutrition intake</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMeals.map((meal, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">{meal.name}</p>
                        <p className="text-sm text-muted-foreground">{meal.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{meal.calories} cal</p>
                        <p className="text-xs text-muted-foreground">
                          P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-3">Daily Macros</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Protein</span>
                        <span>102g / 120g</span>
                      </div>
                      <Progress value={85} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Carbs</span>
                        <span>140g / 200g</span>
                      </div>
                      <Progress value={70} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fats</span>
                        <span>56g / 65g</span>
                      </div>
                      <Progress value={86} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mental Wellness Tab */}
          <TabsContent value="mental" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Mood Tracker
                </CardTitle>
                <CardDescription>Your emotional wellbeing this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {moodHistory.map((entry) => (
                    <div key={entry.date} className="text-center">
                      <div className="text-3xl mb-2">{entry.mood}</div>
                      <p className="text-xs font-medium">{entry.date}</p>
                      <p className="text-xs text-muted-foreground">E: {entry.energy}</p>
                      <p className="text-xs text-muted-foreground">S: {entry.stress}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-purple-500" />
                      Meditation Timer
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Take a mindful break with guided meditation
                    </p>
                    <Button className="w-full">Start 10-min Session</Button>
                  </div>

                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      Weekly Insights
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your average energy level is 7.7/10 this week. Stress levels are lower on weekends.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sleep Tab */}
          <TabsContent value="sleep" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-purple-500" />
                  Sleep Tracking
                </CardTitle>
                <CardDescription>Monitor your rest and recovery</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sleepData.map((entry) => (
                    <div key={entry.date} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">{entry.date}</p>
                        <p className="text-sm text-muted-foreground">{entry.hours} hours</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{entry.quality}%</p>
                        <p className="text-xs text-muted-foreground">Quality</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Weekly Average</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold">7.7h</p>
                      <p className="text-sm text-muted-foreground">Sleep Duration</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">85%</p>
                      <p className="text-sm text-muted-foreground">Sleep Quality</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="mt-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Ready to start your wellness journey?</h3>
                <p className="text-muted-foreground">
                  Sign in to track your real fitness, nutrition, and mental wellness data
                </p>
              </div>
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

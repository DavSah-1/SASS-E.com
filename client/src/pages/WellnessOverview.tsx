/**
 * WellnessOverview - Standalone wellness overview dashboard component
 * Daily activity summary, quick stats, AI coaching, and recent activity
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Apple,
  Droplet,
  Smile,
  Dumbbell,
} from "lucide-react";
import { CoachingDashboard } from "@/components/CoachingDashboard";

export default function WellnessOverview() {
  const { translate: t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Queries
  const workoutHistory = trpc.wellbeing.getWorkoutHistory.useQuery({ limit: 10 });
  const dailyActivity = trpc.wellbeing.getDailyActivity.useQuery({ date: selectedDate });
  const foodLog = trpc.wellbeing.getFoodLog.useQuery({ date: selectedDate });
  const hydrationLog = trpc.wellbeing.getHydrationLog.useQuery({ date: selectedDate });
  const moodLog = trpc.wellbeing.getMoodLog.useQuery({ date: selectedDate });
  const journalEntries = trpc.wellbeing.getJournalEntries.useQuery({ limit: 10 });

  const totalCaloriesConsumed = foodLog.data?.reduce((sum, item) => sum + (parseFloat(item.calories?.toString() || '0') || 0), 0) || 0;
  const totalWaterIntake = hydrationLog.data?.total || 0;
  const waterGoal = 2000; // 2L in ml
  const waterProgress = Math.min((totalWaterIntake / waterGoal) * 100, 100);

  return (
    <div className="space-y-6">
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
    </div>
  );
}

/**
 * FitnessTracker - Standalone fitness tracking component
 * Workout logging, exercise history, trends, and workout library
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dumbbell,
  Plus,
  TrendingUp,
} from "lucide-react";
import { WorkoutTrendsChart } from "@/components/wellbeing/WellbeingCharts";
import { WorkoutLibrary } from "@/components/WorkoutLibrary";

export default function FitnessTracker() {
  const { translate: t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Fitness state
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [workoutCalories, setWorkoutCalories] = useState("");

  // Queries
  const workoutHistory = trpc.wellbeing.getWorkoutHistory.useQuery({ limit: 10 });
  const dailyActivity = trpc.wellbeing.getDailyActivity.useQuery({ date: selectedDate });

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

  return (
    <div className="space-y-6">
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
    </div>
  );
}

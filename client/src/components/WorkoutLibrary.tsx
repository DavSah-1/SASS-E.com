import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Dumbbell, Clock, Flame, Target, Play, Filter } from "lucide-react";

interface WorkoutLibraryProps {
  onWorkoutStart?: (workoutId: number) => void;
}

export function WorkoutLibrary({ onWorkoutStart }: WorkoutLibraryProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

  const { data: workouts, isLoading } = trpc.wellbeing.getWorkouts.useQuery();
  const logWorkoutMutation = trpc.wellbeing.logWorkout.useMutation({
    onSuccess: () => {
      toast.success("Workout logged successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to log workout: ${error.message}`);
    },
  });

  const filteredWorkouts = workouts?.filter((workout) => {
    const typeMatch = selectedType === "all" || workout.type === selectedType;
    const difficultyMatch = selectedDifficulty === "all" || workout.difficulty === selectedDifficulty;
    return typeMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      yoga: "🧘",
      hiit: "🔥",
      strength: "💪",
      pilates: "🤸",
      cardio: "🏃",
      stretching: "🤗",
      other: "🏋️",
    };
    return iconMap[type] || "🏋️";
  };

  const handleStartWorkout = (workout: any) => {
    if (onWorkoutStart) {
      onWorkoutStart(workout.id);
    }
    
    logWorkoutMutation.mutate({
      workoutId: workout.id,
      workoutTitle: workout.title,
      duration: workout.duration,
      caloriesBurned: workout.caloriesBurned || 0,
    });
    
    setSelectedWorkout(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading workout library...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Workout Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="yoga">🧘 Yoga</SelectItem>
                  <SelectItem value="hiit">🔥 HIIT</SelectItem>
                  <SelectItem value="strength">💪 Strength</SelectItem>
                  <SelectItem value="pilates">🤸 Pilates</SelectItem>
                  <SelectItem value="cardio">🏃 Cardio</SelectItem>
                  <SelectItem value="stretching">🤗 Stretching</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty Level</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredWorkouts?.length || 0} of {workouts?.length || 0} workouts
          </div>
        </CardContent>
      </Card>

      {/* Workout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkouts?.map((workout) => (
          <Card key={workout.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{getTypeIcon(workout.type)}</span>
                    <span className="line-clamp-1">{workout.title}</span>
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">
                    {workout.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={getDifficultyColor(workout.difficulty)}>
                    {workout.difficulty}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {workout.type}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{workout.duration} min</span>
                  </div>
                  {workout.caloriesBurned && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Flame className="h-4 w-4" />
                      <span>{workout.caloriesBurned} cal</span>
                    </div>
                  )}
                  {workout.focusArea && (
                    <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                      <Target className="h-4 w-4" />
                      <span className="capitalize">{workout.focusArea}</span>
                    </div>
                  )}
                </div>

                {/* Equipment */}
                {workout.equipment && (
                  <div className="text-xs text-muted-foreground">
                    <strong>Equipment:</strong> {JSON.parse(workout.equipment).join(", ")}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedWorkout(workout)}
                      >
                        <Dumbbell className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      {selectedWorkout && selectedWorkout.id === workout.id && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <span>{getTypeIcon(selectedWorkout.type)}</span>
                              {selectedWorkout.title}
                            </DialogTitle>
                            <DialogDescription>{selectedWorkout.description}</DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 mt-4">
                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Duration</div>
                                <div className="text-2xl font-bold">{selectedWorkout.duration} min</div>
                              </div>
                              {selectedWorkout.caloriesBurned && (
                                <div className="space-y-1">
                                  <div className="text-sm text-muted-foreground">Calories</div>
                                  <div className="text-2xl font-bold">{selectedWorkout.caloriesBurned}</div>
                                </div>
                              )}
                              <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Difficulty</div>
                                <Badge className={getDifficultyColor(selectedWorkout.difficulty)}>
                                  {selectedWorkout.difficulty}
                                </Badge>
                              </div>
                              {selectedWorkout.focusArea && (
                                <div className="space-y-1">
                                  <div className="text-sm text-muted-foreground">Focus</div>
                                  <div className="font-medium capitalize">{selectedWorkout.focusArea}</div>
                                </div>
                              )}
                            </div>

                            {/* Equipment */}
                            {selectedWorkout.equipment && (
                              <div>
                                <h4 className="font-semibold mb-2">Equipment Needed</h4>
                                <div className="flex flex-wrap gap-2">
                                  {JSON.parse(selectedWorkout.equipment).map((item: string, idx: number) => (
                                    <Badge key={idx} variant="secondary">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Instructions */}
                            {selectedWorkout.instructions && (
                              <div>
                                <h4 className="font-semibold mb-2">Workout Instructions</h4>
                                <ol className="space-y-2">
                                  {JSON.parse(selectedWorkout.instructions).map((step: string, idx: number) => (
                                    <li key={idx} className="flex gap-3">
                                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                        {idx + 1}
                                      </span>
                                      <span className="text-sm text-muted-foreground">{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {/* Start Button */}
                            <Button
                              onClick={() => handleStartWorkout(selectedWorkout)}
                              className="w-full"
                              size="lg"
                            >
                              <Play className="h-5 w-5 mr-2" />
                              Start This Workout
                            </Button>
                          </div>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleStartWorkout(workout)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkouts?.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No workouts found matching your filters. Try adjusting your selection.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Wellness Onboarding - Multi-step assessment questionnaire
 * Collects user's fitness level, goals, lifestyle, and challenges
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, Target, Activity, Moon, Apple, Heart, Dumbbell } from "lucide-react";

interface OnboardingData {
  // Step 1: Fitness Level
  fitnessLevel: "beginner" | "intermediate" | "advanced" | "";
  
  // Step 2: Goals
  primaryGoals: string[];
  specificGoalDescription: string;
  
  // Step 3: Lifestyle
  activityLevel: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active" | "";
  sleepHoursPerNight: string;
  dietPreference: string;
  workoutDaysPerWeek: string;
  workoutDurationPreference: string;
  
  // Step 4: Challenges & Equipment
  challenges: string[];
  availableEquipment: string[];
  preferredWorkoutTypes: string[];
  preferredWorkoutTime: string;
  medicalConditions: string;
  injuries: string;
}

const GOAL_OPTIONS = [
  { value: "weight_loss", label: "Weight Loss", icon: "🎯" },
  { value: "muscle_gain", label: "Build Muscle", icon: "💪" },
  { value: "stress_reduction", label: "Reduce Stress", icon: "🧘" },
  { value: "better_sleep", label: "Improve Sleep", icon: "😴" },
  { value: "increase_energy", label: "Boost Energy", icon: "⚡" },
  { value: "improve_flexibility", label: "Flexibility", icon: "🤸" },
  { value: "general_fitness", label: "General Fitness", icon: "🏃" },
  { value: "mental_wellness", label: "Mental Wellness", icon: "🧠" },
];

const CHALLENGE_OPTIONS = [
  "Lack of time",
  "Low motivation",
  "No workout space",
  "Limited equipment",
  "Don't know where to start",
  "Injuries or pain",
  "Inconsistent schedule",
  "Difficulty tracking progress",
];

const EQUIPMENT_OPTIONS = [
  "None (bodyweight only)",
  "Dumbbells",
  "Resistance bands",
  "Yoga mat",
  "Pull-up bar",
  "Kettlebells",
  "Barbell & weights",
  "Gym membership",
];

const WORKOUT_TYPE_OPTIONS = [
  { value: "yoga", label: "Yoga" },
  { value: "hiit", label: "HIIT" },
  { value: "strength", label: "Strength Training" },
  { value: "cardio", label: "Cardio" },
  { value: "pilates", label: "Pilates" },
  { value: "stretching", label: "Stretching" },
];

interface WellnessOnboardingProps {
  onComplete: () => void;
}

export function WellnessOnboarding({ onComplete }: WellnessOnboardingProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    fitnessLevel: "",
    primaryGoals: [],
    specificGoalDescription: "",
    activityLevel: "",
    sleepHoursPerNight: "7",
    dietPreference: "none",
    workoutDaysPerWeek: "3",
    workoutDurationPreference: "30",
    challenges: [],
    availableEquipment: [],
    preferredWorkoutTypes: [],
    preferredWorkoutTime: "morning",
    medicalConditions: "",
    injuries: "",
  });

  const createProfileMutation = trpc.wellbeing.createWellnessProfile.useMutation({
    onSuccess: () => {
      toast.success("Welcome! Your personalized wellness plan is ready!");
      onComplete();
    },
    onError: (error) => {
      toast.error("Failed to save profile: " + error.message);
    },
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    // Validation
    if (step === 1 && !data.fitnessLevel) {
      toast.error("Please select your fitness level");
      return;
    }
    if (step === 2 && data.primaryGoals.length === 0) {
      toast.error("Please select at least one goal");
      return;
    }
    if (step === 3 && !data.activityLevel) {
      toast.error("Please select your activity level");
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    createProfileMutation.mutate({
      fitnessLevel: data.fitnessLevel as "beginner" | "intermediate" | "advanced",
      primaryGoals: JSON.stringify(data.primaryGoals),
      activityLevel: data.activityLevel as "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active",
      sleepHoursPerNight: parseInt(data.sleepHoursPerNight) || 7,
      dietPreference: data.dietPreference,
      challenges: JSON.stringify(data.challenges),
      availableEquipment: JSON.stringify(data.availableEquipment),
      workoutDaysPerWeek: parseInt(data.workoutDaysPerWeek) || 3,
      workoutDurationPreference: parseInt(data.workoutDurationPreference) || 30,
      medicalConditions: data.medicalConditions || null,
      injuries: data.injuries || null,
      preferredWorkoutTypes: JSON.stringify(data.preferredWorkoutTypes),
      preferredWorkoutTime: data.preferredWorkoutTime,
    });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 p-4">
      <Card className="w-full max-w-2xl border-cyan-500/20 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-cyan-400" />
              <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Wellness Assessment
              </CardTitle>
            </div>
            <span className="text-sm text-slate-400">Step {step} of {totalSteps}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Fitness Level */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-cyan-300">What's your current fitness level?</h3>
                <p className="text-sm text-slate-400 mb-4">
                  This helps us recommend appropriate workouts and set realistic goals
                </p>
              </div>

              <RadioGroup
                value={data.fitnessLevel}
                onValueChange={(value) => setData({ ...data, fitnessLevel: value as any })}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border border-slate-600 rounded-lg hover:border-cyan-500 transition-colors cursor-pointer">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner" className="flex-1 cursor-pointer">
                      <div className="font-semibold">🌱 Beginner</div>
                      <div className="text-sm text-slate-400">New to exercise or returning after a break</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border border-slate-600 rounded-lg hover:border-cyan-500 transition-colors cursor-pointer">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
                      <div className="font-semibold">💪 Intermediate</div>
                      <div className="text-sm text-slate-400">Exercise regularly, comfortable with basic movements</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border border-slate-600 rounded-lg hover:border-cyan-500 transition-colors cursor-pointer">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced" className="flex-1 cursor-pointer">
                      <div className="font-semibold">🏆 Advanced</div>
                      <div className="text-sm text-slate-400">Experienced athlete, ready for intense challenges</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-cyan-300">What are your wellness goals?</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Select all that apply - we'll create a personalized plan
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((goal) => (
                  <div
                    key={goal.value}
                    onClick={() => setData({ ...data, primaryGoals: toggleArrayItem(data.primaryGoals, goal.value) })}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      data.primaryGoals.includes(goal.value)
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-slate-600 hover:border-cyan-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={data.primaryGoals.includes(goal.value)}
                        onCheckedChange={() => {}}
                      />
                      <span className="text-2xl">{goal.icon}</span>
                      <span className="font-medium">{goal.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="goalDescription">Tell us more about your goals (optional)</Label>
                <Textarea
                  id="goalDescription"
                  placeholder="e.g., I want to lose 10kg for my wedding, or I want to run a 5K..."
                  value={data.specificGoalDescription}
                  onChange={(e) => setData({ ...data, specificGoalDescription: e.target.value })}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Lifestyle */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-cyan-300">Tell us about your lifestyle</h3>
                <p className="text-sm text-slate-400 mb-4">
                  This helps us create realistic recommendations that fit your life
                </p>
              </div>

              <div>
                <Label>Daily Activity Level</Label>
                <RadioGroup
                  value={data.activityLevel}
                  onValueChange={(value) => setData({ ...data, activityLevel: value as any })}
                  className="mt-2"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sedentary" id="sedentary" />
                      <Label htmlFor="sedentary">Sedentary (desk job, little activity)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lightly_active" id="lightly_active" />
                      <Label htmlFor="lightly_active">Lightly Active (light exercise 1-3 days/week)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderately_active" id="moderately_active" />
                      <Label htmlFor="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very_active" id="very_active" />
                      <Label htmlFor="very_active">Very Active (hard exercise 6-7 days/week)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="extremely_active" id="extremely_active" />
                      <Label htmlFor="extremely_active">Extremely Active (athlete, physical job)</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sleep">Average Sleep (hours/night)</Label>
                  <Input
                    id="sleep"
                    type="number"
                    min="4"
                    max="12"
                    value={data.sleepHoursPerNight}
                    onChange={(e) => setData({ ...data, sleepHoursPerNight: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="workoutDays">Target Workout Days/Week</Label>
                  <Input
                    id="workoutDays"
                    type="number"
                    min="1"
                    max="7"
                    value={data.workoutDaysPerWeek}
                    onChange={(e) => setData({ ...data, workoutDaysPerWeek: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Preferred Workout Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="10"
                    max="120"
                    step="5"
                    value={data.workoutDurationPreference}
                    onChange={(e) => setData({ ...data, workoutDurationPreference: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="diet">Diet Preference</Label>
                  <select
                    id="diet"
                    value={data.dietPreference}
                    onChange={(e) => setData({ ...data, dietPreference: e.target.value })}
                    className="mt-2 w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md"
                  >
                    <option value="none">No specific diet</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Keto</option>
                    <option value="paleo">Paleo</option>
                    <option value="mediterranean">Mediterranean</option>
                    <option value="low_carb">Low Carb</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Preferred Workout Time</Label>
                <RadioGroup
                  value={data.preferredWorkoutTime}
                  onValueChange={(value) => setData({ ...data, preferredWorkoutTime: value })}
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="morning" id="morning" />
                    <Label htmlFor="morning">Morning</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="afternoon" id="afternoon" />
                    <Label htmlFor="afternoon">Afternoon</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="evening" id="evening" />
                    <Label htmlFor="evening">Evening</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 4: Challenges & Equipment */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-cyan-300">Let's address your challenges</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Understanding your barriers helps us provide better support
                </p>
              </div>

              <div>
                <Label className="text-base font-semibold">What challenges do you face? (Select all that apply)</Label>
                <div className="mt-3 space-y-2">
                  {CHALLENGE_OPTIONS.map((challenge) => (
                    <div
                      key={challenge}
                      onClick={() => setData({ ...data, challenges: toggleArrayItem(data.challenges, challenge) })}
                      className="flex items-center space-x-2 p-3 border border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors"
                    >
                      <Checkbox
                        checked={data.challenges.includes(challenge)}
                        onCheckedChange={() => {}}
                      />
                      <Label className="cursor-pointer flex-1">{challenge}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Available Equipment</Label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {EQUIPMENT_OPTIONS.map((equipment) => (
                    <div
                      key={equipment}
                      onClick={() => setData({ ...data, availableEquipment: toggleArrayItem(data.availableEquipment, equipment) })}
                      className="flex items-center space-x-2 p-3 border border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors"
                    >
                      <Checkbox
                        checked={data.availableEquipment.includes(equipment)}
                        onCheckedChange={() => {}}
                      />
                      <Label className="cursor-pointer flex-1 text-sm">{equipment}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Preferred Workout Types</Label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {WORKOUT_TYPE_OPTIONS.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => setData({ ...data, preferredWorkoutTypes: toggleArrayItem(data.preferredWorkoutTypes, type.value) })}
                      className="flex items-center space-x-2 p-3 border border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors"
                    >
                      <Checkbox
                        checked={data.preferredWorkoutTypes.includes(type.value)}
                        onCheckedChange={() => {}}
                      />
                      <Label className="cursor-pointer flex-1">{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="medical">Medical Conditions or Concerns (optional)</Label>
                <Textarea
                  id="medical"
                  placeholder="e.g., knee injury, high blood pressure, asthma..."
                  value={data.medicalConditions}
                  onChange={(e) => setData({ ...data, medicalConditions: e.target.value })}
                  className="mt-2"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="injuries">Current Injuries or Limitations (optional)</Label>
                <Textarea
                  id="injuries"
                  placeholder="e.g., recovering from ankle sprain, lower back pain..."
                  value={data.injuries}
                  onChange={(e) => setData({ ...data, injuries: e.target.value })}
                  className="mt-2"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={createProfileMutation.isPending}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 gap-2"
            >
              {step === totalSteps ? (
                <>
                  <Check className="h-4 w-4" />
                  Complete Assessment
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

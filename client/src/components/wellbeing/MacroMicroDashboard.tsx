import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, Zap } from "lucide-react";

interface FoodLogEntry {
  calories?: string | null;
  protein?: string | null;
  carbs?: string | null;
  fat?: string | null;
  fiber?: string | null;
  sugars?: string | null;
  sodium?: string | null;
  cholesterol?: string | null;
  vitaminA?: string | null;
  vitaminC?: string | null;
  calcium?: string | null;
  iron?: string | null;
}

interface MacroMicroDashboardProps {
  foodLog: FoodLogEntry[];
  dailyGoals?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

// RDA (Recommended Dietary Allowance) values for adults
const RDA = {
  fiber: 25, // g
  sodium: 2300, // mg
  cholesterol: 300, // mg
  vitaminA: 900, // mcg
  vitaminC: 90, // mg
  calcium: 1000, // mg
  iron: 18, // mg
};

export function MacroMicroDashboard({ foodLog, dailyGoals }: MacroMicroDashboardProps) {
  // Calculate totals from food log
  const totals = foodLog.reduce(
    (acc, entry) => {
      acc.calories += parseFloat(entry.calories || "0");
      acc.protein += parseFloat(entry.protein || "0");
      acc.carbs += parseFloat(entry.carbs || "0");
      acc.fat += parseFloat(entry.fat || "0");
      acc.fiber += parseFloat(entry.fiber || "0");
      acc.sodium += parseFloat(entry.sodium || "0");
      acc.cholesterol += parseFloat(entry.cholesterol || "0");
      acc.vitaminA += parseFloat(entry.vitaminA || "0");
      acc.vitaminC += parseFloat(entry.vitaminC || "0");
      acc.calcium += parseFloat(entry.calcium || "0");
      acc.iron += parseFloat(entry.iron || "0");
      return acc;
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
      cholesterol: 0,
      vitaminA: 0,
      vitaminC: 0,
      calcium: 0,
      iron: 0,
    }
  );

  // Default goals if not provided
  const goals = {
    calories: dailyGoals?.calories || 2000,
    protein: dailyGoals?.protein || 50,
    carbs: dailyGoals?.carbs || 275,
    fat: dailyGoals?.fat || 78,
  };

  // Calculate percentages
  const getPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getRDAPercentage = (current: number, rda: number) => {
    return (current / rda) * 100;
  };

  const getStatusColor = (percentage: number, isLowerBetter = false) => {
    if (isLowerBetter) {
      if (percentage <= 100) return "text-green-600";
      if (percentage <= 150) return "text-yellow-600";
      return "text-red-600";
    } else {
      if (percentage >= 80 && percentage <= 120) return "text-green-600";
      if (percentage >= 50) return "text-yellow-600";
      return "text-red-600";
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Macronutrients Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Macronutrients
          </CardTitle>
          <CardDescription>Daily intake vs. goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Calories</span>
              <span className={`text-sm font-semibold ${getStatusColor(getPercentage(totals.calories, goals.calories))}`}>
                {totals.calories.toFixed(0)} / {goals.calories} kcal
              </span>
            </div>
            <Progress value={getPercentage(totals.calories, goals.calories)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {getPercentage(totals.calories, goals.calories).toFixed(0)}% of daily goal
            </p>
          </div>

          {/* Protein */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Protein</span>
              <span className={`text-sm font-semibold ${getStatusColor(getPercentage(totals.protein, goals.protein))}`}>
                {totals.protein.toFixed(1)} / {goals.protein}g
              </span>
            </div>
            <Progress value={getPercentage(totals.protein, goals.protein)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {getPercentage(totals.protein, goals.protein).toFixed(0)}% of daily goal
            </p>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Carbohydrates</span>
              <span className={`text-sm font-semibold ${getStatusColor(getPercentage(totals.carbs, goals.carbs))}`}>
                {totals.carbs.toFixed(1)} / {goals.carbs}g
              </span>
            </div>
            <Progress value={getPercentage(totals.carbs, goals.carbs)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {getPercentage(totals.carbs, goals.carbs).toFixed(0)}% of daily goal
            </p>
          </div>

          {/* Fat */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Fat</span>
              <span className={`text-sm font-semibold ${getStatusColor(getPercentage(totals.fat, goals.fat))}`}>
                {totals.fat.toFixed(1)} / {goals.fat}g
              </span>
            </div>
            <Progress value={getPercentage(totals.fat, goals.fat)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {getPercentage(totals.fat, goals.fat).toFixed(0)}% of daily goal
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Micronutrients Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Micronutrients
          </CardTitle>
          <CardDescription>% of Recommended Daily Allowance (RDA)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fiber */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Fiber</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{totals.fiber.toFixed(1)}g</span>
                <Badge variant={getRDAPercentage(totals.fiber, RDA.fiber) >= 80 ? "default" : "secondary"}>
                  {getRDAPercentage(totals.fiber, RDA.fiber).toFixed(0)}%
                </Badge>
              </div>
            </div>
            <Progress value={Math.min(getRDAPercentage(totals.fiber, RDA.fiber), 100)} className="h-2" />
          </div>

          {/* Vitamin C */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Vitamin C</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{totals.vitaminC.toFixed(0)}mg</span>
                <Badge variant={getRDAPercentage(totals.vitaminC, RDA.vitaminC) >= 80 ? "default" : "secondary"}>
                  {getRDAPercentage(totals.vitaminC, RDA.vitaminC).toFixed(0)}%
                </Badge>
              </div>
            </div>
            <Progress value={Math.min(getRDAPercentage(totals.vitaminC, RDA.vitaminC), 100)} className="h-2" />
          </div>

          {/* Calcium */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Calcium</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{totals.calcium.toFixed(0)}mg</span>
                <Badge variant={getRDAPercentage(totals.calcium, RDA.calcium) >= 80 ? "default" : "secondary"}>
                  {getRDAPercentage(totals.calcium, RDA.calcium).toFixed(0)}%
                </Badge>
              </div>
            </div>
            <Progress value={Math.min(getRDAPercentage(totals.calcium, RDA.calcium), 100)} className="h-2" />
          </div>

          {/* Iron */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Iron</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{totals.iron.toFixed(1)}mg</span>
                <Badge variant={getRDAPercentage(totals.iron, RDA.iron) >= 80 ? "default" : "secondary"}>
                  {getRDAPercentage(totals.iron, RDA.iron).toFixed(0)}%
                </Badge>
              </div>
            </div>
            <Progress value={Math.min(getRDAPercentage(totals.iron, RDA.iron), 100)} className="h-2" />
          </div>

          {/* Sodium (lower is better) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Sodium</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${getStatusColor(getRDAPercentage(totals.sodium, RDA.sodium), true)}`}>
                  {totals.sodium.toFixed(0)}mg
                </span>
                <Badge variant={getRDAPercentage(totals.sodium, RDA.sodium) <= 100 ? "default" : "destructive"}>
                  {getRDAPercentage(totals.sodium, RDA.sodium).toFixed(0)}%
                </Badge>
              </div>
            </div>
            <Progress value={Math.min(getRDAPercentage(totals.sodium, RDA.sodium), 100)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Keep below 2300mg/day</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

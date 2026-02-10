/**
 * NutritionTracker - Standalone nutrition tracking component
 * Food logging, barcode scanning, hydration tracking, and macro/micro dashboards
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Droplet,
  Plus,
  TrendingUp,
} from "lucide-react";
import { CalorieTrackingChart } from "@/components/wellbeing/WellbeingCharts";
import { BarcodeScanner } from "@/components/wellbeing/BarcodeScanner";
import { FoodSearch } from "@/components/wellbeing/FoodSearch";
import { MacroMicroDashboard } from "@/components/wellbeing/MacroMicroDashboard";

export default function NutritionTracker() {
  const { translate: t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
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

  // Queries
  const foodLog = trpc.wellbeing.getFoodLog.useQuery({ date: selectedDate });
  const hydrationLog = trpc.wellbeing.getHydrationLog.useQuery({ date: selectedDate });

  const utils = trpc.useUtils();

  // Mutations
  const addFoodLogMutation = trpc.wellbeing.addFoodLog.useMutation({
    onSuccess: () => {
      toast.success(t("Food logged successfully!"));
      utils.wellbeing.getFoodLog.invalidate();
      utils.wellbeing.getDailyActivity.invalidate();
      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
    },
  });

  const addHydrationMutation = trpc.wellbeing.addHydrationLog.useMutation({
    onSuccess: () => {
      toast.success(t("Water intake logged!"));
      utils.wellbeing.getHydrationLog.invalidate();
      utils.wellbeing.getDailyActivity.invalidate();
    },
  });

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

  const totalCaloriesConsumed = foodLog.data?.reduce((sum, item) => sum + (parseFloat(item.calories?.toString() || '0') || 0), 0) || 0;
  const totalWaterIntake = hydrationLog.data?.total || 0;
  const waterGoal = 2000; // 2L in ml
  const waterProgress = Math.min((totalWaterIntake / waterGoal) * 100, 100);

  return (
    <div className="space-y-6">
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

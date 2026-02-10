/**
 * HealthMetrics - Standalone health metrics tracking component
 * Weight tracking, heart rate logging, wearable device integration, and health history
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Activity,
  Plus,
  TrendingUp,
} from "lucide-react";
import { WeightProgressChart } from "@/components/wellbeing/WellbeingCharts";
import { WearableDevices } from "@/components/WearableDevices";

export default function HealthMetrics() {
  const { translate: t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Health metrics state
  const [weight, setWeight] = useState("");
  const [restingHeartRate, setRestingHeartRate] = useState("");

  // Queries
  const healthMetrics = trpc.wellbeing.getHealthMetrics.useQuery({ limit: 10 });

  const utils = trpc.useUtils();

  // Mutations
  const addHealthMetricMutation = trpc.wellbeing.addHealthMetric.useMutation({
    onSuccess: () => {
      toast.success(t("Health metrics updated!"));
      utils.wellbeing.getHealthMetrics.invalidate();
      setWeight("");
      setRestingHeartRate("");
    },
  });

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

  return (
    <div className="space-y-6">
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
    </div>
  );
}

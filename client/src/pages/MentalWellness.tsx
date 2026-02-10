/**
 * MentalWellness - Standalone mental wellness tracking component
 * Mood tracking, journal entries, meditation logging, and mood patterns
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Brain,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { MoodPatternsChart } from "@/components/wellbeing/WellbeingCharts";

export default function MentalWellness() {
  const { translate: t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Mental wellness state
  const [mood, setMood] = useState<"great" | "good" | "okay" | "bad" | "terrible">("good");
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [journalContent, setJournalContent] = useState("");
  const [meditationDuration, setMeditationDuration] = useState("");

  // Queries
  const moodLog = trpc.wellbeing.getMoodLog.useQuery({ date: selectedDate });
  const journalEntries = trpc.wellbeing.getJournalEntries.useQuery({ limit: 10 });
  const meditationSessions = trpc.wellbeing.getMeditationSessions.useQuery({ limit: 10 });

  const utils = trpc.useUtils();

  // Mutations
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

  return (
    <div className="space-y-6">
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
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type Level, getNextLevel, getProgressToNextLevel } from "@shared/levels";

interface LevelDisplayProps {
  level: Level;
  overallProgress: number;
  variant?: "compact" | "full";
}

export function LevelDisplay({ level, overallProgress, variant = "full" }: LevelDisplayProps) {
  const nextLevel = getNextLevel(level);
  const progressToNext = getProgressToNextLevel(overallProgress, level);

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-4xl">{level.emoji}</span>
        <div>
          <div className="text-lg font-bold text-yellow-200">
            Level {level.name}
          </div>
          <div className="text-xs text-slate-300">{level.description}</div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-2 border-purple-500/30">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Level Emoji */}
          <div className="text-6xl">{level.emoji}</div>

          {/* Level Info */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-2xl font-bold text-purple-200">
                Level {level.name}
              </h3>
              <span className="text-sm text-slate-400">
                ({overallProgress}% overall progress)
              </span>
            </div>

            <p className="text-slate-300 mb-4">{level.description}</p>

            {/* Progress to Next Level */}
            {nextLevel ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">
                    Progress to {nextLevel.emoji} Level {nextLevel.name}
                  </span>
                  <span className="text-sm font-semibold text-purple-300">
                    {Math.round(progressToNext)}%
                  </span>
                </div>
                <Progress value={progressToNext} className="h-2" />
                <p className="text-xs text-slate-400 mt-1">
                  Reach {nextLevel.minProgress}% overall progress to unlock
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-lg p-3">
                <p className="text-sm font-semibold text-purple-200">
                  🎉 Maximum level achieved! You've mastered all content!
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
